import Link from "next/link";

import { UserRole } from "@/generated/prisma/client";
import { ActionForm } from "@/components/action-form";
import { DangerButtonForm } from "@/components/danger-button-form";
import { DoPhoneField } from "@/components/do-phone-field";
import { InlineCreateCard } from "@/components/inline-create-card";
import { PageHeader } from "@/components/page-header";
import { RdLocationField } from "@/components/rd-location-field";
import { SearchForm } from "@/components/search-form";
import { SubmitButton } from "@/components/submit-button";
import { TerritoryFilterForm } from "@/components/territory-filter-form";
import { createCoordinator, deleteCoordinator, updateCoordinator } from "@/lib/actions";
import { requireRouteAccess } from "@/lib/authorization";
import { getCoordinatorRecords, getTerritoryOptions } from "@/lib/data";

export default async function CoordinadoresPage(props: PageProps<"/coordinadores">) {
  const sessionUser = await requireRouteAccess("/coordinadores");
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const editId = typeof searchParams.edit === "string" ? searchParams.edit : "";
  const province = typeof searchParams.province === "string" ? searchParams.province : "";
  const municipality =
    typeof searchParams.municipality === "string" ? searchParams.municipality : "";
  const [allCoordinators, coordinators] = await Promise.all([
    getCoordinatorRecords(),
    getCoordinatorRecords({ municipality, province, query }),
  ]);
  const territory = getTerritoryOptions(allCoordinators);
  const selected = coordinators.find((item) => item.id === editId);
  const canCreate = sessionUser.role === UserRole.ADMIN;
  const canDelete = sessionUser.role === UserRole.ADMIN;
  const scopeMessage =
    sessionUser.role === UserRole.COORDINATOR
      ? "Estas viendo y gestionando solo tu coordinacion."
      : "Vista general de coordinaciones registradas.";
  const activeSearch = {
    ...(province ? { province } : {}),
    ...(municipality ? { municipality } : {}),
  };
  const editParams = new URLSearchParams({
    ...(query ? { q: query } : {}),
    ...(province ? { province } : {}),
    ...(municipality ? { municipality } : {}),
  });
  const editPrefix = editParams.toString();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Gestion de coordinadores"
        title="Coordinadores"
        description={`${scopeMessage} ${coordinators.length} coordinadores visibles.`}
        action={
          <Link
            href={`/export/coordinadores?${editPrefix}`}
            className="inline-flex items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
          >
            Exportar CSV
          </Link>
        }
      />

      {canCreate || selected ? (
        <InlineCreateCard
          title={selected ? "Editar coordinador" : "Nuevo coordinador"}
          description={
            selected
              ? "Actualiza zona, meta y datos de contacto del coordinador seleccionado."
              : "Alta directa de un coordinador con zona, meta y datos de contacto."
          }
        >
          <ActionForm
            action={selected ? updateCoordinator : createCoordinator}
            className="grid gap-4 lg:grid-cols-2"
          >
            {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
            <input
              name="fullName"
              placeholder="Nombre completo"
              defaultValue={selected?.fullName ?? ""}
              className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
              required
              minLength={4}
              maxLength={80}
            />
            <div className="lg:col-span-2">
              <RdLocationField initialZone={selected?.zone} />
            </div>
            <input
              name="email"
              type="email"
              placeholder="Correo"
              defaultValue={selected?.email ?? ""}
              className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
            />
            <DoPhoneField defaultValue={selected?.phone} />
            <input
              name="targetMembers"
              type="number"
              min="0"
              placeholder="Meta de miembros"
              defaultValue={selected?.targetMembers ?? 0}
              className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
            />
            <input
              name="notes"
              placeholder="Notas"
              defaultValue={selected?.notes ?? ""}
              className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
              maxLength={160}
            />
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-3">
                <SubmitButton>
                  {selected ? "Actualizar coordinador" : "Guardar coordinador"}
                </SubmitButton>
                {selected ? (
                  <Link
                    href="/coordinadores"
                    className="inline-flex items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
                  >
                    Cancelar edicion
                  </Link>
                ) : null}
              </div>
            </div>
          </ActionForm>
        </InlineCreateCard>
      ) : null}

      <section className="panel overflow-hidden">
        <SearchForm
          placeholder="Filtrar por nombre, codigo, zona o contacto..."
          defaultValue={query}
          hiddenFields={activeSearch}
        />
        <TerritoryFilterForm
          provinces={territory.provinces}
          municipalities={territory.municipalities}
          selectedProvince={province}
          selectedMunicipality={municipality}
          query={query}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                <th className="px-6 py-4 font-semibold">Codigo</th>
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Zona</th>
                <th className="px-6 py-4 font-semibold">Dirigentes</th>
                <th className="px-6 py-4 font-semibold">Miembros</th>
                <th className="px-6 py-4 font-semibold">Accion</th>
              </tr>
            </thead>
            <tbody>
              {coordinators.map((item) => (
                <tr key={item.id} className="border-t border-[var(--line)] text-sm">
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{item.code}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-[var(--foreground)]">{item.fullName}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {item.email || "Sin correo"} · {item.phone || "Sin telefono"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{item.zone}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-[8px] bg-[var(--indigo-soft)] px-3 py-1 text-xs font-semibold text-[var(--indigo-700)]">
                      {item.dirigenteCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-[8px] bg-[var(--mustard-soft)] px-3 py-1 text-xs font-semibold text-[var(--mustard-700)]">
                      {item.memberCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/coordinadores?${editPrefix ? `${editPrefix}&` : ""}edit=${item.id}`}
                        className="inline-flex items-center rounded-[8px] bg-[var(--indigo-soft)] px-3 py-2 text-xs font-semibold text-[var(--indigo-700)]"
                      >
                        Editar
                      </Link>
                      {canDelete ? (
                        <DangerButtonForm
                          action={deleteCoordinator}
                          id={item.id}
                          confirmMessage={`Se eliminara ${item.fullName} y su estructura vinculada: ${item.dirigenteCount} dirigentes y ${item.memberCount} miembros. Deseas continuar?`}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
