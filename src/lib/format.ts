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

// The API's availableSeats is the ride's capacity, not what is left.
export function freeSeats(ride: { availableSeats: number; passengers: unknown[] }): number {
  return Math.max(0, ride.availableSeats - ride.passengers.length);
}

export function seatsLabel(seats: number): string {
  return seats === 1 ? "1 cupo" : `${seats} cupos`;
}

export function seatsBadgeLabel(seats: number): string {
  if (seats <= 0) return "Sin cupos";
  return `${seatsLabel(seats)} ${seats === 1 ? "disponible" : "disponibles"}`;
}

// The app's ride card writes the day capitalised and without the comma: "Lun 5 oct · 3:45 a. m."
export function formatCardWhen(iso: string): string {
  const day = formatDateShort(iso).replace(",", "");
  return `${day.charAt(0).toUpperCase()}${day.slice(1)} · ${formatTime(iso)}`;
}

export function seatsLeftLabel(seats: number): string {
  if (seats <= 0) return "Sin cupos";
  return seats === 1 ? "Queda 1 campo" : `Quedan ${seats} campos`;
}

export function takenLabel(taken: number, capacity: number): string {
  return `${taken} de ${capacity} ${capacity === 1 ? "campo tomado" : "campos tomados"}`;
}

function calendarDay(date: Date): number {
  const [year, month, day] = date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE }).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export interface DepartureWhen {
  // "hoy", "mañana", "el miércoles", "el 12 de octubre"
  day: string;
  // "en 5 h" or "en 40 min" when it leaves within the next 12 hours.
  soon: string | null;
}

// Relative to the moment the page or image is rendered, so it only goes where the
// result is not cached for long; the WhatsApp preview keeps absolute dates.
export function departureWhen(iso: string, now: Date = new Date()): DepartureWhen | null {
  const departure = new Date(iso);
  const msLeft = departure.getTime() - now.getTime();
  if (msLeft <= 0) return null;

  const days = Math.round((calendarDay(departure) - calendarDay(now)) / 86_400_000);
  const hours = msLeft / 3_600_000;
  const soon = hours >= 12 ? null : hours < 1 ? `en ${Math.max(1, Math.round(msLeft / 60_000))} min` : `en ${Math.floor(hours)} h`;

  if (days <= 0) return { day: "hoy", soon };
  if (days === 1) return { day: "mañana", soon };
  if (days < 7) return { day: `el ${formatWeekday(iso)}`, soon };
  const date = departure.toLocaleDateString(LOCALE, { day: "numeric", month: "long", timeZone: TIME_ZONE });
  return { day: `el ${date}`, soon };
}

// "2:00 p. m." → { time: "2:00", period: "p. m." }, for the big time-first cards.
export function splitTime(iso: string): { time: string; period: string } {
  const [time, ...period] = formatTime(iso).split(" ");
  return { time, period: period.join(" ") };
}

// The ride's calendar day in Costa Rica, "2026-10-05", to group rides by day.
export function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
}

// "Lun 5 oct"
export function formatDayLabel(iso: string): string {
  const day = formatDateShort(iso).replace(",", "");
  return `${day.charAt(0).toUpperCase()}${day.slice(1)}`;
}

// "Sale en 4 h" / "Sale en 25 min" for a ride later today; null once it's left.
export function leavesInLabel(iso: string, now: Date = new Date()): string | null {
  const msLeft = new Date(iso).getTime() - now.getTime();
  if (msLeft <= 0) return null;
  const minutes = Math.round(msLeft / 60_000);
  return minutes < 60 ? `Sale en ${Math.max(1, minutes)} min` : `Sale en ${Math.floor(minutes / 60)} h`;
}

// Short seat count for the driver page: "Quedan 3", "Queda 1", "4 libres" (nobody yet), "Sin cupos".
export function seatsShortLabel(free: number, taken: number): string {
  if (free <= 0) return "Sin cupos";
  if (taken === 0) return free === 1 ? "1 libre" : `${free} libres`;
  return free === 1 ? "Queda 1" : `Quedan ${free}`;
}
