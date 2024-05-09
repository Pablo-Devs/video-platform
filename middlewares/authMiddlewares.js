import jwt from 'jsonwebtoken';

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