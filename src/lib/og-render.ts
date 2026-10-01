import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { loadOgFonts } from "./og-fonts";

const PHOTO_TIMEOUT_MS = 3000;

export async function fetchImageDataUri(
  url?: string | null,
): Promise<string | null> {
  if (!url) return null;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(PHOTO_TIMEOUT_MS) });
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function renderOgPng(
  element: unknown,
): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori(element as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: loadOgFonts(),
  });

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const rendered = resvg.render().asPng();

  const png = new Uint8Array(rendered.byteLength);
  png.set(rendered);
  return png;
}

export interface OgCachePolicy {
  browserSeconds: number;
  cdnSeconds: number;
  staleSeconds?: number;
}

export const STABLE_CACHE: OgCachePolicy = { browserSeconds: 3600, cdnSeconds: 86400 };
// Seat counts change by the minute, so a ride card can't sit in the CDN for a day.
export const SEATS_CACHE: OgCachePolicy = { browserSeconds: 60, cdnSeconds: 300, staleSeconds: 600 };

export function pngResponse(png: Uint8Array<ArrayBuffer>, cache: OgCachePolicy = STABLE_CACHE): Response {
  const stale = cache.staleSeconds ? `, stale-while-revalidate=${cache.staleSeconds}` : "";
  return new Response(png, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": `public, max-age=${cache.browserSeconds}, s-maxage=${cache.cdnSeconds}${stale}`,
      "CDN-Cache-Control": `public, max-age=${cache.cdnSeconds}${stale}`,
    },
  });
}
