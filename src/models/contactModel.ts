import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    subject: String,
    message: String,
  },
  { timestamps: true }
);

export const Contact =
  mongoose.models.Contact || mongoose.model('Contact', contactSchema);
