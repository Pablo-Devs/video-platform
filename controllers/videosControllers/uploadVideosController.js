import Video from '../../models/Video.js';
import User from '../../models/User.js';
import { generatePreviewImages } from '../../middlewares/generateImages.js';
import path from 'path';

export async function uploadVideos(req, res) {
    try {
        const userId = req.user.userId;
        const adminUser = await User.findById(userId);

        if (!adminUser || !adminUser.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admin users can upload videos' });
        }

        const { title, description } = req.body;
        const filePath = req.file.path;
        const fileUrl = `/videos/${req.file.filename}`; // Construct the URL for the video

        const video = new Video({ title, description, filePath: fileUrl });

        await video.save();

        const previewImages = await generatePreviewImages(filePath, video._id);

        video.previewImages = previewImages;
        if (previewImages.length > 0) {
            video.thumbnail = previewImages[2]; // Set the third preview image as the thumbnail
        }
        await video.save();

        adminUser.uploadedVideos.push(video._id);
        await adminUser.save();

        res.status(201).json({ message: 'Video uploaded successfully', video });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}