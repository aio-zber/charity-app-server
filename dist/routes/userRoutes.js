"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', validation_1.validateUserRegistration, userController_1.registerUser);
router.post('/login', validation_1.validateUserLogin, userController_1.loginUser);
// Protected routes
router.get('/profile', auth_1.authenticateToken, auth_1.requireUser, userController_1.getUserProfile);
router.put('/profile', auth_1.authenticateToken, auth_1.requireUser, validation_1.validateUserUpdate, userController_1.updateUserProfile);
exports.default = router;
