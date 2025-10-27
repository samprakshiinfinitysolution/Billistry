import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// POST /api/admin/create
export async function POST(request: Request) {
  try {
    await connectDB();

    const { name, email, password } = await request.json();

    // 1️⃣ Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // 2️⃣ Validate email format (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // 3️⃣ Check if a superadmin already exists
    const existingAdmin = await User.findOne({ role: "superadmin" });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Superadmin already exists" },
        { status: 400 }
      );
    }

    // 4️⃣ Create new superadmin
    const admin = await User.create({
      name,
      email,
      passwordHash: password, // Will be hashed automatically in pre-save hook
      role: "superadmin",
      isActive: true,
      permissions: {
        business: { create: true, read: true, update: true, delete: true },
        staff: { create: true, read: true, update: true, delete: true },
        products: { create: true, read: true, update: true, delete: true },
        sales: { create: true, read: true, update: true, delete: true },
        purchases: { create: true, read: true, update: true, delete: true },
        expenses: { create: true, read: true, update: true, delete: true },
        reports: { read: true },
        visibility: {
          viewAmounts: true,
          viewProfit: true,
          viewSensitiveReports: true,
        },
      },
    });

    // 5️⃣ Return minimal admin info
    return NextResponse.json({
      success: true,
      message: "Superadmin created successfully",
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
