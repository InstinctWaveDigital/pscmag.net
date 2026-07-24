function csvEscape(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function csvRow(values: (string | number | null | undefined)[]): string {
  return values.map(csvEscape).join(",");
}
