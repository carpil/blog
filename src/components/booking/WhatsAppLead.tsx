import { track } from "../../lib/client/analytics";
import { whatsappChatUrl } from "../../lib/share-links";
import "./booking.css";

// "booked" is the passenger writing to the driver from the confirmation, after reserving.
export type LeadContext = "ride" | "ride_closed" | "driver_page" | "booked";

interface Props {
  rideId?: string;
  driverSlug?: string;
  whatsapp: string;
  message: string;
  label: string;
  context: LeadContext;
  // "icon" is the round WhatsApp button next to the driver's name; the label becomes its aria-label.
  variant?: "text" | "icon";
}

// Opens the chat straight away; nothing stands between the tap and WhatsApp. Who tapped
// comes from the PostHog event itself: the signed-in account, or this browser's
// anonymous id until they sign in.
export default function WhatsAppLead({ rideId, driverSlug, whatsapp, message, label, context, variant = "text" }: Props) {
  const onClick = () => {
    const properties = { context, ride_id: rideId ?? null, driver_slug: driverSlug ?? null };
    track("web_whatsapp_clicked", properties);
    // Kept alongside the click so dashboards built on it keep counting.
    track("web_whatsapp_intent", properties);
  };

  return (
    <a
      className={variant === "icon" ? "bk-wa-icon" : "bk-text-button bk-text-button--whatsapp"}
      aria-label={variant === "icon" ? label : undefined}
      href={whatsappChatUrl(whatsapp, message)}
      // A new tab keeps this page alive long enough for the click event to be sent.
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      {variant === "icon" ? <WhatsAppGlyph /> : label}
    </a>
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43zm8.03-17.46A11.3 11.3 0 0 0 12.05.72C5.78.72.68 5.82.68 12.09c0 2 .52 3.96 1.52 5.69L.58 23.67l6.03-1.58a11.33 11.33 0 0 0 5.43 1.38h.01c6.26 0 11.36-5.1 11.37-11.37 0-3.04-1.18-5.89-3.34-8.04z" />
    </svg>
  );
}
