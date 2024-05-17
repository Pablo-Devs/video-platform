import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  filePath: { type: String, required: true },
  previewImages: { type: [String], default: [] },
  uploadedAt: { type: Date, default: Date.now },
});

const Video = mongoose.model('Video', videoSchema);

export default Video;