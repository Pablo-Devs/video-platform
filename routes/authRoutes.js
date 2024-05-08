import express from 'express';
import { userLoginPost, adminLoginPost, loginPage } from '../controllers/authControllers/loginController.js';
import { tokenVerification } from '../controllers/authControllers/accountControllers.js';
import { passwordResetRequest, resetPassword, forgotPasswordPage, resetPasswordPage } from '../controllers/authControllers/accountControllers.js';
import { userSignupPost, adminSignupPost, signupPage } from '../controllers/authControllers/signupController.js';
// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Login Page
router.get('/login', loginPage);

// Signup Page
router.get('/signup', signupPage);

// Forgot Password Page
router.get('/forgot-password', forgotPasswordPage);

// Reset Password Page
router.get('/reset-password/', resetPasswordPage);

// User Signup Post
router.post('/signup', userSignupPost);

// User Login Post
router.post('/login', userLoginPost);

// Admin Signup Post
router.post('/admin-signup', adminSignupPost);

// Admin Login Post
router.post('/admin-login', adminLoginPost);

// account Verification
router.get('/verify/:token', tokenVerification);

// Password Reset Request
router.post('/forgot-password', passwordResetRequest);

// Password Reset
router.post('/reset-password', resetPassword);

export default router;