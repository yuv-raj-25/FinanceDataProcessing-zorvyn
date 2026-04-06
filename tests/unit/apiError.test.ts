import { describe, it, expect } from 'vitest';
import { ApiError } from '../../src/utility/apiError.js';

describe('ApiError', () => {
    it('should create an error with default message and given status code', () => {
        const error = new ApiError('Test error', 400);
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toBe('Test error');
        expect(error.statusCode).toBe(400);
        expect(error.success).toBe(false);
        expect(error.data).toBeNull();
        expect(error.errors).toEqual([]);
    });

    it('should store custom errors array', () => {
        const errors = [{ field: 'email', message: 'required' }];
        const error = new ApiError('Validation', 422, errors);
        expect(error.errors).toEqual(errors);
    });

    describe('static factory methods', () => {
        it('badRequest returns 400', () => {
            const err = ApiError.badRequest('Bad input');
            expect(err.statusCode).toBe(400);
            expect(err.message).toBe('Bad input');
        });

        it('badRequest uses default message', () => {
            const err = ApiError.badRequest();
            expect(err.message).toBe('Bad Request');
        });

        it('unauthorized returns 401', () => {
            const err = ApiError.unauthorized('No token');
            expect(err.statusCode).toBe(401);
            expect(err.message).toBe('No token');
        });

        it('unauthorized uses default message', () => {
            const err = ApiError.unauthorized();
            expect(err.message).toBe('Unauthorized');
        });

        it('forbidden returns 403', () => {
            const err = ApiError.forbidden('No access');
            expect(err.statusCode).toBe(403);
            expect(err.message).toBe('No access');
        });

        it('notFound returns 404', () => {
            const err = ApiError.notFound('Missing');
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe('Missing');
        });

        it('conflict returns 409', () => {
            const err = ApiError.conflict('Duplicate');
            expect(err.statusCode).toBe(409);
            expect(err.message).toBe('Duplicate');
        });

        it('validationError returns 422', () => {
            const fieldErrors = [{ field: 'amount', message: 'must be positive' }];
            const err = ApiError.validationError('Invalid', fieldErrors);
            expect(err.statusCode).toBe(422);
            expect(err.errors).toEqual(fieldErrors);
        });

        it('internalError returns 500', () => {
            const err = ApiError.internalError();
            expect(err.statusCode).toBe(500);
            expect(err.message).toBe('Internal server error');
        });
    });
});
