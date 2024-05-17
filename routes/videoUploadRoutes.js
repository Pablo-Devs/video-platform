import express from 'express';
import { uploadVideos } from '../controllers/videosControllers/uploadVideosController.js';
import { checkAdmin, requireAuth } from '../middlewares/authMiddlewares.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Utility function to ensure a directory exists
const ensureDirectoryExistence = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Multer storage configuration for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'public/videos';
    ensureDirectoryExistence(dir);
    cb(null, dir); // Save uploaded videos to the 'public/videos' directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension); // Generate a unique filename for the uploaded video
  }
});

// Multer upload configuration
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mkv/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extName) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only MP4, AVI, and MKV files are allowed.'));
  }
});

// Admin Video Upload Route
router.post('/upload-video', requireAuth, checkAdmin, (req, res, next) => {
  const uploadMiddleware = upload.single('video');
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadVideos);

export default router;