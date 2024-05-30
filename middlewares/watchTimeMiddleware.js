// Middleware to validate watch time input
export const validateWatchTime = (req, res, next) => {
    const { watchTime } = req.body;
    if (!Number.isInteger(watchTime) || watchTime <= 0) {
        return res.status(400).json({ error: 'Invalid watch time' });
    }
    next();
};