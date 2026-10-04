import { useEffect, useState } from "react";
import { getFirstName, seatsLeftLabel, takenLabel } from "../../lib/format";
import { RIDE_SEATS_EVENT, type RideSeatsDetail } from "../../lib/ride-events";
import Face from "./Face";
import RideCard, { type RideCardPassenger, type RideCardProps } from "./RideCard";
import "./ride.css";

interface Props {
  card: Omit<RideCardProps, "passengers" | "note" | "noteTone" | "cta" | "href">;
  passengers: RideCardPassenger[];
  departureChip: string | null;
}

// Everything on the page that depends on who is in the ride. Server-rendered, then kept
// live by the seat events the booking island sends once someone signs in.
export default function RideSeatsLive({ card, passengers: initialPassengers, departureChip }: Props) {
  const [passengers, setPassengers] = useState(initialPassengers);

  useEffect(() => {
    const onSeats = (event: Event) => {
      const detail = (event as CustomEvent<RideSeatsDetail>).detail;
      setPassengers(detail.passengers.map(({ name, photo }) => ({ name, photo })));
    };
    window.addEventListener(RIDE_SEATS_EVENT, onSeats);
    return () => window.removeEventListener(RIDE_SEATS_EVENT, onSeats);
  }, []);

  const capacity = card.capacity;
  const free = Math.max(0, capacity - passengers.length);
  const seatsLabel = seatsLeftLabel(free);

  return (
    <>
      <div className="chips">
        <span className={free > 0 ? "chip chip--warm" : "chip"}>
          {free > 0 && <span className="chip__dot" aria-hidden="true" />}
          {seatsLabel}
        </span>
        {departureChip && <span className="chip">{departureChip}</span>}
      </div>

      <RideCard {...card} passengers={passengers} note={seatsLabel} noteTone={free > 0 ? "warm" : "muted"} />

      <section className="who">
        <div className="who__head">
          <div>
            <p className="eyebrow">Quién va</p>
            <p className="who__count">{takenLabel(passengers.length, capacity)}</p>
          </div>
          <p className="who__left">{free > 0 ? `Quedan ${free}` : "Lleno"}</p>
        </div>
        <div className="who__bar" aria-hidden="true">
          {Array.from({ length: capacity }, (_, index) => (
            <span key={index} className={index < passengers.length ? "who__seg who__seg--taken" : "who__seg"} />
          ))}
        </div>
        <ul className="who__seats">
          {passengers.map((passenger, index) => (
            <li key={`${passenger.name}-${index}`} className="who__seat">
              <Face name={passenger.name} photo={passenger.photo} size={44} index={index} />
              <span className="who__name">{getFirstName(passenger.name)}</span>
            </li>
          ))}
          {Array.from({ length: free }, (_, index) =>
            index === 0 ? (
              <li key={`free-${index}`} className="who__seat">
                <span className="who__free who__free--you" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
                <span className="who__name who__name--you">¿Vos?</span>
              </li>
            ) : (
              <li key={`free-${index}`} className="who__seat">
                <span className="who__free" aria-hidden="true" />
                <span className="who__name who__name--free">Libre</span>
              </li>
            ),
          )}
        </ul>
      </section>
    </>
  );
}
