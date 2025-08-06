import { Router } from 'express';
import {
  createDonation,
  getUserDonations,
  getAllDonations,
  createDonationByAdmin,
} from '../controllers/donationController';
import { validateDonation } from '../middleware/validation';
import { authenticateToken, requireUser, requireAdmin } from '../middleware/auth';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = Router();

// User donation routes
router.post('/', authenticateToken, requireUser, validateDonation, createDonation);
router.get('/my-donations', authenticateToken, requireUser, getUserDonations);

// Admin donation routes
router.get('/all', authenticateToken, requireAdmin, getAllDonations);
router.post('/admin', 
  authenticateToken, 
  requireAdmin, 
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Donation amount must be at least $0.01'),
    body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    handleValidationErrors,
  ],
  createDonationByAdmin
);

export default router;