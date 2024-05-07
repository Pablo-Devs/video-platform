import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import dotenv from 'dotenv';
dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

        res.redirect(`${process.env.CLIENT_URL}/login`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function passwordResetRequest(req, res) {
    try {
        const { email } = req.body;

        // Generate reset token
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Update user with reset token and expiry
        await User.findOneAndUpdate(
            { email },
            { $set: { resetToken, resetTokenExpiry: Date.now() + 3600000 } }
        );

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
}

export async function resetPassword(req, res) {
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
}