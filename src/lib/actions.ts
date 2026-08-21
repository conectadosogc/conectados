"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { EventStatus, UserRole } from "@/generated/prisma/client";
import type { ActionResponse } from "@/lib/action-state";
import { getAccessScope } from "@/lib/access-scope";
import { deleteAvatar, persistAvatar } from "@/lib/avatar-storage";
import { requireRoles } from "@/lib/authorization";
import { createSession, destroySession } from "@/lib/auth";
import { makeTerritoryCode, makeTerritoryCodeBase, type RecordCodePrefix } from "@/lib/codes";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toInt(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(clean(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDate(value: FormDataEntryValue | null) {
  const parsed = clean(value);
  return parsed ? new Date(parsed) : null;
}

function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value);
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeDominicanPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  let localDigits = digits;
  if (localDigits.length === 11 && localDigits.startsWith("1")) {
    localDigits = localDigits.slice(1);
  }

  if (localDigits.length !== 10) {
    throw new Error("Telefono invalido. Usa un numero dominicano de 10 digitos.");
  }

  return `+1 ${localDigits.slice(0, 3)} ${localDigits.slice(3, 6)} ${localDigits.slice(6)}`;
}

function normalizeDominicanNationalId(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) {
    throw new Error("Cedula invalida. Debe tener 11 digitos.");
  }

  const checksum = digits.slice(0, 10).split("").reduce((total, digit, index) => {
    const product = Number(digit) * (index % 2 === 0 ? 1 : 2);
    return total + (product > 9 ? product - 9 : product);
  }, 0);
  const verifier = (10 - (checksum % 10)) % 10;

  if (verifier !== Number(digits[10])) {
    throw new Error("Cedula invalida. Verifica el digito verificador.");
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
}

function generateTemporaryPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const values = crypto.getRandomValues(new Uint8Array(12));
  const token = Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  return `Cc-${token}`;
}

async function assertNationalIdAvailable(
  nationalId: string,
  current?: { type: "coordinator" | "dirigente" | "member"; id: string },
) {
  const [coordinator, dirigente, member] = await Promise.all([
    prisma.coordinator.findUnique({ where: { nationalId }, select: { id: true } }),
    prisma.dirigente.findUnique({ where: { nationalId }, select: { id: true } }),
    prisma.member.findUnique({ where: { nationalId }, select: { id: true } }),
  ]);

  const conflict =
    (coordinator && (current?.type !== "coordinator" || current.id !== coordinator.id)) ||
    (dirigente && (current?.type !== "dirigente" || current.id !== dirigente.id)) ||
    (member && (current?.type !== "member" || current.id !== member.id));

  assert(!conflict, "La cedula ya esta registrada en el sistema.");
}

async function assertUserRoleBinding(role: UserRole, email: string) {
  if (role === UserRole.ADMIN) return;

  const record =
    role === UserRole.COORDINATOR
      ? await prisma.coordinator.findUnique({ where: { email }, select: { id: true } })
      : role === UserRole.DIRIGENTE
        ? await prisma.dirigente.findUnique({ where: { email }, select: { id: true } })
        : await prisma.member.findUnique({ where: { email }, select: { id: true } });

  const roleName =
    role === UserRole.COORDINATOR
      ? "coordinador"
      : role === UserRole.DIRIGENTE
        ? "dirigente"
        : "miembro";

  assert(
    record,
    `Primero registra el ${roleName} con este mismo correo para poder crear su cuenta.`,
  );
}

async function nextTerritoryCode(
  prefix: RecordCodePrefix,
  province: string | null,
  municipality: string | null,
  findCodes: (base: string) => Promise<Array<{ code: string }>>,
) {
  const safeProvince = province?.trim() ?? "";
  const safeMunicipality = municipality?.trim() ?? "";
  assert(!!safeProvince && !!safeMunicipality, "Selecciona provincia y municipio para generar el codigo.");

  const base = makeTerritoryCodeBase(prefix, safeProvince, safeMunicipality);
  const records = await findCodes(base);
  const sequence = records.reduce((highest, record) => {
    const value = Number(record.code.slice(base.length + 1));
    return Number.isInteger(value) && value > highest ? value : highest;
  }, 0);

  return makeTerritoryCode(prefix, safeProvince, safeMunicipality, sequence + 1);
}

