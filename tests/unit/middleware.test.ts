import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../src/middleware/auth.middleware.js';
import { requireRole } from '../../src/middleware/role.middleware.js';

// Helper to create mock req/res/next
const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockNext = () => vi.fn();

describe('authenticate middleware', () => {
    const SECRET = process.env.JWT_SECRET || 'super_secret_jwt_finance_key_123';

    it('should return 401 if no Authorization header is present', () => {
        const req: any = { header: vi.fn().mockReturnValue(undefined) };
        const res = mockRes();
        const next = mockNext();

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
        const req: any = { header: vi.fn().mockReturnValue('Bearer invalid.token.here') };
        const res = mockRes();
        const next = mockNext();

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });

    it('should set req.user and call next() for a valid token', () => {
        const payload = { id: 'user-1', email: 'a@b.com', role: 'admin', status: 'active' };
        const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
        const req: any = { header: vi.fn().mockReturnValue(`Bearer ${token}`) };
        const res = mockRes();
        const next = mockNext();

        authenticate(req, res, next);

        expect(req.user).toBeDefined();
        expect(req.user.id).toBe('user-1');
        expect(req.user.role).toBe('admin');
        expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user status is inactive', () => {
        const payload = { id: 'user-2', email: 'b@c.com', role: 'viewer', status: 'inactive' };
        const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
        const req: any = { header: vi.fn().mockReturnValue(`Bearer ${token}`) };
        const res = mockRes();
        const next = mockNext();

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'User is inactive. Contact admin.' });
        expect(next).not.toHaveBeenCalled();
    });
});

describe('requireRole middleware', () => {
    it('should call next() if user role is in allowed list', () => {
        const req: any = { user: { id: '1', role: 'admin' } };
        const res = mockRes();
        const next = mockNext();

        const middleware = requireRole(['admin', 'analyst']);
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('should throw ApiError if user role is not allowed', () => {
        const req: any = { user: { id: '1', role: 'viewer' } };
        const res = mockRes();
        const next = mockNext();

        const middleware = requireRole(['admin']);

        expect(() => middleware(req, res, next)).toThrow('Access denied: insufficient permissions');
    });

    it('should throw ApiError if req.user is undefined', () => {
        const req: any = {};
        const res = mockRes();
        const next = mockNext();

        const middleware = requireRole(['admin']);

        expect(() => middleware(req, res, next)).toThrow('Authentication required');
    });
});
