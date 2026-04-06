import { pool } from '../db/index.js';

export class RecordService {
    static async create(
        userId: string,
        type: string,
        amount: number,
        category: string,
        date: string,
        description?: string
    ) {
        const result = await pool.query(
            `INSERT INTO financial_entries (user_id, type, amount, category, date, description)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [userId, type, amount, category, date, description || null]
        );
        return result.rows[0];
    }

    static async getById(id: string, userId: string) {
        const result = await pool.query(
            `SELECT * FROM financial_entries WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
            [id, userId]
        );
        return result.rows[0];
    }

    static async getAll(
        userId: string,
        filters: {
            type?: string;
            category?: string;
            startDate?: string;
            endDate?: string;
            search?: string;
        } = {},
        pagination: {
            page: number;
            limit: number;
        } = { page: 1, limit: 10 }
    ) {
        const conditions: string[] = ['user_id = $1', 'deleted_at IS NULL'];
        const params: any[] = [userId];
        let paramIndex = 2;

        if (filters.type) {
            conditions.push(`type = $${paramIndex++}`);
            params.push(filters.type);
        }

        if (filters.category) {
            conditions.push(`category = $${paramIndex++}`);
            params.push(filters.category);
        }

        if (filters.startDate) {
            conditions.push(`date >= $${paramIndex++}`);
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            conditions.push(`date <= $${paramIndex++}`);
            params.push(filters.endDate);
        }

        if (filters.search) {
            conditions.push(`(description ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`);
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        const whereClause = conditions.join(' AND ');
        
        // Get total count for pagination metadata
        const countResult = await pool.query(`SELECT COUNT(*) FROM financial_entries WHERE ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count, 10);

        // Apply Pagination
        const offset = (pagination.page - 1) * pagination.limit;
        params.push(pagination.limit, offset);
        
        const result = await pool.query(
            `SELECT * FROM financial_entries WHERE ${whereClause} ORDER BY date DESC, created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
            params
        );

        return {
            records: result.rows,
            pagination: {
                total,
                page: pagination.page,
                limit: pagination.limit,
                totalPages: Math.ceil(total / pagination.limit)
            }
        };
    }

    static async update(
        id: string,
        userId: string,
        data: {
            type?: string;
            amount?: number;
            category?: string;
            date?: string;
            description?: string;
        }
    ) {
        const fields: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (data.type !== undefined) {
            fields.push(`type = $${paramIndex++}`);
            params.push(data.type);
        }
        if (data.amount !== undefined) {
            fields.push(`amount = $${paramIndex++}`);
            params.push(data.amount);
        }
        if (data.category !== undefined) {
            fields.push(`category = $${paramIndex++}`);
            params.push(data.category);
        }
        if (data.date !== undefined) {
            fields.push(`date = $${paramIndex++}`);
            params.push(data.date);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${paramIndex++}`);
            params.push(data.description);
        }

        if (fields.length === 0) return null;

        params.push(id, userId);

        const result = await pool.query(
            `UPDATE financial_entries SET ${fields.join(', ')}
             WHERE id = $${paramIndex++} AND user_id = $${paramIndex} AND deleted_at IS NULL
             RETURNING *`,
            params
        );
        return result.rows[0];
    }

    static async delete(id: string, userId: string) {
        const result = await pool.query(
            `UPDATE financial_entries SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING *`,
            [id, userId]
        );
        return result.rows[0];
    }
}
