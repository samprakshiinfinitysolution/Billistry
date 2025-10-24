// models/AuditLog.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IAuditLog extends Document {
  business?: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  action: string;
  resourceType?: string;
  resourceId?: mongoose.Types.ObjectId;
  before?: any;
  after?: any;
  ip?: string;
  createdAt?: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    business: { type: Schema.Types.ObjectId, ref: "Business", index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true },
    resourceType: { type: String },
    resourceId: { type: Schema.Types.ObjectId },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ business: 1, user: 1, createdAt: -1 });

export default models.AuditLog || model<IAuditLog>("AuditLog", AuditLogSchema);
