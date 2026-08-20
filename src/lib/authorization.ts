import "server-only";

import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import type { AppRole } from "@/lib/permissions";
import { routePermissions } from "@/lib/permissions";

export async function requireRoles(allowedRoles: AppRole[]) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(user.role)) {
    redirect("/panel");
  }

  return user;
}

export async function requireRouteAccess(href: keyof typeof routePermissions) {
  return requireRoles(routePermissions[href]);
}
