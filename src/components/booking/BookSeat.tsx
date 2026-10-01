import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { canUseRedirect, firebaseAuth, isFirebaseConfigured, rideDocument } from "../../lib/client/firebase";
import { identify, track } from "../../lib/client/analytics";
import { isLocalPhone, localDigits, rememberPhone, rememberedPhone, toE164 } from "../../lib/client/phone";
import { ApiError, joinRideFromWeb, leaveRide, loginWeb, updateContact, type WebUser } from "../../lib/client/web-api";
import { whatsappChatUrl } from "../../lib/share-links";
import WhatsAppLead from "./WhatsAppLead";
import "./booking.css";

type Step = "idle" | "choose" | "phone" | "code" | "working" | "contact" | "done" | "full" | "unavailable" | "error";
// Apple stays app-only: the web offers Google and phone, which cover everyone.
type Method = "google" | "phone";

interface Props {
  rideId: string;
  driverFirstName: string;
  driverWhatsapp: string | null;
  whatsappMessage: string;
  initialFreeSeats: number;
}

const PENDING_KEY = "carpil:pending-booking";
// Google refuses to sign in inside these webviews, so the phone goes first there.
const EMBEDDED_BROWSER = /Instagram|FBAN|FBAV|Line\//i;

interface PendingBooking {
  rideId: string;
  method: Method;
}

function readPending(): PendingBooking | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingBooking) : null;
  } catch {
    return null;
  }
}

function writePending(pending: PendingBooking | null): void {
  try {
    if (pending === null) {
      sessionStorage.removeItem(PENDING_KEY);
      return;
    }
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    // Without storage the redirect still signs them in; they tap "Reservar" once more.
  }
}

function errorCode(error: unknown): string {
  if (error instanceof ApiError) return error.code;
  return (error as { code?: string } | null)?.code ?? "unknown";
}

