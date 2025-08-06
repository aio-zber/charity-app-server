import { Router } from 'express';
import {
  registerAdmin,
  loginAdmin,
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/adminController';
import {
  validateAdminRegistration,
  validateUserLogin,
  validateUserRegistration,
  validateUserUpdate,
} from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', validateUserLogin, loginAdmin);

// Protected admin routes
router.post('/register', authenticateToken, requireAdmin, validateAdminRegistration, registerAdmin);
router.get('/dashboard', authenticateToken, requireAdmin, getDashboardStats);

// User management routes
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.post('/users', authenticateToken, requireAdmin, validateUserRegistration, createUser);
router.put('/users/:id', authenticateToken, requireAdmin, validateUserUpdate, updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

export default router;