import multer from 'multer';
import { avatarStorage } from '../config/cloudinary.js';

/**
 * Configure multer with Cloudinary storage and basic file validation
 */
const upload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Please upload only images (JPEG, PNG, WEBP).'), false);
    }
    cb(null, true);
  },
});

export default upload;
