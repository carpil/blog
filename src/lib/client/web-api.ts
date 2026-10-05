const API_URL = import.meta.env.PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly missingSteps: string[] = [],
  ) {
    super(code);
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH";
  token?: string;
  body?: unknown;
}

async function request<T>(path: string, { method = "GET", token, body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, payload.message ?? payload.error ?? "unknown", payload.missingSteps ?? []);
  }
  return payload as T;
}

export interface WebUser {
  id: string;
  name: string;
  phoneNumber?: string;
}

export function loginWeb(token: string, name?: string | null) {
  return request<{ user: WebUser; needsContact: boolean }>("/users/login/web", {
    method: "POST",
    token,
    body: name ? { name } : {},
  });
}

export function updateContact(token: string, contact: { name?: string; localPhone?: string }) {
  const body: Record<string, string> = {};
  if (contact.name) body.displayName = contact.name;
  if (contact.localPhone) body.phoneNumber = contact.localPhone;
  return request<{ user: WebUser }>("/users/me", { method: "PATCH", token, body });
}

export function joinRideFromWeb(token: string, rideId: string) {
  return request<{ message: string }>(`/rides/${encodeURIComponent(rideId)}/join/web`, { method: "POST", token });
}

export function leaveRide(token: string, rideId: string) {
  return request<{ message: string }>(`/rides/${encodeURIComponent(rideId)}/leave`, { method: "POST", token });
}
