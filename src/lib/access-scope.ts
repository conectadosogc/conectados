import "server-only";

import { UserRole } from "@/generated/prisma/client";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ScopeBadge } from "@/lib/session";

export type AccessScope = {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  coordinatorId: null | string;
  dirigenteId: null | string;
  badge: ScopeBadge;
};

export async function getAccessScope(): Promise<AccessScope | null> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  if (sessionUser.role === UserRole.ADMIN) {
    return {
      user: sessionUser,
      coordinatorId: null,
      dirigenteId: null,
      badge: {
        title: "Acceso total",
        detail: "Vista completa de la estructura y la administracion.",
      },
    };
  }

  if (sessionUser.role === UserRole.COORDINATOR) {
    const coordinator = await prisma.coordinator.findFirst({
      where: { email: sessionUser.email },
      select: { id: true, fullName: true, zone: true },
    });

    return {
      user: sessionUser,
      coordinatorId: coordinator?.id ?? null,
      dirigenteId: null,
      badge: {
        title: "Alcance de coordinacion",
        detail: coordinator
          ? `${coordinator.fullName} · ${coordinator.zone}`
          : "Coordinacion vinculada a tu cuenta.",
      },
    };
  }

  if (sessionUser.role === UserRole.DIRIGENTE) {
    const dirigente = await prisma.dirigente.findFirst({
      where: { email: sessionUser.email },
      select: { id: true, coordinatorId: true, fullName: true, zone: true },
    });

    return {
      user: sessionUser,
      coordinatorId: dirigente?.coordinatorId ?? null,
      dirigenteId: dirigente?.id ?? null,
      badge: {
        title: "Alcance de dirigencia",
        detail: dirigente
          ? `${dirigente.fullName} · ${dirigente.zone}`
          : "Dirigencia vinculada a tu cuenta.",
      },
    };
  }

  return {
    user: sessionUser,
    coordinatorId: null,
    dirigenteId: null,
    badge: {
      title: "Acceso personal",
      detail: "Vista limitada a tu panel y ajustes de cuenta.",
    },
  };
}
