import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import { authenticate } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// ── Cloudinary Config ───────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mozhiaruvi_blogs',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

// ── Upload Image Route ─────────────────────────────────────────────────────────────
router.post('/image', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file provided' });
  }
  res.json({ 
    url: req.file.path,
    public_id: req.file.filename 
  });
});

// ── Upload Audio Route ─────────────────────────────────────────────────────────────
const audioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mozhiaruvi_audio',
    resource_type: 'auto', // Important for audio files
    allowed_formats: ['mp3', 'wav', 'ogg', 'mpeg', 'webm'],
  },
});

const uploadAudio = multer({ storage: audioStorage });

router.post('/audio', authenticate, uploadAudio.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No audio file provided' });
  }
  res.json({ 
    url: req.file.path,
    public_id: req.file.filename 
  });
});

export default router;
