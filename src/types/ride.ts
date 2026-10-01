export interface Location {
  id: string;
  name: {
    primary: string;
    secondary: string;
  };
  location: {
    lat: number;
    lng: number;
  };
}

export interface UserInfo {
  id: string;
  name: string;
  profilePicture?: string | null;
  averageRating?: number | null;
}

export interface Ride {
  id: string;
  origin: Location | null;
  destination: Location | null;
  meetingPoint: Location | null;
  availableSeats: number;
  price: number;
  departureDate: string; // ISO 8601
  status: RideStatus;
  tripRequestId?: string | null;
  driver: UserInfo;
  passengers: UserInfo[];
  chatId: string;
  deletedAt: string | null;
}

export type RideStatus =
  | "active"
  | "in_progress"
  | "in_route"
  | "on_checkout"
  | "completed"
  | "cancelled"
  | "expired";

export interface RideResponse {
  ride: Ride;
}

// What a stranger opening the link can do with the ride; computed by the API so the
// page, the OG image and the booking island never disagree.
export type RideWebState = "open" | "full" | "departed" | "cancelled";

export interface PublicDriverCard {
  id: string;
  slug: string | null;
  firstName: string;
  name: string;
  profilePicture: string | null;
  averageRating: number | null;
  ratingsCount: number;
  kycVerified: boolean;
  whatsapp: string | null;
  memberSince: string | null;
}

export interface PublicRidePage {
  ride: Ride;
  driver: PublicDriverCard;
  state: RideWebState;
}

export interface PublicDriverPage {
  driver: PublicDriverCard;
  rides: Ride[];
}
