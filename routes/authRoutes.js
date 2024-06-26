import express from 'express';
import { userLoginPost, adminLoginPost, loginPage } from '../controllers/authControllers/loginController.js';
import { tokenVerification } from '../controllers/authControllers/accountControllers.js';
import { passwordResetRequest, resetPassword, forgotPasswordPage, resetPasswordPage } from '../controllers/authControllers/accountControllers.js';
import { userSignupPost, adminSignupPost, signupPage, adminSignupPage } from '../controllers/authControllers/signupController.js';
import { logout } from '../controllers/authControllers/logoutController.js';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Login Page
router.get('/login', loginPage);

// Logout Page
router.get('/logout', logout);

// User signup Page
router.get('/signup', signupPage);

// Admin signup Page
router.get('/admin-signup', adminSignupPage);

// Forgot Password Page
router.get('/settings', forgotPasswordPage);

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