import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
dotenv.config();

export async function userLoginPost(req, res) {
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

        // Set token in a cookie
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // MaxAge is in milliseconds (1 hour)

        // Send success response
        return res.json({ userId: user._id, isAdmin: user.isAdmin, message: 'Login successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function adminLoginPost(req, res) {
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

        // Check if user is verified
        if (!user.verified) {
            return res.status(400).json({ message: 'Account not verified. Check your email for verification instructions' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set token in a cookie
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // MaxAge is in milliseconds (1 hour)

        // Send success response
        return res.json({ userId: user._id, isAdmin: user.isAdmin, message: 'Login successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export function loginPage(req, res) {
    res.render('login');
}