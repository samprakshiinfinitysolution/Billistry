// lib/audit.ts
import AuditLog from "@/models/AuditLog";
import mongoose from "mongoose";

interface AuditLogInput {
  business?: mongoose.Types.ObjectId | string;
  user?: mongoose.Types.ObjectId | string;
  action: string;
  resourceType?: string;
  resourceId?: mongoose.Types.ObjectId | string;
  before?: any;
  after?: any;
  ip?: string;
}

export async function createAuditLog(data: AuditLogInput) {
  try {
    await AuditLog.create(data);
  } catch (err) {
    console.error("AuditLog Error:", err);
  }
}
