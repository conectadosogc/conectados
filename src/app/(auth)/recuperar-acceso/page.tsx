import Link from "next/link";
import { redirect } from "next/navigation";

import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { getSessionUser } from "@/lib/auth";
import { requestAccessRecovery } from "@/lib/actions";

export default async function RecoveryPage() {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    redirect("/panel");
  }

  return (
    <main className="grid-hero relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="dashboard-orbit one" />
      <div className="dashboard-orbit two" />

      <section className="w-full max-w-[640px] rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-7 shadow-[0_30px_70px_-42px_rgba(23,34,67,0.18)]">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--mustard-700)]">
            Recuperacion
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--foreground)]">
            Solicitar acceso
          </h1>
          <p className="max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
            Registra tu solicitud y el administrador podra restablecer tu clave desde gestion
            de usuarios.
          </p>
        </div>

        <div className="mt-6 rounded-[16px] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
          <ActionForm action={requestAccessRecovery} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                Correo
              </label>
              <input
                name="email"
                type="email"
                className="w-full rounded-[12px] border border-[var(--line)] bg-[var(--surface)] px-5 py-3.5 text-[var(--foreground)]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                Nota opcional
              </label>
              <textarea
                name="notes"
                rows={4}
                className="w-full rounded-[12px] border border-[var(--line)] bg-[var(--surface)] px-5 py-3.5 text-[var(--foreground)]"
                placeholder="Ejemplo: perdi mi clave o cambie de equipo."
              />
            </div>

            <SubmitButton className="rounded-[12px] px-5 py-3">
              Registrar solicitud
            </SubmitButton>
          </ActionForm>
        </div>

        <div className="mt-5">
          <Link href="/login" className="text-sm font-medium text-[var(--indigo)]">
            Volver al acceso
          </Link>
        </div>
      </section>
    </main>
  );
}
