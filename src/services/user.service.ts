import bcrypt from 'bcrypt';
import { pool } from '../db/index.js';

export class UserService {
    static async createUser(email: string, password_raw: string, role: string = 'viewer') {
        const hash = await bcrypt.hash(password_raw, 10);
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, status, created_at`,
            [email, hash, role]
        );
        return result.rows[0];
    }

    static async getUserByEmail(email: string) {
        const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        return result.rows[0];
    }

    static async getAllUsers() {
        const result = await pool.query(`SELECT id, email, role, status, created_at FROM users ORDER BY created_at DESC`);
        return result.rows;
    }

    static async updateUserRole(id: string, role: string) {
        const result = await pool.query(
            `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role, status`,
            [role, id]
        );
        return result.rows[0];
    }

    static async updateUserStatus(id: string, status: string) {
        const result = await pool.query(
            `UPDATE users SET status = $1 WHERE id = $2 RETURNING id, email, role, status`,
            [status, id]
        );
        return result.rows[0];
    }
}