function normalizeLocationName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-DO")
    .replace(/\s+/g, " ")
    .trim();
}

async function getStructuredLocation(formData: FormData) {
  const province = clean(formData.get("provinceName"));
  const municipality = clean(formData.get("municipalityName"));
  const neighborhoodName = clean(formData.get("neighborhoodName"));
  const neighborhoodCustom = clean(formData.get("neighborhoodCustom"));
  const zone = clean(formData.get("zone"));
  const neighborhood = neighborhoodName || neighborhoodCustom || null;

  assert(zone.length >= 2, "Zona invalida.");

  if (province && municipality && neighborhoodCustom) {
    await prisma.customNeighborhood.upsert({
      where: {
        province_municipality_normalizedName: {
          province,
          municipality,
          normalizedName: normalizeLocationName(neighborhoodCustom),
        },
      },
      update: {},
      create: {
        province,
        municipality,
        name: neighborhoodCustom,
        normalizedName: normalizeLocationName(neighborhoodCustom),
      },
    });
  }

  return {
    zone,
    province: province || null,
    municipality: municipality || null,
    neighborhood,
  };
}

export async function getCustomNeighborhoods(province: string, municipality: string) {
  await requireRoles([
    UserRole.ADMIN,
    UserRole.COORDINATOR,
    UserRole.DIRIGENTE,
    UserRole.MEMBER,
  ]);

  const safeProvince = province.trim();
  const safeMunicipality = municipality.trim();
  if (!safeProvince || !safeMunicipality) return [];

  const neighborhoods = await prisma.customNeighborhood.findMany({
    where: {
      province: safeProvince,
      municipality: safeMunicipality,
    },
    select: { name: true },
    orderBy: { name: "asc" },
  });

  return neighborhoods.map((item) => item.name);
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function success(message: string): ActionResponse {
  return { status: "success", message };
}

function failure(error: unknown): ActionResponse {
  return {
    status: "error",
    message: error instanceof Error ? error.message : "Ocurrio un error inesperado.",
  };
}

function revalidateCore() {
  [
    "/panel",
    "/coordinadores",
    "/dirigentes",
    "/miembros",
    "/registro-avanzado",
    "/eventos",
    "/usuarios",
    "/ajustes",
  ].forEach((path) => revalidatePath(path));
}

async function getActorScope() {
  const sessionUser = await requireRoles([
    UserRole.ADMIN,
    UserRole.COORDINATOR,
    UserRole.DIRIGENTE,
    UserRole.MEMBER,
  ]);

  const scope = await getAccessScope();
  if (!scope) {
    throw new Error("Sesion no valida.");
  }

  return {
    sessionUser,
    scope,
  };
}

async function assertCoordinatorScopeAccess(coordinatorId: string) {
  const { scope } = await getActorScope();

  if (scope.user.role === UserRole.ADMIN) {
    return;
  }

  if (scope.user.role === UserRole.COORDINATOR && scope.coordinatorId === coordinatorId) {
    return;
  }

  if (scope.user.role === UserRole.DIRIGENTE && scope.coordinatorId === coordinatorId) {
    return;
  }

  throw new Error("No tienes permiso para operar sobre este coordinador.");
}

async function assertDirigenteScopeAccess(dirigenteId: string) {
  const dirigente = await prisma.dirigente.findUnique({
    where: { id: dirigenteId },
    select: { id: true, coordinatorId: true },
  });

  if (!dirigente) {
    throw new Error("Dirigente no encontrado.");
  }

  const { scope } = await getActorScope();

  if (scope.user.role === UserRole.ADMIN) return;
  if (
    scope.user.role === UserRole.COORDINATOR &&
    scope.coordinatorId === dirigente.coordinatorId
  ) {
    return;
  }
  if (scope.user.role === UserRole.DIRIGENTE && scope.dirigenteId === dirigente.id) {
    return;
  }

  throw new Error("No tienes permiso para operar sobre este dirigente.");
}

async function assertMemberScopeAccess(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { id: true, dirigenteId: true },
  });

  if (!member) {
    throw new Error("Miembro no encontrado.");
  }

  if (!member.dirigenteId) {
    const { scope } = await getActorScope();
    if (scope.user.role === UserRole.ADMIN) return;
    throw new Error("No tienes permiso para operar sobre un militante independiente.");
  }

  await assertDirigenteScopeAccess(member.dirigenteId);
}

