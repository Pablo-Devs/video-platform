import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import fetchVideosRoutes from './routes/fetchVideosRoutes.js'
import videoUploadRoutes from './routes/videoUploadRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

app.use(express.static('public'));

// view engine setup
app.set('view engine', 'ejs');

// MongoDB connection
mongoose.connect(`${process.env.MONGO_URL}`)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define routes
app.get('/', (req, res) => res.render('home'));
app.use('/', authRoutes);
app.use('/', fetchVideosRoutes);
app.use('/', videoUploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});