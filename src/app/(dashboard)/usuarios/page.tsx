import Link from "next/link";

import { ActionForm } from "@/components/action-form";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { DangerButtonForm } from "@/components/danger-button-form";
import { InlineCreateCard } from "@/components/inline-create-card";
import { PageHeader } from "@/components/page-header";
import { SearchForm } from "@/components/search-form";
import { SubmitButton } from "@/components/submit-button";
import {
  createUser,
  deleteUser,
  resetUserPassword,
  resolveAccessRecovery,
  toggleUserStatus,
  updateUser,
} from "@/lib/actions";
import { requireRouteAccess } from "@/lib/authorization";
import { getAccessRequestRecords, getAppSnapshot, getUserRecords } from "@/lib/data";

export default async function UsuariosPage(props: PageProps<"/usuarios">) {
  await requireRouteAccess("/usuarios");
  const searchParams = await props.searchParams;
  const editId = typeof searchParams.edit === "string" ? searchParams.edit : "";
  const userQuery = typeof searchParams.q === "string" ? searchParams.q : "";
  const userRole = typeof searchParams.role === "string" ? searchParams.role : "";
  const userStatus = typeof searchParams.status === "string" ? searchParams.status : "";
  const requestQuery = typeof searchParams.rq === "string" ? searchParams.rq : "";
  const requestStatus =
    typeof searchParams.requestStatus === "string" ? searchParams.requestStatus : "";

  const [snapshot, users, requests] = await Promise.all([
    getAppSnapshot(),
    getUserRecords({ query: userQuery, role: userRole, status: userStatus }),
    getAccessRequestRecords({ query: requestQuery, status: requestStatus }),
  ]);

  const selected = snapshot.users.find((item) => item.id === editId);
  const userEditParams = new URLSearchParams({
    ...(userQuery ? { q: userQuery } : {}),
    ...(userRole ? { role: userRole } : {}),
    ...(userStatus ? { status: userStatus } : {}),
  });
  const userEditPrefix = userEditParams.toString();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Soporte y sistema"
        title="Gestion de usuarios"
        description="Controla accesos, roles y estado operativo del personal administrativo y de estructura."
        action={
          <Link
            href={`/export/usuarios?${new URLSearchParams({
              ...(userQuery ? { q: userQuery } : {}),
              ...(userRole ? { role: userRole } : {}),
              ...(userStatus ? { status: userStatus } : {}),
              ...(requestQuery ? { rq: requestQuery } : {}),
              ...(requestStatus ? { requestStatus } : {}),
            }).toString()}`}
            className="inline-flex items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
          >
            Exportar CSV
          </Link>
        }
      />

      <InlineCreateCard
        defaultOpen={Boolean(selected)}
        title={selected ? "Editar usuario" : "Nuevo usuario"}
        description={
          selected
            ? "Actualiza nombre, correo y rol del usuario seleccionado."
            : "Alta de usuarios internos con rol administrativo u operativo."
        }
      >
        <ActionForm action={selected ? updateUser : createUser} className="grid gap-4 lg:grid-cols-4">
          {selected ? <input type="hidden" name="id" value={selected.id} /> : null}
          <input
            name="name"
            placeholder="Nombre completo"
            className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
            defaultValue={selected?.name ?? ""}
            required
            minLength={4}
            maxLength={80}
          />
          <input
            name="email"
            type="email"
            placeholder="Correo"
            className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
            defaultValue={selected?.email ?? ""}
            required
          />
          {selected ? (
            <div className="rounded-[12px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
              La clave se reinicia abajo en la tabla.
            </div>
          ) : (
            <input
              name="password"
              type="password"
              placeholder="Clave temporal"
              className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
              required
              minLength={8}
            />
          )}
          <select
            name="role"
            className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm"
            defaultValue={selected?.roleKey ?? "MEMBER"}
          >
            <option value="ADMIN">Administrador</option>
            <option value="COORDINATOR">Coordinador</option>
            <option value="DIRIGENTE">Dirigente</option>
            <option value="MEMBER">Miembro</option>
          </select>
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <SubmitButton>{selected ? "Guardar cambios" : "Guardar usuario"}</SubmitButton>
              {selected ? (
                <Link
                  href="/usuarios"
                  className="rounded-[10px] border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--foreground)]"
                >
                  Cancelar
                </Link>
              ) : null}
            </div>
          </div>
        </ActionForm>
      </InlineCreateCard>

      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--line)] px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Usuarios internos</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {users.length} resultados visibles en la busqueda actual.
              </p>
            </div>
            <div className="w-full max-w-md">
              <SearchForm
                placeholder="Buscar por nombre, correo, rol o estado..."
                defaultValue={userQuery}
                hiddenFields={{
                  ...(userRole ? { role: userRole } : {}),
                  ...(userStatus ? { status: userStatus } : {}),
                }}
              />
            </div>
          </div>
        </div>
        <form className="grid gap-3 border-b border-[var(--line)] px-6 py-5 md:grid-cols-3">
          <input type="hidden" name="q" value={userQuery} />
          <select
            name="role"
            defaultValue={userRole}
            className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)]"
          >
            <option value="">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Coordinador">Coordinador</option>
            <option value="Dirigente">Dirigente</option>
            <option value="Miembro">Miembro</option>
          </select>
          <select
            name="status"
            defaultValue={userStatus}
            className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)]"
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <button
            type="submit"
            className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]"
          >
            Aplicar filtros
          </button>
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Ultimo ingreso</th>
                <th className="px-6 py-4 font-semibold">Clave</th>
                <th className="px-6 py-4 font-semibold">Gestion</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id} className="border-t border-[var(--line)] text-sm">
                  <td className="px-6 py-4 font-semibold text-[var(--foreground)]">{item.name}</td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{item.email}</td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{item.role}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-[8px] bg-[var(--indigo-soft)] px-3 py-1 text-xs font-semibold text-[var(--indigo-700)]">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{item.lastLogin}</td>
                  <td className="px-6 py-4">
                    <ActionForm action={resetUserPassword} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={item.id} />
                      <input
                        name="nextPassword"
                        type="password"
                        placeholder="Nueva clave"
                        className="w-40 rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-xs"
                        required
                        minLength={8}
                      />
                      <ConfirmSubmitButton
                        confirmMessage={`Se reiniciara la clave de ${item.email}. Deseas continuar?`}
                        className="rounded-[10px] bg-[var(--mustard)] px-3 py-2 text-xs !text-[var(--foreground)]"
                        pendingLabel="..."
                      >
                        Reiniciar
                      </ConfirmSubmitButton>
                    </ActionForm>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex min-w-[320px] items-center gap-2">
                      <Link
                        href={`/usuarios?${userEditPrefix ? `${userEditPrefix}&` : ""}edit=${item.id}`}
                        className="inline-flex min-w-[64px] items-center justify-center whitespace-nowrap rounded-[10px] border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--foreground)]"
                      >
                        Editar
                      </Link>
                      <form action={toggleUserStatus}>
                        <input type="hidden" name="id" value={item.id} />
                        <ConfirmSubmitButton
                          confirmMessage={
                            item.status === "Activo"
                              ? `Se desactivara el acceso de ${item.email}. Deseas continuar?`
                              : `Se activara nuevamente el acceso de ${item.email}. Deseas continuar?`
                          }
                          className="inline-flex min-w-[110px] items-center justify-center whitespace-nowrap rounded-[10px] bg-[var(--surface-strong)] px-3 py-2 text-xs !text-[var(--foreground)] ring-1 ring-[var(--line)]"
                          pendingLabel="..."
                        >
                          {item.status === "Activo" ? "Desactivar" : "Activar"}
                        </ConfirmSubmitButton>
                      </form>
                      <DangerButtonForm
                        action={deleteUser}
                        id={item.id}
                        label="Eliminar"
                        confirmMessage={`Se eliminara la cuenta de ${item.email}. Deseas continuar?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Solicitudes de recuperacion
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {requests.length} solicitudes visibles en la busqueda actual.
            </p>
          </div>
          <div className="w-full max-w-md">
            <form className="flex items-center gap-3">
              <input type="hidden" name="requestStatus" value={requestStatus} />
              <input
                name="rq"
                defaultValue={requestQuery}
                placeholder="Buscar por correo, usuario o estado..."
                className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-sm text-[var(--foreground)]"
              />
              <button
                type="submit"
                className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-medium text-[var(--foreground)]"
              >
                Filtrar
              </button>
            </form>
          </div>
        </div>
        <form className="grid gap-3 border-b border-[var(--line)] px-6 py-5 md:grid-cols-2">
          <input type="hidden" name="rq" value={requestQuery} />
          <select
            name="requestStatus"
            defaultValue={requestStatus}
            className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)]"
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Resuelto">Resuelto</option>
          </select>
          <button
            type="submit"
            className="rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]"
          >
            Aplicar filtro
          </button>
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                <th className="px-6 py-4 font-semibold">Correo</th>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Solicitud</th>
                <th className="px-6 py-4 font-semibold">Resolucion</th>
                <th className="px-6 py-4 font-semibold">Nota</th>
                <th className="px-6 py-4 font-semibold">Cerrar</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <tr key={item.id} className="border-t border-[var(--line)] text-sm">
                  <td className="px-6 py-4 font-medium text-[var(--foreground)]">{item.email}</td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{item.userName}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-[8px] border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{item.createdAt}</td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{item.resolvedAt}</td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">{item.notes ?? "-"}</td>
                  <td className="px-6 py-4">
                    {item.status === "Pendiente" ? (
                      <form action={resolveAccessRecovery}>
                        <input type="hidden" name="id" value={item.id} />
                        <ConfirmSubmitButton
                          confirmMessage={`Se marcara como resuelta la solicitud de ${item.email}. Deseas continuar?`}
                          className="rounded-[10px] bg-[var(--surface-strong)] px-3 py-2 text-xs !text-[var(--foreground)] ring-1 ring-[var(--line)]"
                          pendingLabel="..."
                        >
                          Resolver
                        </ConfirmSubmitButton>
                      </form>
                    ) : (
                      <span className="text-xs text-[var(--muted-foreground)]">Cerrada</span>
                    )}
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
