export function toCsv(rows: Array<Record<string, string | number | null | undefined>>) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const escapeValue = (value: string | number | null | undefined) => {
    const normalized = String(value ?? "");
    const escaped = normalized.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeValue(row[header])).join(",")),
  ].join("\n");
}
