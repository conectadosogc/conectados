import "server-only";

import { AccessRequestStatus, EventStatus, UserRole } from "@/generated/prisma/client";
import {
  demoCoordinators,
  demoDirigentes,
  demoEvents,
  demoMembers,
  demoOrganizationProfile,
  demoUsers,
  type CoordinatorItem,
  type DirigenteItem,
  type EventItem,
  type MemberItem,
  type OrganizationProfileItem,
  type UserItem,
} from "@/lib/demo-data";
import { getAccessScope } from "@/lib/access-scope";
import { prisma } from "@/lib/prisma";

export type CoordinatorRecord = CoordinatorItem & {
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
};

export type DirigenteRecord = DirigenteItem & {
  coordinatorId?: string;
  email?: string | null;
  phone?: string | null;
};

export type MemberRecord = MemberItem & {
  dirigenteId?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type EventRecord = EventItem & {
  statusKey?: EventStatus;
  coordinatorId?: string | null;
  scheduledForInput?: string;
};

export type UserRecord = UserItem & {
  roleKey?: UserRole;
};

export type AccessRequestRecord = {
  id: string;
  email: string;
  status: "Pendiente" | "Resuelto";
  createdAt: string;
  resolvedAt: string;
  notes?: string | null;
  userName: string;
  userExists: boolean;
};

export type TerritoryFilters = {
  municipality?: string;
  province?: string;
  query?: string;
};

export type UserFilters = {
  query?: string;
  role?: string;
  status?: string;
};

export type AccessRequestFilters = {
  query?: string;
  status?: string;
};

export type TerritoryOptionSet = {
  municipalities: string[];
  provinces: string[];
};

export type AppSnapshot = {
  coordinators: CoordinatorRecord[];
  dirigentes: DirigenteRecord[];
  members: MemberRecord[];
  events: EventRecord[];
  users: UserRecord[];
  accessRequests: AccessRequestRecord[];
  organizationProfile: OrganizationProfileItem;
  source: "database" | "demo";
};

function normalize(value: string) {
  return value.toLowerCase();
}

function matchesQuery(values: Array<string | null | undefined>, query?: string) {
  if (!query) return true;
  const q = normalize(query);
  return values.some((value) => normalize(value ?? "").includes(q));
}

function matchesTerritory<T extends { municipality?: string | null; province?: string | null }>(
  item: T,
  filters?: TerritoryFilters,
) {
  if (!filters) return true;
  if (filters.province && item.province !== filters.province) return false;
  if (filters.municipality && item.municipality !== filters.municipality) return false;
  return true;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatDateTimeInput(value: Date) {
  const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function formatRole(role: UserRole) {
  switch (role) {
    case UserRole.ADMIN:
      return "Administrador";
    case UserRole.COORDINATOR:
      return "Coordinador";
    case UserRole.DIRIGENTE:
      return "Dirigente";
    case UserRole.MEMBER:
      return "Miembro";
  }
}

function formatEventStatus(status: EventStatus): EventItem["status"] {
  switch (status) {
    case EventStatus.PENDING:
      return "Pendiente";
    case EventStatus.IN_PROGRESS:
      return "En progreso";
    case EventStatus.COMPLETED:
      return "Completado";
    case EventStatus.CANCELED:
      return "Cancelado";
  }
}

function getDemoSnapshot(): AppSnapshot {
  return {
    coordinators: demoCoordinators,
    dirigentes: demoDirigentes,
    members: demoMembers,
    events: demoEvents,
    users: demoUsers,
    accessRequests: [],
    organizationProfile: demoOrganizationProfile,
    source: "demo",
  };
}

export async function getAppSnapshot(): Promise<AppSnapshot> {
  try {
    const accessScope = await getAccessScope();
    const [coordinators, dirigentes, members, events, users, organizationProfile, accessRequests] =
      await Promise.all([
        prisma.coordinator.findMany({
          orderBy: { createdAt: "asc" },
          include: {
            dirigentes: {
              include: {
                members: true,
              },
            },
          },
        }),
        prisma.dirigente.findMany({
          orderBy: { createdAt: "asc" },
          include: {
            coordinator: true,
            members: true,
          },
        }),
        prisma.member.findMany({
          orderBy: { createdAt: "asc" },
          include: {
            dirigente: true,
          },
        }),
        prisma.event.findMany({
          orderBy: { scheduledFor: "asc" },
        }),
        prisma.user.findMany({
          orderBy: { createdAt: "asc" },
        }),
        prisma.organizationProfile.findFirst(),
        prisma.accessRequest.findMany({
          orderBy: { createdAt: "desc" },
        }),
      ]);

    const scopedCoordinatorId = accessScope?.coordinatorId ?? null;
    const scopedDirigenteId = accessScope?.dirigenteId ?? null;
    const role = accessScope?.user.role ?? UserRole.ADMIN;

    const scopedCoordinators = coordinators.filter((coordinator) => {
      if (role === UserRole.ADMIN) return true;
      if (role === UserRole.COORDINATOR) return coordinator.id === scopedCoordinatorId;
      if (role === UserRole.DIRIGENTE) {
        return coordinator.id === scopedCoordinatorId;
      }
      return false;
    });

    const scopedDirigentes = dirigentes.filter((dirigente) => {
      if (role === UserRole.ADMIN) return true;
      if (role === UserRole.COORDINATOR) return dirigente.coordinatorId === scopedCoordinatorId;
      if (role === UserRole.DIRIGENTE) return dirigente.id === scopedDirigenteId;
      return false;
    });

    const scopedMembers = members.filter((member) => {
      if (role === UserRole.ADMIN) return true;
      if (role === UserRole.COORDINATOR) {
        return member.dirigente?.coordinatorId === scopedCoordinatorId;
      }
      if (role === UserRole.DIRIGENTE) return member.dirigenteId === scopedDirigenteId;
      return false;
    });

    const scopedEvents = events.filter((event) => {
      if (role === UserRole.ADMIN) return true;
      if (role === UserRole.COORDINATOR) return event.coordinatorId === scopedCoordinatorId;
      if (role === UserRole.DIRIGENTE) return event.coordinatorId === scopedCoordinatorId;
      return false;
    });

    const scopedUsers = users.filter((user) => {
      if (role === UserRole.ADMIN) return true;
      return user.id === accessScope?.user.id;
    });

    const scopedAccessRequests =
      role === UserRole.ADMIN
        ? accessRequests
        : accessRequests.filter(() => false);

    return {
      coordinators: scopedCoordinators.map((coordinator) => ({
        id: coordinator.id,
        code: coordinator.code,
        fullName: coordinator.fullName,
        zone: coordinator.zone,
        province: coordinator.province,
        municipality: coordinator.municipality,
        neighborhood: coordinator.neighborhood,
        targetMembers: coordinator.targetMembers,
        dirigenteCount: coordinator.dirigentes.length,
        memberCount: coordinator.dirigentes.reduce(
          (total, dirigente) => total + dirigente.members.length,
          0,
        ),
        email: coordinator.email,
        phone: coordinator.phone,
        notes: coordinator.notes,
      })),
      dirigentes: scopedDirigentes.map((dirigente) => ({
        id: dirigente.id,
        code: dirigente.code,
        fullName: dirigente.fullName,
        zone: dirigente.zone,
        province: dirigente.province,
        municipality: dirigente.municipality,
        neighborhood: dirigente.neighborhood,
        coordinatorName: dirigente.coordinator.fullName,
        coordinatorId: dirigente.coordinatorId,
        memberCount: dirigente.members.length,
        email: dirigente.email,
        phone: dirigente.phone,
      })),
      members: scopedMembers.map((member) => ({
        id: member.id,
        code: member.code,
        fullName: member.fullName,
        zone: member.zone,
        province: member.province,
        municipality: member.municipality,
        neighborhood: member.neighborhood,
        dirigenteName: member.dirigente?.fullName ?? "Militante independiente",
        dirigenteId: member.dirigenteId,
        isMilitant: member.isMilitant,
        email: member.email,
        phone: member.phone,
      })),
      events: scopedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        status: formatEventStatus(event.status),
        statusKey: event.status,
        scheduledFor: formatDate(event.scheduledFor),
        scheduledForInput: formatDateTimeInput(event.scheduledFor),
        location: event.location ?? "Sin ubicacion",
        coordinatorId: event.coordinatorId,
      })),
      users: scopedUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: formatRole(user.role),
        roleKey: user.role,
        status: user.isActive ? "Activo" : "Inactivo",
        lastLogin: user.lastLoginAt ? formatDate(user.lastLoginAt) : "Sin ingreso",
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        title: user.title,
        bio: user.bio,
      })),
      accessRequests: scopedAccessRequests.map((request) => {
        const matchedUser = users.find((user) => normalize(user.email) === normalize(request.email));

        return {
          id: request.id,
          email: request.email,
          status:
            request.status === AccessRequestStatus.PENDING ? "Pendiente" : "Resuelto",
          createdAt: formatDate(request.createdAt),
          resolvedAt: request.resolvedAt ? formatDate(request.resolvedAt) : "Sin resolver",
          notes: request.notes,
          userName: matchedUser?.name ?? "Sin coincidencia",
          userExists: Boolean(matchedUser),
        };
      }),
      organizationProfile: organizationProfile ?? demoOrganizationProfile,
      source: "database",
    };
  } catch {
    return getDemoSnapshot();
  }
}

