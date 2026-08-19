const LOCALE = "es-CR";
const TIME_ZONE = "America/Costa_Rica";

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TIME_ZONE,
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TIME_ZONE,
  });
}

export function formatTimeRange(earliest: string, latest: string): string {
  return `${formatTime(earliest)} – ${formatTime(latest)}`;
}

export function formatWeekday(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    weekday: "long",
    timeZone: TIME_ZONE,
  });
}

export function formatPrice(amount: number): string {
  return `₡${amount.toLocaleString(LOCALE)}`;
}

export function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function seatsLabel(seats: number): string {
  return seats === 1 ? "1 cupo" : `${seats} cupos`;
}

export function seatsBadgeLabel(seats: number): string {
  if (seats <= 0) return "Sin cupos";
  return `${seatsLabel(seats)} ${seats === 1 ? "disponible" : "disponibles"}`;
}
