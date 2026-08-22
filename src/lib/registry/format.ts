export function compactNumber(value?: number): string {
  if (value === undefined) return "—";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function calendarDate(value?: string): string {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(value));
}

export function relativeDate(value?: string): string {
  if (!value) return "never";
  const days = Math.round((new Date(value).getTime() - Date.now()) / 86_400_000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(days) < 30) return formatter.format(days, "day");
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return formatter.format(months, "month");
  return formatter.format(Math.round(months / 12), "year");
}

export function label(value: string): string {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
