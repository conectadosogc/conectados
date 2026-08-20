import { Activity, CalendarRange, ShieldCheck, Users2 } from "lucide-react";

import { cn } from "@/lib/utils";

const icons = {
  coordinadores: Users2,
  dirigentes: ShieldCheck,
  miembros: Activity,
  eventos: CalendarRange,
};

type StatsCardProps = {
  icon: keyof typeof icons;
  label: string;
  value: number;
  trend: string;
  accent: "indigo" | "mustard";
};

const accentStyles = {
  indigo: {
    badge: "text-[var(--indigo-700)]",
    icon: "bg-[var(--indigo-soft)] text-[var(--indigo)]",
    line: "bg-[var(--indigo)]",
  },
  mustard: {
    badge: "text-[var(--mustard-700)]",
    icon: "bg-[var(--mustard-soft)] text-[var(--mustard-700)]",
    line: "bg-[var(--mustard)]",
  },
};

export function StatsCard({ icon, label, value, trend, accent }: StatsCardProps) {
  const Icon = icons[icon];
  const theme = accentStyles[accent];

  return (
    <div className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
            {label}
          </p>
          <div className="space-y-1">
            <p className="font-display text-4xl font-semibold text-[var(--foreground)]">{value}</p>
            <span
              className={cn(
                "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]",
                theme.badge,
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", theme.line)} />
              {trend}
            </span>
          </div>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-[8px]",
            theme.icon,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
