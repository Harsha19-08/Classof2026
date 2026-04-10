import mongoose from 'mongoose';

const galleryPhotoSchema = new mongoose.Schema({
  caption: { type: String, default: '', trim: true },
  category: { type: String, required: true, trim: true },
  photoData: { type: String, required: true }, // base64 data URL
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('GalleryPhoto', galleryPhotoSchema);
