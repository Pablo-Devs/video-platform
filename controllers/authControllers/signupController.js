import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import zxcvbn from "zxcvbn";

import dotenv from 'dotenv';
dotenv.config();

// Regular expression for email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS
    }
});

export async function userSignupPost(req, res) {
    try {
        const { username, email, password } = req.body;

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate password strength
        const passwordStrength = zxcvbn(password);
        if (passwordStrength.score < 3) {
            return res.status(400).json({ message: 'Password is too weak. Please choose a stronger password.' });
        }

        // Hash password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with verification token
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        user = new User({ username, email, password: hashedPassword, isAdmin: false, verificationToken });
        await user.save();

        // Send verification email
        const mailOptions = {
            from: {
                name: 'Bespoke Video Platform',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Bespoke Video Platform Account Verification',
            text: `Click the following link to verify your account: ${process.env.CLIENT_URL}/verify/${verificationToken}`
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'User created successfully. Verification email sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function adminSignupPost(req, res) {
    try {
        const { username, email, password } = req.body;

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate password strength
        const passwordStrength = zxcvbn(password);
        if (passwordStrength.score < 3) {
            return res.status(400).json({ message: 'Password is too weak. Please choose a stronger password.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin user with isAdmin set to true and verification token
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        user = new User({ username, email, password: hashedPassword, isAdmin: true, verificationToken });
        await user.save();

        // Send verification email
        const mailOptions = {
            from: {
                name: 'Bespoke Video Platform',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Bespoke Video Platform Account Verification',
            text: `Click the following link to verify your account: ${process.env.CLIENT_URL}/verify/${verificationToken}`
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Admin user created successfully. Verification email sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export function signupPage(req, res) {
    res.render('signup');
}