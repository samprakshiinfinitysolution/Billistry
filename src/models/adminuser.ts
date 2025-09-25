import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminUser extends Document {
  email: string;
  password: string;
}

const AdminUserSchema = new Schema<IAdminUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
});

export const AdminUser = mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
