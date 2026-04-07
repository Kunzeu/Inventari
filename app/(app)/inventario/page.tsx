"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = { id: string; code: string; name: string; stock: number; min_stock: number };

export default function InventarioPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error: e } = await supabase
        .from("products")
        .select("id, code, name, stock, min_stock")
        .eq("user_id", user.id)
        .order("name");
      if (e) return setError(e.message);
      setItems((data as Product[]) ?? []);
    }
    void load();
  }, []);

  return (
    <div className="card">
      <h1>Inventario y stock</h1>
      <table>
        <thead><tr><th>Codigo</th><th>Producto</th><th>Stock</th><th>Minimo</th><th>Estado</th></tr></thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.code}</td><td>{p.name}</td><td>{p.stock}</td><td>{p.min_stock}</td>
              <td>{p.stock <= p.min_stock ? "Bajo" : "OK"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
