import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import stream from 'stream';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const pipeline = promisify(stream.pipeline);

export async function generatePreviewImages(videoUrl, videoId) {
    return new Promise(async (resolve, reject) => {
        try {
            const previewDir = path.join('/tmp', `preview-${videoId}`);
            if (!fs.existsSync(previewDir)) {
                fs.mkdirSync(previewDir, { recursive: true });
            }

            const videoKey = videoUrl.split('.com/')[1];
            const params = { Bucket: process.env.AWS_BUCKET_NAME, Key: videoKey };
            const command = new GetObjectCommand(params);
            const data = await s3Client.send(command);

            const tempVideoPath = path.join('/tmp', `${videoId}.mp4`);
            await pipeline(data.Body, fs.createWriteStream(tempVideoPath));

            ffmpeg.ffprobe(tempVideoPath, (err, metadata) => {
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

                ffmpeg(tempVideoPath)
                    .on('filenames', (filenames) => {
                        filenames.forEach((filename) => {
                            previewImages.push(path.join(previewDir, filename));
                        });
                    })
                    .on('end', () => {
                        fs.unlinkSync(tempVideoPath);
                        resolve(previewImages);
                    })
                    .on('error', (err) => {
                        fs.unlinkSync(tempVideoPath);
                        reject(err);
                    })
                    .screenshots({
                        timemarks: timemarks.length > 0 ? timemarks : ['0'],
                        folder: previewDir,
                        filename: `image.png`,
                        size: '192x?'
                    });
            });
        } catch (error) {
            reject(error);
        }
    });
}