"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/login', validation_1.validateUserLogin, adminController_1.loginAdmin);
// Protected admin routes
router.post('/register', auth_1.authenticateToken, auth_1.requireAdmin, validation_1.validateAdminRegistration, adminController_1.registerAdmin);
router.get('/dashboard', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getDashboardStats);
// User management routes
router.get('/users', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getAllUsers);
router.post('/users', auth_1.authenticateToken, auth_1.requireAdmin, validation_1.validateUserRegistration, adminController_1.createUser);
router.put('/users/:id', auth_1.authenticateToken, auth_1.requireAdmin, validation_1.validateUserUpdate, adminController_1.updateUser);
router.delete('/users/:id', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.deleteUser);
exports.default = router;
