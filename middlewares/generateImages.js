import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import { PassThrough } from 'stream';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function uploadToS3(buffer, bucket, key) {
    const params = {
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
    };
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
}

export async function generatePreviewImages(videoBuffer, videoId) {
    return new Promise((resolve, reject) => {
        const passThroughStream = new PassThrough();
        passThroughStream.end(videoBuffer);

        ffmpeg.ffprobe(passThroughStream, (err, metadata) => {
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
            const folderKey = `previews/${videoId}`;

            ffmpeg(passThroughStream)
                .on('filenames', (filenames) => {
                    filenames.forEach((filename) => {
                        previewImages.push(`${folderKey}/${filename}`);
                    });
                })
                .on('end', async () => {
                    try {
                        for (const image of previewImages) {
                            const imagePath = path.join('/tmp', image);
                            const imageBuffer = fs.readFileSync(imagePath);
                            await uploadToS3(imageBuffer, process.env.AWS_BUCKET_NAME, image);
                            fs.unlinkSync(imagePath); // Cleanup local file
                        }
                        const s3PreviewImages = previewImages.map(image => `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${image}`);
                        resolve(s3PreviewImages);
                    } catch (uploadError) {
                        reject(uploadError);
                    }
                })
                .on('error', (err) => {
                    reject(err);
                })
                .screenshots({
                    timemarks: timemarks.length > 0 ? timemarks : ['0'],
                    folder: '/tmp',
                    filename: `image-${Date.now()}.png`,
                    size: '192x?'
                });
        });
    });
}