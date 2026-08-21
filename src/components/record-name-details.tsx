type RecordNameDetailsProps = {
  name: string;
  alias?: string | null;
  nationalId?: string | null;
  email?: string | null;
  phone?: string | null;
  province?: string | null;
  municipality?: string | null;
  neighborhood?: string | null;
  relationshipLabel: string;
  relationshipValue: string;
  notes?: string | null;
};

export function RecordNameDetails({
  name,
  alias,
  nationalId,
  email,
  phone,
  province,
  municipality,
  neighborhood,
  relationshipLabel,
  relationshipValue,
  notes,
}: RecordNameDetailsProps) {
  const location = [province, municipality, neighborhood].filter(Boolean).join(" / ");

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[8px] py-1 outline-none transition-colors hover:text-[var(--indigo-700)] focus-visible:ring-2 focus-visible:ring-[var(--indigo)]">
        <span className="font-semibold text-[var(--foreground)]">{name}</span>
        <span className="text-xs font-semibold text-[var(--indigo-700)] group-open:hidden">Ver ficha</span>
        <span className="hidden text-xs font-semibold text-[var(--indigo-700)] group-open:inline">
          Ocultar
        </span>
      </summary>
      <div className="mt-3 grid gap-3 rounded-[8px] border border-[var(--line)] bg-[var(--surface-strong)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
        {alias ? <p><span className="font-semibold text-[var(--foreground)]">Alias: </span>{alias}</p> : null}
        <p><span className="font-semibold text-[var(--foreground)]">Cedula: </span>{nationalId || "Sin cedula registrada"}</p>
        <p><span className="font-semibold text-[var(--foreground)]">Correo: </span>{email || "Sin correo registrado"}</p>
        <p><span className="font-semibold text-[var(--foreground)]">Telefono: </span>{phone || "Sin telefono registrado"}</p>
        <p><span className="font-semibold text-[var(--foreground)]">Ubicacion: </span>{location || "Sin ubicacion detallada"}</p>
        <p><span className="font-semibold text-[var(--foreground)]">{relationshipLabel}: </span>{relationshipValue}</p>
        {notes ? <p><span className="font-semibold text-[var(--foreground)]">Notas: </span>{notes}</p> : null}
      </div>
    </details>
  );
}
