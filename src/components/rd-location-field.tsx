"use client";

import { useEffect, useMemo, useState } from "react";

import rdLocations from "@/data/rd-locations.json";
import { getCustomNeighborhoods } from "@/lib/actions";

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
  const [customNeighborhood, setCustomNeighborhood] = useState(() => {
    const initialProvince = locations.find((item) => item.name === parsed.province);
    const initialMunicipality = initialProvince?.municipalities.find(
      (item) => item.name === parsed.municipality,
    );
    return initialMunicipality?.neighborhoods.includes(parsed.neighborhood) ? "" : parsed.neighborhood;
  });
  const [isCustomNeighborhood, setIsCustomNeighborhood] = useState(() => !!customNeighborhood);
  const [savedNeighborhoods, setSavedNeighborhoods] = useState({
    key: "",
    items: [] as string[],
  });

  const selectedProvince = useMemo(
    () => locations.find((item) => item.name === province) ?? null,
    [province],
  );

  const municipalities = selectedProvince?.municipalities ?? [];
  const selectedMunicipality = municipalities.find((item) => item.name === municipality) ?? null;
  const locationKey = province && municipality ? `${province}::${municipality}` : "";
  const neighborhoods = useMemo(() => {
    const customItems = savedNeighborhoods.key === locationKey ? savedNeighborhoods.items : [];
    const items = [...(selectedMunicipality?.neighborhoods ?? []), ...customItems];
    if (neighborhood && !items.some((item) => item === neighborhood)) {
      items.push(neighborhood);
    }
    return [...new Set(items)];
  }, [locationKey, neighborhood, savedNeighborhoods, selectedMunicipality]);
  const effectiveNeighborhood = isCustomNeighborhood ? customNeighborhood.trim() : neighborhood;

  const zoneValue = [province, municipality, effectiveNeighborhood]
    .filter((item) => item && item.trim().length > 0)
    .join(" / ");
  const mustSelectStructuredZone = required && !parsed.custom;

  useEffect(() => {
    let active = true;

    if (!province || !municipality) return undefined;

    void getCustomNeighborhoods(province, municipality)
      .then((items) => {
        if (active) setSavedNeighborhoods({ key: locationKey, items });
      })
      .catch(() => {
        if (active) setSavedNeighborhoods({ key: locationKey, items: [] });
      });

    return () => {
      active = false;
    };
  }, [locationKey, municipality, province]);

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
            setIsCustomNeighborhood(false);
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
            setIsCustomNeighborhood(false);
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
        <select
          name={isCustomNeighborhood ? undefined : "neighborhoodName"}
          value={isCustomNeighborhood ? "__custom__" : neighborhood}
          disabled={!municipality}
          onChange={(event) => {
            const value = event.target.value;
            const isCustom = value === "__custom__";
            setIsCustomNeighborhood(isCustom);
            setNeighborhood(isCustom ? "" : value);
            if (!isCustom) setCustomNeighborhood("");
          }}
          className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)] disabled:opacity-60"
        >
          <option value="">Selecciona barrio o sector</option>
          {neighborhoods.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
          <option value="__custom__">Agregar otro barrio o sector</option>
        </select>
        {isCustomNeighborhood ? (
          <input
            name="neighborhoodCustom"
            value={customNeighborhood}
            onChange={(event) => setCustomNeighborhood(event.target.value)}
            placeholder="Escribe el barrio o sector"
            className="mt-2 w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)]"
            maxLength={80}
          />
        ) : null}
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
