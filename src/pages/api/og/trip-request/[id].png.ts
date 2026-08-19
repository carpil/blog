import type { APIRoute } from "astro";
import { getTripRequest } from "../../../../lib/api";
import { formatDateShort, formatTimeRange } from "../../../../lib/format";
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
  if (!id) return new Response("Missing trip request ID", { status: 400 });

  try {
    const detail = await getTripRequest(id);
    if (!detail) return new Response("Trip request not found", { status: 404 });

    const { tripRequest, creator } = detail;
    const photo = await fetchImageDataUri(creator?.profilePicture);

    const png = await renderOgPng(
      buildOgCard({
        badge: "BUSCANDO VIAJE",
        origin: tripRequest.origin?.name.primary ?? "Origen",
        destination: tripRequest.destination?.name.primary ?? "Destino",
        chips: [
          {
            icon: CALENDAR_ICON,
            label: formatDateShort(tripRequest.window.earliest),
          },
          {
            icon: CLOCK_ICON,
            label: formatTimeRange(
              tripRequest.window.earliest,
              tripRequest.window.latest,
            ),
          },
        ],
        personOverline: "Publicado por",
        personName: creator?.name ?? "Un pasajero",
        personPhoto: photo,
        personVerified: creator?.verified ?? false,
      }),
    );

    return pngResponse(png);
  } catch (error) {
    console.error("[og/trip-request] generation failed", error);
    return new Response("Error generating image", { status: 500 });
  }
};
