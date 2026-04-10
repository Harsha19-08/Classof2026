import { Router } from 'express';
import multer from 'multer';
import GalleryPhoto from '../models/GalleryPhoto.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // increased to 15MB
  fileFilter: (req, file, cb) => {
    // Loosely check if it's an image or missing mimetype (like raw files)
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  },
});

// GET /api/gallery - Get all gallery photos (public)
router.get('/', async (req, res) => {
  try {
    const photos = await GalleryPhoto.find().sort({ createdAt: -1 });
    res.json({ photos });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/gallery/categories - Get unique categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await GalleryPhoto.distinct('category');
    res.json({ categories: ['All Memories', ...categories] });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/gallery/upload - Upload gallery photo (admin only)
router.post('/upload', authenticate, requireAdmin, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const { caption, category } = req.body;
    if (!category) {
      return res.status(400).json({ error: 'Category is required.' });
    }

    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    const photo = await GalleryPhoto.create({
      caption: caption || '',
      category,
      photoData: dataUrl,
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Photo added to gallery!', photo: { _id: photo._id, caption: photo.caption, category: photo.category } });
  } catch (err) {
    console.error('Gallery upload error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/gallery/:id - Delete gallery photo (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const photo = await GalleryPhoto.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found.' });

    await GalleryPhoto.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Photo removed from gallery.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Error handling for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large. Maximum 5MB.' });
    return res.status(400).json({ error: err.message });
  }
  if (err.message === 'Only image files are allowed.') return res.status(400).json({ error: err.message });
  next(err);
});

export default router;
