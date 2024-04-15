import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date }
});

const User = mongoose.model('User', userSchema);

export default User;