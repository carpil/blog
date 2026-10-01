import type { APIRoute } from "astro";
import { getRide } from "../../../../lib/api";
import {
  formatDateShort,
  formatPrice,
  formatTime,
  seatsBadgeLabel,
} from "../../../../lib/format";
import { buildOgCard } from "../../../../lib/og-card";
import { CALENDAR_ICON, CLOCK_ICON } from "../../../../lib/og-icons";
import {
  fetchImageDataUri,
  pngResponse,
  renderOgPng,
} from "../../../../lib/og-render";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return new Response("Missing ride ID", { status: 400 });

  try {
    const ride = await getRide(id);
    if (!ride) return new Response("Ride not found", { status: 404 });

    const visiblePassengers = ride.passengers.slice(0, 4);
    const [driverPhoto, ...passengerPhotos] = await Promise.all([
      fetchImageDataUri(ride.driver.profilePicture),
      ...visiblePassengers.map((passenger) =>
        fetchImageDataUri(passenger.profilePicture),
      ),
    ]);

    const png = await renderOgPng(
      buildOgCard({
        badge: seatsBadgeLabel(ride.availableSeats).toUpperCase(),
        origin: ride.origin?.name.primary ?? "Origen",
        destination: ride.destination?.name.primary ?? "Destino",
        chips: [
          { icon: CALENDAR_ICON, label: formatDateShort(ride.departureDate) },
          { icon: CLOCK_ICON, label: formatTime(ride.departureDate) },
        ],
        price: formatPrice(ride.price),
        personOverline: "Conduce",
        personName: ride.driver.name,
        personPhoto: driverPhoto,
        personVerified: true,
        seatStack: {
          passengers: visiblePassengers.map((passenger, index) => ({
            name: passenger.name,
            photo: passengerPhotos[index] ?? null,
          })),
          freeSeats: ride.availableSeats,
        },
      }),
    );

    return pngResponse(png);
  } catch (error) {
    console.error("[og/ride] generation failed", error);
    return new Response("Error generating image", { status: 500 });
  }
};
