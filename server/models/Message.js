import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  studentId: { type: Number, required: true, index: true },
  text: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
