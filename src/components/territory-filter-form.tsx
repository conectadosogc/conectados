type TerritoryFilterFormProps = {
  municipalities: string[];
  provinces: string[];
  query?: string;
  selectedMunicipality?: string;
  selectedProvince?: string;
};

export function TerritoryFilterForm({
  municipalities,
  provinces,
  query = "",
  selectedMunicipality = "",
  selectedProvince = "",
}: TerritoryFilterFormProps) {
  return (
    <form className="grid gap-3 border-b border-[var(--line)] px-6 py-5 md:grid-cols-2">
      <input type="hidden" name="q" value={query} />
      <select
        name="province"
        defaultValue={selectedProvince}
        className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)]"
      >
        <option value="">Todas las provincias</option>
        {provinces.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        name="municipality"
        defaultValue={selectedMunicipality}
        className="w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--foreground)]"
      >
        <option value="">Todos los municipios</option>
        {municipalities.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </form>
  );
}
