/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarRange,
  Compass,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Shield,
  UserCog,
  UserRound,
  Users,
  Users2,
} from "lucide-react";

import { logoutAction } from "@/lib/actions";
import { canAccessRoute } from "@/lib/permissions";
import type { ScopeBadge, SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";

const navItems = [
  { href: "/panel", label: "Panel central", icon: LayoutDashboard },
  { href: "/coordinadores", label: "Coordinadores", icon: Users2 },
  { href: "/dirigentes", label: "Dirigentes", icon: Shield },
  { href: "/miembros", label: "Miembros", icon: Users },
  { href: "/registro-avanzado", label: "Registro guiado", icon: Compass },
  { href: "/eventos", label: "Eventos", icon: CalendarRange },
  { href: "/usuarios", label: "Usuarios", icon: UserCog },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
];

export function DashboardShell({
  children,
  user,
  scopeBadge,
}: {
  children: React.ReactNode;
  user: SessionUser;
  scopeBadge: null | ScopeBadge;
}) {
  const pathname = usePathname();
  const visibleNavItems = navItems.filter((item) => canAccessRoute(user.role, item.href));
  const initials =
    user.name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mx-auto grid min-h-screen max-w-[1680px] gap-4 px-4 py-4 lg:grid-cols-[268px_1fr] lg:px-5 lg:py-5">
        <aside className="panel p-4">
          <div className="flex h-full flex-col">
            <div className="panel-flat flex min-h-[92px] items-center p-4">
              <BrandLogo className="h-12 w-full" />
            </div>

            {scopeBadge ? (
              <div className="panel-flat mt-4 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--mustard-700)]">
                  Alcance activo
                </p>
                <p className="mt-1.5 text-base font-semibold text-[var(--foreground)]">
                  {scopeBadge.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  {scopeBadge.detail}
                </p>
              </div>
            ) : null}

            <div className="mt-4 rounded-[10px] border border-[var(--line)] bg-[var(--surface-tint)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--mustard-700)]">
                Ruta activa
              </p>
              <p className="mt-1.5 text-base font-semibold text-[var(--foreground)]">
                {visibleNavItems.find((item) => item.href === pathname)?.label ??
                  "Conectado por el Cambio"}
              </p>
            </div>

            <div className="mt-4 flex-1 space-y-1.5">
              {visibleNavItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center justify-between rounded-[9px] border px-3.5 py-3 text-sm font-medium",
                      active
                        ? "border-[var(--line)] bg-[var(--surface-tint)] text-[var(--foreground)]"
                        : "border-transparent bg-transparent text-[var(--foreground)] hover:border-[var(--line)] hover:bg-[var(--surface-strong)]",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-[8px]",
                          active
                            ? "bg-[var(--indigo)] text-white"
                            : "bg-[var(--indigo-soft)] text-[var(--indigo-700)]",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {label}
                    </span>
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        active ? "bg-[var(--mustard)]" : "bg-transparent",
                      )}
                    />
                  </Link>
                );
              })}
            </div>

            <div className="panel-flat mt-4 p-4">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-11 w-11 rounded-[8px] border border-[var(--line)] object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[var(--mustard-soft)] font-semibold text-[var(--mustard-700)]">
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{user.email}</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                    {user.role}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Link
                  href="/ajustes"
                  className="inline-flex items-center gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--indigo)] hover:bg-[var(--indigo)] hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                  Perfil
                </Link>
                <form action={logoutAction}>
                  <button className="inline-flex items-center gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-[var(--mustard)] hover:bg-[var(--mustard)] hover:text-white">
                    <LogOut className="h-4 w-4" />
                    Salir
                  </button>
                </form>
              </div>
            </div>
          </div>
        </aside>

        <main className="panel overflow-hidden p-5 lg:p-6">
          <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full max-w-xl flex-col gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <form action="/busqueda">
                  <input
                    name="q"
                    className="w-full rounded-[9px] border border-[var(--line)] bg-[var(--surface-strong)] px-11 py-3 text-sm text-[var(--foreground)]"
                    placeholder="Buscar personas, zonas, eventos o accesos..."
                    defaultValue=""
                  />
                </form>
              </div>
              {scopeBadge ? (
                <div className="rounded-[9px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
                  {scopeBadge.title}: {scopeBadge.detail}
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/usuarios"
                className="inline-flex items-center gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)]"
              >
                <Bell className="h-4 w-4 text-[var(--mustard)]" />
                Gestion
              </Link>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-10 w-10 rounded-[8px] border border-[var(--line)] object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[var(--line)] bg-[var(--surface-strong)] text-[var(--indigo-700)]">
                  <UserRound className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
          <div className="pt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
