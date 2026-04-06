import { Router } from 'express';
import { createUser, getAllUsers, changeRole, changeStatus } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createUserSchema, changeRoleSchema, changeStatusSchema } from '../validators/user.validator.js';

const router = Router();

// Only admins can create and manage users
router.post('/', authenticate, requireRole(['admin']), validate(createUserSchema), createUser);
router.get('/', authenticate, requireRole(['admin']), getAllUsers);
router.put('/:id/role', authenticate, requireRole(['admin']), validate(changeRoleSchema), changeRole);
router.put('/:id/status', authenticate, requireRole(['admin']), validate(changeStatusSchema), changeStatus);

export default router;
