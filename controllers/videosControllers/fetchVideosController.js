import Video from '../../models/Video.js';
import mongoose from 'mongoose';

export async function videoNavigation(req, res) {
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
}

export async function getVideoByID(req, res) {
    try {
        const { videoId } = req.params;

        // Validate videoId as a valid ObjectId
        if (!mongoose.isValidObjectId(videoId)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }

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
}

export async function getVideoUrlByID(req, res) {
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
}