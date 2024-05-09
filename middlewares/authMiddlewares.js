import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to require authentication
export const requireAuth = async (req, res, next) => {
    try {
        // Extract token from cookies
        const token = req.cookies.token;

        // Check if token exists
        if (!token) {
            return res.redirect('/login');
        }

        // Verify and decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded user data to request object
        req.user = decoded;

        // Move to the next middleware
        next();
    } catch (error) {
        // Handle verification errors
        console.error('JWT verification error:', error.message);
        return res.redirect('/login');
    }
};

// Middleware to check user authentication and attach user data to response locals
export const checkUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            res.locals.user = user;
        } else {
            res.locals.user = null;
        }
        next();
    } catch (error) {
        console.error('Error identifying user:', error.message);
        res.locals.user = null;
        next();
    }
};