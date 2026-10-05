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
}

// Opens the chat straight away; nothing stands between the tap and WhatsApp. Who tapped
// comes from the PostHog event itself: the signed-in account, or this browser's
// anonymous id until they sign in.
export default function WhatsAppLead({ rideId, driverSlug, whatsapp, message, label, context }: Props) {
  const onClick = () => {
    const properties = { context, ride_id: rideId ?? null, driver_slug: driverSlug ?? null };
    track("web_whatsapp_clicked", properties);
    // Kept alongside the click so dashboards built on it keep counting.
    track("web_whatsapp_intent", properties);
  };

  return (
    <a
      className="bk-text-button bk-text-button--whatsapp"
      href={whatsappChatUrl(whatsapp, message)}
      // A new tab keeps this page alive long enough for the click event to be sent.
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      {label}
    </a>
  );
}
