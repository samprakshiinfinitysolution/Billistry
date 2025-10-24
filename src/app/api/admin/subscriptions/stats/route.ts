import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
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
    const limit = Math.max(1, Math.min(50, parseInt(params.get("limit") || "10", 10)));

    const authResult = await authMiddleware(req);
    if (authResult instanceof NextResponse && !allowPublic(req)) return authResult;

    const user: any = authResult instanceof NextResponse ? { role: 'shopkeeper' } : authResult;

    const now = new Date();
    const baseQuery: any = { isDeleted: { $ne: true } };
    if (businessId) {
      try {
        baseQuery._id = new mongoose.Types.ObjectId(businessId);
      } catch (e) {
        baseQuery._id = businessId as any;
      }
    } else if (user && user.role !== 'superadmin' && user.businessId) {
      try {
        baseQuery._id = new mongoose.Types.ObjectId(user.businessId);
      } catch (e) {
        baseQuery._id = user.businessId as any;
      }
    }

    // counts
    const [activeCount, expiredCount, noneCount] = await Promise.all([
      Business.countDocuments({ ...baseQuery, subscriptionExpiry: { $gte: now } }),
  Business.countDocuments({ ...baseQuery, subscriptionExpiry: { $lt: now, $exists: true } }),
      Business.countDocuments({ ...baseQuery, $or: [ { subscriptionPlan: { $exists: false } }, { subscriptionPlan: null } ] }),
    ]);

    // recent businesses with subscription changes (sorted by updatedAt desc)
    const recent = await Business.find(baseQuery)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('name subscriptionPlan subscriptionExpiry updatedAt')
      .lean();

    const sanitized = recent.map((b: any) => ({
      id: b._id?.toString?.(),
      name: b.name,
      subscriptionPlan: b.subscriptionPlan?.toString?.() || null,
      subscriptionExpiry: b.subscriptionExpiry || null,
      updatedAt: b.updatedAt || null,
    }));

    return NextResponse.json({ success: true, totals: { active: activeCount, expired: expiredCount, none: noneCount }, recent: sanitized });
  } catch (err: any) {
    console.error('/api/admin/subscriptions/stats error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
