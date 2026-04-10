import { Router } from 'express';
import Message from '../models/Message.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/messages/:studentId - Get messages for a student (public)
router.get('/:studentId', async (req, res) => {
  try {
    const messages = await Message.find({ studentId: parseInt(req.params.studentId) })
      .sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/messages/:studentId - Post a message (auth required)
router.post('/:studentId', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const message = await Message.create({
      studentId: parseInt(req.params.studentId),
      text: text.trim(),
      author: req.user.name,
      userId: req.user._id,
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/messages/:id - Delete a message (Admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
