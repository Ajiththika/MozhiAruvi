import express from 'express';
import multer from 'multer';
import { createCloudinaryStorage } from '../config/cloudinary.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// ── Storage for general blog/event images ────────────────────────────────────
const storage = createCloudinaryStorage('mozhi-arivu/content');
const upload = multer({ storage });

// ── Upload Route ─────────────────────────────────────────────────────────────
router.post('/image', authenticate, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file provided' });
  }
  res.json({ 
    success: true,
    url: req.file.path,
    public_id: req.file.filename 
  });
}));

export default router;
