

// app/api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import { DEFAULT_PERMISSIONS } from "@/constants/permissions";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is not set");

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, phone, otp } = await req.json();

    if (!otp || (!email && !phone)) {
      return NextResponse.json(
        { error: "Email/Phone and OTP are required" },
        { status: 400 }
      );
    }

    // 🔎 Find user
    const user = await User.findOne({
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please request OTP again." },
        { status: 404 }
      );
    }

    // 🔑 Verify OTP
    if (!user.verifyOtp(otp)) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Clear OTP
    user.clearOtp();
    await user.save();

    // 🏪 Shopkeeper: auto-create business if first login
    let businessId = user.business?.toString() ?? "";
    if (user.role === "shopkeeper" && !businessId) {
      const businessName = user.name ?? phone ?? "My Shop";
      const business = await Business.create({
        name: `${businessName}'s Shop`,
        owner: user._id,
        isActive: true,
      });
      user.business = business._id;
      await user.save();
      businessId = business._id.toString();
    }

    // 📌 Fetch business name if exists
    let businessName = "";
    if (businessId) {
      const business = await Business.findById(businessId).select("name");
      businessName = business?.name || "";
    }

    const permissions = Object.values(user.permissions || {}).some(
      (v) => v === true
    )
      ? user.permissions
      : DEFAULT_PERMISSIONS[user.role as keyof typeof DEFAULT_PERMISSIONS] ||
        {};

    // 🛠 Generate JWT (lightweight: only businessId)
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        businessId,
        permissions,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🍪 Set cookie and respond with consistent payload
    const res = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        businessId,
        businessName, // 👈 keep consistent with authMiddleware
        permissions,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("❌ Verify OTP Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
