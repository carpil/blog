import Face from "./Face";
import "./ride.css";

export interface RideCardPassenger {
  name: string;
  photo?: string | null;
  me?: boolean;
}

export interface RideCardProps {
  origin: string;
  destination: string;
  when: string;
  price: string;
  driverName: string;
  driverPhoto?: string | null;
  driverVerified?: boolean;
  passengers: RideCardPassenger[];
  capacity: number;
  note?: string;
  noteTone?: "warm" | "muted";
  cta?: string;
  href?: string;
}

const MAX_FACES = 4;
export const DRIVER_COLORS: [string, string] = ["#262a31", "#c9beff"];

// The same card the app shows in its ride lists: dark, a spine of dots, the price in lilac.
export default function RideCard({
  origin,
  destination,
  when,
  price,
  driverName,
  driverPhoto,
  driverVerified = false,
  passengers,
  capacity,
  note,
  noteTone = "warm",
  cta,
  href,
}: RideCardProps) {
  const faces = passengers.slice(0, MAX_FACES);
  const free = Math.max(0, capacity - passengers.length);
  const Tag = href ? "a" : "article";

  return (
    <Tag className="rc" {...(href ? { href } : {})}>
      <span className="rc__dot rc__dot--origin" aria-hidden="true">
        <span />
      </span>
      <div className="rc__row">
        <div className="rc__text">
          <p className="rc__place">{origin}</p>
          <p className="rc__when">{when}</p>
        </div>
        <div className="rc__driver">
          <Face name={driverName} photo={driverPhoto} size={28} colors={DRIVER_COLORS} className="rc__driver-face" />
          {driverVerified && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#6c47ff" role="img" aria-label="Verificado">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          )}
        </div>
      </div>

      <span className="rc__spine" aria-hidden="true" />
      <span />

      <span className="rc__dot rc__dot--destination" aria-hidden="true" />
      <div className="rc__row">
        <p className="rc__place rc__text">{destination}</p>
        <p className="rc__price">{price}</p>
      </div>

      <div className="rc__foot">
        <p className={`rc__note rc__note--${noteTone}`}>
          {note && noteTone === "warm" && <span className="rc__note-dot" aria-hidden="true" />}
          {note}
        </p>
        <div className="rc__stack">
          {faces.map((passenger, index) => (
            <Face
              key={`${passenger.name}-${index}`}
              name={passenger.name}
              photo={passenger.photo}
              size={22}
              index={index}
              me={passenger.me}
              className={passenger.me ? "rc__face rc__face--me" : "rc__face"}
            />
          ))}
          {free > 0 && (
            <span className="rc__face rc__face--free" aria-label={`${free} libres`}>
              +{free}
            </span>
          )}
        </div>
      </div>

      {cta && <span className="rc__cta">{cta}</span>}
    </Tag>
  );
}
