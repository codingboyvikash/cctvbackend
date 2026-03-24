import express from 'express';
import { body } from 'express-validator';
import { submitTicket, checkTicketStatus, submitContactInquiry } from '../controllers/customerController.js';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post(
  '/tickets',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required.'),
    body('mobileNumber').trim().notEmpty().withMessage('Mobile number is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('serviceType').isIn(['CCTV', 'IT', 'Printer', 'AMC', 'Other']).withMessage('Invalid service type.'),
    body('problemDescription').trim().notEmpty().withMessage('Problem description is required.'),
    body('address').trim().notEmpty().withMessage('Address is required.'),
  ],
  validate,
  submitTicket
);

router.post(
  '/tickets/status',
  [
    body('ticketNumber').trim().notEmpty().withMessage('Ticket number is required.'),
    body('contact').trim().notEmpty().withMessage('Mobile number or email is required.'),
  ],
  validate,
  checkTicketStatus
);

router.post(
  '/contact',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('mobile').trim().notEmpty().withMessage('Mobile number is required.'),
    body('message').trim().notEmpty().withMessage('Message is required.'),
  ],
  validate,
  submitContactInquiry
);

export default router;
