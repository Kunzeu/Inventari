"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Sale = { id: string; product_id: string; quantity: number; unit_price: number; total: number; created_at: string };

export default function VentasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error: e } = await supabase
        .from("sales")
        .select("id, product_id, quantity, unit_price, total, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (e) return setError(e.message);
      setSales((data as Sale[]) ?? []);
    }
    void load();
  }, []);

  return (
    <div className="card">
      <h1>Ventas</h1>
      <p style={{ marginTop: 8 }}>Historial de ventas registradas en el POS.</p>
      <table style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>P. Unit</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td>{new Date(s.created_at).toLocaleString("es-CO")}</td>
              <td>{s.product_id}</td>
              <td>{s.quantity}</td>
              <td>{s.unit_price}</td>
              <td>{s.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
