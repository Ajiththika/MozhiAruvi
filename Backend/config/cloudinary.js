import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { createCloudinaryStorage } from '../utils/cloudinaryMulterStorage.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = createCloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mozhi-arivu/avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

export { cloudinary, storage };
