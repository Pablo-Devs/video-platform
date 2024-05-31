import express from 'express';
import { getOverviewData, getPerformanceData, getDemographicData, logViewById, logWatchTimeById } from '../controllers/videosControllers/videosAnalytics.js';
import { validateWatchTime } from '../middlewares/watchTimeMiddleware.js';
import { requireAuth } from '../middlewares/authMiddlewares.js';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// routes for analytics data
router.get('/analytics/overview', requireAuth, getOverviewData);

router.get('/analytics/performance', requireAuth, getPerformanceData);

router.get('/analytics/demographics', requireAuth, getDemographicData);

// Route to log a view
router.post('/log-view/:videoId', requireAuth, logViewById);

// Route to log watch time
router.post('/log-watch-time/:videoId',requireAuth, validateWatchTime, logWatchTimeById);

export default router;