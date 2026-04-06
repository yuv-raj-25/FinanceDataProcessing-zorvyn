import { Router } from 'express';
import {
    createRecord,
    getRecord,
    getAllRecords,
    updateRecord,
    deleteRecord,
} from '../controllers/record.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { 
    createRecordSchema, 
    updateRecordSchema, 
    getRecordSchema, 
    getAllRecordsSchema 
} from '../validators/record.validator.js';

const router = Router();

// All record routes require authentication
router.use(authenticate);

// Read-only routes available to all roles (admin, analyst, viewer)
router.get('/', requireRole(['admin', 'analyst', 'viewer']), validate(getAllRecordsSchema), getAllRecords);
router.get('/:id', requireRole(['admin', 'analyst', 'viewer']), validate(getRecordSchema), getRecord);

// Write routes restricted to admins
router.post('/', requireRole(['admin']), validate(createRecordSchema), createRecord);
router.put('/:id', requireRole(['admin']), validate(updateRecordSchema), updateRecord);
router.delete('/:id', requireRole(['admin']), validate(getRecordSchema), deleteRecord);

export default router;
