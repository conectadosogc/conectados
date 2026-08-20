function randomToken(length: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export function makeCode(prefix: "CRD" | "DRG" | "MBR") {
  return `${prefix}-${randomToken(8)}`;
}
