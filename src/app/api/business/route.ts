


import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { authMiddleware, UserPayload } from "@/lib/middleware/auth";

// GET: list businesses
export async function GET(req: NextRequest) {
  await connectDB();
  const user =await authMiddleware(req) as UserPayload;
  if (user instanceof NextResponse) return user;

  const businesses =
    user.role === "shopkeeper"
      ? await Business.find({ owner: user.userId, isDeleted: false })
      : await Business.find({ isDeleted: false });

  return NextResponse.json({ success: true, businesses });
}

// POST: create new business
export async function POST(req: NextRequest) {
  await connectDB();
  const user =await authMiddleware(req) as UserPayload;
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const { name, address, phone, email, gstNumber, currency, timezone } = body;

  if (!name) return NextResponse.json({ error: "Business name is required" }, { status: 400 });

  const ownerId = user.role === "shopkeeper" ? user.userId : body.owner;

  const business = await Business.create({
    name,
    owner: ownerId,
    address,
    phone,
    email,
    gstNumber,
    currency,
    timezone,
    createdBy: user.userId,
    updatedBy: user.userId,
  });

  return NextResponse.json({ success: true, business });
}

// PUT: update business
export async function PUT(req: NextRequest) {
  await connectDB();
  const user =await authMiddleware(req) as UserPayload;
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const { id, ...updateData } = body;
  if (!id) return NextResponse.json({ error: "Business ID is required" }, { status: 400 });

  const business = await Business.findById(id);
  if (!business || business.isDeleted) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  if (user.role === "shopkeeper" && business.owner.toString() !== user.userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  Object.assign(business, updateData, { updatedBy: user.userId });
  await business.save();

  return NextResponse.json({ success: true, business });
}

// DELETE: soft delete business
export async function DELETE(req: NextRequest) {
  await connectDB();
  const user =await authMiddleware(req) as UserPayload;
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Business ID required" }, { status: 400 });

  const business = await Business.findById(id);
  if (!business || business.isDeleted) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  if (user.role === "shopkeeper" && business.owner.toString() !== user.userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  business.isDeleted = true;
  business.deletedAt = new Date();
  business.updatedBy = user.userId;
  await business.save();

  return NextResponse.json({ success: true, message: "Business deleted" });
}
