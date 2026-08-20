import Link from "next/link";

import { UserRole } from "@/generated/prisma/client";
import { ActionForm } from "@/components/action-form";
import { DangerButtonForm } from "@/components/danger-button-form";
import { InlineCreateCard } from "@/components/inline-create-card";
import { PageHeader } from "@/components/page-header";
import { SearchForm } from "@/components/search-form";
import { SubmitButton } from "@/components/submit-button";
import { createEvent, deleteEvent, updateEvent } from "@/lib/actions";
import { requireRouteAccess } from "@/lib/authorization";
import { getAppSnapshot, getEventRecords } from "@/lib/data";

export default async function EventosPage(props: PageProps<"/eventos">) {
  const sessionUser = await requireRouteAccess("/eventos");
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const editId = typeof searchParams.edit === "string" ? searchParams.edit : "";
  const [snapshot, events] = await Promise.all([getAppSnapshot(), getEventRecords(query)]);
  const selected = events.find((item) => item.id === editId);
  const canDelete =
    sessionUser.role === UserRole.ADMIN || sessionUser.role === UserRole.COORDINATOR;
  const allowUnassignedCoordinator = sessionUser.role === UserRole.ADMIN;
  const scopeMessage =
    sessionUser.role === UserRole.DIRIGENTE
      ? "Estas viendo eventos vinculados a tu coordinacion."
      : sessionUser.role === UserRole.COORDINATOR
        ? "Estas viendo eventos dentro de tu coordinacion."
        : "Seguimiento de actividades y tareas operativas.";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Soporte y sistema"
        title="Eventos y mantenimiento"
        description={scopeMessage}
        action={
          <Link
            href={`/export/eventos${query ? `?q=${encodeURIComponent(query)}` : ""}`}
            className="inline-flex items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
          >
            Exportar CSV
          </Link>
        }
      />

      <InlineCreateCard
        title={selected ? "Editar evento" : "Nuevo evento"}
        description={
          selected
            ? "Actualiza fecha, estado y responsable del evento seleccionado."
            : "Registra una actividad con fecha, estado y responsable territorial."
        }
      >
        <ActionForm action={selected ? updateEvent : createEvent} className="grid gap-4 lg:grid-cols-2">
          {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
          <input
            name="title"
            placeholder="Titulo del evento"
            defaultValue={selected?.title ?? ""}
            className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
            required
            minLength={4}
            maxLength={80}
          />
          <input
            name="scheduledFor"
            type="datetime-local"
            defaultValue={selected?.scheduledForInput ?? ""}
            className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
            required
          />
          <select
            name="status"
            className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
            defaultValue={selected?.statusKey ?? "PENDING"}
          >
            <option value="PENDING">Pendiente</option>
            <option value="IN_PROGRESS">En progreso</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELED">Cancelado</option>
          </select>
          <select
            name="coordinatorId"
            className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
            defaultValue={selected?.coordinatorId ?? ""}
          >
            {allowUnassignedCoordinator ? <option value="">Sin coordinador</option> : null}
            {snapshot.coordinators.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fullName}
              </option>
            ))}
          </select>
          <input
            name="location"
            placeholder="Ubicacion"
            defaultValue={selected?.location === "Sin ubicacion" ? "" : selected?.location ?? ""}
            className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm lg:col-span-2"
            maxLength={120}
          />
          <textarea
            name="description"
            placeholder="Descripcion"
            defaultValue={selected?.description ?? ""}
            className="min-h-28 rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm lg:col-span-2"
            required
            minLength={8}
            maxLength={500}
          />
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-3">
              <SubmitButton>{selected ? "Actualizar evento" : "Guardar evento"}</SubmitButton>
              {selected ? (
                <Link
                  href="/eventos"
                  className="inline-flex items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
                >
                  Cancelar edicion
                </Link>
              ) : null}
            </div>
          </div>
        </ActionForm>
      </InlineCreateCard>

      <section className="panel overflow-hidden">
        <SearchForm placeholder="Buscar evento por titulo, estado o lugar..." defaultValue={query} />
        <div className="grid gap-4 p-6 xl:grid-cols-2">
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-[12px] border border-[var(--line)] bg-[var(--surface-strong)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">{event.title}</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">{event.description}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                    {event.scheduledFor} · {event.location}
                  </p>
                </div>
                <span className="rounded-[8px] bg-[var(--mustard-soft)] px-3 py-1 text-xs font-semibold text-[var(--mustard-700)]">
                  {event.status}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex gap-2">
                  <Link
                    href={`/eventos?${query ? `q=${encodeURIComponent(query)}&` : ""}edit=${event.id}`}
                    className="inline-flex items-center rounded-[8px] bg-[var(--indigo-soft)] px-3 py-2 text-xs font-semibold text-[var(--indigo-700)]"
                  >
                    Editar
                  </Link>
                  {canDelete ? (
                    <DangerButtonForm
                      action={deleteEvent}
                      id={event.id}
                      confirmMessage={`Se eliminara el evento ${event.title}. Deseas continuar?`}
                    />
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
