import { Router } from 'express';
import WallMessage from '../models/WallMessage.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/wall - Get all wall messages (public)
router.get('/', async (req, res) => {
  try {
    const messages = await WallMessage.find().sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/wall - Post a wall message (optional auth)
router.post('/', optionalAuthenticate, async (req, res) => {
  try {
    const { text, isAnonymous } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    // Determine author and userId
    let author = 'Anonymous';
    let userId = null;

    if (req.user && !isAnonymous) {
      author = req.user.name;
      userId = req.user._id;
    }

    const message = await WallMessage.create({
      text: text.trim(),
      author,
      userId,
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/wall/:id - Delete a wall message (Admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    await WallMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
