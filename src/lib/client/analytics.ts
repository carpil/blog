import type { PostHog } from "posthog-js";

const KEY = import.meta.env.PUBLIC_POSTHOG_KEY;
const HOST = import.meta.env.PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let client: Promise<PostHog | null> | null = null;

// Loaded on first use so the page renders before the analytics bundle arrives.
function posthog(): Promise<PostHog | null> {
  if (!KEY || typeof window === "undefined") return Promise.resolve(null);
  client ??= import("posthog-js")
    .then(({ default: ph }) => {
      ph.init(KEY, { api_host: HOST, person_profiles: "identified_only", capture_pageview: false });
      ph.register({ surface: "web" });
      return ph;
    })
    .catch(() => null);
  return client;
}

export type WebEvent =
  | "web_ride_opened"
  | "web_driver_page_opened"
  | "web_book_cta_clicked"
  | "web_signin_started"
  | "web_signed_in"
  | "web_signin_failed"
  | "web_contact_submitted"
  | "web_ride_booked"
  | "web_booking_failed"
  | "web_booking_cancelled"
  | "web_session_reset"
  | "web_whatsapp_clicked"
  | "web_whatsapp_intent"
  | "web_share_clicked";

export function track(event: WebEvent, properties: Record<string, unknown> = {}): void {
  void posthog().then((ph) => ph?.capture(event, properties));
}

// The uid is the distinct id the API's own events use, so the web funnel and
// ride_joined_server line up in one person.
export function identify(uid: string): void {
  void posthog().then((ph) => ph?.identify(uid));
}

export async function anonymousId(): Promise<string | undefined> {
  const ph = await posthog();
  return ph?.get_distinct_id() ?? undefined;
}
