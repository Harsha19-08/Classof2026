import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register - Request access
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, major, rollNo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({ error: 'Access request already submitted. Please wait for admin approval.' });
      }
      if (existing.status === 'rejected') {
        return res.status(400).json({ error: 'Your access request was rejected. Contact the admin.' });
      }
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      major: major || 'IT',
      rollNo: rollNo || '',
      status: 'pending',
      role: 'user',
    });

    res.status(201).json({
      success: true,
      message: 'Access request submitted! Please wait for admin approval before signing in.',
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/auth/login - Sign in
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email. Please request access first.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Your access request is still pending. Please wait for admin approval.' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Your access request was rejected. Contact the admin.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        major: user.major,
        rollNo: user.rollNo,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// GET /api/auth/me - Get current user from token
router.get('/me', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      major: req.user.major,
      rollNo: req.user.rollNo,
      role: req.user.role,
    },
  });
});

export default router;