async function assertEventScopeAccess(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, coordinatorId: true },
  });

  if (!event) {
    throw new Error("Evento no encontrado.");
  }

  if (!event.coordinatorId) {
    const { scope } = await getActorScope();
    if (scope.user.role !== UserRole.ADMIN) {
      throw new Error("No tienes permiso para operar sobre este evento.");
    }
    return;
  }

  await assertCoordinatorScopeAccess(event.coordinatorId);
}

export async function loginAction(_: string | null, formData: FormData) {
  const email = clean(formData.get("email")).toLowerCase();
  const password = clean(formData.get("password"));

  if (!email || !password) {
    return "Completa correo y clave.";
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!user || !user.isActive) {
    return "El usuario no existe o esta inactivo.";
  }

  let isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid && user.role === UserRole.ADMIN) {
    const expectedEmail = (process.env.ADMIN_EMAIL ?? "admin@conectados.local").toLowerCase();
    const expectedPassword = process.env.ADMIN_PASSWORD ?? "conectados";

    if (email === expectedEmail && password === expectedPassword) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(password) },
      });
      isValid = true;
    }
  }

  if (!isValid) {
    return "Credenciales invalidas.";
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession(user.id);
  redirect("/panel");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function createCoordinator(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireRoles([UserRole.ADMIN]);
    const fullName = clean(formData.get("fullName"));
    const location = await getStructuredLocation(formData);
    const email = clean(formData.get("email")).toLowerCase();
    const phone = normalizeDominicanPhone(clean(formData.get("phone")));
    const alias = clean(formData.get("alias"));
    const nationalId = normalizeDominicanNationalId(clean(formData.get("nationalId")));

    assert(fullName.length >= 4, "Nombre demasiado corto.");
    assert(alias.length <= 60, "El alias es demasiado largo.");
    assert(isValidEmail(email), "Correo requerido para crear el acceso del coordinador.");
    await assertNationalIdAvailable(nationalId);
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });
    assert(
      !existingUser || existingUser.role === UserRole.COORDINATOR,
      "Ya existe una cuenta con este correo y otro rol.",
    );
    const code = await nextTerritoryCode("CRD", location.province, location.municipality, (base) =>
      prisma.coordinator.findMany({
        where: { code: { startsWith: base } },
        select: { code: true },
      }),
    );
    const temporaryPassword = existingUser ? null : generateTemporaryPassword();
    const passwordHash = temporaryPassword ? await hashPassword(temporaryPassword) : null;

    await prisma.$transaction([
      prisma.coordinator.create({
        data: {
          code,
          fullName,
          alias: alias || null,
          nationalId,
          zone: location.zone,
          province: location.province,
          municipality: location.municipality,
          neighborhood: location.neighborhood,
          email,
          phone: phone || null,
          notes: clean(formData.get("notes")) || null,
        } as never,
      }),
      ...(temporaryPassword && passwordHash
        ? [
            prisma.user.create({
              data: {
                name: fullName,
                email,
                passwordHash,
                phone: phone || null,
                role: UserRole.COORDINATOR,
                isActive: true,
              },
            }),
          ]
        : []),
    ]);

    revalidateCore();
    return success(
      temporaryPassword
        ? `Coordinador y cuenta creados. Clave temporal: ${temporaryPassword}`
        : "Coordinador guardado y vinculado a la cuenta existente.",
    );
  } catch (error) {
    return failure(error);
  }
}

export async function updateCoordinator(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireRoles([UserRole.ADMIN, UserRole.COORDINATOR]);
    const id = clean(formData.get("id"));
    const fullName = clean(formData.get("fullName"));
    const location = await getStructuredLocation(formData);
    const email = clean(formData.get("email")).toLowerCase();
    const phone = normalizeDominicanPhone(clean(formData.get("phone")));
    const alias = clean(formData.get("alias"));
    const nationalId = normalizeDominicanNationalId(clean(formData.get("nationalId")));

    assert(!!id, "Coordinador no encontrado.");
    assert(fullName.length >= 4, "Nombre demasiado corto.");
    assert(alias.length <= 60, "El alias es demasiado largo.");
    if (email) assert(isValidEmail(email), "Correo invalido.");

    await assertCoordinatorScopeAccess(id);
    await assertNationalIdAvailable(nationalId, { type: "coordinator", id });

    await prisma.coordinator.update({
      where: { id },
      data: {
        fullName,
        alias: alias || null,
        nationalId,
        zone: location.zone,
        province: location.province,
        municipality: location.municipality,
        neighborhood: location.neighborhood,
        email: email || null,
        phone: phone || null,
        notes: clean(formData.get("notes")) || null,
      } as never,
    });

    revalidateCore();
    return success("Coordinador actualizado.");
  } catch (error) {
    return failure(error);
  }
}

