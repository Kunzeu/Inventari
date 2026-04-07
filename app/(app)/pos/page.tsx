"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = { id: string; code: string; name: string; price: number; stock: number };

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");

  async function loadProducts() {
    const supabase = createClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("products")
      .select("id, code, name, price, stock")
      .eq("user_id", user.id)
      .order("name");
    const list = (data as Product[]) ?? [];
    setProducts(list);
    if (list.length && !productId) setProductId(list[0].id);
  }

  useEffect(() => { void loadProducts(); }, []);

  const selected = useMemo(() => products.find((p) => p.id === productId), [products, productId]);
  const total = selected ? Number(selected.price) * Number(quantity || 0) : 0;

  async function sell(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return setMessage("Selecciona un producto.");
    const qty = Number(quantity);
    if (qty <= 0) return setMessage("Cantidad invalida.");
    if (qty > selected.stock) return setMessage("Stock insuficiente.");

    const supabase = createClient();
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setMessage("Sesion no valida.");

    const nextStock = selected.stock - qty;
    const { error } = await supabase.from("products").update({ stock: nextStock }).eq("id", selected.id);
    if (error) return setMessage(error.message);

    await supabase.from("sales").insert({
      user_id: user.id,
      product_id: selected.id,
      quantity: qty,
      unit_price: selected.price,
      total,
    });

    setMessage("Venta registrada.");
    await loadProducts();
  }

  return (
    <div className="card">
      <h1>POS (Punto de Venta)</h1>
      <p style={{ marginTop: 8 }}>Registra ventas rapidas y descuenta stock automaticamente.</p>
      <form className="grid grid-2" style={{ marginTop: 14 }} onSubmit={(e) => void sell(e)}>
        <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)}>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} - {p.name} (stock: {p.stock})
            </option>
          ))}
        </select>
        <input
          className="input"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <div className="card" style={{ margin: 0 }}>
          <strong>Total venta:</strong> {total}
        </div>
        <button className="btn" type="submit">Registrar venta</button>
      </form>
      {message ? <p style={{ marginTop: 10 }}>{message}</p> : null}
    </div>
  );
}
