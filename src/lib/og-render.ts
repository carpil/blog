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

export function pngResponse(png: Uint8Array<ArrayBuffer>): Response {
  return new Response(png, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "CDN-Cache-Control": "public, max-age=86400",
    },
  });
}
