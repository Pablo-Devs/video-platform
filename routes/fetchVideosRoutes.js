import express from 'express';
import { videoNavigation, getVideoByID, getVideoUrlByID } from '../controllers/videosControllers/fetchVideosController.js';

const router = express.Router();

// Route to fetch videos for navigation
router.get('/videos', videoNavigation);

// Route to retrieve a specific video by ID
router.get('/videos/:videoId', getVideoByID);

// Route to retrieve the URL of a specific video by its ID
router.get('/videos/:videoId/url', getVideoUrlByID);

export default router;
