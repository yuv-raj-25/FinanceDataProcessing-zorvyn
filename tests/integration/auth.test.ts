import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

// Mock the UserService to avoid needing a real database
vi.mock('../../src/services/user.service.js', () => {
    const bcrypt = require('bcrypt');
    const hash = bcrypt.hashSync('correctpassword', 10);
    return {
        UserService: {
            getUserByEmail: vi.fn(async (email: string) => {
                if (email === 'test@example.com') {
                    return {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        email: 'test@example.com',
                        password_hash: hash,
                        role: 'admin',
                        status: 'active'
                    };
                }
                if (email === 'inactive@example.com') {
                    return {
                        id: '123e4567-e89b-12d3-a456-426614174001',
                        email: 'inactive@example.com',
                        password_hash: hash,
                        role: 'viewer',
                        status: 'inactive'
                    };
                }
                return null;
            })
        }
    };
});

describe('POST /api/auth/login', () => {
    it('should return 200 and a token for valid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'correctpassword' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.email).toBe('test@example.com');
        expect(res.body.data.user.role).toBe('admin');
    });

    it('should return 401 for wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('should return 401 for non-existent user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@example.com', password: 'password123' });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('should return 403 for inactive user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'inactive@example.com', password: 'correctpassword' });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it('should return 422 for missing email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'password123' });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
    });

    it('should return 422 for invalid email format', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'not-an-email', password: 'password123' });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
    });

    it('should return 422 for empty password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: '' });

        expect(res.status).toBe(422);
    });
});
