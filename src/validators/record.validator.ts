import { z } from 'zod';

export const createRecordSchema = z.object({
    body: z.object({
        type: z.enum(['income', 'expense']),
        amount: z.number().positive('amount must be a positive number'),
        category: z.string().min(1, 'Category is required'),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
        description: z.string().optional()
    })
});

export const updateRecordSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid record ID')
    }),
    body: z.object({
        type: z.enum(['income', 'expense']).optional(),
        amount: z.number().positive('amount must be a positive number').optional(),
        category: z.string().min(1).optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
        description: z.string().optional()
    }).refine(data => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update'
    })
});

export const getRecordSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid record ID')
    })
});

export const getAllRecordsSchema = z.object({
    query: z.object({
        type: z.enum(['income', 'expense']).optional(),
        category: z.string().optional(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format').optional(),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format').optional(),
        search: z.string().optional(),
        page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
        limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10)
    })
});
