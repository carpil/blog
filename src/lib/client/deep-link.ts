import { APP_STORE_URL, PLAY_STORE_URL } from "../share-links";

const APPLE_UA = /iPhone|iPad|iPod|Macintosh/i;
const MOBILE_UA = /iPhone|iPad|iPod|Android/i;
const FALLBACK_DELAY = 1500;

// Links marked with data-deep-link open the app, and fall back to the store when the app
// doesn't take over the screen. On desktop they go straight to the store.
export function wireDeepLinks(root: ParentNode = document): void {
  const ua = navigator.userAgent;
  const storeUrl = APPLE_UA.test(ua) ? APP_STORE_URL : PLAY_STORE_URL;
  const mobile = MOBILE_UA.test(ua);

  root.querySelectorAll<HTMLAnchorElement>("a[data-deep-link]").forEach((link) => {
    if (!mobile) {
      link.href = storeUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      return;
    }
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = link.dataset.deepLink!;
      window.setTimeout(() => {
        if (document.visibilityState !== "visible") return;
        window.location.href = storeUrl;
      }, FALLBACK_DELAY);
    });
  });
}
