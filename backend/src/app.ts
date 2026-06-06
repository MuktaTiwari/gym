import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import rateLimit from "express-rate-limit";
import { corsOptions } from "./config/corsOptions";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./features/auth/auth.routes";
import membersRoutes from "./features/members/members.routes";
import plansRoutes from "./features/plans/plans.routes";
import gymRoutes from "./features/gyms/gym.routes";
import superAdminRoutes from "./features/super-admin/superAdmin.routes";

const app = express();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/v1/auth", authRateLimiter, authRoutes);
app.use("/api/v1/members", membersRoutes);
app.use("/api/v1/plans", plansRoutes);
app.use("/api/v1/gym", gymRoutes);
app.use("/api/v1/super-admin", superAdminRoutes);

// Serve uploaded logos
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", message: "FitCore API is running smoothly" });
});

// Central Error Handler
app.use(errorHandler);

export default app;
