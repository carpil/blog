import { useState, type FormEvent } from "react";
import { anonymousId, track } from "../../lib/client/analytics";
import { isLocalPhone, localDigits, rememberedPhone, rememberPhone, toE164 } from "../../lib/client/phone";
import { createContactIntent } from "../../lib/client/web-api";
import { whatsappChatUrl } from "../../lib/share-links";
import "./booking.css";

export type LeadContext = "ride" | "ride_closed" | "driver_page";

interface Props {
  rideId?: string;
  driverSlug?: string;
  driverFirstName: string;
  whatsapp: string;
  message: string;
  label: string;
  context: LeadContext;
  variant?: "primary" | "secondary";
}

// The phone is asked before WhatsApp opens because a chat that starts outside Carpil
// leaves no trace otherwise: no way to follow up, no way to count the channel.
export default function WhatsAppLead({
  rideId,
  driverSlug,
  driverFirstName,
  whatsapp,
  message,
  label,
  context,
  variant = "secondary",
}: Props) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(rememberedPhone);
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isLocalPhone(phone)) {
      setError("Escribí tu número de 8 dígitos.");
      return;
    }
    setError(null);
    setSending(true);
    const trimmedName = name.trim();
    try {
      await createContactIntent({
        rideId,
        driverSlug,
        phoneNumber: toE164(phone),
        name: trimmedName.length >= 2 ? trimmedName : undefined,
        anonymousId: await anonymousId(),
      });
    } catch {
      // Never keep someone from reaching the driver because the lead didn't save.
    }
    rememberPhone(localDigits(phone));
    track("web_whatsapp_intent", { context, ride_id: rideId ?? null, driver_slug: driverSlug ?? null });
    window.location.href = whatsappChatUrl(whatsapp, message);
  };

  if (!open) {
    return (
      <button type="button" className={`bk-button bk-button--${variant} bk-button--whatsapp`} onClick={() => setOpen(true)}>
        {label}
      </button>
    );
  }

  return (
    <form className="bk-panel" onSubmit={submit} noValidate>
      <p className="bk-panel__title">Antes de abrir WhatsApp</p>
      <p className="bk-panel__hint">
        Dejanos tu número para avisarte si el viaje cambia. Después le escribís a {driverFirstName} como siempre.
      </p>
      <label className="bk-field">
        <span className="bk-field__label">Tu WhatsApp</span>
        <input
          className="bk-input"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="8888 8888"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </label>
      <label className="bk-field">
        <span className="bk-field__label">¿Cómo te conoce {driverFirstName}? (opcional)</span>
        <input
          className="bk-input"
          autoComplete="name"
          placeholder="Ej: Doña Marta"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      {error && <p className="bk-error">{error}</p>}
      <button type="submit" className="bk-button bk-button--primary bk-button--whatsapp" disabled={sending}>
        {sending ? "Abriendo WhatsApp…" : `Abrir WhatsApp con ${driverFirstName}`}
      </button>
      <button type="button" className="bk-link" onClick={() => setOpen(false)}>
        Volver
      </button>
    </form>
  );
}
