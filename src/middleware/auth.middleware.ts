import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthRequest, UserPayload } from '../types/index.js';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_finance_key_123') as UserPayload;
        
        if (decoded.status === 'inactive') {
            res.status(403).json({ error: 'User is inactive. Contact admin.' });
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
