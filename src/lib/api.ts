import type { Ride, RideResponse } from "../types/ride";

const BASE_URL = import.meta.env.API_URL ?? process.env.API_URL;

export async function getRide(id: string): Promise<Ride | null> {
  const url = `${BASE_URL}/rides/drivers/${id}`;

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    console.log("[getRide] error body", text);
    return null;
  }

  const data: RideResponse = await res.json();
  return data.ride;
}
