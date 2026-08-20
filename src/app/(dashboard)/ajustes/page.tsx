/* eslint-disable @next/next/no-img-element */
import { ActionForm } from "@/components/action-form";
import { DoPhoneField } from "@/components/do-phone-field";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  changeOwnPassword,
  updateOrganizationProfile,
  updateOwnProfile,
} from "@/lib/actions";
import { requireRouteAccess } from "@/lib/authorization";
import { getAppSnapshot } from "@/lib/data";
import { UserRole } from "@/generated/prisma/client";

function Field({
  label,
  name,
  value,
  type = "text",
  required = false,
  minLength,
  maxLength,
  disabled = false,
}: {
  label: string;
  name: string;
  value: string | number | null | undefined;
  type?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={value ?? ""}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        disabled={disabled}
        className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3.5 text-sm text-[var(--foreground)] disabled:opacity-70"
      />
    </div>
  );
}

function TextareaField({
  label,
  name,
  value,
  rows = 4,
  maxLength,
}: {
  label: string;
  name: string;
  value: string | number | null | undefined;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
        {label}
      </label>
      <textarea
        name={name}
        rows={rows}
        maxLength={maxLength}
        defaultValue={value ?? ""}
        className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3.5 text-sm text-[var(--foreground)]"
      />
    </div>
  );
}

