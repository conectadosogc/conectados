import Link from "next/link";

import { UserRole } from "@/generated/prisma/client";
import { ActionForm } from "@/components/action-form";
import { DangerButtonForm } from "@/components/danger-button-form";
import { DoPhoneField } from "@/components/do-phone-field";
import { InlineCreateCard } from "@/components/inline-create-card";
import { PageHeader } from "@/components/page-header";
import { RdLocationField } from "@/components/rd-location-field";
import { RecordNameDetails } from "@/components/record-name-details";
import { SearchForm } from "@/components/search-form";
import { SubmitButton } from "@/components/submit-button";
import { TerritoryFilterForm } from "@/components/territory-filter-form";
import { createMember, deleteMember, updateMember } from "@/lib/actions";
import { requireRouteAccess } from "@/lib/authorization";
import { getAppSnapshot, getMemberRecords, getTerritoryOptions } from "@/lib/data";

export default async function MiembrosPage(props: PageProps<"/miembros">) {
  const sessionUser = await requireRouteAccess("/miembros");
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const editId = typeof searchParams.edit === "string" ? searchParams.edit : "";
  const province = typeof searchParams.province === "string" ? searchParams.province : "";
  const municipality =
    typeof searchParams.municipality === "string" ? searchParams.municipality : "";
  const [snapshot, allMembers, members] = await Promise.all([
    getAppSnapshot(),
    getMemberRecords(),
    getMemberRecords({ municipality, province, query }),
  ]);
  const territory = getTerritoryOptions(allMembers);
  const selected = members.find((item) => item.id === editId);
  const canDelete =
    sessionUser.role === UserRole.ADMIN || sessionUser.role === UserRole.COORDINATOR;
  const scopeMessage =
    sessionUser.role === UserRole.DIRIGENTE
      ? "Estas viendo miembros asignados a tu dirigencia."
      : sessionUser.role === UserRole.COORDINATOR
        ? "Estas viendo miembros dentro de tu coordinacion."
        : "Miembros asignados a dirigentes.";
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
        eyebrow="Base operativa"
        title="Miembros"
        description={`${scopeMessage} ${members.length} miembros visibles.`}
        action={
          <Link
            href={`/export/miembros?${editPrefix}`}
            className="inline-flex items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
          >
            Exportar CSV
          </Link>
        }
      />

      <InlineCreateCard
        title={selected ? "Editar miembro" : "Nuevo miembro"}
        description={
          selected
            ? "Actualiza los datos del miembro y el dirigente al que responde."
            : "Se crea vinculado a un dirigente ya existente."
        }
      >
        <ActionForm action={selected ? updateMember : createMember} className="grid gap-4 lg:grid-cols-2">
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
          <input
            name="alias"
            placeholder="Apodo o alias (opcional)"
            defaultValue={selected?.alias ?? ""}
            className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
            maxLength={60}
          />
          <input
            name="nationalId"
            placeholder="Cedula (000-0000000-0)"
            defaultValue={selected?.nationalId ?? ""}
            className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
            inputMode="numeric"
            required
          />
          <select
            name="dirigenteId"
            className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
            required
            defaultValue={selected?.isMilitant ? "__militant__" : selected?.dirigenteId ?? ""}
          >
            <option value="" disabled>
              Selecciona dirigente
            </option>
            <option value="__militant__">Militante independiente (sin dirigente)</option>
            {snapshot.dirigentes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fullName} · {item.zone}
              </option>
            ))}
          </select>
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
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-3">
              <SubmitButton>{selected ? "Actualizar miembro" : "Guardar miembro"}</SubmitButton>
              {selected ? (
                <Link
                  href="/miembros"
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
        <SearchForm
          placeholder="Filtrar por nombre, dirigente o zona..."
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
                <th className="px-6 py-4 font-semibold">Dirigente / tipo</th>
                <th className="px-6 py-4 font-semibold">Zona</th>
                <th className="px-6 py-4 font-semibold">Accion</th>
              </tr>
            </thead>
            <tbody>
              {members.map((item) => (
                <tr key={item.id} className="border-t border-[var(--line)] text-sm">
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{item.code}</td>
                  <td className="px-6 py-4">
                    <RecordNameDetails name={item.fullName} alias={item.alias} nationalId={item.nationalId} email={item.email} phone={item.phone} province={item.province} municipality={item.municipality} neighborhood={item.neighborhood} relationshipLabel={item.isMilitant ? "Condicion" : "Dirigente"} relationshipValue={item.isMilitant ? "Militante independiente" : item.dirigenteName} />
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {item.email || "Sin correo"} · {item.phone || "Sin telefono"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{item.isMilitant ? "Militante" : item.dirigenteName}</td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{item.zone}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/miembros?${editPrefix ? `${editPrefix}&` : ""}edit=${item.id}`}
                        className="inline-flex items-center rounded-[8px] bg-[var(--indigo-soft)] px-3 py-2 text-xs font-semibold text-[var(--indigo-700)]"
                      >
                        Editar
                      </Link>
                      {canDelete ? (
                        <DangerButtonForm
                          action={deleteMember}
                          id={item.id}
                          confirmMessage={`Se eliminara el miembro ${item.fullName}. Deseas continuar?`}
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
