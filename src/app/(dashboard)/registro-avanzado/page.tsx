import Link from "next/link";
import { ArrowRightLeft } from "lucide-react";

import { UserRole } from "@/generated/prisma/client";
import { ActionForm } from "@/components/action-form";
import { DoPhoneField } from "@/components/do-phone-field";
import { PageHeader } from "@/components/page-header";
import { RdLocationField } from "@/components/rd-location-field";
import { SubmitButton } from "@/components/submit-button";
import { createDirigente, createMember } from "@/lib/actions";
import { requireRouteAccess } from "@/lib/authorization";
import { getAppSnapshot } from "@/lib/data";

export default async function RegistroAvanzadoPage(props: PageProps<"/registro-avanzado">) {
  const sessionUser = await requireRouteAccess("/registro-avanzado");
  const searchParams = await props.searchParams;
  const coordinatorId =
    typeof searchParams.coordinatorId === "string" ? searchParams.coordinatorId : "";
  const dirigenteId =
    typeof searchParams.dirigenteId === "string" ? searchParams.dirigenteId : "";
  const requestedMode = typeof searchParams.mode === "string" ? searchParams.mode : "dirigente";
  const query = typeof searchParams.q === "string" ? searchParams.q.trim().toLowerCase() : "";
  const canCreateDirigente =
    sessionUser.role === UserRole.ADMIN || sessionUser.role === UserRole.COORDINATOR;
  const mode = canCreateDirigente ? requestedMode : "miembro";
  const snapshot = await getAppSnapshot();

  const filteredCoordinators = snapshot.coordinators.filter((item) =>
    !query
      ? true
      : [item.fullName, item.code, item.zone, item.province, item.municipality]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query)),
  );

  const filteredDirigentes = snapshot.dirigentes.filter((item) =>
    !query
      ? true
      : [
            item.fullName,
            item.code,
            item.zone,
            item.province,
            item.municipality,
            item.coordinatorName,
          ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query)),
  );

  const selectedCoordinator = snapshot.coordinators.find((item) => item.id === coordinatorId);
  const selectedDirigente = snapshot.dirigentes.find((item) => item.id === dirigenteId);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard / registro avanzado"
        title="Registro avanzado"
        description={
          sessionUser.role === UserRole.DIRIGENTE
            ? "Alta de miembros dentro de tu dirigencia."
            : "Alta rapida siguiendo la secuencia coordinador -> dirigente -> miembro."
        }
        action={
          canCreateDirigente ? (
            <div className="inline-flex rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] p-1 text-sm font-medium">
              <Link
                href="/registro-avanzado?mode=dirigente"
                className={`rounded-[8px] px-4 py-2 ${
                  mode !== "miembro"
                    ? "bg-[var(--indigo-soft)] text-[var(--indigo-700)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                Coordinador {"->"} dirigente
              </Link>
              <Link
                href="/registro-avanzado?mode=miembro"
                className={`rounded-[8px] px-4 py-2 ${
                  mode === "miembro"
                    ? "bg-[var(--indigo-soft)] text-[var(--indigo-700)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                Dirigente {"->"} miembro
              </Link>
            </div>
          ) : null
        }
      />

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="panel p-4">
          <div className="rounded-[12px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
            <div className="border-b border-[var(--line)] pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                    {mode === "miembro" ? "Seleccionar dirigente" : "Seleccionar coordinador"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {mode === "miembro" ? filteredDirigentes.length : filteredCoordinators.length}{" "}
                    resultados disponibles.
                  </p>
                </div>
                <span className="rounded-[8px] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--indigo-700)]">
                  Paso 1 de 2
                </span>
              </div>
              <form className="mt-4">
                <input type="hidden" name="mode" value={mode} />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={
                    mode === "miembro"
                      ? "Buscar dirigente, codigo o zona..."
                      : "Buscar coordinador, codigo o zona..."
                  }
                  className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
                />
              </form>
            </div>

            <div className="soft-scrollbar mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {mode === "miembro"
                ? filteredDirigentes.map((item) => (
                    <Link
                      key={item.id}
                      href={`/registro-avanzado?mode=miembro&dirigenteId=${item.id}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                      className={`flex items-center justify-between rounded-[10px] border px-4 py-4 text-left ${
                        item.id === dirigenteId
                          ? "border-[var(--indigo)] bg-[var(--indigo-soft)]"
                          : "border-[var(--line)] bg-[var(--surface)]"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{item.fullName}</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                          {item.code} · {item.zone} · {item.coordinatorName}
                        </p>
                      </div>
                      <ArrowRightLeft className="h-4 w-4 text-[var(--muted-foreground)]" />
                    </Link>
                  ))
                : filteredCoordinators.map((item) => (
                    <Link
                      key={item.id}
                      href={`/registro-avanzado?mode=dirigente&coordinatorId=${item.id}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                      className={`flex items-center justify-between rounded-[10px] border px-4 py-4 text-left ${
                        item.id === coordinatorId
                          ? "border-[var(--indigo)] bg-[var(--indigo-soft)]"
                          : "border-[var(--line)] bg-[var(--surface)]"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{item.fullName}</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                          {item.code} · {item.zone}
                        </p>
                      </div>
                      <ArrowRightLeft className="h-4 w-4 text-[var(--muted-foreground)]" />
                    </Link>
                  ))}
            </div>
          </div>
        </div>

        <div className="panel p-8">
          {mode === "miembro" ? (
            selectedDirigente ? (
              <ActionForm action={createMember} className="space-y-4">
                <input type="hidden" name="dirigenteId" value={selectedDirigente.id} />
                <div className="space-y-4">
                  <span className="inline-flex rounded-[8px] bg-[var(--mustard-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--mustard-700)]">
                    Paso 2 de 2
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                      Dirigente base
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                      {selectedDirigente.fullName}
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {selectedDirigente.code} · {selectedDirigente.zone}
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <MiniData label="Coordinador" value={selectedDirigente.coordinatorName} />
                    <MiniData
                      label="Miembros actuales"
                      value={String(selectedDirigente.memberCount)}
                    />
                    <MiniData label="Zona base" value={selectedDirigente.zone} />
                  </div>
                </div>
                <input
                  name="fullName"
                  placeholder="Nombre completo del miembro"
                  className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
                  required
                  minLength={4}
                  maxLength={80}
                />
                <div className="lg:col-span-2">
                  <RdLocationField initialZone={selectedDirigente.zone} />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="Correo"
                  className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
                />
                <DoPhoneField />
                <SubmitButton>Crear miembro</SubmitButton>
              </ActionForm>
            ) : (
              <EmptyAdvancedState title="Selecciona un dirigente" />
            )
          ) : selectedCoordinator ? (
            <ActionForm action={createDirigente} className="space-y-4">
              <input type="hidden" name="coordinatorId" value={selectedCoordinator.id} />
              <div className="space-y-4">
                <span className="inline-flex rounded-[8px] bg-[var(--mustard-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--mustard-700)]">
                  Paso 2 de 2
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                    Coordinador base
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                    {selectedCoordinator.fullName}
                  </h2>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {selectedCoordinator.code} · {selectedCoordinator.zone}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <MiniData
                    label="Dirigentes actuales"
                    value={String(selectedCoordinator.dirigenteCount)}
                  />
                  <MiniData
                    label="Miembros actuales"
                    value={String(selectedCoordinator.memberCount)}
                  />
                  <MiniData label="Zona base" value={selectedCoordinator.zone} />
                </div>
              </div>
              <input
                name="fullName"
                placeholder="Nombre completo del dirigente"
                className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
                required
                minLength={4}
                maxLength={80}
              />
              <div className="lg:col-span-2">
                <RdLocationField initialZone={selectedCoordinator.zone} />
              </div>
              <input
                name="email"
                type="email"
                placeholder="Correo"
                className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
              />
              <DoPhoneField />
              <SubmitButton>Crear dirigente</SubmitButton>
            </ActionForm>
          ) : (
            <EmptyAdvancedState title="Selecciona un coordinador" />
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyAdvancedState({ title }: { title: string }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[12px] bg-[var(--mustard-soft)] text-[var(--mustard-700)]">
          <ArrowRightLeft className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
          El formulario de alta se habilita al seleccionar una entidad del panel lateral.
        </p>
      </div>
    </div>
  );
}

function MiniData({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}
