import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();


// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// User Signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, isAdmin } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with verification token
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        user = new User({ email, password: hashedPassword, isAdmin, verificationToken });
        await user.save();

        // Send verification email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Account Verification',
            text: `Click the following link to verify your account: ${process.env.CLIENT_URL}/verify/${verificationToken}`
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'User created successfully. Verification email sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Check if user is verified
        if (!user.verified) {
            return res.status(400).json({ message: 'Account not verified. Check your email for verification instructions' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin Signup
router.post('/admin/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin user with isAdmin set to true
        user = new User({ email, password: hashedPassword, isAdmin: true });
        await user.save();

        res.status(201).json({ message: 'Admin user created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists and is an admin
        const user = await User.findOne({ email, isAdmin: true });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// User Verification
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Update user verification status
        const user = await User.findOneAndUpdate(
            { email: decoded.email },
            { $set: { verified: true, verificationToken: null } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.redirect(`${process.env.CLIENT_URL}/login`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Password Reset Request
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Generate reset token
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Update user with reset token and expiry
        await User.findOneAndUpdate(
            { email },
            { $set: { resetToken, resetTokenExpiry: Date.now() + 3600000 } }
        );

        // Send password reset email
        const transporter = nodemailer.createTransport({
            // Configure email transporter
        });

        const mailOptions = {
            from: 'blanksonpaul3@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `Click the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${resetToken}`
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Password Reset
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Check token expiry
        const user = await User.findOne({ email: decoded.email });
        if (!user || Date.now() > user.resetTokenExpiry) {
            return res.status(400).json({ message: 'Token expired. Request a new one' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password and reset token
        await User.findOneAndUpdate(
            { email: decoded.email },
            { $set: { password: hashedPassword, resetToken: null, resetTokenExpiry: null } }
        );

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;