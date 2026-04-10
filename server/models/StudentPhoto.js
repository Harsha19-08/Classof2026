import mongoose from 'mongoose';

const studentPhotoSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
  photoData: { type: String, required: true }, // base64 data URL
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('StudentPhoto', studentPhotoSchema);
