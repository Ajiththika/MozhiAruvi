import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Creates a CloudinaryStorage instance for a specific folder.
 */
export const createCloudinaryStorage = (folderName = 'mozhi-arivu/general') => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    },
  });
};

// Legacy Export for avatars
export const avatarStorage = createCloudinaryStorage('mozhi-arivu/avatars');

export { cloudinary };
