import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ICategory extends Document {
  business: mongoose.Types.ObjectId; // each category belongs to a business
  category_name: string;
  category_description?: string | null;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  isActive: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    category_name: { type: String, required: true, unique: true, index: true },
    category_description: { type: String, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ business: 1, category_name: 1 }, { unique: true });
export default models.Category || model<ICategory>("Category", CategorySchema);