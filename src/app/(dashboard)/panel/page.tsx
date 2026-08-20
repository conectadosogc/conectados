import { AlertCircle } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
import { requireRouteAccess } from "@/lib/authorization";
import { getAppSnapshot } from "@/lib/data";

export default async function DashboardPage() {
  await requireRouteAccess("/panel");
  const snapshot = await getAppSnapshot();

  const stats = [
    {
      icon: "coordinadores" as const,
      label: "Coordinadores",
      value: snapshot.coordinators.length,
      trend: "Base territorial",
      accent: "indigo" as const,
    },
    {
      icon: "dirigentes" as const,
      label: "Dirigentes",
      value: snapshot.dirigentes.length,
      trend: "Mando intermedio",
      accent: "mustard" as const,
    },
    {
      icon: "miembros" as const,
      label: "Miembros",
      value: snapshot.members.length,
      trend: "Operacion activa",
      accent: "indigo" as const,
    },
    {
      icon: "eventos" as const,
      label: "Eventos",
      value: snapshot.events.length,
      trend: "Agenda registrada",
      accent: "mustard" as const,
    },
  ];

  const totalStructure =
    snapshot.coordinators.length + snapshot.dirigentes.length + snapshot.members.length;
  const totalTargets = snapshot.coordinators.reduce((sum, item) => sum + item.targetMembers, 0);
  const maxCount = Math.max(...snapshot.coordinators.map((item) => item.memberCount), 1);
  const busiestCoordinator =
    [...snapshot.coordinators].sort((left, right) => right.memberCount - left.memberCount)[0] ?? null;
  const pendingAccessRequests = snapshot.accessRequests.filter(
    (item) => item.status === "Pendiente",
  );
  const inactiveUsers = snapshot.users.filter((item) => item.status === "Inactivo");
  const activeEvents = snapshot.events.filter(
    (item) => item.status === "Pendiente" || item.status === "En progreso",
  );
  const territoryDistribution = Array.from(
    [...snapshot.coordinators, ...snapshot.dirigentes, ...snapshot.members].reduce<
      Map<string, number>
    >((acc, item) => {
      const province = item.province?.trim();
      if (!province) return acc;
      acc.set(province, (acc.get(province) ?? 0) + 1);
      return acc;
    }, new Map()),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Panel general"
        title="Resumen operativo"
        description="Lectura rapida del estado territorial, la estructura activa y los accesos del sistema."
      />

      <section className="grid gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
        <InfoBlock
          label="Meta total declarada"
          value={String(totalTargets)}
          detail={
            busiestCoordinator
              ? `Mayor carga actual: ${busiestCoordinator.fullName}`
              : "Sin coordinaciones registradas"
          }
        />
        <InfoBlock
          label="Eventos activos"
          value={String(activeEvents.length)}
          detail={activeEvents[0] ? `Siguiente frente: ${activeEvents[0].title}` : "Sin eventos pendientes"}
        />
        <InfoBlock
          label="Usuarios inactivos"
          value={String(inactiveUsers.length)}
          detail={
            inactiveUsers[0] ? `Revisar acceso de ${inactiveUsers[0].email}` : "Sin cuentas por reactivar"
          }
        />
      </section>

      <section className="panel-flat p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
              Rendimiento por coordinacion
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Carga actual de miembros por cada coordinacion activa.
            </p>
          </div>
          <span className="rounded-[8px] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--mustard-700)]">
            {snapshot.coordinators.length} activas
          </span>
        </div>
        <div className="mt-6 space-y-5">
          {snapshot.coordinators.map((item) => {
            const width = Math.max((item.memberCount / maxCount) * 100, 8);
            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{item.fullName}</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                      {item.zone}
                    </p>
                  </div>
                  <div className="text-right text-sm font-semibold text-[var(--foreground)]">
                    {item.memberCount}
                  </div>
                </div>
                <div className="h-3 rounded-full bg-[var(--surface-tint)]">
                  <div
                    className="h-3 rounded-full bg-[var(--mustard)]"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="panel-flat p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-[var(--foreground)]">
              Agenda territorial
            </h2>
            <span className="rounded-[8px] border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--mustard-700)]">
              {activeEvents.length} activos
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {snapshot.events.map((event) => (
              <article
                key={event.id}
                className="rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-5 py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-[var(--foreground)]">{event.title}</p>
                    <p className="max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
                      {event.description}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                      {event.scheduledFor} | {event.location}
                    </p>
                  </div>
                  <span className="rounded-[8px] border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[var(--indigo-700)]">
                    {event.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel-flat p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Presencia territorial
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Provincias con mayor carga operativa registrada.
                </p>
              </div>
              <span className="rounded-[8px] border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--indigo-700)]">
                {territoryDistribution.length} provincias
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {territoryDistribution.map(([province, count]) => {
                const percentage = totalStructure ? Math.round((count / totalStructure) * 100) : 0;
                return (
                  <div key={province} className="space-y-2">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-semibold text-[var(--foreground)]">{province}</span>
                      <span className="text-[var(--muted-foreground)]">
                        {count} registros | {percentage}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--surface-tint)]">
                      <div
                        className="h-2 rounded-full bg-[var(--indigo)]"
                        style={{ width: `${Math.max(percentage, 10)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel-flat p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--mustard-soft)] text-[var(--mustard-700)]">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Pendientes inmediatos</h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Lo primero que conviene revisar hoy.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                pendingAccessRequests[0]
                  ? `Revisar solicitud de ${pendingAccessRequests[0].email}`
                  : "No hay solicitudes de recuperacion pendientes.",
                inactiveUsers[0]
                  ? `Validar estado de ${inactiveUsers[0].email}`
                  : "No hay cuentas inactivas por revisar.",
                activeEvents[0]
                  ? `Dar seguimiento a ${activeEvents[0].title}`
                  : "No hay eventos activos por seguimiento.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[9px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="panel-flat p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold text-[var(--foreground)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{detail}</p>
    </div>
  );
}
