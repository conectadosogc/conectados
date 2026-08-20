import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <div className="panel w-full p-8 md:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--mustard-700)]">
          Pagina no encontrada
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          Esta ruta no existe en Conectados.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
          Revisa la direccion o vuelve al panel principal si tu sesion sigue activa.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/panel"
            className="inline-flex items-center justify-center rounded-[10px] bg-[var(--indigo)] px-5 py-3 text-sm font-semibold text-white"
          >
            Ir al panel
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--foreground)]"
          >
            Volver al login
          </Link>
        </div>
      </div>
    </main>
  );
}
