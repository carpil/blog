import type { APIRoute } from "astro";
import { getDriverPage } from "../../../../lib/api";
import { formatDateShort, formatTime } from "../../../../lib/format";
import { buildDriverOgCard } from "../../../../lib/og-card";
import { SEATS_CACHE, fetchImageDataUri, pngResponse, renderOgPng } from "../../../../lib/og-render";

export const prerender = false;

const summaryFor = (rideCount: number): string => {
  if (rideCount === 0) return "Conductor en Carpil";
  return rideCount === 1 ? "1 viaje próximo" : `${rideCount} viajes próximos`;
};

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  if (!slug) return new Response("Missing driver", { status: 400 });

  try {
    const page = await getDriverPage(slug);
    if (!page) return new Response("Driver not found", { status: 404 });
    const { driver, rides } = page;

    const png = await renderOgPng(
      buildDriverOgCard({
        name: driver.name,
        photo: await fetchImageDataUri(driver.profilePicture),
        verified: driver.kycVerified,
        summary: summaryFor(rides.length),
        rating: driver.averageRating !== null && driver.ratingsCount > 0 ? driver.averageRating.toFixed(1) : null,
        rides: rides.map((ride) => ({
          when: `${formatDateShort(ride.departureDate)} · ${formatTime(ride.departureDate)}`,
          origin: ride.origin?.name.primary ?? "Origen",
          destination: ride.destination?.name.primary ?? "Destino",
        })),
        footer: `Apartá tu campo en carpil.app/${driver.slug ?? slug}`,
      }),
    );

    return pngResponse(png, SEATS_CACHE);
  } catch (error) {
    console.error("[og/driver] generation failed", error);
    return new Response("Error generating image", { status: 500 });
  }
};
