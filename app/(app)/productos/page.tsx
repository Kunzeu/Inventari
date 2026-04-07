"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = { id: string; code: string; name: string; category: string; stock: number; min_stock: number; price: number; image_url: string | null };

export default function ProductosPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const supabase = createClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error: e } = await supabase
      .from("products")
      .select("id, code, name, category, stock, min_stock, price, image_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (e) return setError(e.message);
    setItems((data as Product[]) ?? []);
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return items;
    return items.filter((p) => [p.code, p.name, p.category].join(" ").toLowerCase().includes(s));
  }, [items, q]);

  async function del(id: string) {
    const supabase = createClient();
    if (!supabase) return;
    const { error: e } = await supabase.from("products").delete().eq("id", id);
    if (e) return setError(e.message);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <>
      <div className="card row" style={{ justifyContent: "space-between" }}>
        <h1>Productos</h1>
        <Link className="btn-ghost" href="/productos/nuevo">+ Agregar producto</Link>
      </div>
      <div className="card">
        <input className="input" placeholder="Buscar productos..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="card">
        <table className="products-table">
          <thead>
            <tr><th>Imagen</th><th>Codigo</th><th>Nombre</th><th>Categoria</th><th>Stock</th><th>Min</th><th>Precio</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.image_url ? <img src={p.image_url} alt="" className="product-thumb" /> : <span className="thumb-fallback">—</span>}</td>
                <td>{p.code}</td><td>{p.name}</td><td>{p.category || "-"}</td><td>{p.stock}</td><td>{p.min_stock}</td><td>{p.price}</td>
                <td className="row">
                  <Link className="btn-ghost" href={`/productos/${p.id}/editar`}>Editar</Link>
                  <button className="btn-ghost" onClick={() => void del(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error ? <p className="error">{error}</p> : null}
      </div>
    </>
  );
}
