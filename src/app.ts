import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import type { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import { ApiError } from "./utility/apiError.js";

dotenv.config();

const app = express();

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