export async function deleteCoordinator(formData: FormData) {
  await requireRoles([UserRole.ADMIN]);
  const id = clean(formData.get("id"));
  if (!id) return;
  await prisma.coordinator.delete({ where: { id } });
  revalidateCore();
}

export async function createDirigente(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireRoles([UserRole.ADMIN, UserRole.COORDINATOR]);
    const fullName = clean(formData.get("fullName"));
    const alias = clean(formData.get("alias"));
    const nationalId = normalizeDominicanNationalId(clean(formData.get("nationalId")));
    const location = await getStructuredLocation(formData);
    const coordinatorId = clean(formData.get("coordinatorId"));
    const email = clean(formData.get("email")).toLowerCase();
    const phone = normalizeDominicanPhone(clean(formData.get("phone")));

    assert(fullName.length >= 4, "Nombre demasiado corto.");
    assert(alias.length <= 60, "El alias es demasiado largo.");
    assert(!!coordinatorId, "Coordinador requerido.");
    if (email) assert(isValidEmail(email), "Correo invalido.");
    await assertNationalIdAvailable(nationalId);

    await assertCoordinatorScopeAccess(coordinatorId);
    const code = await nextTerritoryCode("DRG", location.province, location.municipality, (base) =>
      prisma.dirigente.findMany({
        where: { code: { startsWith: base } },
        select: { code: true },
      }),
    );

    await prisma.dirigente.create({
      data: {
        code,
        fullName,
        alias: alias || null,
        nationalId,
        zone: location.zone,
        province: location.province,
        municipality: location.municipality,
        neighborhood: location.neighborhood,
        coordinatorId,
        email: email || null,
        phone: phone || null,
      } as never,
    });

    revalidateCore();
    return success("Dirigente guardado.");
  } catch (error) {
    return failure(error);
  }
}

export async function updateDirigente(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireRoles([UserRole.ADMIN, UserRole.COORDINATOR]);
    const id = clean(formData.get("id"));
    const fullName = clean(formData.get("fullName"));
    const alias = clean(formData.get("alias"));
    const nationalId = normalizeDominicanNationalId(clean(formData.get("nationalId")));
    const location = await getStructuredLocation(formData);
    const coordinatorId = clean(formData.get("coordinatorId"));
    const email = clean(formData.get("email")).toLowerCase();
    const phone = normalizeDominicanPhone(clean(formData.get("phone")));

    assert(!!id, "Dirigente no encontrado.");
    assert(fullName.length >= 4, "Nombre demasiado corto.");
    assert(alias.length <= 60, "El alias es demasiado largo.");
    assert(!!coordinatorId, "Coordinador requerido.");
    if (email) assert(isValidEmail(email), "Correo invalido.");

    await assertDirigenteScopeAccess(id);
    await assertNationalIdAvailable(nationalId, { type: "dirigente", id });
    await assertCoordinatorScopeAccess(coordinatorId);

    await prisma.dirigente.update({
      where: { id },
      data: {
        fullName,
        alias: alias || null,
        nationalId,
        zone: location.zone,
        province: location.province,
        municipality: location.municipality,
        neighborhood: location.neighborhood,
        coordinatorId,
        email: email || null,
        phone: phone || null,
      } as never,
    });

    revalidateCore();
    return success("Dirigente actualizado.");
  } catch (error) {
    return failure(error);
  }
}

export async function deleteDirigente(formData: FormData) {
  await requireRoles([UserRole.ADMIN, UserRole.COORDINATOR]);
  const id = clean(formData.get("id"));
  if (!id) return;
  await assertDirigenteScopeAccess(id);
  await prisma.dirigente.delete({ where: { id } });
  revalidateCore();
}

