import type { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { asyncHandler } from '../utility/asyncHandler.js';
import { ApiError } from '../utility/apiError.js';
import { ApiResponse } from '../utility/apiResponse.js';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role } = req.body;

    try {
        const user = await UserService.createUser(email, password, role || 'viewer');
        res.status(201).json(new ApiResponse(user, 'User created successfully', 201));
    } catch (error: any) {
        if (error.code === '23505') {
            throw ApiError.conflict('Email already exists');
        }
        throw error;
    }
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    res.status(200).json(new ApiResponse(users, 'Users fetched successfully', 200));
});

export const changeRole = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { role } = req.body;

    const updatedUser = await UserService.updateUserRole(id, role);
    if (!updatedUser) {
        throw ApiError.notFound('User not found');
    }

    res.status(200).json(new ApiResponse(updatedUser, 'Role updated successfully', 200));
});

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { status } = req.body;

    const updatedUser = await UserService.updateUserStatus(id, status);
    if (!updatedUser) {
        throw ApiError.notFound('User not found');
    }

    res.status(200).json(new ApiResponse(updatedUser, 'Status updated successfully', 200));
});
