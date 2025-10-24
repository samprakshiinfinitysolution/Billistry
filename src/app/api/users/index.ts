import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { SubscriptionPlan } from "@/models/SubscriptionPlan";
import { authMiddleware } from "@/lib/middleware/auth";

// 📌 GET all users in the same business
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await authMiddleware(req, ["superadmin", "shopkeeper"]);
    if (currentUser instanceof NextResponse) return currentUser;
    // If superadmin, allow listing across all businesses. Support optional role filter.
    const params = req.nextUrl.searchParams;
    const roleFilter = params.get('role') || undefined;

    const query: any = { isDeleted: false };
    if (currentUser.role !== 'superadmin') {
      // restrict to the current user's business
      query.business = currentUser.businessId;
    } else if (roleFilter) {
      query.role = roleFilter;
    }

    const users = await User.find(query).select("-passwordHash");
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("User API error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 📌 POST create new user
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await authMiddleware(req, ["superadmin", "shopkeeper"]);
    if (currentUser instanceof NextResponse) return currentUser;

    const { name, phone, email, password, role } = await req.json();

    if (!name || (!phone && !email)) {
      return NextResponse.json({ message: "Name and phone/email are required" }, { status: 400 });
    }

    const userRole = role || "shopkeeper";

    let subscription;
    if (userRole === "shopkeeper") {
      let defaultPlan = await SubscriptionPlan.findOne({ name: "Free Trial" }); // Assuming a default plan exists
      if (!defaultPlan) {
        defaultPlan = await SubscriptionPlan.create({
          name: "Free Trial",
          durationInDays: 30,
          price: 0,
          features: ["basic"],
        });
      }
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + defaultPlan.durationInDays);
      subscription = { plan: defaultPlan._id, startDate, endDate, isActive: true };
    }

    const newUser = new User({
      name,
      phone,
      email,
      passwordHash: password, // Hashed in pre-save hook
      role: userRole,
      business: currentUser.businessId,
      createdBy: currentUser.userId,
      subscription,
    });

    await newUser.save();

    const userResponse = { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, subscription: newUser.subscription };
    return NextResponse.json({ message: "User created successfully", user: userResponse }, { status: 201 });

  } catch (error: any) {
    console.error("User API error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
