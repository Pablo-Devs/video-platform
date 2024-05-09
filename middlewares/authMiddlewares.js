import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const requireAuth = (req, res, next) => {
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

export const checkUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                console.error('JWT verification error:', err.message);
                res.locals.user = null;
                next();
            } else {
                try {
                    let user = await User.findById(decoded.userId);
                    res.locals.user = user;
                    next();
                } catch (error) {
                    console.error('Error finding user:', error.message);
                    res.locals.user = null;
                    next();
                }
            }
        })
    } else {
        res.locals.user = null;
        next();
    }
}