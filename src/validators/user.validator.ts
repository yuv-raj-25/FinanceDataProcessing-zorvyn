import { z } from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
        role: z.enum(['admin', 'analyst', 'viewer']).optional()
    })
});

export const changeRoleSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid user ID')
    }),
    body: z.object({
        role: z.enum(['admin', 'analyst', 'viewer'])
    })
});

export const changeStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid user ID')
    }),
    body: z.object({
        status: z.enum(['active', 'inactive'])
    })
});
