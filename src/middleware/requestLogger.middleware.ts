import type{ Request, Response, NextFunction } from "express";
import crypto from "crypto";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`);
  });

  next();
};
