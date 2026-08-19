import type { SatoriOptions } from "satori";

// Los .woff se importan con `?inline` (data URI) en vez de leerse de node_modules:
// el file tracing de Vercel no arrastra @fontsource al bundle de la función.
// Satori no lee woff2, y el subset `latin` de Inter no trae U+20A1 (₡), que sí está
// en `latin-ext` — de ahí InterExt como familia de respaldo para el precio.
import jakarta800 from "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff?inline";
import jakarta700 from "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff?inline";
import inter400 from "@fontsource/inter/files/inter-latin-400-normal.woff?inline";
import inter600 from "@fontsource/inter/files/inter-latin-600-normal.woff?inline";
import inter700 from "@fontsource/inter/files/inter-latin-700-normal.woff?inline";
import interExt700 from "@fontsource/inter/files/inter-latin-ext-700-normal.woff?inline";

function decode(dataUri: string): Buffer {
  return Buffer.from(dataUri.slice(dataUri.indexOf(",") + 1), "base64");
}

const FONTS: SatoriOptions["fonts"] = [
  { name: "Jakarta", weight: 800, style: "normal", data: decode(jakarta800) },
  { name: "Jakarta", weight: 700, style: "normal", data: decode(jakarta700) },
  { name: "Inter", weight: 400, style: "normal", data: decode(inter400) },
  { name: "Inter", weight: 600, style: "normal", data: decode(inter600) },
  { name: "Inter", weight: 700, style: "normal", data: decode(inter700) },
  { name: "InterExt", weight: 700, style: "normal", data: decode(interExt700) },
];

export function loadOgFonts(): SatoriOptions["fonts"] {
  return FONTS;
}
