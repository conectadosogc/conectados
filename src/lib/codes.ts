export type RecordCodePrefix = "CRD" | "DRG" | "MBR";

function territorySegment(value: string, fallback: string) {
  const words = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return fallback;
  if (words.length === 1) return words[0].slice(0, 4);
  return words.map((word) => word[0]).join("").slice(0, 4);
}

export function makeTerritoryCodeBase(
  prefix: RecordCodePrefix,
  province: string,
  municipality: string,
) {
  return `${prefix}-${territorySegment(province, "RD")}-${territorySegment(municipality, "LOC")}`;
}

export function makeTerritoryCode(
  prefix: RecordCodePrefix,
  province: string,
  municipality: string,
  sequence: number,
) {
  return `${makeTerritoryCodeBase(prefix, province, municipality)}-${String(sequence).padStart(3, "0")}`;
}
