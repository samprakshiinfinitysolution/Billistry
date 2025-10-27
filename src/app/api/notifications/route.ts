import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

// GET /api/notifications?status=&limit=&skip=
export async function GET(req: NextRequest) {
  await connectDB();
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const skip = parseInt(url.searchParams.get("skip") || "0", 10);

  const q: any = { business: user.businessId };
  if (status) q.status = status;

  const total = await Notification.countDocuments(q);
  const items = await Notification.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

  return NextResponse.json({ success: true, total, items });
}

// POST /api/notifications
export async function POST(req: NextRequest) {
  await connectDB();
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const { to, channel, template, payload, scheduledAt } = body;
  if (!to || !channel || !template) {
    return NextResponse.json({ error: "to, channel and template are required" }, { status: 400 });
  }

  const n = await Notification.create({
    business: user.businessId,
    to,
    channel,
    template,
    payload: payload || {},
    scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    createdBy: user.userId,
  });

  return NextResponse.json({ success: true, notification: n }, { status: 201 });
}

// PATCH /api/notifications?id=...&action=markread
export async function PATCH(req: NextRequest) {
  await connectDB();
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const action = url.searchParams.get("action");
  if (!id || !action) return NextResponse.json({ error: "id and action required" }, { status: 400 });

  const notif = await Notification.findById(id);
  if (!notif || notif.business.toString() !== user.businessId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "markread") {
    notif.status = "SENT"; // treat SENT as read marker in this simple model
    await notif.save();
    return NextResponse.json({ success: true, notification: notif });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
