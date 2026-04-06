import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/user.service.js';
import { asyncHandler } from '../utility/asyncHandler.js';
import { ApiError } from '../utility/apiError.js';
import { ApiResponse } from '../utility/apiResponse.js';

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await UserService.getUserByEmail(email);
    if (!user) {
        throw ApiError.unauthorized('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        throw ApiError.unauthorized('Invalid credentials');
    }

    if (user.status === 'inactive') {
        throw ApiError.forbidden('Account is inactive');
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, status: user.status },
        process.env.JWT_SECRET || 'super_secret_jwt_finance_key_123',
        { expiresIn: '24h' }
    );

    res.status(200).json(
        new ApiResponse(
            { token, user: { id: user.id, email: user.email, role: user.role, status: user.status } },
            'Login successful',
            200
        )
    );
});
