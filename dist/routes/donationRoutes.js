"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const donationController_1 = require("../controllers/donationController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const validation_2 = require("../middleware/validation");
const router = (0, express_1.Router)();
// User donation routes
router.post('/', auth_1.authenticateToken, auth_1.requireUser, validation_1.validateDonation, donationController_1.createDonation);
router.get('/my-donations', auth_1.authenticateToken, auth_1.requireUser, donationController_1.getUserDonations);
// Admin donation routes
router.get('/all', auth_1.authenticateToken, auth_1.requireAdmin, donationController_1.getAllDonations);
router.post('/admin', auth_1.authenticateToken, auth_1.requireAdmin, [
    (0, express_validator_1.body)('amount').isFloat({ min: 0.01 }).withMessage('Donation amount must be at least $0.01'),
    (0, express_validator_1.body)('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
    validation_2.handleValidationErrors,
], donationController_1.createDonationByAdmin);
exports.default = router;
