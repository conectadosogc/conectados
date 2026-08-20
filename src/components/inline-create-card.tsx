type InlineCreateCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function InlineCreateCard({
  title,
  description,
  children,
  defaultOpen = false,
}: InlineCreateCardProps) {
  return (
    <details className="panel overflow-hidden" open={defaultOpen}>
      <summary className="cursor-pointer list-none px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
          </div>
          <span className="rounded-[8px] bg-[var(--indigo-soft)] px-3 py-1 text-xs font-semibold text-[var(--indigo-700)]">
            Abrir
          </span>
        </div>
      </summary>
      <div className="border-t border-[var(--line)] px-6 py-6">{children}</div>
    </details>
  );
}
