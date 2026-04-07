"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Lead = { id: string; customer_name: string; status: string; note: string };

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [form, setForm] = useState({ customer_name: "", status: "nuevo", note: "" });
  const [error, setError] = useState("");

  async function load() {
    const supabase = createClient();
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error: e } = await supabase
      .from("crm_leads")
      .select("id, customer_name, status, note")
      .eq("user_id", user.id);
    if (e) return setError(e.message);
    setLeads((data as Lead[]) ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error: e } = await supabase.from("crm_leads").insert({
      user_id: user.id,
      ...form,
    });
    if (e) return setError(e.message);
    setForm({ customer_name: "", status: "nuevo", note: "" });
    await load();
  }

  return (
    <>
      <div className="card"><h1>CRM</h1><p style={{ marginTop: 8 }}>Seguimiento de clientes y oportunidades.</p></div>
      <div className="card">
        <form className="grid grid-2" onSubmit={(e) => void add(e)}>
          <input className="input" placeholder="Cliente" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required />
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="nuevo">Nuevo</option>
            <option value="contactado">Contactado</option>
            <option value="cerrado">Cerrado</option>
          </select>
          <input className="input" placeholder="Nota" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <button className="btn" type="submit">Crear seguimiento</button>
        </form>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Cliente</th><th>Estado</th><th>Nota</th></tr></thead>
          <tbody>{leads.map((l) => <tr key={l.id}><td>{l.customer_name}</td><td>{l.status}</td><td>{l.note}</td></tr>)}</tbody>
        </table>
        {error ? <p className="error">{error}</p> : null}
      </div>
    </>
  );
}
