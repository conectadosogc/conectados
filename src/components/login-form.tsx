"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowUpRight } from "lucide-react";

import { loginAction } from "@/lib/actions";

const initialState: null | string = null;

export function LoginForm() {
  const [error, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
          Correo
        </label>
        <input
          name="email"
          type="email"
          defaultValue="admin@conectados.local"
          className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3.5 text-[var(--foreground)]"
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
            Clave
          </label>
          <Link href="/recuperar-acceso" className="text-sm font-medium text-[var(--indigo)]">
            Recuperar acceso
          </Link>
        </div>
        <input
          name="password"
          type="password"
          className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3.5 text-[var(--foreground)]"
          required
          minLength={8}
          autoComplete="current-password"
        />
      </div>

      <label className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
        <span className="h-5 w-5 rounded-full border border-[var(--mustard)] bg-[var(--mustard-soft)]" />
        Mantener sesion abierta en este equipo
      </label>

      {error ? (
        <p className="rounded-[10px] border border-[var(--mustard)] bg-[var(--mustard-soft)] px-4 py-3 text-sm text-[var(--mustard-700)]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(135deg,var(--mustard),#d2a642)] px-6 py-3.5 text-base font-semibold text-[var(--foreground)] shadow-[0_18px_30px_-18px_rgba(191,144,41,0.46)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Ingresando..." : "Ingresar al sistema"}
        <ArrowUpRight className="h-4 w-4" />
      </button>
    </form>
  );
}
