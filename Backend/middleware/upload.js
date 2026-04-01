import multer from 'multer';
import { storage } from '../config/cloudinary.js';

/**
 * Configure multer with Cloudinary storage and basic file validation
 */
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for photos
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Please upload only images (JPEG, PNG, WEBP).'), false);
    }
    cb(null, true);
  },
});

export default upload;
