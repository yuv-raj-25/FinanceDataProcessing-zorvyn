import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utility/apiError.js";

export const validate = (schema: z.ZodTypeAny) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                const errors = error.issues.map((e: any) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                return next(ApiError.validationError("Validation failed", errors));
            }
            return next(error);
        }
    };
};
