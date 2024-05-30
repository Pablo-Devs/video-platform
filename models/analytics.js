import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  views: { type: Number, default: 0 },
  watchTime: { type: Number, default: 0 },
  subscribers: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;