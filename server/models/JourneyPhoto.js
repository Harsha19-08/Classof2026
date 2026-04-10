import mongoose from 'mongoose';

const journeyPhotoSchema = new mongoose.Schema({
  year: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  caption: { type: String, default: '', trim: true },
  photoData: { type: String }, // Legacy compatibility
  photos: { type: [String], default: [] }, // Array of base64 data URLs
  order: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('JourneyPhoto', journeyPhotoSchema);
