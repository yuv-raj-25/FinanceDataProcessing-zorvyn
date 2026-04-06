import type { Request } from 'express';

export interface UserPayload {
    id: string;
    email: string;
    role: string;
    status: string;
}

export interface AuthRequest extends Request {
    user?: UserPayload;
}
