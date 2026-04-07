"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadProductImage } from "@/lib/supabase/product-images";

export default function NuevoProductoPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [form, setForm] = useState({ code: "", name: "", category: "", stock: "0", min_stock: "0", price: "0" });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return setError("Supabase no configurado.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setError("Sesion invalida.");

    let imageUrl: string | null = null;
    if (imageFile) {
      const upload = await uploadProductImage(supabase, user.id, imageFile);
      if ("error" in upload) return setError(upload.error);
      imageUrl = upload.url;
    }

    const { error: dbError } = await supabase.from("products").insert({
      user_id: user.id,
      code: form.code.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      stock: Number(form.stock || 0),
      min_stock: Number(form.min_stock || 0),
      price: Number(form.price || 0),
      image_url: imageUrl,
    });
    if (dbError) return setError(dbError.message);
    router.push("/productos");
  }

  return (
    <div className="card">
      <h1>Nuevo producto</h1>
      <form className="grid grid-2" onSubmit={(e) => void save(e)}>
        <div className="image-upload-wrap">
          <label className="image-upload-label">Imagen del producto</label>
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
              setPreview(file ? URL.createObjectURL(file) : "");
            }}
          />
          {preview ? <img src={preview} alt="" className="product-thumb-lg" /> : null}
        </div>
        <input className="input" placeholder="Codigo" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        <input className="input" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className="input" type="number" min={0} placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input className="input" type="number" min={0} placeholder="Stock minimo" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} />
        <input className="input" type="number" min={0} placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <button className="btn" type="submit">Guardar</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
