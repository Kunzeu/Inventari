"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Invoice = { id: string; reference: string; status: string; total: number; created_at: string };

export default function FacturacionPage() {
  const [rows, setRows] = useState<Invoice[]>([]);
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
        .from("invoices")
        .select("id, reference, status, total, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (e) return setError(e.message);
      setRows((data as Invoice[]) ?? []);
    }
    void load();
  }, []);

  return (
    <div className="card">
      <h1>Facturacion Electronica</h1>
      <p style={{ marginTop: 8 }}>Base para emitir, consultar y rastrear facturas.</p>
      <table style={{ marginTop: 12 }}>
        <thead><tr><th>Referencia</th><th>Estado</th><th>Total</th><th>Fecha</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id}><td>{r.reference}</td><td>{r.status}</td><td>{r.total}</td><td>{new Date(r.created_at).toLocaleString("es-CO")}</td></tr>)}</tbody>
      </table>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