export function getTerritoryOptions<
  T extends { municipality?: string | null; province?: string | null },
>(items: T[]): TerritoryOptionSet {
  const provinces = Array.from(
    new Set(items.map((item) => item.province).filter((item): item is string => Boolean(item))),
  ).sort((a, b) => a.localeCompare(b, "es"));

  const municipalities = Array.from(
    new Set(
      items.map((item) => item.municipality).filter((item): item is string => Boolean(item)),
    ),
  ).sort((a, b) => a.localeCompare(b, "es"));

  return { municipalities, provinces };
}

export async function getCoordinatorRecords(filters?: TerritoryFilters) {
  const snapshot = await getAppSnapshot();
  return snapshot.coordinators.filter((item) =>
    matchesTerritory(item, filters) &&
    matchesQuery(
      [
        item.code,
        item.fullName,
        item.zone,
        item.province,
        item.municipality,
        item.neighborhood,
        item.email,
        item.phone,
      ],
      filters?.query,
    ),
  );
}

export async function getDirigenteRecords(filters?: TerritoryFilters) {
  const snapshot = await getAppSnapshot();
  return snapshot.dirigentes.filter((item) =>
    matchesTerritory(item, filters) &&
    matchesQuery(
      [
        item.code,
        item.fullName,
        item.zone,
        item.province,
        item.municipality,
        item.neighborhood,
        item.coordinatorName,
        item.email,
        item.phone,
      ],
      filters?.query,
    ),
  );
}

