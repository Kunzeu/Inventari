import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  return <AppShell>{children}</AppShell>;
}
