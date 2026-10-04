// The ride card is server-rendered while the booking island watches the ride live;
// the island announces seat changes with this event so the card can follow.
export const RIDE_SEATS_EVENT = "carpil:ride-seats";

export interface RideSeatsDetail {
  freeSeats: number;
  passengers: { id: string | null; name: string; photo: string | null }[];
}
