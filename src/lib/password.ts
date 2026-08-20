const ITERATIONS = 120_000;
const KEY_LENGTH = 32;
const encoder = new TextEncoder();

function toHex(buffer: Uint8Array) {
  return Array.from(buffer)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(value: string) {
  const bytes = new Uint8Array(value.length / 2);

  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }

  return bytes;
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  return `${toHex(salt)}:${toHex(new Uint8Array(derivedBits))}`;
}

export async function verifyPassword(password: string, passwordHash: string | null | undefined) {
  if (!passwordHash) return false;

  const [salt, storedKey] = passwordHash.split(":");
  if (!salt || !storedKey) return false;

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: fromHex(salt),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );
  const derivedKey = new Uint8Array(derivedBits);
  const storedBuffer = fromHex(storedKey);

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < storedBuffer.length; index += 1) {
    mismatch |= storedBuffer[index] ^ derivedKey[index];
  }

  return mismatch === 0;
}
