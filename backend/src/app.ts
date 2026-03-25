import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import applicationsRoutes from "./routes/applications.js";
import notesRoutes from "./routes/notes.js";
import analyticsRoutes from "./routes/analytics.js";
import { authMiddleware } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { env, corsAllowedOrigins } from "./config/env.js";

const app = express();

// Behind Render / other reverse proxies — use for correct req.ip / secure cookies if you add them later
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: corsAllowedOrigins(),
    credentials: false,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/applications", authMiddleware, applicationsRoutes);
app.use("/api/notes", authMiddleware, notesRoutes);
app.use("/api/analytics", authMiddleware, analyticsRoutes);

app.use(errorHandler);

export default app;
