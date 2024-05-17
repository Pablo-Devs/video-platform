import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minLength: 6 },
  verified: { type: Boolean, default: false },
  resetOTP: { type: String },
  resetOTPCreatedAt: { type: Date }, 
  verificationToken: { type: String },
  isAdmin: { type: Boolean, default: false },
  uploadedVideos: [
    {
      title: { type: String },
      description: { type: String },
      filePath: { type: String }
    }
  ]
});

const User = mongoose.model('User', userSchema);

export default User;