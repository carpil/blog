import type { Ride, RideWebState } from "../types/ride";
import { departureWhen, formatDateShort, formatTime, freeSeats, seatsLeftLabel } from "./format";

export function routeLabel(ride: Ride): string {
  return `${ride.origin?.name.primary ?? "Origen"} → ${ride.destination?.name.primary ?? "Destino"}`;
}

export function whenLabel(ride: Ride): string {
  return `${formatDateShort(ride.departureDate)} a las ${formatTime(ride.departureDate)}`;
}

// Prefilled so the driver knows which trip the message is about without asking.
export function rideWhatsappMessage(driverFirstName: string, ride: Ride): string {
  return `Hola ${driverFirstName}, vi tu viaje ${routeLabel(ride)} del ${whenLabel(ride)} en Carpil. ¿Tenés campo?`;
}

export function driverWhatsappMessage(driverFirstName: string): string {
  return `Hola ${driverFirstName}, vi tus viajes en Carpil. ¿Cuándo salís?`;
}

// The driver is the one who shares the ride to fill it, so the text speaks as them.
// One quick line: the link preview underneath already carries seats, price and faces.
export function rideShareText(ride: Ride, now: Date = new Date()): string {
  const destination = ride.destination?.name.primary ?? "mi destino";
  const day = departureWhen(ride.departureDate, now)?.day ?? `el ${formatDateShort(ride.departureDate)}`;
  return `Salgo ${day} a las ${formatTime(ride.departureDate)} a ${destination}, espacios disponibles.`;
}

const CLOSED_BADGE: Record<Exclude<RideWebState, "open">, string> = {
  full: "Sin cupos",
  departed: "Ya salió",
  cancelled: "Cancelado",
};

export function stateBadge(ride: Ride, state: RideWebState): string {
  if (state === "open") return seatsLeftLabel(freeSeats(ride));
  return CLOSED_BADGE[state];
}

export const CLOSED_COPY: Record<Exclude<RideWebState, "open">, { title: string; message: (driver: string) => string }> = {
  full: {
    title: "Este viaje ya se llenó",
    message: (driver) => `Escribile a ${driver}: a veces se libera un campo o sale otro viaje.`,
  },
  departed: {
    title: "Este viaje ya salió",
    message: (driver) => `Escribile a ${driver} para apartar campo en el próximo.`,
  },
  cancelled: {
    title: "Este viaje se canceló",
    message: (driver) => `Escribile a ${driver} para ver qué otro viaje tiene.`,
  },
};

// Replaces the closed message when the driver has other rides that can still be booked.
export function otherRidesMessage(driver: string): string {
  return `${driver} tiene otros viajes con campo. Reservá uno acá mismo.`;
}
