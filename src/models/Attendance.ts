import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAttendance extends Document {
  staffId: mongoose.Schema.Types.ObjectId;
  date: Date;
  status: "present" | "absent" | "leave";
  notes?: string;
}

const AttendanceSchema: Schema<IAttendance> = new Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["present", "absent", "leave"],
    required: true,
  },
  notes: { type: String },
}, { timestamps: true });

export default (mongoose.models.Attendance as Model<IAttendance>) || mongoose.model<IAttendance>("Attendance", AttendanceSchema);