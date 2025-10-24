import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import Attendance from "@/models/Attendance";
import User from "@/models/User";

/**
 * @description Get attendance records for a staff member, with filtering and summary
 * @param req
 */
export async function GET(req: NextRequest) {
  const user = await authMiddleware(req, ["shopkeeper", "superadmin"]);
  if ("status" in user) return user;

  const { searchParams } = new URL(req.url);
  const staffId = searchParams.get("staffId");
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const status = searchParams.get("status");

  await connectDB();

  try {
    const filter: any = {};

    if (staffId) {
      // If a specific staff ID is provided, filter by it
      const staffMember = await User.findOne({ _id: staffId, business: user.businessId });
      if (!staffMember) {
        return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
      }
      filter.staffId = new mongoose.Types.ObjectId(staffId);
    } else {
      // Otherwise, get all staff for the business and filter attendance by their IDs
      const staffInBusiness = await User.find({ business: user.businessId, role: 'staff' }).select('_id');
      const staffIds = staffInBusiness.map(s => s._id);
      filter.staffId = { $in: staffIds };
    }

    if (year && month) {
      const monthIndex = parseInt(month) - 1;
      const startDate = new Date(parseInt(year), monthIndex, 1);
      const endDate = new Date(parseInt(year), monthIndex + 1, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const summaryFilter: any = { ...filter };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const records = await Attendance.find(filter).populate('staffId', 'name').sort({ date: -1 });

    const summaryAggregation = await Attendance.aggregate([
      { $match: summaryFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const summary = {
      present: summaryAggregation.find(s => s._id === 'present')?.count || 0,
      absent: summaryAggregation.find(s => s._id === 'absent')?.count || 0,
      leave: summaryAggregation.find(s => s._id === 'leave')?.count || 0,
    };

    return NextResponse.json({ records, summary });
  } catch (error: any) {
    console.error("Failed to fetch attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

/**
 * @description Mark attendance for a staff member (single or bulk)
 * @param req
 */
export async function POST(req: NextRequest) {
  const user = await authMiddleware(req, ["shopkeeper", "superadmin"]);
  if ("status" in user) return user;

  const { staffId, status, date, notes, startDate, endDate } = await req.json();

  if (!staffId || !status) {
    return NextResponse.json({ error: "Missing required fields: staffId, status" }, { status: 400 });
  }

  if (!date && (!startDate || !endDate)) {
    return NextResponse.json({ error: "Either a single date or a date range is required" }, { status: 400 });
  }

  await connectDB();

  try {
    const staffMember = await User.findOne({ _id: staffId, business: user.businessId });
    if (!staffMember) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const operations = [];
      for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
        const currentDate = new Date(day);
        currentDate.setHours(12, 0, 0, 0);
        operations.push({
          updateOne: {
            filter: { staffId: new mongoose.Types.ObjectId(staffId), date: currentDate },
            update: { $set: { status, notes: notes || "" } },
            upsert: true,
          },
        });
      }
      if (operations.length > 0) await Attendance.bulkWrite(operations);
      return NextResponse.json({ success: true, message: "Bulk attendance marked successfully." });
    } else {
      // For single date, use findOneAndUpdate with upsert to prevent duplicates
      const attendanceDate = new Date(date);
      attendanceDate.setHours(12, 0, 0, 0); // Normalize date to avoid timezone issues

      const updatedAttendance = await Attendance.findOneAndUpdate(
        {
          staffId: new mongoose.Types.ObjectId(staffId),
          date: attendanceDate,
        },
        {
          $set: { status, notes: notes || "" },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      return NextResponse.json(updatedAttendance, { status: 201 });
    }
  } catch (error: any) {
    console.error("Failed to mark attendance:", error);
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 });
  }
}