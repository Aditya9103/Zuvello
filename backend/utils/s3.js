import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug: Log if credentials are loaded (without exposing actual values)
console.log('🔐 AWS Config Check:');
console.log('  - Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ Loaded' : '✗ Missing');
console.log('  - Secret Key:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Loaded' : '✗ Missing');
console.log('  - Region:', process.env.AWS_REGION || '✗ Missing');
console.log('  - Bucket:', process.env.AWS_S3_BUCKET || '✗ Missing');

// Configure S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} fileName - File name
 * @param {String} mimeType - File MIME type
 * @returns {Promise<String>} - S3 object key
 */
export async function uploadToS3(fileBuffer, fileName, mimeType) {
    // Add career-commando prefix to separate from other projects
    const key = `career-commando/blog-images/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
    });

    try {
        console.log(`📤 Uploading to S3: ${key}`);
        await s3Client.send(command);
        console.log(`✅ Upload successful: ${key}`);
        return key;
    } catch (error) {
        console.error('❌ S3 Upload Error:', error.message);
        console.error('Error details:', {
            name: error.name,
            code: error.code,
            statusCode: error.$metadata?.httpStatusCode
        });
        throw new Error('Failed to upload image to S3');
    }
}

/**
 * Generate presigned URL for viewing
 * @param {String} key - S3 object key
 * @returns {Promise<String>} - Presigned URL
 */
export async function getPresignedUrl(key) {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 * 24 * 7 }); // 7 days
        return url;
    } catch (error) {
        console.error('Presigned URL Error:', error);
        throw new Error('Failed to generate presigned URL');
    }
}

/**
 * Delete file from S3
 * @param {String} key - S3 object key
 */
export async function deleteFromS3(key) {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
    });

    try {
        await s3Client.send(command);
    } catch (error) {
        console.error('S3 Delete Error:', error);
        throw new Error('Failed to delete image from S3');
    }
}
