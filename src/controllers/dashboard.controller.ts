import type { Response } from 'express';
import type { AuthRequest } from '../types/index.js';
import { DashboardService } from '../services/dashboard.service.js';
import { asyncHandler } from '../utility/asyncHandler.js';
import { ApiError } from '../utility/apiError.js';
import { ApiResponse } from '../utility/apiResponse.js';

/**
 * GET /api/dashboard/summary?startDate=&endDate=
 * Returns total income, expenses, net balance, record count.
 */
export const getSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized();

    const { startDate, endDate } = req.query;
    const summary = await DashboardService.getSummary(
        userId,
        typeof startDate === 'string' ? startDate : undefined,
        typeof endDate === 'string' ? endDate : undefined
    );

    res.status(200).json(new ApiResponse(summary, 'Summary fetched successfully', 200));
});

/**
 * GET /api/dashboard/category-totals?startDate=&endDate=
 * Returns income/expense totals grouped by category.
 */
export const getCategoryTotals = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized();

    const { startDate, endDate } = req.query;
    const totals = await DashboardService.getCategoryTotals(
        userId,
        typeof startDate === 'string' ? startDate : undefined,
        typeof endDate === 'string' ? endDate : undefined
    );

    res.status(200).json(new ApiResponse(totals, 'Category totals fetched successfully', 200));
});

/**
 * GET /api/dashboard/recent?limit=10
 * Returns the most recent financial entries.
 */
export const getRecentActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized();

    const limitParam = req.query.limit;
    const limit = typeof limitParam === 'string' ? Math.min(Math.max(parseInt(limitParam, 10) || 10, 1), 50) : 10;

    const activity = await DashboardService.getRecentActivity(userId, limit);
    res.status(200).json(new ApiResponse(activity, 'Recent activity fetched successfully', 200));
});

/**
 * GET /api/dashboard/trends/monthly?year=2026
 * Returns monthly income/expense/net totals.
 * If no year is specified, returns the last 12 months.
 */
export const getMonthlyTrends = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized();

    const yearParam = req.query.year;
    const year = typeof yearParam === 'string' ? parseInt(yearParam, 10) : undefined;

    if (year !== undefined && (isNaN(year) || year < 1900 || year > 2100)) {
        throw ApiError.badRequest('Invalid year');
    }

    const trends = await DashboardService.getMonthlyTrends(userId, year);
    res.status(200).json(new ApiResponse(trends, 'Monthly trends fetched successfully', 200));
});

/**
 * GET /api/dashboard/trends/weekly?weeks=12
 * Returns weekly income/expense/net totals for the past N weeks.
 */
export const getWeeklyTrends = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized();

    const weeksParam = req.query.weeks;
    const weeks = typeof weeksParam === 'string' ? Math.min(Math.max(parseInt(weeksParam, 10) || 12, 1), 52) : 12;

    const trends = await DashboardService.getWeeklyTrends(userId, weeks);
    res.status(200).json(new ApiResponse(trends, 'Weekly trends fetched successfully', 200));
});
