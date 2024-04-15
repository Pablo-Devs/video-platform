import express from 'express';
import multer from 'multer';
import path from 'path';
import Video from '../models/Video';
import User from '../models/User';

const router = express.Router();

// Multer storage configuration for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/videos'); // Save uploaded videos to the 'uploads/videos' directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension); // Generate a unique filename for the uploaded video
  }
});

// Multer upload configuration
const upload = multer({ storage: storage });

// Admin Video Upload Route
router.post('/admin/upload-video', upload.single('video'), async (req, res) => {
  try {
    // Check if the user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized. Only admin users can upload videos' });
    }

    const { title, description } = req.body;
    const filePath = req.file.path;

    // Create a new video document
    const video = new Video({ title, description, filePath });
    await video.save();

    // Update admin user document to include the uploaded video
    const adminId = req.user._id;
    const adminUser = await User.findById(adminId);
    adminUser.uploadedVideos.push(video._id);
    await adminUser.save();

    res.status(201).json({ message: 'Video uploaded successfully', video });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;