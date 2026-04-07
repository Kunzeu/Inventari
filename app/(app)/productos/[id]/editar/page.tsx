"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadProductImage } from "@/lib/supabase/product-images";

export default function EditarProductoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [form, setForm] = useState({ code: "", name: "", category: "", stock: "0", min_stock: "0", price: "0" });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      if (!supabase) return;
      const { data, error: e } = await supabase
        .from("products")
        .select("code, name, category, stock, min_stock, price, image_url")
        .eq("id", id)
        .single();
      if (e || !data) return setError(e?.message ?? "No encontrado");
      setForm({
        code: String(data.code ?? ""),
        name: String(data.name ?? ""),
        category: String(data.category ?? ""),
        stock: String(data.stock ?? 0),
        min_stock: String(data.min_stock ?? 0),
        price: String(data.price ?? 0),
      });
      setImageUrl(String(data.image_url ?? ""));
    }
    void load();
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return setError("Supabase no configurado.");
    let finalImageUrl = imageUrl || null;
    if (imageFile) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setError("Sesion invalida.");
      const upload = await uploadProductImage(supabase, user.id, imageFile);
      if ("error" in upload) return setError(upload.error);
      finalImageUrl = upload.url;
    }

    const { error: dbError } = await supabase.from("products").update({
      code: form.code.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      stock: Number(form.stock || 0),
      min_stock: Number(form.min_stock || 0),
      price: Number(form.price || 0),
      image_url: finalImageUrl,
    }).eq("id", id);
    if (dbError) return setError(dbError.message);
    router.push("/productos");
  }

  return (
    <div className="card">
      <h1>Editar producto</h1>
      <form className="grid grid-2" onSubmit={(e) => void save(e)}>
        <div className="image-upload-wrap">
          <label className="image-upload-label">Imagen del producto</label>
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          {imageFile ? (
            <img src={URL.createObjectURL(imageFile)} alt="" className="product-thumb-lg" />
          ) : imageUrl ? (
            <img src={imageUrl} alt="" className="product-thumb-lg" />
          ) : null}
        </div>
        <input className="input" placeholder="Codigo" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        <input className="input" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className="input" type="number" min={0} placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input className="input" type="number" min={0} placeholder="Stock minimo" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} />
        <input className="input" type="number" min={0} placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <button className="btn" type="submit">Guardar cambios</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
