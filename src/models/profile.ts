import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone1: { type: String, required: true },
    phone2: { type: String },
    gstNumber: { type: String },
    email: { type: String, required: true },
    image: { type: String }, // uploaded image path
    businessName: { type: String, required: true },
    businessAddress: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    businessType: { type: String, required: true },
    businessCategory: { type: String, required: true },
    aboutBusiness: { type: String },
    sealSignature: { type: String }, // uploaded signature image path
  },
  { timestamps: true }
);

export default mongoose.models.Profile || mongoose.model("Profile", profileSchema);
