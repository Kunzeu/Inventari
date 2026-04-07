"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Sale = { total: number; created_at: string };
type Product = { stock: number; price: number; min_stock: number };

export default function InformesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: s, error: se }, { data: p, error: pe }] = await Promise.all([
        supabase.from("sales").select("total, created_at").eq("user_id", user.id),
        supabase.from("products").select("stock, price, min_stock").eq("user_id", user.id),
      ]);
      if (se || pe) return setError(se?.message ?? pe?.message ?? "Error");
      setSales((s as Sale[]) ?? []);
      setProducts((p as Product[]) ?? []);
    }
    void load();
  }, []);

  const totalSales = useMemo(() => sales.reduce((a, b) => a + Number(b.total || 0), 0), [sales]);
  const inventoryValue = useMemo(
    () => products.reduce((a, p) => a + Number(p.stock || 0) * Number(p.price || 0), 0),
    [products]
  );
  const lowStock = useMemo(
    () => products.filter((p) => Number(p.stock || 0) <= Number(p.min_stock || 0)).length,
    [products]
  );

  return (
    <div className="grid grid-2">
      <div className="card"><h1>Informes</h1><p style={{ marginTop: 8 }}>Resumen ejecutivo de ventas e inventario.</p></div>
      <div className="card"><strong>Ventas totales:</strong> {totalSales}</div>
      <div className="card"><strong>Valor del inventario:</strong> {inventoryValue}</div>
      <div className="card"><strong>Productos con stock bajo:</strong> {lowStock}</div>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
