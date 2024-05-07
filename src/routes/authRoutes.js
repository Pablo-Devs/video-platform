import express from 'express';
import { userLoginPost, adminLoginPost } from '../controllers/authControllers/loginController.js';
import { tokenVerification } from '../controllers/authControllers/accountControllers.js';
import { passwordResetRequest, resetPassword } from '../controllers/authControllers/accountControllers.js';
import { userSignupPost, adminSignupPost } from '../controllers/authControllers/signupController.js';
// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// User Signup
router.post('/signup', userSignupPost);

// User Login
router.post('/login', userLoginPost);

// Admin Signup
router.post('/admin/signup', adminSignupPost);

// Admin Login
router.post('/admin/login', adminLoginPost);

// account Verification
router.get('/verify/:token', tokenVerification);

// Password Reset Request
router.post('/reset-password', passwordResetRequest);

// Password Reset
router.post('/reset-password/:token', resetPassword);

export default router;