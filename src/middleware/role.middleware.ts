import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import { ApiError } from '../utility/apiError.js';

export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            throw ApiError.unauthorized('Authentication required');
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw ApiError.forbidden('Access denied: insufficient permissions');
        }

        next();
    };
};