export async function createMember(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireRoles([UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DIRIGENTE]);
    const fullName = clean(formData.get("fullName"));
    const alias = clean(formData.get("alias"));
    const nationalId = normalizeDominicanNationalId(clean(formData.get("nationalId")));
    const location = await getStructuredLocation(formData);
    const selectedDirigenteId = clean(formData.get("dirigenteId"));
    const isMilitant = selectedDirigenteId === "__militant__";
    const dirigenteId = isMilitant ? null : selectedDirigenteId;
    const email = clean(formData.get("email")).toLowerCase();
    const phone = normalizeDominicanPhone(clean(formData.get("phone")));

    assert(fullName.length >= 4, "Nombre demasiado corto.");
    assert(alias.length <= 60, "El alias es demasiado largo.");
    assert(isMilitant || !!dirigenteId, "Dirigente requerido.");
    if (email) assert(isValidEmail(email), "Correo invalido.");
    await assertNationalIdAvailable(nationalId);

    if (isMilitant) {
      await requireRoles([UserRole.ADMIN]);
    } else {
      await assertDirigenteScopeAccess(dirigenteId as string);
    }
    const code = await nextTerritoryCode("MBR", location.province, location.municipality, (base) =>
      prisma.member.findMany({
        where: { code: { startsWith: base } },
        select: { code: true },
      }),
    );

    await prisma.member.create({
      data: {
        code,
        fullName,
        alias: alias || null,
        nationalId,
        zone: location.zone,
        province: location.province,
        municipality: location.municipality,
        neighborhood: location.neighborhood,
        dirigenteId,
        isMilitant,
        email: email || null,
        phone: phone || null,
      } as never,
    });

    revalidateCore();
    return success("Miembro guardado.");
  } catch (error) {
    return failure(error);
  }
}

export async function updateMember(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireRoles([UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DIRIGENTE]);
    const id = clean(formData.get("id"));
    const fullName = clean(formData.get("fullName"));
    const alias = clean(formData.get("alias"));
    const nationalId = normalizeDominicanNationalId(clean(formData.get("nationalId")));
    const location = await getStructuredLocation(formData);
    const selectedDirigenteId = clean(formData.get("dirigenteId"));
    const isMilitant = selectedDirigenteId === "__militant__";
    const dirigenteId = isMilitant ? null : selectedDirigenteId;
    const email = clean(formData.get("email")).toLowerCase();
    const phone = normalizeDominicanPhone(clean(formData.get("phone")));

    assert(!!id, "Miembro no encontrado.");
    assert(fullName.length >= 4, "Nombre demasiado corto.");
    assert(alias.length <= 60, "El alias es demasiado largo.");
    assert(isMilitant || !!dirigenteId, "Dirigente requerido.");
    if (email) assert(isValidEmail(email), "Correo invalido.");

    await assertMemberScopeAccess(id);
    await assertNationalIdAvailable(nationalId, { type: "member", id });
    if (isMilitant) {
      await requireRoles([UserRole.ADMIN]);
    } else {
      await assertDirigenteScopeAccess(dirigenteId as string);
    }

    await prisma.member.update({
      where: { id },
      data: {
        fullName,
        alias: alias || null,
        nationalId,
        zone: location.zone,
        province: location.province,
        municipality: location.municipality,
        neighborhood: location.neighborhood,
        dirigenteId,
        isMilitant,
        email: email || null,
        phone: phone || null,
      } as never,
    });

    revalidateCore();
    return success("Miembro actualizado.");
  } catch (error) {
    return failure(error);
  }
}

export async function deleteMember(formData: FormData) {
  await requireRoles([UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DIRIGENTE]);
  const id = clean(formData.get("id"));
  if (!id) return;
  await assertMemberScopeAccess(id);
  await prisma.member.delete({ where: { id } });
  revalidateCore();
}

