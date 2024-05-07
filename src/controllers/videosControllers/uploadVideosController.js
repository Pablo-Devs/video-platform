import Video from '../../models/Video.js';
import User from '../../models/User.js';

export async function uploadVideos(req, res) {
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
    }