export const APP_STORE_URL =
  "https://apps.apple.com/cr/app/carpil-viajes-compartidos/id6754807330";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.carpil.carpil";

export const SITE_URL = "https://carpil.app";

export type ShareVariant = "ride" | "trip-request";

export function deepLink(variant: ShareVariant, id: string): string {
  return `carpil://${variant}/${id}`;
}

export function shareUrl(variant: ShareVariant, id: string): string {
  return `${SITE_URL}/${variant}/${id}`;
}

export function whatsappShareUrl(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
}

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}
