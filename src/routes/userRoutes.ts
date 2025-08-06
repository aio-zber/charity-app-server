import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from '../controllers/userController';
import {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
} from '../middleware/validation';
import { authenticateToken, requireUser } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateUserLogin, loginUser);

// Protected routes
router.get('/profile', authenticateToken, requireUser, getUserProfile);
router.put('/profile', authenticateToken, requireUser, validateUserUpdate, updateUserProfile);

export default router;