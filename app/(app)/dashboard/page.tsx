"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = { stock: number; min_stock: number; price: number };
type Sale = { total: number };

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      if (!supabase) return;
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("products").select("stock, min_stock, price"),
        supabase.from("sales").select("total"),
      ]);
      setProducts((p as Product[]) ?? []);
      setSales((s as Sale[]) ?? []);
    }
    void load();
  }, []);

  const kpi = useMemo(() => {
    const totalProducts = products.length;
    const totalUnits = products.reduce((a, p) => a + Number(p.stock || 0), 0);
    const lowStock = products.filter((p) => Number(p.stock || 0) <= Number(p.min_stock || 0)).length;
    const salesTotal = sales.reduce((a, s) => a + Number(s.total || 0), 0);
    return { totalProducts, totalUnits, lowStock, salesTotal };
  }, [products, sales]);

  return (
    <>
      <div className="card">
        <h1>Dashboard POS</h1>
        <p style={{ marginTop: 8 }}>Resumen de inventario, ventas y operacion.</p>
      </div>
      <div className="grid grid-2">
        <div className="card"><strong>Productos:</strong> {kpi.totalProducts}</div>
        <div className="card"><strong>Unidades en stock:</strong> {kpi.totalUnits}</div>
        <div className="card"><strong>Stock bajo:</strong> {kpi.lowStock}</div>
        <div className="card"><strong>Ventas acumuladas:</strong> {kpi.salesTotal}</div>
      </div>
    </>
  );
}
