import express from 'express';
import multer from 'multer';
import path from 'path'; // Import the path module
import { uploadVideos, deleteVideo } from '../controllers/videosControllers/uploadVideosController.js';
import { checkAdmin, requireAuth } from '../middlewares/authMiddlewares.js';

const router = express.Router();

const storage = multer.memoryStorage();
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

router.delete('/delete-video/:id', requireAuth, checkAdmin, deleteVideo);

export default router;