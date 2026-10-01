import type { Ride, RideWebState } from "../types/ride";
import { formatDateShort, formatTime, freeSeats, seatsBadgeLabel } from "./format";

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

const CLOSED_BADGE: Record<Exclude<RideWebState, "open">, string> = {
  full: "Sin cupos",
  departed: "Ya salió",
  cancelled: "Cancelado",
};

export function stateBadge(ride: Ride, state: RideWebState): string {
  if (state === "open") return seatsBadgeLabel(freeSeats(ride));
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
