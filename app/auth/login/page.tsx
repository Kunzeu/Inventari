"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const supabase = createClient();
    if (!supabase) return setError("Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) return setError(signInError.message);
    window.location.href = "/dashboard";
  }

  return (
    <main className="main login-main">
      <section className="card">
        <h1>Iniciar sesion</h1>
        <p style={{ marginTop: 8, marginBottom: 14 }}>Accede a tu sistema POS con Supabase.</p>
        <form onSubmit={(e) => void onSubmit(e)} className="grid">
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" required />
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Clave" required />
          {error ? <p className="error">{error}</p> : null}
          <button className="btn" type="submit">Entrar</button>
        </form>
      </section>
    </main>
  );
}
