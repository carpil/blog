import type { APIRoute } from "astro";

export const prerender = false;

// Firebase's "Option 3" for signInWithRedirect: serve the auth handler from our own
// domain so Safari and Chrome's storage partitioning can't lose the session on the way
// back from Google or Apple. Astro skips underscore folders in src/pages, and a
// vercel.json rewrite would override the adapter's routing, so this lives in the
// catch-all route; every other unknown path still ends in a 404.
// https://firebase.google.com/docs/auth/web/redirect-best-practices
const PROXIED_PATH = /^\/__\/(auth\/|firebase\/init\.json$)/;
const PROJECT_ID = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID;

const DROPPED_REQUEST_HEADERS = ["host", "connection", "accept-encoding", "content-length"];
// fetch() already decoded the body, so the upstream encoding headers no longer apply.
const DROPPED_RESPONSE_HEADERS = ["content-encoding", "content-length", "transfer-encoding", "connection"];

const notFound = () => new Response("Not found", { status: 404 });

export const ALL: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  if (!PROXIED_PATH.test(url.pathname) || !PROJECT_ID) return notFound();

  const headers = new Headers(request.headers);
  for (const name of DROPPED_REQUEST_HEADERS) headers.delete(name);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const upstream = await fetch(`https://${PROJECT_ID}.firebaseapp.com${url.pathname}${url.search}`, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstream.headers);
  for (const name of DROPPED_RESPONSE_HEADERS) responseHeaders.delete(name);

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
};
