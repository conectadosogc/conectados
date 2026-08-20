export type AppRole = "ADMIN" | "COORDINATOR" | "DIRIGENTE" | "MEMBER";

export const routePermissions: Record<string, AppRole[]> = {
  "/panel": ["ADMIN", "COORDINATOR", "DIRIGENTE", "MEMBER"],
  "/busqueda": ["ADMIN", "COORDINATOR", "DIRIGENTE", "MEMBER"],
  "/coordinadores": ["ADMIN", "COORDINATOR"],
  "/dirigentes": ["ADMIN", "COORDINATOR"],
  "/miembros": ["ADMIN", "COORDINATOR", "DIRIGENTE"],
  "/registro-avanzado": ["ADMIN", "COORDINATOR", "DIRIGENTE"],
  "/eventos": ["ADMIN", "COORDINATOR", "DIRIGENTE"],
  "/usuarios": ["ADMIN"],
  "/ajustes": ["ADMIN", "COORDINATOR", "DIRIGENTE", "MEMBER"],
};

export function canAccessRoute(role: AppRole, href: string) {
  const allowedRoles = routePermissions[href];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}
