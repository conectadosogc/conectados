"use client";

import { useMemo, useState } from "react";

import rdLocations from "@/data/rd-locations.json";

type Municipality = {
  name: string;
  neighborhoods: string[];
};

type Province = {
  name: string;
  municipalities: Municipality[];
};

const locations = rdLocations as Province[];

function parseZone(initialZone?: string) {
  const parts = (initialZone ?? "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      province: parts[0] ?? "",
      municipality: parts[1] ?? "",
      neighborhood: parts[2] ?? "",
      custom: "",
    };
  }

  return {
    province: "",
    municipality: "",
    neighborhood: "",
    custom: initialZone?.trim() ?? "",
  };
}

export function RdLocationField({
  initialZone,
  required = true,
}: {
  initialZone?: string;
  required?: boolean;
}) {
  const parsed = useMemo(() => parseZone(initialZone), [initialZone]);
  const [province, setProvince] = useState(parsed.province);
  const [municipality, setMunicipality] = useState(parsed.municipality);
  const [neighborhood, setNeighborhood] = useState(parsed.neighborhood);
  const [customNeighborhood, setCustomNeighborhood] = useState("");

  const selectedProvince = useMemo(
    () => locations.find((item) => item.name === province) ?? null,
    [province],
  );

  const municipalities = selectedProvince?.municipalities ?? [];
  const selectedMunicipality = municipalities.find((item) => item.name === municipality) ?? null;
  const neighborhoods = selectedMunicipality?.neighborhoods ?? [];
  const effectiveNeighborhood = neighborhoods.length
    ? neighborhood
    : customNeighborhood.trim();

  const zoneValue = [province, municipality, effectiveNeighborhood]
    .filter((item) => item && item.trim().length > 0)
    .join(" / ");
  const mustSelectStructuredZone = required && !parsed.custom;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <input type="hidden" name="zone" value={zoneValue || parsed.custom} />

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
          Provincia
        </label>
        <select
          name="provinceName"
          value={province}
          required={mustSelectStructuredZone}
          onChange={(event) => {
            setProvince(event.target.value);
            setMunicipality("");
            setNeighborhood("");
            setCustomNeighborhood("");
          }}
          className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)]"
        >
          <option value="">Selecciona provincia</option>
          {locations.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
          Municipio
        </label>
        <select
          name="municipalityName"
          value={municipality}
          required={mustSelectStructuredZone}
          disabled={!province}
          onChange={(event) => {
            setMunicipality(event.target.value);
            setNeighborhood("");
            setCustomNeighborhood("");
          }}
          className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)] disabled:opacity-60"
        >
          <option value="">Selecciona municipio</option>
          {municipalities.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
          Barrio o sector
        </label>
        {neighborhoods.length ? (
          <select
            name="neighborhoodName"
            value={neighborhood}
            disabled={!municipality}
            onChange={(event) => setNeighborhood(event.target.value)}
            className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)] disabled:opacity-60"
          >
            <option value="">Selecciona barrio o sector</option>
            {neighborhoods.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="neighborhoodCustom"
            value={customNeighborhood}
            onChange={(event) => setCustomNeighborhood(event.target.value)}
            placeholder="Barrio o sector"
            disabled={!municipality}
            className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)] disabled:opacity-60"
            maxLength={80}
          />
        )}
      </div>

      {parsed.custom && !zoneValue ? (
        <div className="lg:col-span-3 rounded-[10px] border border-[var(--mustard)] bg-[var(--mustard-soft)] px-4 py-3 text-sm text-[var(--mustard-700)]">
          Zona actual guardada: {parsed.custom}. Selecciona una provincia y municipio para
          actualizarla al nuevo formato.
        </div>
      ) : null}
    </div>
  );
}
