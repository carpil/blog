import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
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
import { APP_STORE_URL, PLAY_STORE_URL, whatsappChatUrl } from "../../lib/share-links";
import { RIDE_SEATS_EVENT, type RideSeatsDetail } from "../../lib/ride-events";
import RideCard, { type RideCardPassenger, type RideCardProps } from "../ride/RideCard";
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
  driverSlug: string | null;
  card: Omit<RideCardProps, "passengers" | "note" | "noteTone" | "cta" | "href">;
  initialPassengers: RideCardPassenger[];
}

type SeatPassenger = RideSeatsDetail["passengers"][number];

const SHEET_STEPS = new Set<Step>(["choose", "phone", "code", "working", "contact", "full", "unavailable", "error"]);
const RESEND_SECONDS = 45;

// "88204665" → "8820 4665", the way people read Costa Rican numbers.
function spacedPhone(raw: string): string {
  const digits = localDigits(raw).slice(0, 8);
  return digits.length > 4 ? `${digits.slice(0, 4)} ${digits.slice(4)}` : digits;
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

// How the account signs in, read from Firebase rather than from this visit, so a booking
// by someone who was already signed in still says whether it came through Google or phone.
function signInMethod(user: User): Method | null {
  const providers = user.providerData.map((provider) => provider.providerId);
  if (providers.includes("phone")) return "phone";
  if (providers.includes("google.com")) return "google";
  return null;
}

function errorCode(error: unknown): string {
  if (error instanceof ApiError) return error.code;
  return (error as { code?: string } | null)?.code ?? "unknown";
}

function errorDetail(error: unknown): string | undefined {
  return (error as { message?: string } | null)?.message?.slice(0, 200);
}

// Once the same number is verified in the app, this web account is folded into the app
// one and disabled. Its session has to go so the next phone sign-in lands on the app uid.
const SESSION_GONE = new Set(["account_merged", "auth/user-disabled", "auth/user-token-expired"]);
// Error 39 is Firebase holding back SMS to one number after too many attempts or poor
// carrier delivery; other numbers keep working.
const PHONE_BLOCKED = new Set(["auth/error-code:-39"]);
const BROWSER_UNVERIFIED = new Set(["auth/captcha-check-failed", "auth/invalid-app-credential"]);

export default function BookSeat({
  rideId,
  driverFirstName,
  driverWhatsapp,
  whatsappMessage,
  initialFreeSeats,
  driverSlug,
  card,
  initialPassengers,
}: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<WebUser | null>(null);
  const [freeSeats, setFreeSeats] = useState(initialFreeSeats);
  const [passengers, setPassengers] = useState<SeatPassenger[]>(() =>
    initialPassengers.map(({ name, photo }) => ({ id: null, name, photo: photo ?? null })),
  );
  const [onBoard, setOnBoard] = useState(false);
  const [phone, setPhone] = useState(() => spacedPhone(rememberedPhone()));
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [name, setName] = useState("");
  const [skipPhone, setSkipPhone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const verifier = useRef<RecaptchaVerifier | null>(null);
  const confirmation = useRef<ConfirmationResult | null>(null);

  const fail = (text: string, reason: string) => {
    track("web_booking_failed", { ride_id: rideId, reason });
    setMessage(text);
    setStep("error");
  };

  const restartSignIn = async (reason: string) => {
    track("web_session_reset", { ride_id: rideId, reason });
    await signOut(firebaseAuth()).catch(() => {});
    setFormError(null);
    setNotice("Tu cuenta ahora está en la app de Carpil. Entrá de nuevo con tu número para seguir.");
    setStep("phone");
  };

  // A merged web account loses its verified phone, but its cached token stays valid for
  // up to an hour, so the API answers verification_required instead of account_merged.
  // Only a forced refresh tells the two apart: Firebase rejects it for a disabled user.
  const failVerification = async (reason: string) => {
    const gone = await firebaseAuth()
      .currentUser?.getIdToken(true)
      .then(() => null)
      .catch((error: unknown) => errorCode(error));
    if (gone && SESSION_GONE.has(gone)) {
      await restartSignIn(gone);
      return;
    }
    fail("No pudimos confirmar tu correo. Probá entrar con tu número de teléfono.", reason);
  };

  const handleBookingError = (error: unknown) => {
    const reason = errorCode(error);
    if (SESSION_GONE.has(reason)) {
      void restartSignIn(reason);
      return;
    }
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
      void failVerification(reason);
      return;
    }
    fail(`Algo salió mal. Probá de nuevo o escribile a ${driverFirstName} por WhatsApp.`, reason);
  };

  const handleAuthError = (error: unknown, method: Method) => {
    const reason = errorCode(error);
    track("web_signin_failed", { ride_id: rideId, method, reason, detail: errorDetail(error) });
    console.warn("Sign-in failed", reason, error);
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
    if (PHONE_BLOCKED.has(reason)) {
      fail("No pudimos mandar el código a ese número. Probá más tarde o entrá con Google.", reason);
      return;
    }
    if (reason === "auth/quota-exceeded") {
      fail("No pudimos mandar el código. Probá más tarde o entrá con Google.", reason);
      return;
    }
    if (BROWSER_UNVERIFIED.has(reason)) {
      fail("No pudimos verificarte. Recargá la página y probá de nuevo.", reason);
      return;
    }
    fail(`No pudimos iniciar sesión. Probá de nuevo o escribile a ${driverFirstName} por WhatsApp.`, reason);
  };

  const book = async (signedIn: User) => {
    setStep("working");
    try {
      await joinRideFromWeb(await signedIn.getIdToken(), rideId);
      track("web_ride_booked", { ride_id: rideId, method: signInMethod(signedIn) });
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
        .catch((error: unknown) => handleAuthError(error, pending.method));
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
          const riders: { id?: string; name?: string; profilePicture?: string | null }[] = data.passengers ?? [];
          const seats = Math.max(0, (data.availableSeats ?? 0) - riders.length);
          const seated = riders.map((passenger) => ({
            id: passenger.id ?? null,
            name: passenger.name ?? "",
            photo: passenger.profilePicture || null,
          }));
          setFreeSeats(seats);
          setPassengers(seated);
          setOnBoard((data.passengerIds ?? []).includes(user.uid));
          const detail: RideSeatsDetail = { freeSeats: seats, passengers: seated };
          window.dispatchEvent(new CustomEvent(RIDE_SEATS_EVENT, { detail }));
        },
        () => {},
      );
    })();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [user, rideId]);

  // Signing out must drop everything that belonged to the previous account, or the
  // "¡Listo!" panel would linger until a reload.
  useEffect(() => {
    if (user) return;
    setOnBoard(false);
    setAccount(null);
    setConfirmingCancel(false);
    setStep((current) => (current === "done" || current === "contact" ? "idle" : current));
  }, [user]);

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
      await signInWithRedirect(auth, provider).catch((error: unknown) => handleAuthError(error, "google"));
      return;
    }
    try {
      const result = await signInWithPopup(auth, provider);
      await continueAs(result.user, "google");
    } catch (error) {
      handleAuthError(error, "google");
    }
  };

  const requestCode = async () => {
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
      setNotice(null);
      setCode("");
      setResendIn(RESEND_SECONDS);
      setStep("code");
    } catch (error) {
      verifier.current?.clear();
      verifier.current = null;
      handleAuthError(error, "phone");
    }
  };

  const sendCode = (event: FormEvent) => {
    event.preventDefault();
    void requestCode();
  };

  const confirmCode = async (value: string) => {
    if (!/^\d{6}$/.test(value)) {
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
      const result = await confirmation.current.confirm(value);
      await continueAs(result.user, "phone");
    } catch (error) {
      if (errorCode(error) === "auth/invalid-verification-code") setCode("");
      handleAuthError(error, "phone");
    }
  };

  // Confirms on its own once the sixth digit lands, typed or filled in from the SMS.
  const changeCode = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (digits.length === 6) void confirmCode(digits);
  };

  useEffect(() => {
    if (step !== "code" || resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [step, resendIn]);

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
      const reason = errorCode(error);
      if (SESSION_GONE.has(reason)) {
        void restartSignIn(reason);
        return;
      }
      fail("No pudimos cancelar tu reserva. Probá de nuevo en un momento.", reason);
    }
  };

  const leadButton = driverWhatsapp && (
    <WhatsAppLead
      rideId={rideId}
      whatsapp={driverWhatsapp}
      message={whatsappMessage}
      label="Prefiero coordinar por WhatsApp"
      context="ride"
    />
  );

  const showDone = step === "done" || (onBoard && step === "idle");
  const showFull = step === "full" || (!onBoard && freeSeats <= 0 && step === "idle");
  const sheetOpen = SHEET_STEPS.has(step);
  const closeSheet = () => {
    if (step === "working") return;
    setFormError(null);
    setStep("idle");
  };

  // The page stays put behind the sheet and the confirmation instead of scrolling with them.
  useEffect(() => {
    if (!sheetOpen && !showDone) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sheetOpen, showDone]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!isFirebaseConfigured()) return null;

  const knownPhone = account?.phoneNumber ?? user?.phoneNumber ?? null;
  const myPassengers: RideCardPassenger[] = passengers.map((passenger) => ({
    name: passenger.name,
    photo: passenger.photo,
    me: user !== null && passenger.id === user.uid,
  }));
  // The live ride can lag the booking by a moment; the confirmation shows you in it anyway.
  if (user && !myPassengers.some((passenger) => passenger.me)) {
    myPassengers.push({ name: account?.name || user.displayName || "Vos", photo: user.photoURL, me: true });
  }

  return (
    <>
      <div id="bk-recaptcha" />

      {!showDone && (
        <div className="bk-dock">
          <div className="bk-bar">
            <div className="bk-bar__price">
              <p className="bk-bar__amount">{card.price}</p>
              <p className="bk-bar__hint">por campo · pagás a {driverFirstName}</p>
            </div>
            {showFull ? (
              <button type="button" className="bk-bar__cta" disabled>
                Lleno
              </button>
            ) : (
              <button type="button" className="bk-bar__cta" onClick={start}>
                Reservar
              </button>
            )}
          </div>
          <p className="bk-dock__caption">
            {showFull ? `Escribile a ${driverFirstName}: a veces se libera un campo.` : "Sin descargar nada · En 30 segundos"}
          </p>
          {user && step === "idle" && (
            <button type="button" className="bk-link bk-link--quiet" onClick={() => signOut(firebaseAuth())}>
              ¿No sos vos? Salir
            </button>
          )}
        </div>
      )}

      {sheetOpen && (
        <div className="bk-sheet-layer">
          <div className="bk-backdrop" onClick={closeSheet} aria-hidden="true" />
          <div className="bk-sheet" role="dialog" aria-modal="true" aria-labelledby="bk-sheet-title">
            <span className="bk-sheet__handle" aria-hidden="true" />

            {step === "choose" && (
              <>
                <SheetHead title="¿Cómo querés entrar?" hint={`Es para que ${driverFirstName} sepa quién va. Solo la primera vez.`} />
                <div className="bk-trip">
                  <span className="bk-trip__spine" aria-hidden="true">
                    <span className="bk-trip__dot" />
                    <span className="bk-trip__line" />
                    <span className="bk-trip__dot bk-trip__dot--destination" />
                  </span>
                  <div className="bk-trip__text">
                    <p className="bk-trip__route">
                      {card.origin} → {card.destination}
                    </p>
                    <p className="bk-trip__when">{card.when} · 1 campo</p>
                  </div>
                  <p className="bk-trip__price">{card.price}</p>
                </div>
                <div className="bk-stack">
                  <button type="button" className="bk-button bk-button--secondary" onClick={signInWithGoogle}>
                    <GoogleIcon />
                    Seguir con Google
                  </button>
                  <button type="button" className="bk-button bk-button--secondary" onClick={() => setStep("phone")}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9beff" strokeWidth="2" aria-hidden="true">
                      <rect x="6" y="2" width="12" height="20" rx="2.5" />
                      <path d="M11 18h2" strokeLinecap="round" />
                    </svg>
                    Con mi número de teléfono
                  </button>
                </div>
                <p className="bk-legal">
                  Al seguir aceptás los <a href="/terms">Términos</a> y la <a href="/privacy">Privacidad</a> de Carpil.
                </p>
              </>
            )}

            {step === "phone" && (
              <form className="bk-form" onSubmit={sendCode} noValidate>
                <BackButton onClick={() => setStep("choose")} />
                <SheetHead title="Tu número de teléfono" hint={notice ?? "Te mandamos un código por mensaje de texto."} />
                <label className="bk-field">
                  <span className="bk-field__label">Número</span>
                  <span className="bk-input-group">
                    <span className="bk-input-group__prefix">+506</span>
                    <span className="bk-input-group__divider" aria-hidden="true" />
                    <input
                      className="bk-input-group__input"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="8888 8888"
                      autoFocus
                      value={phone}
                      onChange={(event) => setPhone(spacedPhone(event.target.value))}
                    />
                  </span>
                </label>
                {formError && <p className="bk-error">{formError}</p>}
                <button type="submit" className="bk-button bk-button--primary">
                  Enviarme el código
                </button>
                {EMBEDDED_BROWSER.test(navigator.userAgent) && (
                  <p className="bk-caption">¿Preferís entrar con Google? Abrí este link en Chrome o Safari.</p>
                )}
              </form>
            )}

            {step === "code" && (
              <form className="bk-form" onSubmit={(event) => { event.preventDefault(); void confirmCode(code); }} noValidate>
                <SheetHead
                  title="Escribí el código"
                  hint={
                    <>
                      Te lo mandamos al {spacedPhone(phone)}.{" "}
                      <button type="button" className="bk-inline-link" onClick={() => setStep("phone")}>
                        Cambiar
                      </button>
                    </>
                  }
                />
                <label className="bk-otp">
                  <input
                    className="bk-otp__input"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label="Código de 6 dígitos"
                    maxLength={6}
                    autoFocus
                    value={code}
                    onChange={(event) => changeCode(event.target.value)}
                  />
                  <span className="bk-otp__boxes" aria-hidden="true">
                    {Array.from({ length: 6 }, (_, index) => (
                      <span key={index} className={index === code.length ? "bk-otp__box bk-otp__box--active" : "bk-otp__box"}>
                        {code[index] ?? (index === code.length ? <span className="bk-otp__caret" /> : null)}
                      </span>
                    ))}
                  </span>
                </label>
                {formError && <p className="bk-error">{formError}</p>}
                {resendIn > 0 ? (
                  <p className="bk-countdown">Reenviar código en 0:{String(resendIn).padStart(2, "0")}</p>
                ) : (
                  <button type="button" className="bk-link" onClick={() => void requestCode()}>
                    Reenviar código
                  </button>
                )}
              </form>
            )}

            {step === "contact" && (
              <form className="bk-form bk-form--roomy" onSubmit={submitContact} noValidate>
                <div className="bk-progress" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <SheetHead title="Último paso" hint={`Así le llega tu reserva a ${driverFirstName}.`} />
                <label className="bk-field">
                  <span className="bk-field__label">¿Cómo te conoce {driverFirstName}?</span>
                  <span className="bk-input-group">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9beff" strokeWidth="2" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      className="bk-input-group__input bk-input-group__input--text"
                      autoComplete="name"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </span>
                </label>
                {needsPhone && !skipPhone && (
                  <label className="bk-field">
                    <span className="bk-field__label">Tu WhatsApp</span>
                    <span className="bk-input-group">
                      <span className="bk-input-group__prefix">+506</span>
                      <span className="bk-input-group__divider" aria-hidden="true" />
                      <input
                        className="bk-input-group__input"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder="8888 8888"
                        value={phone}
                        onChange={(event) => setPhone(spacedPhone(event.target.value))}
                      />
                    </span>
                  </label>
                )}
                {!needsPhone && knownPhone && (
                  <div className="bk-note">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <p>
                      Te avisamos por WhatsApp al <strong>{spacedPhone(knownPhone)}</strong> si el viaje cambia.
                    </p>
                  </div>
                )}
                {formError && <p className="bk-error">{formError}</p>}
                <div className="bk-total">
                  <span>1 campo · pagás a {driverFirstName}</span>
                  <strong>{card.price}</strong>
                </div>
                <button type="submit" className="bk-button bk-button--primary">
                  Reservar
                </button>
                {needsPhone && !skipPhone && (
                  <button type="button" className="bk-link" onClick={() => setSkipPhone(true)}>
                    No tengo WhatsApp
                  </button>
                )}
              </form>
            )}

            {step === "working" && (
              <div className="bk-busy" role="status">
                <span className="bk-spinner" aria-hidden="true" />
                <p className="bk-hint">Un momento…</p>
              </div>
            )}

            {(step === "full" || step === "unavailable") && (
              <>
                <SheetHead
                  title={step === "full" ? "Este viaje ya se llenó" : "Este viaje ya no recibe reservas"}
                  hint={
                    step === "full"
                      ? `Escribile a ${driverFirstName}: a veces se libera un campo o sale otro viaje.`
                      : `Escribile a ${driverFirstName} para ver qué otro viaje tiene.`
                  }
                />
                <div className="bk-stack">
                  {driverSlug && (
                    <a className="bk-button bk-button--primary" href={`/${driverSlug}`}>
                      Ver otros viajes de {driverFirstName}
                    </a>
                  )}
                  {leadButton}
                </div>
              </>
            )}

            {step === "error" && (
              <>
                <SheetHead title="Algo salió mal" hint={message ?? ""} />
                <div className="bk-stack">
                  <button type="button" className="bk-button bk-button--primary" onClick={() => setStep("idle")}>
                    Intentar de nuevo
                  </button>
                  {leadButton}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDone && (
        <div className="bk-done" role="dialog" aria-modal="true" aria-labelledby="bk-done-title">
          <div className="bk-done__inner">
            <div className="bk-done__head">
              <span className="bk-done__check" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <h2 id="bk-done-title" className="bk-done__title">
                ¡Listo! Tenés campo con {driverFirstName}.
              </h2>
              <p className="bk-done__text">{driverFirstName} ya sabe que vas. Le pagás directo, en efectivo o SINPE.</p>
            </div>

            <RideCard {...card} passengers={myPassengers} note="Vos vas en este viaje" />

            {driverWhatsapp && (
              <a
                className="bk-button bk-button--whatsapp"
                href={whatsappChatUrl(driverWhatsapp, whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  const properties = { context: "booked", ride_id: rideId, driver_slug: driverSlug };
                  track("web_whatsapp_clicked", properties);
                  track("web_whatsapp_intent", properties);
                }}
              >
                Escribirle a {driverFirstName}
              </a>
            )}

            <section className="bk-app">
              <div className="bk-app__head">
                <img src="/logo-carpil.png" alt="" width="44" height="44" />
                <div>
                  <p className="bk-app__title">Seguí tu viaje en la app</p>
                  <p className="bk-app__hint">
                    {knownPhone ? "Entrás con el mismo número. Tu reserva ya está ahí." : "Tu reserva te espera ahí."}
                  </p>
                </div>
              </div>
              <ul className="bk-app__list">
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9beff" strokeWidth="2" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Ves a {driverFirstName} en el mapa el día del viaje
                </li>
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9beff" strokeWidth="2" aria-hidden="true">
                    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" strokeLinejoin="round" />
                    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" strokeLinejoin="round" />
                  </svg>
                  Chat con todo el grupo del viaje
                </li>
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9beff" strokeWidth="2" aria-hidden="true">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Te avisamos si algo cambia
                </li>
              </ul>
              <div className="bk-app__stores">
                <a className="bk-store" href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#dfe2eb" aria-hidden="true">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <span>
                    <span className="bk-store__over">Descargala en el</span>
                    <span className="bk-store__name">App Store</span>
                  </span>
                </a>
                <a className="bk-store" href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#dfe2eb" aria-hidden="true">
                    <path d="M3.84 2.15A1.5 1.5 0 0 0 3 3.5v17a1.5 1.5 0 0 0 .84 1.35L13.69 12 3.84 2.15zm12.97 12.97L6.05 21.34l8.49-8.49 2.27 2.27zM20.16 10.8c.34.27.59.69.59 1.2s-.25.92-.59 1.19l-2.29 1.33-2.5-2.52 2.5-2.52 2.29 1.32zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z" />
                  </svg>
                  <span>
                    <span className="bk-store__over">Disponible en</span>
                    <span className="bk-store__name">Google Play</span>
                  </span>
                </a>
              </div>
            </section>

            <div className="bk-done__foot">
              {!confirmingCancel ? (
                <button type="button" className="bk-link" onClick={() => setConfirmingCancel(true)}>
                  Cancelar mi reserva
                </button>
              ) : (
                <div className="bk-confirm">
                  <p className="bk-hint">¿Seguro? Tu campo queda libre para otra persona.</p>
                  <button type="button" className="bk-button bk-button--danger" onClick={cancel}>
                    Sí, cancelar
                  </button>
                  <button type="button" className="bk-link" onClick={() => setConfirmingCancel(false)}>
                    No, mantener mi campo
                  </button>
                </div>
              )}
              {user && (
                <button type="button" className="bk-link bk-link--quiet" onClick={() => signOut(firebaseAuth())}>
                  ¿No sos vos? Salir
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SheetHead({ title, hint }: { title: string; hint: ReactNode }) {
  return (
    <div className="bk-head">
      <p id="bk-sheet-title" className="bk-title">
        {title}
      </p>
      <p className="bk-hint">{hint}</p>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="bk-back" onClick={onClick}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Volver
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18a10.99 10.99 0 0 0 0 9.86l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A10.99 10.99 0 0 0 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
