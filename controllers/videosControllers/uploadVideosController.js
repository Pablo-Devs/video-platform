import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import Video from '../../models/Video.js';
import User from '../../models/User.js';
import { generatePreviewImages } from '../../middlewares/generateImages.js';
import fs from 'fs/promises';
import path from 'path';

// Initialize S3 client with credentials and region from environment variables
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Function to upload an object to S3
async function uploadToS3(params) {
    try {
        await s3Client.send(new PutObjectCommand(params));
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw new Error('Error uploading to S3');
    }
}

// Function to delete an object from S3
async function deleteFromS3(params) {
    try {
        await s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
        console.error('Error deleting from S3:', error);
        throw new Error('Error deleting from S3');
    }
}

// Function to construct S3 URL based on bucket name, region, and object key
function getS3Url(bucketName, region, key) {
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

// Function to handle video uploads
export async function uploadVideos(req, res) {
    try {
        const userId = req.user.userId;
        const adminUser = await User.findById(userId);

        // Check if the user is an admin
        if (!adminUser || !adminUser.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admin users can upload videos' });
        }

        const { title, description } = req.body;
        const file = req.file;

        // Construct the S3 key for the video
        const videoKey = `videos/${Date.now()}_${file.originalname}`;
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: videoKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        // Upload the video to S3
        await uploadToS3(uploadParams);

        // Construct the video URL
        const videoUrl = getS3Url(process.env.AWS_BUCKET_NAME, process.env.AWS_REGION, videoKey);

        // Create a new video document in the database
        const video = new Video({
            title,
            description,
            filePath: videoUrl,
        });

        await video.save();

        // Generate preview images for the video
        const previewImages = await generatePreviewImages(videoUrl, video._id);

        // Upload preview images to S3 and get their URLs
        const previewImageUploadPromises = previewImages.map(async (previewImagePath) => {
            const imageBuffer = await fs.readFile(previewImagePath);
            const imageKey = `previews/${video._id}/${path.basename(previewImagePath)}`;
            const imageUploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: imageKey,
                Body: imageBuffer,
                ContentType: 'image/png',
            };

            await uploadToS3(imageUploadParams);
            return getS3Url(process.env.AWS_BUCKET_NAME, process.env.AWS_REGION, imageKey);
        });

        const previewImageUrls = await Promise.all(previewImageUploadPromises);

        // Delete local preview images after upload
        await Promise.all(previewImages.map(imagePath => fs.unlink(imagePath)));

        // Update the video document with preview images URLs and thumbnail
        video.previewImages = previewImageUrls;
        if (previewImageUrls.length > 0) {
            video.thumbnail = previewImageUrls[2]; // Set the third preview image as the thumbnail
        }
        await video.save();

        // Update the admin user's uploaded videos
        adminUser.uploadedVideos.push(video._id);
        await adminUser.save();

        res.status(201).json({ message: 'Video uploaded successfully', video });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Function to handle video deletion
export async function deleteVideo(req, res) {
    try {
        const userId = req.user.userId;
        const adminUser = await User.findById(userId);

        // Check if the user is an admin
        if (!adminUser || !adminUser.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. Only admin users can delete videos' });
        }

        const videoId = req.params.id;
        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Extract the video key from the video URL
        const videoKey = video.filePath.split('.com/')[1];
        await deleteFromS3({ Bucket: process.env.AWS_BUCKET_NAME, Key: videoKey });

        // Delete preview images from S3
        const deletePreviewImagePromises = video.previewImages.map(imagePath => {
            const imageKey = imagePath.split('.com/')[1];
            return deleteFromS3({ Bucket: process.env.AWS_BUCKET_NAME, Key: imageKey });
        });

        await Promise.all(deletePreviewImagePromises);

        // Remove the video document from the database
        await Video.findByIdAndDelete(videoId);

        // Update the admin user's uploaded videos
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