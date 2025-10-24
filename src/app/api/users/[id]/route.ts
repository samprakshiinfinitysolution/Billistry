import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { authMiddleware } from "@/lib/middleware/auth";

async function findUser(id: string, businessId?: string, opts?: { lean?: boolean }) {
  // find user by id; businessId parameter is used by non-superadmins to restrict scope
  const q: any = { _id: id, isDeleted: false };
  if (businessId) q.business = businessId;
  const base = User.findOne(q)
    .select("-passwordHash -otp -otpExpiresAt")
    .populate({ path: 'business', select: 'name logoUrl signatureUrl address city state pincode website currency timezone' });
  if (opts?.lean) return await base.lean();
  return await base;
}

// 📌 GET user
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const currentUser = await authMiddleware(req, ["superadmin", "shopkeeper"]);
    if (currentUser instanceof NextResponse) return currentUser;
  // allow superadmin to fetch any user (no business restriction)
  const scopeBusinessId = currentUser.role === 'superadmin' ? undefined : currentUser.businessId;
  const user = await findUser(params.id, scopeBusinessId, { lean: true });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    // add convenient fields for frontend
    const business = (user as any).business || null;
    const out = {
      ...user,
      businessName: business?.name || null,
      avatar: (user as any).avatar || business?.logoUrl || null,
      signature: (user as any).signature || business?.signatureUrl || null,
      businessTypes: business?.businessTypes || (user as any).businessTypes || [],
      industryTypes: business?.industryTypes || (user as any).industryTypes || [],
      registrationType: business?.registrationType || (user as any).registrationType || null,
      gstNumber: business?.gstNumber || (user as any).gstNumber || null,
      panNumber: business?.panNumber || (user as any).panNumber || null,
      companyEmail: business?.email || (user as any).companyEmail || (user as any).email || null,
      companyPhone: business?.phone || (user as any).companyPhone || (user as any).phone || null,
      billingAddress: business?.address || (user as any).address || null,
      city: business?.city || (user as any).city || null,
      state: business?.state || (user as any).state || null,
      pincode: business?.pincode || (user as any).pincode || null,
      enableEInvoicing: !!business?.enableEInvoicing || !!(user as any).enableEInvoicing,
      enableTds: !!business?.enableTds || !!(user as any).enableTds,
      enableTcs: !!business?.enableTcs || !!(user as any).enableTcs,
      website: business?.website || (user as any).website || null,
    };
    return NextResponse.json(out);
  } catch (error: any) {
    console.error("User API error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 📌 UPDATE user
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const currentUser = await authMiddleware(req, ["superadmin", "shopkeeper"]);
    if (currentUser instanceof NextResponse) return currentUser;

    const user = await findUser(params.id, currentUser.businessId, { lean: false });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    if (currentUser.role === "shopkeeper" && (((user as any).role === "shopkeeper") || ((user as any).role === "superadmin"))) {
      return NextResponse.json({ message: "Not authorized to manage this user" }, { status: 403 });
    }

    const { name, phone, email, role, isActive } = await req.json();

    if (name) (user as any).name = name;
    if (phone) (user as any).phone = phone;
    if (email) (user as any).email = email;
    if (role && currentUser.role === "superadmin") (user as any).role = role;
    if (isActive !== undefined) (user as any).isActive = isActive;

    (user as any).updatedBy = currentUser.userId;
    await (user as any).save();

    return NextResponse.json({ message: "User updated successfully", user });
  } catch (error: any) {
    console.error("User API error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 📌 DELETE user (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const currentUser = await authMiddleware(req, ["superadmin", "shopkeeper"]);
    if (currentUser instanceof NextResponse) return currentUser;

    const user = await findUser(params.id, currentUser.businessId, { lean: false });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (currentUser.role === "shopkeeper" && (((user as any).role === "shopkeeper") || ((user as any).role === "superadmin"))) {
      return NextResponse.json({ message: "Not authorized to manage this user" }, { status: 403 });
    }

    (user as any).isDeleted = true;
    (user as any).deletedAt = new Date();
    (user as any).updatedBy = currentUser.userId;
    await (user as any).save();

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("User API error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
