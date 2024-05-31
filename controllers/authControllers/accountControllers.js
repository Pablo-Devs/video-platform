import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import dotenv from 'dotenv';
dotenv.config();

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

// Function to generate a random OTP
function generateOTP() {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

export async function tokenVerification(req, res) {
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

        res.redirect(`${req.protocol}://${req.get('host')}/login`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function passwordResetRequest(req, res) {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne ({ email });
        if (!user) {
            return res.status(400).json({ message: 'Account does not exist' });
        }

        // Generate OTP
        const otp = generateOTP();

        // Hash the OTP (optional)
        const hashedOTP = await bcrypt.hash(otp, 10);

        // Update user with hashed OTP
        await User.findOneAndUpdate(
            { email },
            { $set: { resetOTP: hashedOTP, resetOTPCreatedAt: Date.now() } }
        );

        // Send OTP via email
        const mailOptions = {
            from: {
                name: 'Paul Leonard Video Platform',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Paul Leonard Video Platform Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Password reset OTP sent to your email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function resetPassword(req, res) {
    try {
        const { email, otp, newPassword } = req.body;

        // Retrieve user by email
        const user = await User.findOne({ email });

        // Check if user exists and OTP matches
        if (!user || !user.resetOTP) {
            return res.status(400).json({ message: 'Invalid email or OTP' });
        }

        // Verify OTP
        const otpMatch = await bcrypt.compare(otp, user.resetOTP);
        if (!otpMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Check OTP expiry (e.g., OTP valid for 10 minutes)
        const otpExpirationTime = 10 * 60 * 1000; // 10 minutes in milliseconds
        const otpCreationTime = new Date(user.resetOTPCreatedAt).getTime();
        if (Date.now() > otpCreationTime + otpExpirationTime) {
            return res.status(400).json({ message: 'OTP expired. Request a new one' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password and reset OTP
        await User.findOneAndUpdate(
            { email },
            { $set: { password: hashedPassword, resetOTP: null, resetOTPCreatedAt: null } }
        );

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export function forgotPasswordPage(req, res) {
    res.render('forgot-password');
}

export function resetPasswordPage(req, res) {
    res.render('reset-password');
}

// export function accountVerification(req, res) {
//     res.render('verify-email');
// }
