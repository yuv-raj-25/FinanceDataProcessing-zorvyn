import { describe, it, expect } from 'vitest';
import { loginSchema } from '../../src/validators/auth.validator.js';
import { createUserSchema, changeRoleSchema, changeStatusSchema } from '../../src/validators/user.validator.js';
import { createRecordSchema, updateRecordSchema, getRecordSchema } from '../../src/validators/record.validator.js';

describe('Auth Validators', () => {
    describe('loginSchema', () => {
        it('should pass with valid email and password', () => {
            const result = loginSchema.safeParse({
                body: { email: 'test@example.com', password: 'secret123' }
            });
            expect(result.success).toBe(true);
        });

        it('should fail with invalid email', () => {
            const result = loginSchema.safeParse({
                body: { email: 'not-an-email', password: 'secret123' }
            });
            expect(result.success).toBe(false);
        });

        it('should fail with empty password', () => {
            const result = loginSchema.safeParse({
                body: { email: 'test@example.com', password: '' }
            });
            expect(result.success).toBe(false);
        });

        it('should fail with missing fields', () => {
            const result = loginSchema.safeParse({ body: {} });
            expect(result.success).toBe(false);
        });
    });
});

describe('User Validators', () => {
    describe('createUserSchema', () => {
        it('should pass with valid email, password, and optional role', () => {
            const result = createUserSchema.safeParse({
                body: { email: 'admin@test.com', password: 'pass123456', role: 'admin' }
            });
            expect(result.success).toBe(true);
        });

        it('should pass without role (defaults in controller)', () => {
            const result = createUserSchema.safeParse({
                body: { email: 'user@test.com', password: 'pass123456' }
            });
            expect(result.success).toBe(true);
        });

        it('should fail with short password', () => {
            const result = createUserSchema.safeParse({
                body: { email: 'user@test.com', password: '12345' }
            });
            expect(result.success).toBe(false);
        });

        it('should fail with invalid role', () => {
            const result = createUserSchema.safeParse({
                body: { email: 'user@test.com', password: 'pass123456', role: 'superadmin' }
            });
            expect(result.success).toBe(false);
        });
    });

    describe('changeRoleSchema', () => {
        it('should pass with valid UUID and role', () => {
            const result = changeRoleSchema.safeParse({
                params: { id: '123e4567-e89b-12d3-a456-426614174000' },
                body: { role: 'analyst' }
            });
            expect(result.success).toBe(true);
        });

        it('should fail with non-UUID id', () => {
            const result = changeRoleSchema.safeParse({
                params: { id: 'not-a-uuid' },
                body: { role: 'admin' }
            });
            expect(result.success).toBe(false);
        });

        it('should fail with invalid role value', () => {
            const result = changeRoleSchema.safeParse({
                params: { id: '123e4567-e89b-12d3-a456-426614174000' },
                body: { role: 'moderator' }
            });
            expect(result.success).toBe(false);
        });
    });

    describe('changeStatusSchema', () => {
        it('should pass with "active"', () => {
            const result = changeStatusSchema.safeParse({
                params: { id: '123e4567-e89b-12d3-a456-426614174000' },
                body: { status: 'active' }
            });
            expect(result.success).toBe(true);
        });

        it('should pass with "inactive"', () => {
            const result = changeStatusSchema.safeParse({
                params: { id: '123e4567-e89b-12d3-a456-426614174000' },
                body: { status: 'inactive' }
            });
            expect(result.success).toBe(true);
        });

        it('should fail with invalid status', () => {
            const result = changeStatusSchema.safeParse({
                params: { id: '123e4567-e89b-12d3-a456-426614174000' },
                body: { status: 'banned' }
            });
            expect(result.success).toBe(false);
        });
    });
});

describe('Record Validators', () => {
    describe('createRecordSchema', () => {
        it('should pass with all required fields', () => {
            const result = createRecordSchema.safeParse({
                body: {
                    type: 'income',
                    amount: 1500.50,
                    category: 'Salary',
                    date: '2026-04-06'
                }
            });
            expect(result.success).toBe(true);
        });

        it('should pass with optional description', () => {
            const result = createRecordSchema.safeParse({
                body: {
                    type: 'expense',
                    amount: 50,
                    category: 'Food',
                    date: '2026-04-06',
                    description: 'Lunch'
                }
            });
            expect(result.success).toBe(true);
        });

        it('should fail with negative amount', () => {
            const result = createRecordSchema.safeParse({
                body: {
                    type: 'income',
                    amount: -100,
                    category: 'Salary',
                    date: '2026-04-06'
                }
            });
            expect(result.success).toBe(false);
        });

        it('should fail with zero amount', () => {
            const result = createRecordSchema.safeParse({
                body: {
                    type: 'income',
                    amount: 0,
                    category: 'Salary',
                    date: '2026-04-06'
                }
            });
            expect(result.success).toBe(false);
        });

        it('should fail with invalid type', () => {
            const result = createRecordSchema.safeParse({
                body: {
                    type: 'transfer',
                    amount: 100,
                    category: 'Misc',
                    date: '2026-04-06'
                }
            });
            expect(result.success).toBe(false);
        });

        it('should fail with invalid date format', () => {
            const result = createRecordSchema.safeParse({
                body: {
                    type: 'income',
                    amount: 100,
                    category: 'Salary',
                    date: '04-06-2026'
                }
            });
            expect(result.success).toBe(false);
        });

        it('should fail with empty category', () => {
            const result = createRecordSchema.safeParse({
                body: {
                    type: 'income',
                    amount: 100,
                    category: '',
                    date: '2026-04-06'
                }
            });
            expect(result.success).toBe(false);
        });

        it('should fail when required fields are missing', () => {
            const result = createRecordSchema.safeParse({
                body: { type: 'income' }
            });
            expect(result.success).toBe(false);
        });
    });

    describe('updateRecordSchema', () => {
        it('should pass with partial fields and valid UUID', () => {
            const result = updateRecordSchema.safeParse({
                params: { id: '123e4567-e89b-12d3-a456-426614174000' },
                body: { amount: 200 }
            });
            expect(result.success).toBe(true);
        });

        it('should fail with invalid UUID in params', () => {
            const result = updateRecordSchema.safeParse({
                params: { id: 'abc' },
                body: { amount: 200 }
            });
            expect(result.success).toBe(false);
        });
    });

    describe('getRecordSchema', () => {
        it('should pass with valid UUID', () => {
            const result = getRecordSchema.safeParse({
                params: { id: '123e4567-e89b-12d3-a456-426614174000' }
            });
            expect(result.success).toBe(true);
        });

        it('should fail with non-UUID string', () => {
            const result = getRecordSchema.safeParse({
                params: { id: '12345' }
            });
            expect(result.success).toBe(false);
        });
    });
});
