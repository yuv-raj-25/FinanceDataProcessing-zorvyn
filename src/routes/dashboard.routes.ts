import { Router } from 'express';
import {
    getSummary,
    getCategoryTotals,
    getRecentActivity,
    getMonthlyTrends,
    getWeeklyTrends
} from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// All dashboard routes require authentication and at least 'analyst' role
// Viewers cannot access the dashboard summaries, only their own raw records if needed.
// (Based on requirements: "An analyst may be allowed to read records and access summaries")
router.use(authenticate, requireRole(['admin', 'analyst']));

router.get('/summary', getSummary);
router.get('/category-totals', getCategoryTotals);
router.get('/recent', getRecentActivity);
router.get('/trends/monthly', getMonthlyTrends);
router.get('/trends/weekly', getWeeklyTrends);

export default router;
