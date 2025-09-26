// models/Otp.ts
import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IOtp extends Document {
  identifier: string; // phone or email
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    identifier: {
      type: String,
      required: true,
      index: true, // fast lookup for validation
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // store only createdAt
  }
);

// Auto-delete OTPs after expiry using MongoDB TTL index
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Avoid model overwrite issue in Next.js / hot-reload
const Otp = models.Otp || model<IOtp>("Otp", OtpSchema);

export default Otp;
