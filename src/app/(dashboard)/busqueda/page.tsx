import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { requireRouteAccess } from "@/lib/authorization";
import { getAppSnapshot } from "@/lib/data";
import { canAccessRoute } from "@/lib/permissions";

function includesQuery(values: Array<string | null | undefined>, query: string) {
  const normalized = query.toLowerCase();
  return values.some((value) => (value ?? "").toLowerCase().includes(normalized));
}

export default async function BusquedaPage(props: PageProps<"/busqueda">) {
  const sessionUser = await requireRouteAccess("/busqueda");
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const snapshot = await getAppSnapshot();

  const coordinators =
    query && canAccessRoute(sessionUser.role, "/coordinadores")
      ? snapshot.coordinators.filter((item) =>
          includesQuery(
            [item.fullName, item.code, item.zone, item.province, item.municipality, item.email],
            query,
          ),
        )
      : [];

  const dirigentes =
    query && canAccessRoute(sessionUser.role, "/dirigentes")
      ? snapshot.dirigentes.filter((item) =>
          includesQuery(
            [
              item.fullName,
              item.code,
              item.zone,
              item.province,
              item.municipality,
              item.coordinatorName,
              item.email,
            ],
            query,
          ),
        )
      : [];

  const members =
    query && canAccessRoute(sessionUser.role, "/miembros")
      ? snapshot.members.filter((item) =>
          includesQuery(
            [
              item.fullName,
              item.code,
              item.zone,
              item.province,
              item.municipality,
              item.dirigenteName,
              item.email,
            ],
            query,
          ),
        )
      : [];

  const events =
    query && canAccessRoute(sessionUser.role, "/eventos")
      ? snapshot.events.filter((item) =>
          includesQuery([item.title, item.description, item.location, item.status], query),
        )
      : [];

  const users =
    query && canAccessRoute(sessionUser.role, "/usuarios")
      ? snapshot.users.filter((item) =>
          includesQuery([item.name, item.email, item.role, item.status], query),
        )
      : [];

  const accessRequests =
    query && canAccessRoute(sessionUser.role, "/usuarios")
      ? snapshot.accessRequests.filter((item) =>
          includesQuery([item.email, item.userName, item.status, item.notes], query),
        )
      : [];

  const total =
    coordinators.length +
    dirigentes.length +
    members.length +
    events.length +
    users.length +
    accessRequests.length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Busqueda global"
        title="Resultados"
        description={
          query
            ? `${total} coincidencias para "${query}".`
            : "Escribe un termino para buscar personas, zonas, eventos y accesos visibles para tu cuenta."
        }
      />

      <section className="panel-flat p-6">
        <form action="/busqueda" className="flex flex-col gap-3 md:flex-row">
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar por nombre, codigo, zona, provincia, municipio o correo..."
            className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
          />
          <button
            type="submit"
            className="rounded-[10px] bg-[var(--indigo)] px-5 py-3 text-sm font-semibold text-white"
          >
            Buscar
          </button>
        </form>
      </section>

      {!query ? (
        <section className="panel-flat p-8 text-sm text-[var(--muted-foreground)]">
          La busqueda global revisa los modulos que tu rol puede consultar y muestra resultados agrupados.
        </section>
      ) : total === 0 ? (
        <section className="panel-flat p-8 text-sm text-[var(--muted-foreground)]">
          No hay coincidencias para esta busqueda dentro de tu alcance actual.
        </section>
      ) : (
        <div className="space-y-4">
          <SearchGroup
            title="Coordinadores"
            count={coordinators.length}
            items={coordinators.map((item) => ({
              id: item.id,
              title: item.fullName,
              subtitle: `${item.code} | ${item.zone}`,
              meta: [item.email || "Sin correo", `${item.memberCount} miembros`],
              href: `/coordinadores?edit=${item.id}`,
            }))}
          />
          <SearchGroup
            title="Dirigentes"
            count={dirigentes.length}
            items={dirigentes.map((item) => ({
              id: item.id,
              title: item.fullName,
              subtitle: `${item.code} | ${item.zone}`,
              meta: [item.coordinatorName, `${item.memberCount} miembros`],
              href: `/dirigentes?edit=${item.id}`,
            }))}
          />
          <SearchGroup
            title="Miembros"
            count={members.length}
            items={members.map((item) => ({
              id: item.id,
              title: item.fullName,
              subtitle: `${item.code} | ${item.zone}`,
              meta: [item.dirigenteName, item.email || "Sin correo"],
              href: `/miembros?edit=${item.id}`,
            }))}
          />
          <SearchGroup
            title="Eventos"
            count={events.length}
            items={events.map((item) => ({
              id: item.id,
              title: item.title,
              subtitle: `${item.scheduledFor} | ${item.location}`,
              meta: [item.status],
              href: `/eventos?edit=${item.id}`,
            }))}
          />
          <SearchGroup
            title="Usuarios"
            count={users.length}
            items={users.map((item) => ({
              id: item.id,
              title: item.name,
              subtitle: item.email,
              meta: [item.role, item.status],
              href: `/usuarios?edit=${item.id}`,
            }))}
          />
          <SearchGroup
            title="Solicitudes de acceso"
            count={accessRequests.length}
            items={accessRequests.map((item) => ({
              id: item.id,
              title: item.email,
              subtitle: item.userName,
              meta: [item.status, item.createdAt],
              href: `/usuarios?rq=${encodeURIComponent(item.email)}`,
            }))}
          />
        </div>
      )}
    </div>
  );
}

function SearchGroup({
  title,
  count,
  items,
}: {
  title: string;
  count: number;
  items: Array<{
    id: string;
    title: string;
    subtitle: string;
    meta: string[];
    href: string;
  }>;
}) {
  if (!count) return null;

  return (
    <section className="panel-flat overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
        <span className="rounded-[8px] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--indigo-700)]">
          {count}
        </span>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col gap-2 px-6 py-4 hover:bg-[var(--surface-tint)]"
          >
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <p className="font-semibold text-[var(--foreground)]">{item.title}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{item.subtitle}</p>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">{item.meta.join(" | ")}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
