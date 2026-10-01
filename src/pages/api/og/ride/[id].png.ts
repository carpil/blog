import type { APIRoute } from "astro";
import { getRidePage } from "../../../../lib/api";
import { formatDateShort, formatPrice, formatTime, freeSeats } from "../../../../lib/format";
import { buildOgCard } from "../../../../lib/og-card";
import { CALENDAR_ICON, CLOCK_ICON } from "../../../../lib/og-icons";
import { SEATS_CACHE, fetchImageDataUri, pngResponse, renderOgPng } from "../../../../lib/og-render";
import { stateBadge } from "../../../../lib/ride-copy";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return new Response("Missing ride ID", { status: 400 });

  try {
    const page = await getRidePage(id);
    if (!page) return new Response("Ride not found", { status: 404 });
    const { ride, driver, state } = page;

    const visiblePassengers = ride.passengers.slice(0, 4);
    const [driverPhoto, ...passengerPhotos] = await Promise.all([
      fetchImageDataUri(driver.profilePicture),
      ...visiblePassengers.map((passenger) => fetchImageDataUri(passenger.profilePicture)),
    ]);

    const png = await renderOgPng(
      buildOgCard({
        badge: stateBadge(ride, state).toUpperCase(),
        origin: ride.origin?.name.primary ?? "Origen",
        destination: ride.destination?.name.primary ?? "Destino",
        chips: [
          { icon: CALENDAR_ICON, label: formatDateShort(ride.departureDate) },
          { icon: CLOCK_ICON, label: formatTime(ride.departureDate) },
        ],
        price: formatPrice(ride.price),
        personOverline: "Conduce",
        personName: driver.name,
        personPhoto: driverPhoto,
        personVerified: driver.kycVerified,
        seatStack: {
          passengers: visiblePassengers.map((passenger, index) => ({
            name: passenger.name,
            photo: passengerPhotos[index] ?? null,
          })),
          freeSeats: state === "open" ? freeSeats(ride) : 0,
        },
      }),
    );

    return pngResponse(png, SEATS_CACHE);
  } catch (error) {
    console.error("[og/ride] generation failed", error);
    return new Response("Error generating image", { status: 500 });
  }
};
