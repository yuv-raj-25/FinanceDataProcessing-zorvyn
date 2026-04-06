import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';

const SECRET = process.env.JWT_SECRET || 'super_secret_jwt_finance_key_123';

// Generate tokens for different roles
const adminToken = jwt.sign(
    { id: 'admin-uuid-1', email: 'admin@test.com', role: 'admin', status: 'active' },
    SECRET,
    { expiresIn: '1h' }
);

const viewerToken = jwt.sign(
    { id: 'viewer-uuid-1', email: 'viewer@test.com', role: 'viewer', status: 'active' },
    SECRET,
    { expiresIn: '1h' }
);

const analystToken = jwt.sign(
    { id: 'analyst-uuid-1', email: 'analyst@test.com', role: 'analyst', status: 'active' },
    SECRET,
    { expiresIn: '1h' }
);

// Mock RecordService
vi.mock('../../src/services/record.service.js', () => {
    const mockRecord = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: 'admin-uuid-1',
        type: 'income',
        amount: '1500.00',
        category: 'Salary',
        date: '2026-04-06',
        description: 'Monthly salary',
        created_at: '2026-04-06T10:00:00Z',
        deleted_at: null
    };

    return {
        RecordService: {
            create: vi.fn(async () => mockRecord),
            getById: vi.fn(async (id: string, userId: string) => {
                if (id === '550e8400-e29b-41d4-a716-446655440000' && userId === 'admin-uuid-1') {
                    return mockRecord;
                }
                return null;
            }),
            getAll: vi.fn(async () => ({
                records: [mockRecord],
                pagination: { total: 1, page: 1, limit: 10, totalPages: 1 }
            })),
            update: vi.fn(async (id: string, userId: string) => {
                if (id === '550e8400-e29b-41d4-a716-446655440000' && userId === 'admin-uuid-1') {
                    return { ...mockRecord, amount: '2000.00' };
                }
                return null;
            }),
            delete: vi.fn(async (id: string, userId: string) => {
                if (id === '550e8400-e29b-41d4-a716-446655440000' && userId === 'admin-uuid-1') {
                    return mockRecord;
                }
                return null;
            }),
        }
    };
});

describe('Records API', () => {
    // ──── Authentication ────
    describe('Authentication', () => {
        it('should return 401 without a token', async () => {
            const res = await request(app).get('/api/records');
            expect(res.status).toBe(401);
        });

        it('should return 401 with an invalid token', async () => {
            const res = await request(app)
                .get('/api/records')
                .set('Authorization', 'Bearer invalid.jwt.token');
            expect(res.status).toBe(401);
        });
    });

    // ──── Role-Based Access ────
    describe('Role-Based Access', () => {
        it('viewer should be able to GET records', async () => {
            const res = await request(app)
                .get('/api/records')
                .set('Authorization', `Bearer ${viewerToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('viewer should NOT be able to POST records', async () => {
            const res = await request(app)
                .post('/api/records')
                .set('Authorization', `Bearer ${viewerToken}`)
                .send({
                    type: 'income',
                    amount: 100,
                    category: 'Salary',
                    date: '2026-04-06'
                });
            expect(res.status).toBe(403);
        });

        it('analyst should be able to GET records', async () => {
            const res = await request(app)
                .get('/api/records')
                .set('Authorization', `Bearer ${analystToken}`);
            expect(res.status).toBe(200);
        });

        it('analyst should NOT be able to DELETE records', async () => {
            const res = await request(app)
                .delete('/api/records/550e8400-e29b-41d4-a716-446655440000')
                .set('Authorization', `Bearer ${analystToken}`);
            expect(res.status).toBe(403);
        });
    });

    // ──── CRUD Operations (Admin) ────
    describe('CRUD (admin)', () => {
        it('POST /api/records - should create a record', async () => {
            const res = await request(app)
                .post('/api/records')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    type: 'income',
                    amount: 1500.50,
                    category: 'Salary',
                    date: '2026-04-06',
                    description: 'Monthly salary'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.type).toBe('income');
        });

        it('GET /api/records - should list records with pagination', async () => {
            const res = await request(app)
                .get('/api/records')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.records).toBeDefined();
            expect(res.body.data.pagination).toBeDefined();
            expect(res.body.data.pagination.total).toBe(1);
        });

        it('GET /api/records/:id - should fetch a single record', async () => {
            const res = await request(app)
                .get('/api/records/550e8400-e29b-41d4-a716-446655440000')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe('550e8400-e29b-41d4-a716-446655440000');
        });

        it('GET /api/records/:id - should return 404 for non-existent record', async () => {
            const res = await request(app)
                .get('/api/records/550e8400-e29b-41d4-a716-446655440099')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(404);
        });

        it('PUT /api/records/:id - should update a record', async () => {
            const res = await request(app)
                .put('/api/records/550e8400-e29b-41d4-a716-446655440000')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ amount: 2000 });

            expect(res.status).toBe(200);
            expect(res.body.data.amount).toBe('2000.00');
        });

        it('DELETE /api/records/:id - should soft delete a record', async () => {
            const res = await request(app)
                .delete('/api/records/550e8400-e29b-41d4-a716-446655440000')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ──── Validation ────
    describe('Validation', () => {
        it('should return 422 for invalid type', async () => {
            const res = await request(app)
                .post('/api/records')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ type: 'transfer', amount: 100, category: 'Misc', date: '2026-04-06' });
            expect(res.status).toBe(422);
        });

        it('should return 422 for negative amount', async () => {
            const res = await request(app)
                .post('/api/records')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ type: 'income', amount: -50, category: 'Misc', date: '2026-04-06' });
            expect(res.status).toBe(422);
        });

        it('should return 422 for bad date format', async () => {
            const res = await request(app)
                .post('/api/records')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ type: 'income', amount: 100, category: 'Misc', date: '06-04-2026' });
            expect(res.status).toBe(422);
        });

        it('should return 422 for non-UUID record id', async () => {
            const res = await request(app)
                .get('/api/records/not-a-uuid')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(422);
        });
    });
});
