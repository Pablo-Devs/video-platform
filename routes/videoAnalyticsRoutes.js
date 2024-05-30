import express from 'express';
import { getOverviewData, getPerformanceData, getDemographicData, logViewById, logWatchTimeById } from '../controllers/videosControllers/videosAnalytics.js';
import { validateWatchTime } from '../middlewares/watchTimeMiddleware.js';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// routes for analytics data
router.get('/analytics/overview', getOverviewData);

router.get('/analytics/performance', getPerformanceData);

router.get('/analytics/demographics', getDemographicData);

// Route to log a view
router.post('/log-view/:videoId', logViewById);

// Route to log watch time
router.post('/log-watch-time/:videoId', validateWatchTime, logWatchTimeById);

export default router;