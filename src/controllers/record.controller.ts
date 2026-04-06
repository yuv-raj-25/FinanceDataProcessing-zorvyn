import type { Response } from 'express';
import type { AuthRequest } from '../types/index.js';
import { RecordService } from '../services/record.service.js';
import { asyncHandler } from '../utility/asyncHandler.js';
import { ApiError } from '../utility/apiError.js';
import { ApiResponse } from '../utility/apiResponse.js';


export const createRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized();

    const { type, amount, category, date, description } = req.body;

    const record = await RecordService.create(userId, type, amount, category, date, description);
    res.status(201).json(new ApiResponse(record, 'Record created successfully', 201));
});

export const getRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized();

    const id = req.params.id as string;
    const record = await RecordService.getById(id, userId);
    if (!record) {
        throw ApiError.notFound('Record not found');
    }

    res.status(200).json(new ApiResponse(record, 'Record fetched successfully', 200));
});

export const getAllRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized();

    const { type, category, startDate, endDate, search, page, limit } = req.query as any;

    const filters: { type?: string; category?: string; startDate?: string; endDate?: string; search?: string } = {};
    if (typeof type === 'string') filters.type = type;
    if (typeof category === 'string') filters.category = category;
    if (typeof startDate === 'string') filters.startDate = startDate;
    if (typeof endDate === 'string') filters.endDate = endDate;
    if (typeof search === 'string') filters.search = search;

    const pagination = {
        page: page,
        limit: limit
    };

    const recordsData = await RecordService.getAll(userId, filters, pagination);
    res.status(200).json(new ApiResponse(recordsData, 'Records fetched successfully', 200));
});

export const updateRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized();

    const { type, amount, category, date, description } = req.body;

    const id = req.params.id as string;
    const updated = await RecordService.update(id, userId, {
        type, amount, category, date, description,
    });

    if (!updated) {
        throw ApiError.notFound('Record not found or nothing to update');
    }

    res.status(200).json(new ApiResponse(updated, 'Record updated successfully', 200));
});

export const deleteRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized();

    const id = req.params.id as string;
    const deleted = await RecordService.delete(id, userId);
    if (!deleted) {
        throw ApiError.notFound('Record not found');
    }

    res.status(200).json(new ApiResponse(deleted, 'Record deleted successfully', 200));
});
