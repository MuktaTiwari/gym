import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { corsOptions } from "./config/corsOptions";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./features/auth/auth.routes";
import membersRoutes from "./features/members/members.routes";
import plansRoutes from "./features/plans/plans.routes";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/members", membersRoutes);
app.use("/api/v1/plans", plansRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "FitCore API is running smoothly" });
});

// Central Error Handler
app.use(errorHandler);

export default app;
