import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

// Function to generate preview images for a video
export function generatePreviewImages(videoFilePath) {
  const previewImagesDir = path.join(__dirname, '..', 'public', 'previewImages', path.basename(videoFilePath, path.extname(videoFilePath)));
  
  // Create directory to store preview images if it doesn't exist
  if (!fs.existsSync(previewImagesDir)) {
    fs.mkdirSync(previewImagesDir, { recursive: true });
  }

  // Generate preview images every 10 seconds using ffmpeg
  ffmpeg(videoFilePath)
    .outputOptions('-vf', 'fps=1/10')
    .on('filenames', (filenames) => {
      console.log('Generated ' + filenames.length + ' preview images');
    })
    .on('error', (err) => {
      console.error('Error generating preview images:', err);
    })
    .on('end', () => {
      console.log('Preview images generated successfully');
    })
    .save(path.join(previewImagesDir, 'preview-%03d.png'));
}