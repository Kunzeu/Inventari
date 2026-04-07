"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Customer = { id: string; name: string; email: string; phone: string; points: number };

export default function ClientesPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");

  async function load() {
    const supabase = createClient();
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error: e } = await supabase
      .from("customers")
      .select("id, name, email, phone, points")
      .eq("user_id", user.id);
    if (e) return setError(e.message);
    setItems((data as Customer[]) ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error: e1 } = await supabase.from("customers").insert({
      user_id: user.id,
      ...form,
      points: 0,
    });
    if (e1) return setError(e1.message);
    setForm({ name: "", email: "", phone: "" });
    await load();
  }

  return (
    <>
      <div className="card">
        <h1>Clientes</h1>
        <p style={{ marginTop: 8 }}>Gestion de clientes con base para lealtad.</p>
      </div>
      <div className="card">
        <form className="grid grid-2" onSubmit={(e) => void save(e)}>
          <input className="input" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Telefono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <button className="btn" type="submit">Agregar cliente</button>
        </form>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Nombre</th><th>Email</th><th>Telefono</th><th>Puntos</th></tr></thead>
          <tbody>{items.map((c) => <tr key={c.id}><td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.points ?? 0}</td></tr>)}</tbody>
        </table>
        {error ? <p className="error">{error}</p> : null}
      </div>
    </>
  );
}
