import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import Video from '../../models/Video.js';
import User from '../../models/User.js';
import { generatePreviewImages } from '../../middlewares/generateImages.js';
import fs from 'fs';
import path from 'path';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export async function uploadVideos(req, res) {
    try {
        const userId = req.user.userId;
        const adminUser = await User.findById(userId);

        if (!adminUser || !adminUser.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admin users can upload videos' });
        }

        const { title, description } = req.body;
        const file = req.file;

        const videoKey = `videos/${Date.now()}_${file.originalname}`;

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: videoKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        const videoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoKey}`;

        const video = new Video({
            title,
            description,
            filePath: videoUrl
        });

        await video.save();

        const previewImages = await generatePreviewImages(videoUrl, video._id);

        // Upload preview images to S3
        const previewImageUrls = [];
        for (const previewImagePath of previewImages) {
            const imageBuffer = fs.readFileSync(previewImagePath);
            const imageKey = `previews/${video._id}/${path.basename(previewImagePath)}`;

            const imageUploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: imageKey,
                Body: imageBuffer,
                ContentType: 'image/png'
            };

            await s3Client.send(new PutObjectCommand(imageUploadParams));
            previewImageUrls.push(`https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`);
        }

        // Clean up local preview images
        previewImages.forEach(imagePath => fs.unlinkSync(imagePath));

        video.previewImages = previewImageUrls;
        if (previewImageUrls.length > 0) {
            video.thumbnail = previewImageUrls[2]; // Set the third preview image as the thumbnail
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

        // Extract video key from the URL
        const videoKey = video.filePath.split('.com/')[1];
        const videoParams = { Bucket: process.env.AWS_BUCKET_NAME, Key: videoKey };
        await s3Client.send(new DeleteObjectCommand(videoParams));

        // Delete preview images from S3
        for (const imagePath of video.previewImages) {
            const imageKey = imagePath.split('.com/')[1];
            const imageParams = { Bucket: process.env.AWS_BUCKET_NAME, Key: imageKey };
            await s3Client.send(new DeleteObjectCommand(imageParams));
        }

        // Remove video document from database
        await Video.findByIdAndDelete(videoId);

        // Remove the video ID from the admin user's uploadedVideos array
        adminUser.uploadedVideos = adminUser.uploadedVideos.filter(
            idObj => idObj.toString() !== videoId
        );
        await adminUser.save();

        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}