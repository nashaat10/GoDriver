// import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import s3Client from "../config/s3.js";
// import crypto from 'crypto';

// export const uploadToS3 = async (file, folder = 'chat') => {
//   try {
//     const fileExtension = file.originalname.split('.').pop();
//     const randomName = crypto.randomBytes(16).toString('hex');
//     const key = `${folder}/${randomName}.${fileExtension}`;

//     const command = new PutObjectCommand({
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: key,
//       Body: file.buffer,
//       ContentType: file.mimetype,
//     });

//     await s3Client.send(command);

//     return {
//       key,
//       mimetype: file.mimetype,
//       size: file.size,
//       originalname: file.originalname
//     };
//   } catch (error) {
//     console.error('Error uploading to S3:', error);
//     throw new Error('Failed to upload file to S3');
//   }
// };

// export const getSignedFileUrl = async (key) => {
//     const command = new GetObjectCommand({
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: key
//     });
  
//     return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
//   };