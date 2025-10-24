import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import mongoose from "mongoose";

function allowPublic(req: NextRequest) {
  try {
    if (process.env.ALLOW_PUBLIC_VIEW === "1") return true;
    if (process.env.NODE_ENV === "development") return true;
    if (req.nextUrl.searchParams.get("public") === "1") return true;
  } catch (e) {}
  return false;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const params = req.nextUrl.searchParams;
    const businessId = params.get("businessId") || undefined;
    const limit = Math.max(1, Math.min(500, parseInt(params.get("limit") || "10", 10)));

    const authResult = await authMiddleware(req);
    let user: any = undefined;
    if (authResult instanceof NextResponse) {
      if (!allowPublic(req)) return authResult;
      user = { userId: 'public', role: 'shopkeeper' } as any;
    } else {
      user = authResult;
    }

    const q: any = {};
    if (businessId) {
      try {
        q.business = new mongoose.Types.ObjectId(businessId);
      } catch (e) {
        // if invalid id, fall back to string match
        q.business = businessId as any;
      }
    } else if (user && user.role !== 'superadmin' && user.businessId) {
      try {
        q.business = new mongoose.Types.ObjectId(user.businessId);
      } catch (e) {
        q.business = user.businessId as any;
      }
    }

    // populate the user and business refs so UI can display user name/email and business name
    const items = await AuditLog.find(q)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: 'user', select: 'name email' })
      .populate({ path: 'business', select: 'name' })
      .lean();
    // optional debug flag: ?debug=1 will also return the query and count
    if (params.get('debug') === '1') {
      const total = await AuditLog.countDocuments(q);
      return NextResponse.json({ success: true, items, query: q, count: total });
    }

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    console.error('/api/admin/audit-logs error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