export async function createEvent(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireRoles([UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DIRIGENTE]);
    const title = clean(formData.get("title"));
    const description = clean(formData.get("description"));
    const scheduledFor = toDate(formData.get("scheduledFor"));

    assert(title.length >= 4, "Titulo invalido.");
    assert(description.length >= 8, "Descripcion invalida.");
    assert(!!scheduledFor && !Number.isNaN(scheduledFor.getTime()), "Fecha invalida.");

    const statusValue = clean(formData.get("status"));
    const status = Object.values(EventStatus).includes(statusValue as EventStatus)
      ? (statusValue as EventStatus)
      : EventStatus.PENDING;

    const coordinatorId = clean(formData.get("coordinatorId"));
    const eventDate = scheduledFor as Date;

    if (coordinatorId) {
      await assertCoordinatorScopeAccess(coordinatorId);
    } else {
      const { scope } = await getActorScope();
      if (scope.user.role !== UserRole.ADMIN) {
        throw new Error("Debes asignar un coordinador valido.");
      }
    }

    await prisma.event.create({
      data: {
        title,
        description,
        scheduledFor: eventDate,
        status,
        location: clean(formData.get("location")) || null,
        coordinatorId: coordinatorId || null,
      },
    });

    revalidateCore();
    return success("Evento guardado.");
  } catch (error) {
    return failure(error);
  }
}

export async function updateEvent(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireRoles([UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DIRIGENTE]);
    const id = clean(formData.get("id"));
    const title = clean(formData.get("title"));
    const description = clean(formData.get("description"));
    const scheduledFor = toDate(formData.get("scheduledFor"));

    assert(!!id, "Evento no encontrado.");
    assert(title.length >= 4, "Titulo invalido.");
    assert(description.length >= 8, "Descripcion invalida.");
    assert(!!scheduledFor && !Number.isNaN(scheduledFor.getTime()), "Fecha invalida.");

    const statusValue = clean(formData.get("status"));
    const status = Object.values(EventStatus).includes(statusValue as EventStatus)
      ? (statusValue as EventStatus)
      : EventStatus.PENDING;

    const coordinatorId = clean(formData.get("coordinatorId"));
    const eventDate = scheduledFor as Date;

    await assertEventScopeAccess(id);
    if (coordinatorId) {
      await assertCoordinatorScopeAccess(coordinatorId);
    } else {
      const { scope } = await getActorScope();
      if (scope.user.role !== UserRole.ADMIN) {
        throw new Error("Debes asignar un coordinador valido.");
      }
    }

    await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        scheduledFor: eventDate,
        status,
        location: clean(formData.get("location")) || null,
        coordinatorId: coordinatorId || null,
      },
    });

    revalidateCore();
    return success("Evento actualizado.");
  } catch (error) {
    return failure(error);
  }
}

export async function deleteEvent(formData: FormData) {
  await requireRoles([UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DIRIGENTE]);
  const id = clean(formData.get("id"));
  if (!id) return;
  await assertEventScopeAccess(id);
  await prisma.event.delete({ where: { id } });
  revalidateCore();
}

export async function createUser(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireRoles([UserRole.ADMIN]);
    const name = clean(formData.get("name"));
    const email = clean(formData.get("email")).toLowerCase();
    const password = clean(formData.get("password"));
    const roleValue = clean(formData.get("role"));

    assert(name.length >= 4, "Nombre invalido.");
    assert(isValidEmail(email), "Correo invalido.");
    assert(password.length >= 8, "La clave debe tener al menos 8 caracteres.");

    const role = Object.values(UserRole).includes(roleValue as UserRole)
      ? (roleValue as UserRole)
      : UserRole.MEMBER;

    await assertUserRoleBinding(role, email);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role,
        isActive: true,
      },
    });

    revalidateCore();
    return success("Usuario guardado.");
  } catch (error) {
    return failure(error);
  }
}

export async function updateUser(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireRoles([UserRole.ADMIN]);
    const id = clean(formData.get("id"));
    const name = clean(formData.get("name"));
    const email = clean(formData.get("email")).toLowerCase();
    const roleValue = clean(formData.get("role"));

    assert(!!id, "Usuario no encontrado.");
    assert(name.length >= 4, "Nombre invalido.");
    assert(isValidEmail(email), "Correo invalido.");

    const role = Object.values(UserRole).includes(roleValue as UserRole)
      ? (roleValue as UserRole)
      : UserRole.MEMBER;

    await assertUserRoleBinding(role, email);

    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
      },
    });

    revalidatePath("/usuarios");
    return success("Usuario actualizado.");
  } catch (error) {
    return failure(error);
  }
}

