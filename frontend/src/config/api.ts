/**
 * Backend origin (scheme + host, optional port). No `/api` suffix.
 * Set `VITE_API_URL` for production (e.g. on Vercel). Local `npm run dev` without it uses the Vite `/api` proxy.
 */
export const API_URL =
  import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000";

export default API_URL;

/** Full REST prefix (`.../api`) for fetch calls */
export function getApiBase(): string {
  if (import.meta.env.DEV && !import.meta.env.VITE_API_URL?.trim()) {
    return "/api";
  }
  const origin = API_URL.replace(/\/$/, "");
  if (origin.endsWith("/api")) return origin;
  return `${origin}/api`;
}
