import mongoose from 'mongoose';

const wallMessageSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('WallMessage', wallMessageSchema);
