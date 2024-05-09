import express from 'express';
import { uploadVideos } from '../controllers/videosControllers/uploadVideosController.js';
import { checkAdmin, requireAuth } from '../middlewares/authMiddlewares.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer storage configuration for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/videos'); // Save uploaded videos to the 'public/videos' directory
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
router.post('/upload-video',requireAuth, checkAdmin, upload.single('video'), uploadVideos);

export default router;