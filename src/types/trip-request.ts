import type { Location } from "./ride";

export type TripRequestStatus =
  | "open"
  | "matching"
  | "converted"
  | "expired"
  | "cancelled";

export interface TripGeo extends Location {
  geohash: string;
  kind: "place" | "zone" | "pin";
}

export interface TripWindow {
  earliest: string; // ISO 8601
  latest: string; // ISO 8601
  flexibilityMinutes: number;
}

export interface TripMemberInfo {
  name: string;
  profilePicture?: string | null;
  verified: boolean;
  averageRating?: number | null;
}

export interface TripRequestMember {
  uid: string;
  seats: number;
  role: "creator" | "pooler";
  member: TripMemberInfo;
  joinedAt: string;
}

export interface TripRequest {
  id: string;
  creator: string;
  origin: TripGeo | null;
  destination: TripGeo | null;
  matchRadiusKm: number;
  window: TripWindow;
  seatsNeeded: number;
  pooledSeats: number;
  memberCount: number;
  status: TripRequestStatus;
  matchedRideId: string | null;
  expiresAt: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TripRequestResponse {
  tripRequest: TripRequest;
  members: TripRequestMember[];
}
