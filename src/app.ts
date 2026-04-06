import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import type { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { ApiError } from "./utility/apiError.js";
import { requestLogger } from "./middleware/requestLogger.middleware.js";
import { pool } from "./db/index.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(requestLogger);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 100, 
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use(limiter);

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import recordRoutes from './routes/record.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);




// health check
app.get("/health", async (req, res, next) => {
  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    const duration = Date.now() - start;
    res.status(200).json({
      status: "UP",
      timestamp: new Date().toISOString(),
      database: "connected",
      latency: `${duration}ms`
    });
  } catch (error) {
    res.status(503).json({
      status: "DOWN",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Global error handler — catches errors thrown/forwarded by asyncHandler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: [],
    data: null,
  });
});

export default app;