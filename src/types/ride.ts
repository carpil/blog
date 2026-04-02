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

export interface Driver {
  id: string;
  name: string;
  profilePicture?: string;
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
  driver: Driver;
  passengers: Driver[];
  chatId: string;
  deletedAt: string | null;
}

export interface RideResponse {
  ride: Ride;
}
