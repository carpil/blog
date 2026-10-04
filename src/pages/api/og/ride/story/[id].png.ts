import type { APIRoute } from "astro";
import { getRidePage } from "../../../../../lib/api";
import { departureWhen, formatDateShort, formatPrice, formatTime, freeSeats } from "../../../../../lib/format";
import { SEATS_CACHE, fetchImageDataUri, pngResponse, renderOgPng } from "../../../../../lib/og-render";
import { STORY_SIZE, buildStoryCard } from "../../../../../lib/og-story";

export const prerender = false;

// The 1080×1920 image behind the "Historia" share button. It says "mañana" and how many
// seats are left, so it follows the same short cache as the seat count.
export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return new Response("Missing ride ID", { status: 400 });

  try {
    const page = await getRidePage(id);
    if (!page) return new Response("Ride not found", { status: 404 });
    const { ride, driver, state } = page;

    const visiblePassengers = ride.passengers.slice(0, 4);
    const photos = await Promise.all(visiblePassengers.map((passenger) => fetchImageDataUri(passenger.profilePicture)));

    const seats = state === "open" ? freeSeats(ride) : 0;
    const day = departureWhen(ride.departureDate)?.day ?? `el ${formatDateShort(ride.departureDate)}`;
    const subline = seats <= 0 ? "Ya se llenó." : seats === 1 ? "Me queda 1 campo." : `Me quedan ${seats} campos.`;

    const png = await renderOgPng(
      buildStoryCard({
        headline: `Salgo ${day}.`,
        subline,
        origin: ride.origin?.name.primary ?? "Origen",
        destination: ride.destination?.name.primary ?? "Destino",
        when: `${formatDateShort(ride.departureDate)} · ${formatTime(ride.departureDate)}`,
        price: formatPrice(ride.price),
        passengers: visiblePassengers.map((passenger, index) => ({ name: passenger.name, photo: photos[index] ?? null })),
        capacity: ride.availableSeats,
        takenLabel: `${ride.passengers.length} de ${ride.availableSeats}`,
        footer: `Tocá el enlace para reservar · Conduce ${driver.firstName}`,
      }),
      STORY_SIZE,
    );

    return pngResponse(png, SEATS_CACHE);
  } catch (error) {
    console.error("[og/ride/story] generation failed", error);
    return new Response("Error generating image", { status: 500 });
  }
};