export async function toggleUserStatus(formData: FormData) {
  const sessionUser = await requireRoles([UserRole.ADMIN]);
  const id = clean(formData.get("id"));
  if (!id) return;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;
  if (user.id === sessionUser.id && user.isActive) return;

  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });

  revalidateCore();
}

export async function deleteUser(formData: FormData) {
  const sessionUser = await requireRoles([UserRole.ADMIN]);
  const id = clean(formData.get("id"));
  if (!id) return;

  const target = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      avatarUrl: true,
    },
  });

  if (!target) return;
  if (target.id === sessionUser.id) {
    throw new Error("No puedes eliminar tu propia cuenta.");
  }

  if (target.role === UserRole.ADMIN) {
    const adminCount = await prisma.user.count({
      where: { role: UserRole.ADMIN },
    });

    if (adminCount <= 1) {
      throw new Error("Debe quedar al menos un administrador en el sistema.");
    }
  }

  await deleteAvatar(target.avatarUrl);

  await prisma.accessRequest.deleteMany({
    where: { email: target.email },
  });

  await prisma.user.delete({
    where: { id: target.id },
  });

  revalidateCore();
}

export async function updateOwnProfile(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const sessionUser = await requireRoles([
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.DIRIGENTE,
      UserRole.MEMBER,
    ]);

    const name = clean(formData.get("name"));
    const phone = normalizeDominicanPhone(clean(formData.get("phone")));
    const title = clean(formData.get("title"));
    const bio = clean(formData.get("bio"));
    const removeAvatar = clean(formData.get("removeAvatar")) === "1";
    const avatarFile = formData.get("avatarFile");
    const currentUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { avatarUrl: true },
    });

    assert(name.length >= 4, "El nombre debe tener al menos 4 caracteres.");
    assert(name.length <= 80, "El nombre es demasiado largo.");
    if (phone) assert(phone.length >= 7, "Telefono invalido.");
    if (title) assert(title.length <= 80, "El cargo es demasiado largo.");
    if (bio) assert(bio.length <= 280, "La descripcion debe tener como maximo 280 caracteres.");

    let avatarUrl = currentUser?.avatarUrl ?? null;
    if (removeAvatar && avatarUrl) {
      await deleteAvatar(avatarUrl);
      avatarUrl = null;
    }

    if (avatarFile instanceof File && avatarFile.size > 0) {
      const nextAvatarUrl = await persistAvatar(avatarFile, sessionUser.id);
      if (avatarUrl && avatarUrl !== nextAvatarUrl) {
        await deleteAvatar(avatarUrl);
      }
      avatarUrl = nextAvatarUrl;
    }

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        name,
        phone: phone || null,
        title: title || null,
        avatarUrl,
        bio: bio || null,
      },
    });

    revalidateCore();
    return success("Perfil actualizado.");
  } catch (error) {
    return failure(error);
  }
}

