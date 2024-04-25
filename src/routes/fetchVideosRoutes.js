import express from 'express';
import Video from '../models/Video';

const router = express.Router();

// Route to fetch videos for navigation
router.get('/videos', async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1; // Current page number, default is 1
        const limit = parseInt(req.query.limit) || 10; // Number of videos per page, default is 10

        // Calculate skip value to skip videos for pagination
        const skip = (page - 1) * limit;

        // Fetch videos for the current page
        const videos = await Video.find()
            .skip(skip)
            .limit(limit)
            .exec();

        res.json({ videos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to retrieve a specific video by ID
router.get('/videos/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;

        // Find the video by its ID
        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        res.json({ video });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to retrieve the URL of a specific video by its ID
router.get('/videos/:videoId/url', async (req, res) => {
    try {
        const { videoId } = req.params;

        // Find the video by its ID
        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Construct the URL of the video based on its ID
        const videoUrl = `${req.protocol}://${req.get('host')}/videos/${videoId}`;

        res.json({ videoUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
