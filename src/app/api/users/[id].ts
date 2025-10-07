import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { authMiddleware } from "@/lib/middleware/auth";

async function findUser(id: string, businessId: string) {
  const user = await User.findOne({
    _id: id,
    business: businessId,
    isDeleted: false,
  }).select("-passwordHash");
  return user;
}

// 📌 GET user
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const currentUser = await authMiddleware(req, ["superadmin", "shopkeeper"]);
    if (currentUser instanceof NextResponse) return currentUser;
    
    const user = await findUser(params.id, currentUser.businessId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    
    return NextResponse.json(user);
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

    const user = await findUser(params.id, currentUser.businessId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (currentUser.role === "shopkeeper" && (user.role === "shopkeeper" || user.role === "superadmin")) {
      return NextResponse.json({ message: "Not authorized to manage this user" }, { status: 403 });
    }

    const { name, phone, email, role, isActive } = await req.json();

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (role && currentUser.role === "superadmin") user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    user.updatedBy = currentUser.userId;
    await user.save();

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

    const user = await findUser(params.id, currentUser.businessId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (currentUser.role === "shopkeeper" && (user.role === "shopkeeper" || user.role === "superadmin")) {
      return NextResponse.json({ message: "Not authorized to manage this user" }, { status: 403 });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.updatedBy = currentUser.userId;
    await user.save();

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("User API error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
