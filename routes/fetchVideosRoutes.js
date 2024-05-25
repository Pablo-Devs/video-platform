import express from 'express';
import { videoNavigation, getVideoByID, getVideoUrlByID, getAllVideosIDs } from '../controllers/videosControllers/fetchVideosController.js';
import { requireAuth, checkAdmin } from '../middlewares/authMiddlewares.js';

const router = express.Router();

// Route to fetch videos for navigation
router.get('/navigate-videos', videoNavigation);

// Route to retrieve all video IDs
router.get('/api/video-ids', getAllVideosIDs);

// Route to retrieve a specific video by ID
router.get('/api/videos/:videoId', getVideoByID);

// Route to retrieve the URL of a specific video by its ID
router.get('/video-url/:videoId', getVideoUrlByID);

router.get('/home',requireAuth, (req, res) => res.render('home'));

router.get('/watch', requireAuth, (req, res) => res.render('videos'));

router.get('/upload-videos', checkAdmin, requireAuth, (req, res) => res.render('upload-videos'));

export default router;
