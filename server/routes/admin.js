import { Router } from 'express';
import User from '../models/User.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/pending - Get pending access requests
router.get('/pending', async (req, res) => {
  try {
    const pending = await User.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json({ users: pending });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/approved - Get approved users
router.get('/approved', async (req, res) => {
  try {
    const approved = await User.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json({ users: approved });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/rejected - Get rejected users
router.get('/rejected', async (req, res) => {
  try {
    const rejected = await User.find({ status: 'rejected' }).sort({ createdAt: -1 });
    res.json({ users: rejected });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/admin/approve/:id - Approve a user
router.post('/approve/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.status = 'approved';
    await user.save();

    res.json({ success: true, message: `${user.name} has been approved.`, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/admin/reject/:id - Reject a user
router.post('/reject/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.status = 'rejected';
    await user.save();

    res.json({ success: true, message: `${user.name} has been rejected.`, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/admin/user/:id - Delete a user
router.delete('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ error: 'Cannot delete admin.' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `${user.name} has been removed.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
