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
  status: "active" | "canceled" | "completed";
  driver: UserInfo;
  passengers: UserInfo[];
  chatId: string;
  deletedAt: string | null;
}

export interface RideResponse {
  ride: Ride;
}
