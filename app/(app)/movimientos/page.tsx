"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = { id: string; code: string; name: string; stock: number };

export default function MovimientosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<"entrada" | "salida">("entrada");
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");

  async function loadProducts() {
    const supabase = createClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("products")
      .select("id, code, name, stock")
      .eq("user_id", user.id)
      .order("name");
    const list = (data as Product[]) ?? [];
    setProducts(list);
    if (list.length && !productId) setProductId(list[0].id);
  }

  useEffect(() => { void loadProducts(); }, []);

  async function applyMovement(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(quantity);
    if (qty <= 0) return setMessage("Cantidad invalida");
    const selected = products.find((p) => p.id === productId);
    if (!selected) return setMessage("Selecciona un producto");

    const nextStock = type === "entrada" ? selected.stock + qty : Math.max(0, selected.stock - qty);
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.from("products").update({ stock: nextStock }).eq("id", selected.id);
    if (error) return setMessage(error.message);
    setMessage("Movimiento aplicado");
    await loadProducts();
  }

  return (
    <div className="card">
      <h1>Movimientos de stock</h1>
      <form className="grid grid-2" onSubmit={(e) => void applyMovement(e)}>
        <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
        </select>
        <select className="input" value={type} onChange={(e) => setType(e.target.value as "entrada" | "salida")}>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </select>
        <input className="input" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <button className="btn" type="submit">Aplicar movimiento</button>
      </form>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