export default function BookSeat({ rideId, driverFirstName, driverWhatsapp, whatsappMessage, initialFreeSeats }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<WebUser | null>(null);
  const [freeSeats, setFreeSeats] = useState(initialFreeSeats);
  const [onBoard, setOnBoard] = useState(false);
  const [phone, setPhone] = useState(rememberedPhone);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [skipPhone, setSkipPhone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const verifier = useRef<RecaptchaVerifier | null>(null);
  const confirmation = useRef<ConfirmationResult | null>(null);

  const fail = (text: string, reason: string) => {
    track("web_booking_failed", { ride_id: rideId, reason });
    setMessage(text);
    setStep("error");
  };

  const handleBookingError = (error: unknown) => {
    const reason = errorCode(error);
    if (reason === "already_passenger") {
      setStep("done");
      return;
    }
    if (reason === "ride_full") {
      track("web_booking_failed", { ride_id: rideId, reason });
      setStep("full");
      return;
    }
    if (error instanceof ApiError && error.status === 410) {
      track("web_booking_failed", { ride_id: rideId, reason });
      setStep("unavailable");
      return;
    }
    if (reason === "verification_required") {
      fail("No pudimos confirmar tu correo. Probá entrar con tu número de teléfono.", reason);
      return;
    }
    fail(`Algo salió mal. Probá de nuevo o escribile a ${driverFirstName} por WhatsApp.`, reason);
  };

  const handleAuthError = (error: unknown) => {
    const reason = errorCode(error);
    if (reason === "auth/popup-closed-by-user" || reason === "auth/cancelled-popup-request") {
      setStep("choose");
      return;
    }
    if (reason === "auth/invalid-verification-code") {
      setFormError("Ese código no coincide. Revisalo e intentá de nuevo.");
      setStep("code");
      return;
    }
    if (reason === "auth/invalid-phone-number") {
      setFormError("Ese número no parece válido.");
      setStep("phone");
      return;
    }
    if (reason === "auth/too-many-requests") {
      fail(`Hubo demasiados intentos. Esperá unos minutos o escribile a ${driverFirstName} por WhatsApp.`, reason);
      return;
    }
    fail(`No pudimos iniciar sesión. Probá de nuevo o escribile a ${driverFirstName} por WhatsApp.`, reason);
  };

  const book = async (signedIn: User) => {
    setStep("working");
    try {
      await joinRideFromWeb(await signedIn.getIdToken(), rideId);
      track("web_ride_booked", { ride_id: rideId });
      setStep("done");
    } catch (error) {
      handleBookingError(error);
    }
  };

  const continueAs = async (signedIn: User, method: Method | null) => {
    setStep("working");
    identify(signedIn.uid);
    if (method) track("web_signed_in", { method, ride_id: rideId });
    try {
      const result = await loginWeb(await signedIn.getIdToken(), signedIn.displayName);
      setAccount(result.user);
      setName(result.user.name ?? "");
      if (result.needsContact) {
        setStep("contact");
        return;
      }
      await book(signedIn);
    } catch (error) {
      handleBookingError(error);
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const auth = firebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    const pending = readPending();
    if (pending?.rideId === rideId) {
      writePending(null);
      setStep("working");
      getRedirectResult(auth)
        .then((result) => {
          if (!result) {
            setStep("idle");
            return;
          }
          return continueAs(result.user, pending.method);
        })
        .catch(handleAuthError);
    }
    return unsubscribe;
  }, []);

  // Seats and "you're already in" stay live once signed in, the same way the app
  // watches the ride, so nobody taps "Reservar" on a ride that just filled up.
  useEffect(() => {
    if (!user) return;
    let active = true;
    let unsubscribe = () => {};
    void (async () => {
      const [{ onSnapshot }, reference] = await Promise.all([import("firebase/firestore"), rideDocument(rideId)]);
      if (!active) return;
      unsubscribe = onSnapshot(
        reference,
        (snapshot) => {
          const data = snapshot.data();
          if (!data) return;
          setFreeSeats(Math.max(0, (data.availableSeats ?? 0) - (data.passengers?.length ?? 0)));
          setOnBoard((data.passengerIds ?? []).includes(user.uid));
        },
        () => {},
      );
    })();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [user, rideId]);

  const start = () => {
    track("web_book_cta_clicked", { ride_id: rideId, signed_in: user !== null });
    if (user) {
      void continueAs(user, null);
      return;
    }
    setStep(EMBEDDED_BROWSER.test(navigator.userAgent) ? "phone" : "choose");
  };

  const signInWithGoogle = async () => {
    track("web_signin_started", { method: "google", ride_id: rideId });
    const auth = firebaseAuth();
    const provider = new GoogleAuthProvider();
    if (canUseRedirect()) {
      writePending({ rideId, method: "google" });
      await signInWithRedirect(auth, provider).catch(handleAuthError);
      return;
    }
    try {
      const result = await signInWithPopup(auth, provider);
      await continueAs(result.user, "google");
    } catch (error) {
      handleAuthError(error);
    }
  };

  const sendCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!isLocalPhone(phone)) {
      setFormError("Escribí tu número de 8 dígitos.");
      return;
    }
    setFormError(null);
    setStep("working");
    track("web_signin_started", { method: "phone", ride_id: rideId });
    try {
      const auth = firebaseAuth();
      verifier.current ??= new RecaptchaVerifier(auth, "bk-recaptcha", { size: "invisible" });
      confirmation.current = await signInWithPhoneNumber(auth, toE164(phone), verifier.current);
      rememberPhone(localDigits(phone));
      setCode("");
      setStep("code");
    } catch (error) {
      verifier.current?.clear();
      verifier.current = null;
      handleAuthError(error);
    }
  };

  const confirmCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setFormError("El código tiene 6 dígitos.");
      return;
    }
    if (!confirmation.current) {
      setStep("phone");
      return;
    }
    setFormError(null);
    setStep("working");
    try {
      const result = await confirmation.current.confirm(code.trim());
      await continueAs(result.user, "phone");
    } catch (error) {
      handleAuthError(error);
    }
  };

  const needsPhone = !account?.phoneNumber;

  const submitContact = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setFormError("Escribí tu nombre.");
      return;
    }
    const sendPhone = needsPhone && !skipPhone;
    if (sendPhone && !isLocalPhone(phone)) {
      setFormError("Escribí tu número de 8 dígitos, o tocá \"No tengo WhatsApp\".");
      return;
    }
    const signedIn = firebaseAuth().currentUser;
    if (!signedIn) {
      setStep("choose");
      return;
    }
    setFormError(null);
    setStep("working");
    try {
      await updateContact(await signedIn.getIdToken(), {
        name: trimmedName === account?.name ? undefined : trimmedName,
        localPhone: sendPhone ? localDigits(phone) : undefined,
      });
      if (sendPhone) rememberPhone(localDigits(phone));
      track("web_contact_submitted", { ride_id: rideId, has_whatsapp: sendPhone || !needsPhone });
      await book(signedIn);
    } catch (error) {
      handleBookingError(error);
    }
  };

  const cancel = async () => {
    const signedIn = firebaseAuth().currentUser;
    if (!signedIn) return;
    setConfirmingCancel(false);
    setStep("working");
    try {
      await leaveRide(await signedIn.getIdToken(), rideId);
      track("web_booking_cancelled", { ride_id: rideId });
      setOnBoard(false);
      setStep("idle");
    } catch (error) {
      fail("No pudimos cancelar tu reserva. Probá de nuevo en un momento.", errorCode(error));
    }
  };

  const leadButton = driverWhatsapp && (
    <WhatsAppLead
      rideId={rideId}
      driverFirstName={driverFirstName}
      whatsapp={driverWhatsapp}
      message={whatsappMessage}
      label="Prefiero por WhatsApp"
      context="ride"
    />
  );

  if (!isFirebaseConfigured()) {
    return <div className="bk">{leadButton}</div>;
  }

  const showDone = step === "done" || (onBoard && step === "idle");
  const showFull = step === "full" || (!onBoard && freeSeats <= 0 && step === "idle");

  return (
    <div className="bk">
      <div id="bk-recaptcha" />

      {showDone && (
        <div className="bk-panel bk-panel--success">
          <p className="bk-panel__title">¡Listo! Tenés campo con {driverFirstName}.</p>
          <p className="bk-panel__hint">
            Pagás directo a {driverFirstName}, en efectivo o SINPE. Si necesitás coordinar algo, escribile.
          </p>
          {driverWhatsapp && (
            <a className="bk-button bk-button--primary bk-button--whatsapp" href={whatsappChatUrl(driverWhatsapp, whatsappMessage)}>
              Escribirle a {driverFirstName}
            </a>
          )}
          {!confirmingCancel && (
            <button type="button" className="bk-link" onClick={() => setConfirmingCancel(true)}>
              Cancelar mi reserva
            </button>
          )}
          {confirmingCancel && (
            <div className="bk-confirm">
              <p className="bk-panel__hint">¿Seguro? Tu campo queda libre para otra persona.</p>
              <button type="button" className="bk-button bk-button--danger" onClick={cancel}>
                Sí, cancelar
              </button>
              <button type="button" className="bk-link" onClick={() => setConfirmingCancel(false)}>
                No, mantener mi campo
              </button>
            </div>
          )}
        </div>
      )}

      {!showDone && showFull && (
        <div className="bk-panel">
          <p className="bk-panel__title">Este viaje ya se llenó.</p>
          <p className="bk-panel__hint">Escribile a {driverFirstName}: a veces se libera un campo o sale otro viaje.</p>
          {leadButton}
        </div>
      )}

      {step === "unavailable" && (
        <div className="bk-panel">
          <p className="bk-panel__title">Este viaje ya no recibe reservas.</p>
          <p className="bk-panel__hint">Escribile a {driverFirstName} para ver qué otro viaje tiene.</p>
          {leadButton}
        </div>
      )}

      {step === "idle" && !showDone && !showFull && (
        <>
          <button type="button" className="bk-button bk-button--primary" onClick={start}>
            Reservar mi campo
          </button>
          {leadButton}
          <p className="bk-caption">Sin descargar nada. Pagás directo a {driverFirstName}.</p>
        </>
      )}

      {step === "choose" && (
        <div className="bk-panel">
          <p className="bk-panel__title">¿Cómo querés entrar?</p>
          <p className="bk-panel__hint">Es para que {driverFirstName} sepa quién va. Solo la primera vez.</p>
          <button type="button" className="bk-button bk-button--secondary" onClick={signInWithGoogle}>
            Seguir con Google
          </button>
          <button type="button" className="bk-button bk-button--secondary" onClick={() => setStep("phone")}>
            Con mi número de teléfono
          </button>
          <button type="button" className="bk-link" onClick={() => setStep("idle")}>
            Volver
          </button>
        </div>
      )}

      {step === "phone" && (
        <form className="bk-panel" onSubmit={sendCode} noValidate>
          <p className="bk-panel__title">Tu número de teléfono</p>
          <p className="bk-panel__hint">Te mandamos un código por mensaje de texto.</p>
          <label className="bk-field">
            <span className="bk-field__label">Número (Costa Rica)</span>
            <input
              className="bk-input"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="8888 8888"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          {formError && <p className="bk-error">{formError}</p>}
          <button type="submit" className="bk-button bk-button--primary">
            Enviarme el código
          </button>
          {EMBEDDED_BROWSER.test(navigator.userAgent) && (
            <p className="bk-caption">¿Preferís entrar con Google? Abrí este link en Chrome o Safari.</p>
          )}
          <button type="button" className="bk-link" onClick={() => setStep("choose")}>
            Usar otra forma
          </button>
        </form>
      )}

      {step === "code" && (
        <form className="bk-panel" onSubmit={confirmCode} noValidate>
          <p className="bk-panel__title">Escribí el código</p>
          <p className="bk-panel__hint">Te lo mandamos al {localDigits(phone)}.</p>
          <label className="bk-field">
            <span className="bk-field__label">Código de 6 dígitos</span>
            <input
              className="bk-input bk-input--code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            />
          </label>
          {formError && <p className="bk-error">{formError}</p>}
          <button type="submit" className="bk-button bk-button--primary">
            Confirmar
          </button>
          <button type="button" className="bk-link" onClick={() => setStep("phone")}>
            Cambiar el número
          </button>
        </form>
      )}

      {step === "contact" && (
        <form className="bk-panel" onSubmit={submitContact} noValidate>
          <p className="bk-panel__title">Último paso</p>
          <p className="bk-panel__hint">Así le llega tu reserva a {driverFirstName}.</p>
          <label className="bk-field">
            <span className="bk-field__label">¿Cómo te conoce {driverFirstName}?</span>
            <input
              className="bk-input"
              autoComplete="name"
              placeholder="Ej: Doña Marta"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          {needsPhone && !skipPhone && (
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
          )}
          {formError && <p className="bk-error">{formError}</p>}
          <button type="submit" className="bk-button bk-button--primary">
            Reservar mi campo
          </button>
          {needsPhone && !skipPhone && (
            <button type="button" className="bk-link" onClick={() => setSkipPhone(true)}>
              No tengo WhatsApp
            </button>
          )}
        </form>
      )}

      {step === "working" && (
        <div className="bk-panel bk-panel--busy" role="status">
          <span className="bk-spinner" aria-hidden="true" />
          <p className="bk-panel__hint">Un momento…</p>
        </div>
      )}

      {step === "error" && (
        <div className="bk-panel">
          <p className="bk-error">{message}</p>
          <button type="button" className="bk-button bk-button--primary" onClick={() => setStep("idle")}>
            Intentar de nuevo
          </button>
          {leadButton}
        </div>
      )}

      {user && (step === "idle" || showDone) && (
        <button type="button" className="bk-link bk-link--quiet" onClick={() => signOut(firebaseAuth())}>
          ¿No sos vos? Salir
        </button>
      )}
    </div>
  );
}
