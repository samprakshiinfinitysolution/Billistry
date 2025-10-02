import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { authMiddleware } from "@/lib/middleware/auth";
import AuditLog from "@/models/AuditLog";

export async function GET(req: NextRequest) {
  // Only superadmin can view audit logs
  const auth = await authMiddleware(req, ["superadmin"]);
  if (auth) return auth;

  try {
    await connectDB();
    const user = (req as any).user;

    const { searchParams } = new URL(req.url);

    const businessId = searchParams.get("business");
    const userId = searchParams.get("user");
    const action = searchParams.get("action");
    const from = searchParams.get("from"); // date string
    const to = searchParams.get("to");     // date string
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const filter: any = {};

    if (businessId) filter.business = businessId;
    if (userId) filter.user = userId;
    if (action) filter.action = action;
    if (from || to) filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name email role")
      .populate("business", "name");

    const total = await AuditLog.countDocuments(filter);

    return NextResponse.json({
      page,
      limit,
      total,
      logs: logs.map(log => ({
        _id: log._id,
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        before: log.before,
        after: log.after,
        ip: log.ip,
        user: log.user,
        business: log.business,
        createdAt: log.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("AUDIT_API_ERROR:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
