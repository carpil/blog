import type { RideCardProps } from "../components/ride/RideCard";
import type { PublicDriverCard, Ride } from "../types/ride";
import { formatCardWhen, formatPrice } from "./format";

type CardBase = Omit<RideCardProps, "note" | "noteTone" | "cta" | "href">;

export function rideCardProps(ride: Ride, driver: PublicDriverCard): CardBase {
  return {
    origin: ride.origin?.name.primary ?? "Origen",
    destination: ride.destination?.name.primary ?? "Destino",
    when: formatCardWhen(ride.departureDate),
    price: formatPrice(ride.price),
    driverName: driver.name,
    driverPhoto: driver.profilePicture,
    driverVerified: driver.kycVerified,
    passengers: ride.passengers.map((passenger) => ({ name: passenger.name, photo: passenger.profilePicture ?? null })),
    capacity: ride.availableSeats,
  };
}
