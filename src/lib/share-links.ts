export const APP_STORE_URL =
  "https://apps.apple.com/cr/app/carpil-viajes-compartidos/id6754807330";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.carpil.carpil";

export const SITE_URL = "https://www.carpil.app";

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

export function driverUrl(slug: string): string {
  return `${SITE_URL}/${slug}`;
}

// A chat with one person, unlike whatsappShareUrl which lets you pick who to send to.
export function whatsappChatUrl(phoneE164: string, text: string): string {
  const digits = phoneE164.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
