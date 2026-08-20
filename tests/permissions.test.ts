import test from "node:test";
import assert from "node:assert/strict";

import { canAccessRoute, routePermissions, type AppRole } from "../src/lib/permissions";

const roles: AppRole[] = ["ADMIN", "COORDINATOR", "DIRIGENTE", "MEMBER"];

test("todas las rutas declaradas tienen al menos un rol autorizado", () => {
  for (const [route, allowedRoles] of Object.entries(routePermissions)) {
    assert.ok(allowedRoles.length > 0, `La ruta ${route} no tiene permisos asignados.`);
  }
});

test("todos los roles pueden entrar al panel", () => {
  for (const role of roles) {
    assert.equal(canAccessRoute(role, "/panel"), true);
  }
});

test("usuarios solo admite administradores", () => {
  assert.equal(canAccessRoute("ADMIN", "/usuarios"), true);
  assert.equal(canAccessRoute("COORDINATOR", "/usuarios"), false);
  assert.equal(canAccessRoute("DIRIGENTE", "/usuarios"), false);
  assert.equal(canAccessRoute("MEMBER", "/usuarios"), false);
});

test("miembros admite dirigentes pero no miembros base", () => {
  assert.equal(canAccessRoute("ADMIN", "/miembros"), true);
  assert.equal(canAccessRoute("COORDINATOR", "/miembros"), true);
  assert.equal(canAccessRoute("DIRIGENTE", "/miembros"), true);
  assert.equal(canAccessRoute("MEMBER", "/miembros"), false);
});

test("rutas no registradas se rechazan", () => {
  assert.equal(canAccessRoute("ADMIN", "/ruta-desconocida"), false);
});
