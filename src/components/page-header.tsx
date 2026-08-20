import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 border-b border-[var(--line)] pb-5 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--mustard-700)]">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] md:text-[15px]">
            {description}
          </p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
