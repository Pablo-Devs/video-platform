import Video from '../../models/Video.js';
import mongoose from 'mongoose';
import path from 'path';

// Fetch All Videos with Pagination
export async function videoNavigation(req, res) {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1; // Current page number, default is 1
        const limit = parseInt(req.query.limit) || 10; // Number of videos per page, default is 10

        // Calculate skip value to skip videos for pagination
        const skip = (page - 1) * limit;

        // Fetch total number of videos
        const totalVideos = await Video.countDocuments();

        // Fetch videos for the current page
        const videos = await Video.find()
            .skip(skip)
            .limit(limit)
            .exec();

        // Calculate total pages
        const totalPages = Math.ceil(totalVideos / limit);

        res.json({
            videos,
            currentPage: page,
            totalPages,
            totalVideos
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Get Video Details by ID
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
        console.error('Error fetching video by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Get Video URL by ID
export async function getVideoUrlByID(req, res) {
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

        // Construct the URL of the video file
        const videoUrl = `${req.protocol}://${req.get('host')}${video.filePath}`;

        res.json({ videoUrl });
    } catch (error) {
        console.error('Error fetching video URL by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}