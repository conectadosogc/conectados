import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/components/login-form";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    redirect("/panel");
  }

  return (
    <main className="grid-hero relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6">
      <section className="w-full max-w-[1120px] overflow-hidden rounded-[18px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_22px_48px_-36px_rgba(25,40,79,0.18)]">
        <div className="grid min-h-[620px] items-stretch xl:grid-cols-[1fr_0.92fr]">
          <div className="flex items-center bg-[linear-gradient(160deg,#223684_0%,#2740b0_72%,#3a53c4_100%)] px-8 py-10 text-white lg:px-12">
            <div className="w-full max-w-md">
              <BrandLogo
                className="mx-auto h-40 w-full max-w-[560px] justify-center sm:h-48"
                tone="light"
              />

              <div className="mt-7">
                <h1 className="max-w-[10ch] font-display text-4xl font-semibold leading-[0.98] tracking-tight lg:text-[4.2rem]">
                  Acceso al sistema
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[var(--surface)] px-7 py-10 lg:px-10">
            <div className="w-full max-w-md">
              <div className="mb-6 space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--mustard-700)]">
                  Ingreso
                </p>
                <h2 className="font-display text-[1.95rem] font-semibold tracking-tight text-[var(--foreground)] lg:text-[2.3rem]">
                  Iniciar sesion
                </h2>
              </div>

              <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
