import { Router } from 'express';
import multer from 'multer';
import JourneyPhoto from '../models/JourneyPhoto.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // increased to 15MB to prevent large phone files from bouncing
  fileFilter: (req, file, cb) => {
    // Loosely check if it's an image or missing mimetype (like raw files)
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  },
});

const uploadMiddleware = (req, res, next) => {
  upload.array('photos', 3)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading (e.g., LIMIT_FILE_SIZE)
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading
      return res.status(400).json({ error: err.message });
    }
    // Everything went fine
    next();
  });
};

// GET /api/journey - Get all journey events (public)
router.get('/', async (req, res) => {
  try {
    const events = await JourneyPhoto.find().sort({ year: 1, order: 1 });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/journey/upload - Add journey event (admin only)
router.post('/upload', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      // Allow fallback if someone uses the old single 'photo'
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const { year, title, description, caption, order } = req.body;
    if (!year || !title) {
      return res.status(400).json({ error: 'Year and title are required.' });
    }

    const photos = req.files.map(file => {
      const base64 = file.buffer.toString('base64');
      return `data:${file.mimetype};base64,${base64}`;
    });

    const event = await JourneyPhoto.create({
      year,
      title,
      description: description || '',
      caption: caption || '',
      photos: photos,
      // Keep the first photo as legacy photoData just in case
      photoData: photos[0],
      order: order !== undefined && order !== '' ? Number(order) : 0,
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Journey event added!', event: { _id: event._id, year: event.year, title: event.title } });
  } catch (err) {
    console.error('Journey upload error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/journey/:id - Update journey event (admin only)
router.put('/:id', authenticate, requireAdmin, uploadMiddleware, async (req, res) => {
  try {
    const event = await JourneyPhoto.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    const { keptPhotos, year, title, description, caption, order } = req.body;
    if (year) event.year = year;
    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (caption !== undefined) event.caption = caption;
    if (order !== undefined && order !== '') event.order = Number(order);

    let finalPhotos = [];
    if (keptPhotos) {
      try { finalPhotos = JSON.parse(keptPhotos); } catch(e) {}
    }

    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => {
        const base64 = file.buffer.toString('base64');
        return `data:${file.mimetype};base64,${base64}`;
      });
      finalPhotos = [...finalPhotos, ...newPhotos];
    }

    if (finalPhotos.length === 0) {
      return res.status(400).json({ error: 'At least one photo is required.' });
    }

    event.photos = finalPhotos;
    event.photoData = finalPhotos[0];

    await event.save();
    res.json({ success: true, message: 'Journey event updated!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/journey/:id - Delete journey event (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const event = await JourneyPhoto.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    await JourneyPhoto.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Journey event removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Error handling
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large. Maximum 5MB.' });
    return res.status(400).json({ error: err.message });
  }
  if (err.message === 'Only image files are allowed.') return res.status(400).json({ error: err.message });
  next(err);
});

export default router;
