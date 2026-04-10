import { Router } from 'express';
import multer from 'multer';
import StudentPhoto from '../models/StudentPhoto.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Multer config: accept image files up to 5MB in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  },
});

// GET /api/photos - Get all student photos (for yearbook page)
router.get('/', async (req, res) => {
  try {
    const photos = await StudentPhoto.find({}, { rollNo: 1, photoData: 1, _id: 0 });
    // Return as a map: { rollNo: photoData }
    const photoMap = {};
    photos.forEach((p) => {
      photoMap[p.rollNo] = p.photoData;
    });
    res.json({ photos: photoMap });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/photos/:rollNo - Get a specific student's photo
router.get('/:rollNo', async (req, res) => {
  try {
    const photo = await StudentPhoto.findOne({ rollNo: req.params.rollNo.toUpperCase() });
    if (!photo) {
      return res.status(404).json({ error: 'No photo found for this student.' });
    }
    res.json({ rollNo: photo.rollNo, photoData: photo.photoData });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/photos/upload - Upload own photo (auth required, must match user's rollNo)
router.post('/upload', authenticate, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const userRollNo = req.user.rollNo?.toUpperCase();
    if (!userRollNo) {
      return res.status(400).json({ error: 'Your account does not have a roll number. Update your profile first.' });
    }

    // Convert to base64 data URL
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    // Upsert: create or update the photo for this rollNo
    await StudentPhoto.findOneAndUpdate(
      { rollNo: userRollNo },
      { rollNo: userRollNo, photoData: dataUrl, uploadedBy: req.user._id },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Photo uploaded successfully!', rollNo: userRollNo });
  } catch (err) {
    console.error('Photo upload error:', err);
    if (err.message === 'Only image files are allowed.') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Error handling for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

export default router;
