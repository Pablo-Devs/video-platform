import Video from '../../models/Video.js';
import User from '../../models/User.js';
import { generatePreviewImages } from '../../middlewares/generatePreviewImages.js';
import fs from 'fs';
import path from 'path';

export async function uploadVideos(req, res) {
    try {
        // Retrieve the decoded user ID from the request object
        const userId = req.user.userId;

        // Fetch the user details using the decoded user ID
        const adminUser = await User.findById(userId);

        // Check if the user is an admin
        if (!adminUser || !adminUser.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admin users can upload videos' });
        }

        // Extract video details from the request body
        const { title, description } = req.body;
        const filePath = req.file.path;

        // Create a new video document
        const video = new Video({ title, description, filePath });

        // Generate preview images for the uploaded video
        const previewImagesPath = await generatePreviewImages(filePath);

        // Save the paths of the preview images in the video document
        video.previewImages = previewImagesPath;

        // Set the first preview image as the thumbnail
        if (previewImagesPath.length > 0) {
            const thumbnailPath = path.join(__dirname, '..', 'public', 'thumbnails', `${video._id}.png`);
            fs.copyFileSync(previewImagesPath[0], thumbnailPath);
            video.thumbnail = `/thumbnails/${video._id}.png`;
        }

        // Save the video document
        await video.save();

        // Update admin user document to include the uploaded video
        adminUser.uploadedVideos.push(video._id);
        await adminUser.save();

        // Send response
        res.status(201).json({ message: 'Video uploaded successfully', video });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}