export async function getMemberRecords(filters?: TerritoryFilters) {
  const snapshot = await getAppSnapshot();
  return snapshot.members.filter((item) =>
    matchesTerritory(item, filters) &&
    matchesQuery(
      [
        item.code,
        item.fullName,
        item.zone,
        item.province,
        item.municipality,
        item.neighborhood,
        item.dirigenteName,
        item.email,
        item.phone,
      ],
      filters?.query,
    ),
  );
}

export async function getEventRecords(query?: string) {
  const snapshot = await getAppSnapshot();
  return snapshot.events.filter((item) =>
    matchesQuery([item.title, item.description, item.location, item.status], query),
  );
}

export async function getUserRecords(query?: string | UserFilters) {
  const snapshot = await getAppSnapshot();
  const filters = typeof query === "string" ? { query } : query;
  return snapshot.users.filter((item) => {
    if (filters?.role && item.role !== filters.role) return false;
    if (filters?.status && item.status !== filters.status) return false;
    return matchesQuery(
      [item.name, item.email, item.role, item.status, item.lastLogin],
      filters?.query,
    );
  });
}

export async function getAccessRequestRecords(query?: string | AccessRequestFilters) {
  const snapshot = await getAppSnapshot();
  const filters = typeof query === "string" ? { query } : query;
  return snapshot.accessRequests.filter((item) => {
    if (filters?.status && item.status !== filters.status) return false;
    return matchesQuery(
      [item.email, item.userName, item.status, item.notes],
      filters?.query,
    );
  });
}
