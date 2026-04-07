"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserRow = { id: string; email: string; full_name: string; role: string; is_active: boolean };

export default function PersonalPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      if (!supabase) return;
      const { data, error: e } = await supabase.from("users").select("id, email, full_name, role, is_active");
      if (e) return setError(e.message);
      setUsers((data as UserRow[]) ?? []);
    }
    void load();
  }, []);

  return (
    <div className="card">
      <h1>Gestion de Personal</h1>
      <p style={{ marginTop: 8 }}>Usuarios, roles y estado activo.</p>
      <table style={{ marginTop: 12 }}>
        <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Activo</th></tr></thead>
        <tbody>{users.map((u) => <tr key={u.id}><td>{u.full_name || "-"}</td><td>{u.email}</td><td>{u.role}</td><td>{u.is_active ? "Si" : "No"}</td></tr>)}</tbody>
      </table>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
