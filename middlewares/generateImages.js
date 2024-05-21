import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import fs from 'fs';
import path from 'path';

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

export async function generatePreviewImages(videoPath, videoId) {
    return new Promise((resolve, reject) => {
        const previewDir = path.join('public', `preview-${videoId}`);
        if (!fs.existsSync(previewDir)) {
            fs.mkdirSync(previewDir, { recursive: true });
        }

        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                return reject(err);
            }

            const duration = metadata.format.duration;
            const interval = 10;
            const timemarks = [];

            for (let i = interval; i < duration; i += interval) {
                timemarks.push(i.toString());
            }

            const previewImages = [];

            ffmpeg(videoPath)
                .on('filenames', (filenames) => {
                    filenames.forEach((filename) => {
                        previewImages.push(`/preview-${videoId}/${filename}`);
                    });
                })
                .on('end', () => {
                    resolve(previewImages);
                })
                .on('error', (err) => {
                    reject(err);
                })
                .screenshots({
                    timemarks: timemarks.length > 0 ? timemarks : ['0'],
                    folder: previewDir,
                    filename: `image.png`,
                    size: '192x?'
                });
        });
    });
}