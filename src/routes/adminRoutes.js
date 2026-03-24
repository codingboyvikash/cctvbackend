import express from 'express';
import { body } from 'express-validator';
import {
  adminLogin,
  getDashboardStats,
  getTickets,
  getSingleTicket,
  updateTicket,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  validate,
  adminLogin
);

router.get('/dashboard/stats', protect, getDashboardStats);
router.get('/tickets', protect, getTickets);
router.get('/tickets/:id', protect, getSingleTicket);
router.put(
  '/tickets/:id',
  protect,
  [
    body('status').optional().isIn(['Open', 'In Progress', 'Closed']).withMessage('Invalid status.'),
    body('assignedTechnician').optional().isString().withMessage('Assigned technician must be text.'),
    body('note').optional().isString().withMessage('Note must be text.'),
  ],
  validate,
  updateTicket
);

export default router;
