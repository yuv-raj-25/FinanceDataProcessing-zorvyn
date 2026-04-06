import { pool } from '../db/index.js';

export class DashboardService {
    /**
     * Returns total income, total expenses, and net balance for a user.
     * Optionally scoped to a date range.
     */
    static async getSummary(
        userId: string,
        startDate?: string,
        endDate?: string
    ) {
        const conditions = ['user_id = $1', 'deleted_at IS NULL'];
        const params: any[] = [userId];
        let idx = 2;

        if (startDate) {
            conditions.push(`date >= $${idx++}`);
            params.push(startDate);
        }
        if (endDate) {
            conditions.push(`date <= $${idx++}`);
            params.push(endDate);
        }

        const where = conditions.join(' AND ');

        const result = await pool.query(
            `SELECT
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS net_balance,
                COUNT(*)::int AS total_records
             FROM financial_entries
             WHERE ${where}`,
            params
        );

        return result.rows[0];
    }

    /**
     * Returns totals grouped by category, split by type.
     */
    static async getCategoryTotals(
        userId: string,
        startDate?: string,
        endDate?: string
    ) {
        const conditions = ['user_id = $1', 'deleted_at IS NULL'];
        const params: any[] = [userId];
        let idx = 2;

        if (startDate) {
            conditions.push(`date >= $${idx++}`);
            params.push(startDate);
        }
        if (endDate) {
            conditions.push(`date <= $${idx++}`);
            params.push(endDate);
        }

        const where = conditions.join(' AND ');

        const result = await pool.query(
            `SELECT
                category,
                type,
                SUM(amount) AS total,
                COUNT(*)::int AS count
             FROM financial_entries
             WHERE ${where}
             GROUP BY category, type
             ORDER BY total DESC`,
            params
        );

        return result.rows;
    }

    /**
     * Returns the most recent financial entries for a user.
     */
    static async getRecentActivity(userId: string, limit: number = 10) {
        const result = await pool.query(
            `SELECT * FROM financial_entries
             WHERE user_id = $1 AND deleted_at IS NULL
             ORDER BY date DESC, created_at DESC
             LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    /**
     * Returns monthly totals (income, expenses, net) for the given year,
     * or the last 12 months if no year is specified.
     */
    static async getMonthlyTrends(userId: string, year?: number) {
        if (year) {
            const result = await pool.query(
                `SELECT
                    EXTRACT(MONTH FROM date)::int AS month,
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses,
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS net
                 FROM financial_entries
                 WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND deleted_at IS NULL
                 GROUP BY month
                 ORDER BY month`,
                [userId, year]
            );
            return result.rows;
        }

        // Last 12 months
        const result = await pool.query(
            `SELECT
                TO_CHAR(date_trunc('month', date), 'YYYY-MM') AS month,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS net
             FROM financial_entries
             WHERE user_id = $1
               AND date >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
               AND deleted_at IS NULL
             GROUP BY date_trunc('month', date)
             ORDER BY month`,
            [userId]
        );
        return result.rows;
    }

    /**
     * Returns weekly totals for a given number of past weeks.
     */
    static async getWeeklyTrends(userId: string, weeks: number = 12) {
        const result = await pool.query(
            `SELECT
                TO_CHAR(date_trunc('week', date), 'YYYY-MM-DD') AS week_start,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses,
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS net
             FROM financial_entries
             WHERE user_id = $1
               AND date >= CURRENT_DATE - ($2 * 7)::int
               AND deleted_at IS NULL
             GROUP BY date_trunc('week', date)
             ORDER BY week_start`,
            [userId, weeks]
        );
        return result.rows;
    }
}
