import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import messageRoutes from './routes/messages.js';
import wallRoutes from './routes/wall.js';
import photoRoutes from './routes/photos.js';
import galleryRoutes from './routes/gallery.js';
import journeyRoutes from './routes/journey.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/wall', wallRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/journey', journeyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Seed admin account
async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ rollNo: '22R21A12H1' });
    if (!adminExists) {
      await User.create({
        name: 'Muddada Harshavardhan',
        email: 'harsha@yearbook.com',
        password: 'admin123',
        major: 'IT',
        rollNo: '22R21A12H1',
        role: 'admin',
        status: 'approved',
      });
     
    } else {
      console.log('✅ Admin account already exists');
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  }
}

// Connect to MongoDB and start server
async function start() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('');
      
      console.log('');
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('');
    console.error('👉 Make sure to update server/.env with your MongoDB Atlas URI:');
    console.error('   MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/yearbook');
    process.exit(1);
  }
}

start();
