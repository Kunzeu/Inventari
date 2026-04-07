"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const nav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/pos", label: "POS" },
    { href: "/productos", label: "Productos" },
    { href: "/inventario", label: "Inventario" },
    { href: "/movimientos", label: "Movimientos" },
    { href: "/ventas", label: "Ventas" },
    { href: "/clientes", label: "Clientes" },
    { href: "/informes", label: "Informes" },
    { href: "/crm", label: "CRM" },
    { href: "/personal", label: "Personal" },
    { href: "/facturacion", label: "Facturacion" },
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <h3 className="brand-title">POS Inventario</h3>
        <p className="brand-sub">Sistema de gestion</p>
        <nav className="sidebar-nav">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "nav-link active" : "nav-link"}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
