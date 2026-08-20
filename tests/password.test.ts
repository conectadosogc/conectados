import test from "node:test";
import assert from "node:assert/strict";

import { hashPassword, verifyPassword } from "../src/lib/password";

test("hashPassword genera hashes distintos para la misma clave", async () => {
  const first = await hashPassword("conectados");
  const second = await hashPassword("conectados");

  assert.notEqual(first, second);
  assert.match(first, /^[a-f0-9]+:[a-f0-9]+$/);
  assert.match(second, /^[a-f0-9]+:[a-f0-9]+$/);
});

test("verifyPassword acepta la clave correcta", async () => {
  const passwordHash = await hashPassword("conectados");

  const result = await verifyPassword("conectados", passwordHash);

  assert.equal(result, true);
});

test("verifyPassword rechaza la clave incorrecta y hashes invalidos", async () => {
  const passwordHash = await hashPassword("conectados");

  assert.equal(await verifyPassword("otra-clave", passwordHash), false);
  assert.equal(await verifyPassword("conectados", null), false);
  assert.equal(await verifyPassword("conectados", "invalido"), false);
});
