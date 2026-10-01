import type { PublicDriverPage, PublicRidePage } from "../types/ride";
import type {
  TripMemberInfo,
  TripRequest,
  TripRequestResponse,
} from "../types/trip-request";

const BASE_URL = import.meta.env.API_URL ?? process.env.API_URL;

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    if (res.status === 404) return null;

    if (!res.ok) {
      console.log(`[api] ${path} responded ${res.status}`, await res.text());
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error(`[api] ${path} failed`, error);
    return null;
  }
}

// Every state comes back, cancelled and departed included: the page turns those into
// a way to reach the driver instead of a dead end.
export async function getRidePage(id: string): Promise<PublicRidePage | null> {
  return await getJson<PublicRidePage>(`/public/rides/${encodeURIComponent(id)}`);
}

export async function getDriverPage(slug: string): Promise<PublicDriverPage | null> {
  return await getJson<PublicDriverPage>(`/public/drivers/${encodeURIComponent(slug)}`);
}

export interface TripRequestDetail {
  tripRequest: TripRequest;
  creator: TripMemberInfo | null;
}

const VISIBLE_TRIP_REQUEST_STATUSES = ["open", "matching"];

export async function getTripRequest(
  id: string,
): Promise<TripRequestDetail | null> {
  const data = await getJson<TripRequestResponse>(`/trip-requests/${id}`);
  if (!data?.tripRequest) return null;

  const { tripRequest } = data;
  if (tripRequest.deletedAt) return null;
  if (!VISIBLE_TRIP_REQUEST_STATUSES.includes(tripRequest.status)) return null;

  const creator =
    data.members?.find((member) => member.role === "creator")?.member ?? null;

  return { tripRequest, creator };
}