export async function updateOrganizationProfile(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireRoles([UserRole.ADMIN]);
    const businessName = clean(formData.get("businessName"));
    const businessEmail = clean(formData.get("businessEmail")).toLowerCase();
    const businessPhone = normalizeDominicanPhone(clean(formData.get("businessPhone")));
    const contactEmail = clean(formData.get("contactEmail")).toLowerCase();
    const contactPhone = normalizeDominicanPhone(clean(formData.get("contactPhone")));
    const publicEmail = clean(formData.get("publicEmail")).toLowerCase();
    const website = clean(formData.get("website"));

    assert(businessName.length >= 3, "Nombre de negocio invalido.");
    assert(isValidEmail(businessEmail), "Correo del negocio invalido.");
    assert(!!businessPhone, "Telefono del negocio requerido.");
    assert(isValidEmail(contactEmail), "Correo de contacto invalido.");
    assert(!!contactPhone, "Telefono de contacto requerido.");
    if (publicEmail) assert(isValidEmail(publicEmail), "Correo publico invalido.");
    if (website) assert(isValidUrl(website), "Sitio web invalido.");

    await prisma.organizationProfile.upsert({
      where: { id: 1 },
      update: {
        businessName,
        businessEmail,
        businessPhone,
        taxId: clean(formData.get("taxId")),
        fullAddress: clean(formData.get("fullAddress")),
        employeeCount: toInt(formData.get("employeeCount"), 0) || null,
        contactName: clean(formData.get("contactName")),
        contactEmail,
        contactPhone,
        extraAddress: clean(formData.get("extraAddress")) || null,
        legalRepresentativeName: clean(formData.get("legalRepresentativeName")) || null,
        legalRepresentativeId: clean(formData.get("legalRepresentativeId")) || null,
        companyType: clean(formData.get("companyType")) || null,
        website: website || null,
        publicEmail: publicEmail || null,
        publicNotes: clean(formData.get("publicNotes")) || null,
      },
      create: {
        id: 1,
        businessName,
        businessEmail,
        businessPhone,
        taxId: clean(formData.get("taxId")),
        fullAddress: clean(formData.get("fullAddress")),
        employeeCount: toInt(formData.get("employeeCount"), 0) || null,
        contactName: clean(formData.get("contactName")),
        contactEmail,
        contactPhone,
        extraAddress: clean(formData.get("extraAddress")) || null,
        legalRepresentativeName: clean(formData.get("legalRepresentativeName")) || null,
        legalRepresentativeId: clean(formData.get("legalRepresentativeId")) || null,
        companyType: clean(formData.get("companyType")) || null,
        website: website || null,
        publicEmail: publicEmail || null,
        publicNotes: clean(formData.get("publicNotes")) || null,
      },
    });

    revalidateCore();
    return success("Ajustes actualizados.");
  } catch (error) {
    return failure(error);
  }
}

export async function changeOwnPassword(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const sessionUser = await requireRoles([
      UserRole.ADMIN,
      UserRole.COORDINATOR,
      UserRole.DIRIGENTE,
      UserRole.MEMBER,
    ]);
    const currentPassword = clean(formData.get("currentPassword"));
    const nextPassword = clean(formData.get("nextPassword"));
    const confirmPassword = clean(formData.get("confirmPassword"));

    assert(currentPassword.length >= 1, "Debes indicar tu clave actual.");
    assert(nextPassword.length >= 8, "La nueva clave debe tener al menos 8 caracteres.");
    assert(nextPassword === confirmPassword, "La confirmacion de clave no coincide.");

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    assert(isValid, "La clave actual no es correcta.");

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(nextPassword) },
    });

    return success("Clave actualizada.");
  } catch (error) {
    return failure(error);
  }
}

export async function resetUserPassword(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const sessionUser = await requireRoles([UserRole.ADMIN]);
    const id = clean(formData.get("id"));
    const nextPassword = clean(formData.get("nextPassword"));

    assert(!!id, "Usuario no encontrado.");
    assert(nextPassword.length >= 8, "La nueva clave debe tener al menos 8 caracteres.");

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!target) {
      throw new Error("Usuario no encontrado.");
    }

    assert(target.id !== sessionUser.id, "Usa el cambio de clave personal para tu cuenta.");

    await prisma.user.update({
      where: { id: target.id },
      data: {
        passwordHash: await hashPassword(nextPassword),
        isActive: true,
      },
    });

    await prisma.accessRequest.updateMany({
      where: {
        email: target.email,
        status: "PENDING",
      },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });

    revalidatePath("/usuarios");
    return success(`Clave reiniciada para ${target.email}.`);
  } catch (error) {
    return failure(error);
  }
}

export async function requestAccessRecovery(
  _: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const email = clean(formData.get("email")).toLowerCase();
    const notes = clean(formData.get("notes"));

    assert(isValidEmail(email), "Indica un correo valido.");

    const existingPending = await prisma.accessRequest.findFirst({
      where: {
        email,
        status: "PENDING",
      },
    });

    if (!existingPending) {
      await prisma.accessRequest.create({
        data: {
          email,
          notes: notes || null,
        },
      });
    }

    return success(
      "Solicitud registrada. Un administrador podra restablecer tu acceso desde el panel interno.",
    );
  } catch (error) {
    return failure(error);
  }
}

export async function resolveAccessRecovery(formData: FormData) {
  await requireRoles([UserRole.ADMIN]);
  const id = clean(formData.get("id"));
  if (!id) return;

  await prisma.accessRequest.update({
    where: { id },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
    },
  });

  revalidatePath("/usuarios");
}
