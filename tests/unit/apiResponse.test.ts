import { describe, it, expect } from 'vitest';
import { ApiResponse } from '../../src/utility/apiResponse.js';

describe('ApiResponse', () => {
    it('should create a success response for status < 400', () => {
        const resp = new ApiResponse({ id: 1 }, 'Created', 201);
        expect(resp.success).toBe(true);
        expect(resp.statusCode).toBe(201);
        expect(resp.message).toBe('Created');
        expect(resp.data).toEqual({ id: 1 });
    });

    it('should set success to false for status >= 400', () => {
        const resp = new ApiResponse(null, 'Error', 400);
        expect(resp.success).toBe(false);
    });

    it('should use default message when none provided', () => {
        const resp = new ApiResponse([], undefined, 200);
        expect(resp.message).toBe('success');
    });

    it('should handle null data', () => {
        const resp = new ApiResponse(null, 'No content', 204);
        expect(resp.data).toBeNull();
        expect(resp.success).toBe(true);
    });
});
