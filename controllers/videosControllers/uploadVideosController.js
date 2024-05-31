import fs from 'fs';
import path from 'path';
import Video from '../../models/Video.js';
import User from '../../models/User.js';
import { generatePreviewImages } from '../../middlewares/generateImages.js';

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

export async function deleteVideo(req, res) {
    try {
        const userId = req.user.userId;
        const adminUser = await User.findById(userId);

        if (!adminUser || !adminUser.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admin users can delete videos' });
        }

        const videoId = req.params.id;
        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Resolve absolute path for the video file
        const videoPath = path.resolve('public', `.${video.filePath}`);
        if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
            // console.log(`Deleted video file: ${videoPath}`);
        } else {
            console.warn(`Video file not found: ${videoPath}`);
        }

        // Resolve absolute paths for preview images and delete them
        video.previewImages.forEach(imagePath => {
            const fullPath = path.resolve('public', `.${imagePath}`);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                // console.log(`Deleted preview image: ${fullPath}`);
            } else {
                console.warn(`Preview image not found: ${fullPath}`);
            }
        });

        // Remove the folder containing preview images
        const folderName = `preview-${video._id}`;
        const folderPath = path.resolve(path.join('public', folderName));
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true });
        }

        // Remove the video from the database
        await Video.findByIdAndDelete(videoId);

        // Remove the video from the admin's uploaded videos list
        adminUser.uploadedVideos = adminUser.uploadedVideos.filter(
            idObj => idObj._id.toString() !== videoId
        );
        await adminUser.save();

        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}