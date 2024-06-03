import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  filePath: { type: String },
  previewImages: { type: [String], default: [] },
  thumbnail: { type: String },
  uploadedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  watchTime: { type: Number, default: 0 }
});

const Video = mongoose.model('Video', videoSchema);

export default Video;