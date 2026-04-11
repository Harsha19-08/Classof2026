import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify JWT token
export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Please sign in.' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ error: 'Your account is not yet approved.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Check if user is admin
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

// Optional authentication (for anonymous endpoints)
// This MUST NOT return 401, as it should allow guests to proceed.
export async function optionalAuthenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next();
    }

    const token = header.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id);

    if (user && user.status === 'approved') {
      req.user = user;
    }
  } catch (err) {
    // Log for debugging if possible, but never return error status
    console.log('Optional Auth ignored invalid token');
  }
  next();
}
