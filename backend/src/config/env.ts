import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),
  DATABASE_URL: z.string().min(1),
  /** Render and other hosts set this; fall back for local dev */
  PORT: z.coerce.number().int().positive().default(5000),
  JWT_SECRET: z.string().min(16, "JWT_SECRET should be at least 16 characters"),
  /**
   * Comma-separated browser origins allowed by CORS (e.g. https://myapp.onrender.com).
   * Required when NODE_ENV is production.
   */
  FRONTEND_ORIGIN: z.string().optional(),
  /** Listen address (0.0.0.0 for Render, Docker, etc.) */
  HOST: z.string().optional().default("0.0.0.0"),
});

export const env = schema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
  HOST: process.env.HOST,
});

export function corsAllowedOrigins(): string | string[] {
  const raw = env.FRONTEND_ORIGIN?.trim();
  if (!raw) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "FRONTEND_ORIGIN must be set in production (comma-separated allowed origins, e.g. https://your-frontend.onrender.com)"
      );
    }
    return "http://localhost:5173";
  }
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) {
    throw new Error("FRONTEND_ORIGIN contains no valid origins");
  }
  return list.length === 1 ? list[0]! : list;
}
