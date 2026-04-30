import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { getRide } from "../../../../lib/api";
import { buildOgTemplate } from "../../../../lib/og-template";

export const prerender = false;

const require = createRequire(import.meta.url);

const interRegularPromise = readFile(
  require.resolve("@fontsource/inter/files/inter-latin-400-normal.woff"),
);
const interBoldPromise = readFile(
  require.resolve("@fontsource/inter/files/inter-latin-700-normal.woff"),
);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "America/Costa_Rica",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Costa_Rica",
  });
}

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response("Missing ride ID", { status: 400 });
  }

  try {
    const ride = await getRide(id);
    if (!ride) {
      return new Response("Ride not found", { status: 404 });
    }

    let driverPhotoBase64 = "";
    if (ride.driver.profilePicture) {
      try {
        const photoRes = await fetch(ride.driver.profilePicture);
        if (photoRes.ok) {
          const photoBuffer = await photoRes.arrayBuffer();
          const base64 = Buffer.from(photoBuffer).toString("base64");
          const contentType =
            photoRes.headers.get("content-type") || "image/jpeg";
          driverPhotoBase64 = `data:${contentType};base64,${base64}`;
        }
      } catch {
        // Fallback: render initial
      }
    }

    const [boldFont, regularFont] = await Promise.all([
      interBoldPromise,
      interRegularPromise,
    ]);

    const svg = await satori(
      buildOgTemplate({
        origin: ride.origin?.name.primary ?? "Origen",
        destination: ride.destination?.name.primary ?? "Destino",
        date: formatDate(ride.departureDate),
        time: formatTime(ride.departureDate),
        price: `₡${ride.price.toLocaleString("es-CR")}`,
        seatsAvailable: ride.availableSeats,
        driverName: ride.driver.name,
        driverPhoto: driverPhotoBase64,
      }) as any,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: boldFont,
            weight: 700,
            style: "normal",
          },
          {
            name: "Inter",
            data: regularFont,
            weight: 400,
            style: "normal",
          },
        ],
      },
    );

    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 },
    });
    const pngBuffer = resvg.render().asPng();

    return new Response(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "CDN-Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("OG image generation failed:", error);
    return new Response("Error generating image", { status: 500 });
  }
};
