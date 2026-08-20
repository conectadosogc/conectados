import { getAccessScope } from "@/lib/access-scope";
import { requireSessionUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await requireSessionUser();
  const scope = await getAccessScope();

  return (
    <DashboardShell user={sessionUser} scopeBadge={scope?.badge ?? null}>
      {children}
    </DashboardShell>
  );
}
