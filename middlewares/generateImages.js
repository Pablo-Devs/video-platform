import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import fs from 'fs';
import path from 'path';

// Set the paths for ffmpeg and ffprobe from the static packages
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

export async function generatePreviewImages(videoPath, outputDirectory, videoId) {
    return new Promise((resolve, reject) => {
        // Ensure the preview directory exists
        const previewDir = path.join(outputDirectory, `previews_${videoId}`);
        if (!fs.existsSync(previewDir)) {
            fs.mkdirSync(previewDir, { recursive: true });
        }

        // Get video duration
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                return reject(err);
            }

            const duration = metadata.format.duration; // in seconds
            const interval = 10; // seconds between screenshots
            const timemarks = [];

            for (let i = interval; i < duration; i += interval) {
                timemarks.push(i.toString());
            }

            const previewImages = [];

            ffmpeg(videoPath)
                .on('filenames', (filenames) => {
                    filenames.forEach((filename) => {
                        previewImages.push(path.join(previewDir, filename));
                    });
                })
                .on('end', () => {
                    resolve(previewImages);
                })
                .on('error', (err) => {
                    reject(err);
                })
                .screenshots({
                    timemarks: timemarks.length > 0 ? timemarks : ['0'], // fallback to first frame if timemarks are empty
                    folder: previewDir,
                    filename: `${videoId}-preview-%03d.png`,
                    size: '120x?'
                });
        });
    });
}