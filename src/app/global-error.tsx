"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
          <div className="panel w-full p-8 md:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--mustard-700)]">
              Error de sistema
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              No se pudo completar la vista.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
              Ocurrio una falla inesperada. Puedes reintentar la accion o volver al acceso
              principal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => reset()}
                className="inline-flex items-center justify-center rounded-[10px] bg-[var(--indigo)] px-5 py-3 text-sm font-semibold text-white"
              >
                Reintentar
              </button>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--foreground)]"
              >
                Ir al login
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