export default async function AjustesPage() {
  const sessionUser = await requireRouteAccess("/ajustes");
  const isAdmin = sessionUser.role === UserRole.ADMIN;
  const snapshot = await getAppSnapshot();
  const profile = snapshot.organizationProfile;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Configuracion general"
        title="Ajustes"
        description="Perfil personal, apariencia del sistema y configuracion general."
      />

      <div className="grid gap-6 2xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <ActionForm action={updateOwnProfile} className="panel p-6">
            <div className="flex flex-col gap-5 border-b border-[var(--line)] pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Perfil personal</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                  Actualiza tu nombre, foto, cargo y datos visibles dentro del sistema.
                </p>
              </div>
              <div className="flex items-center gap-4">
                {sessionUser.avatarUrl ? (
                  <img
                    src={sessionUser.avatarUrl}
                    alt={sessionUser.name}
                    className="h-16 w-16 rounded-[12px] border border-[var(--line)] object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-[12px] border border-[var(--line)] bg-[var(--surface-tint)] text-lg font-semibold text-[var(--indigo)]">
                    {sessionUser.name
                      .split(" ")
                      .map((part) => part[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <Field
                label="Nombre completo"
                name="name"
                value={sessionUser.name}
                required
                minLength={4}
                maxLength={80}
              />
              <Field label="Correo" name="emailView" value={sessionUser.email} disabled />
              <Field
                label="Cargo"
                name="title"
                value={sessionUser.title}
                maxLength={80}
              />
              <DoPhoneField label="Telefono" name="phone" defaultValue={sessionUser.phone} />
            </div>

            <div className="mt-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                  Foto de perfil
                </label>
                <input
                  name="avatarFile"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3.5 text-sm text-[var(--foreground)] file:mr-4 file:rounded-[8px] file:border-0 file:bg-[var(--indigo-soft)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--indigo-700)]"
                />
                <p className="text-xs text-[var(--muted-foreground)]">
                  JPG, PNG, WEBP o GIF. Maximo 2 MB.
                </p>
                {sessionUser.avatarUrl ? (
                  <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <input type="checkbox" name="removeAvatar" value="1" />
                    Quitar foto actual
                  </label>
                ) : null}
              </div>
            </div>

            <div className="mt-5">
              <TextareaField
                label="Descripcion breve"
                name="bio"
                value={sessionUser.bio}
                rows={4}
                maxLength={280}
              />
            </div>

            <div className="mt-8">
              <SubmitButton className="rounded-[10px] px-5 py-3">Guardar perfil</SubmitButton>
            </div>
          </ActionForm>

        </div>

        <div className="space-y-6">
          <section className="panel p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Apariencia</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Cambia entre modo claro y oscuro segun tu preferencia.
            </p>
            <div className="mt-6 flex items-center justify-between rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Tema de interfaz</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  El cambio se aplica al instante en este navegador.
                </p>
              </div>
              <ThemeToggle />
            </div>
          </section>

          <ActionForm action={changeOwnPassword} className="panel p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Seguridad de acceso</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Actualiza tu clave personal. Usa al menos 8 caracteres.
            </p>

            <div className="mt-6 space-y-5">
              <Field label="Clave actual" name="currentPassword" value="" type="password" required minLength={1} />
              <Field label="Nueva clave" name="nextPassword" value="" type="password" required minLength={8} />
              <Field
                label="Confirmar nueva clave"
                name="confirmPassword"
                value=""
                type="password"
                required
                minLength={8}
              />
            </div>

            <div className="mt-8">
              <SubmitButton className="rounded-[10px] px-5 py-3">Actualizar clave</SubmitButton>
            </div>
          </ActionForm>
        </div>

        {isAdmin ? (
          <ActionForm action={updateOrganizationProfile} className="panel p-6 2xl:col-span-2">
            <div className="mb-6 flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex rounded-[10px] border border-[var(--line)] bg-[var(--surface)] p-1 text-sm font-medium">
                  <span className="rounded-[8px] bg-[var(--indigo-soft)] px-4 py-2 text-[var(--indigo-700)]">
                    Datos generales
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  Informacion principal de la organizacion, contactos y datos publicos en una sola vista.
                </p>
              </div>
            </div>

            <div className="grid gap-6 2xl:grid-cols-2">
              <section className="space-y-5 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] p-5">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Negocio</h2>
                <div className="grid gap-5 xl:grid-cols-2">
                  <Field
                    label="Nombre del negocio"
                    name="businessName"
                    value={profile.businessName}
                    required
                    minLength={3}
                  />
                  <Field
                    label="Correo electronico"
                    name="businessEmail"
                    value={profile.businessEmail}
                    type="email"
                    required
                  />
                  <DoPhoneField
                    label="Telefono"
                    name="businessPhone"
                    defaultValue={profile.businessPhone}
                  />
                  <Field label="RNC o identificacion fiscal" name="taxId" value={profile.taxId} />
                  <div className="xl:col-span-2">
                    <Field label="Direccion completa" name="fullAddress" value={profile.fullAddress} />
                  </div>
                  <div className="xl:col-span-2">
                    <Field label="Direccion adicional" name="extraAddress" value={profile.extraAddress} />
                  </div>
                </div>
              </section>

              <section className="space-y-5 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] p-5">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Contacto</h2>
                <div className="grid gap-5 xl:grid-cols-2">
                  <Field
                    label="Cantidad de empleados"
                    name="employeeCount"
                    value={profile.employeeCount}
                    type="number"
                  />
                  <Field label="Contacto (nombre)" name="contactName" value={profile.contactName} />
                  <DoPhoneField
                    label="Contacto (telefono)"
                    name="contactPhone"
                    defaultValue={profile.contactPhone}
                  />
                  <Field
                    label="Contacto (correo)"
                    name="contactEmail"
                    value={profile.contactEmail}
                    type="email"
                    required
                  />
                </div>
              </section>

              <section className="space-y-5 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] p-5">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Informacion legal</h2>
                <div className="grid gap-5 xl:grid-cols-2">
                  <Field
                    label="Representante legal (nombre)"
                    name="legalRepresentativeName"
                    value={profile.legalRepresentativeName}
                  />
                  <Field
                    label="Representante legal (id)"
                    name="legalRepresentativeId"
                    value={profile.legalRepresentativeId}
                  />
                  <Field label="Tipo de empresa" name="companyType" value={profile.companyType} />
                  <Field label="Sitio web" name="website" value={profile.website} type="url" />
                  <div className="xl:col-span-2">
                    <Field
                      label="Correo publico"
                      name="publicEmail"
                      value={profile.publicEmail}
                      type="email"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-5 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] p-5">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Notas publicas</h2>
                <TextareaField label="Notas publicas" name="publicNotes" value={profile.publicNotes} rows={8} />
              </section>
            </div>

            <div className="mt-8">
              <SubmitButton className="rounded-[10px] px-5 py-3">Guardar datos</SubmitButton>
            </div>
          </ActionForm>
        ) : (
          <section className="panel p-6 2xl:col-span-2">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Perfil general</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Esta seccion es administrada solo por cuentas con rol de administrador.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ReadRow label="Negocio" value={profile.businessName} />
              <ReadRow label="Correo" value={profile.businessEmail} />
              <ReadRow label="Telefono" value={profile.businessPhone} />
              <ReadRow label="Direccion" value={profile.fullAddress} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ReadRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-[12px] border border-[var(--line)] bg-[var(--surface-strong)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[var(--foreground)]">{value ?? "-"}</p>
    </div>
  );
}
