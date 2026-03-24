import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import applicationsRoutes from "./routes/applications.js";
import notesRoutes from "./routes/notes.js";
import analyticsRoutes from "./routes/analytics.js";
import { authMiddleware } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    credentials: false,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/applications", authMiddleware, applicationsRoutes);
app.use("/api/notes", authMiddleware, notesRoutes);
app.use("/api/analytics", authMiddleware, analyticsRoutes);

app.use(errorHandler);

export default app;
