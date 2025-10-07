







import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import { DEFAULT_PERMISSIONS } from "@/constants/permissions";
import { IPermissions } from "@/models/User";  // 👈 use structured permissions

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

export type Role = "superadmin" | "shopkeeper" | "staff";

export interface JwtUserPayload {
  userId: string;
  businessId: string;
  role: Role;
}

export type UserPayload = JwtUserPayload & {
  businessName?: string;
  permissions: IPermissions;   // ✅ structured type
};

export async function authMiddleware(
  req: NextRequest,
  allowedRoles?: Role[]
): Promise<UserPayload | NextResponse> {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtUserPayload;

    // Role enforcement
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // 🔎 Business name
    let businessName = "";
    if (decoded.businessId) {
      const business = await Business.findById(decoded.businessId).select("name");
      businessName = business?.name || "";
    }

    // 🔑 Permissions resolution
    let permissions: IPermissions;
    if (decoded.role === "staff") {
      const staff = await User.findById(decoded.userId).select("permissions");
      if (!staff) {
        return NextResponse.json({ error: "Staff not found" }, { status: 404 });
      }
      permissions = staff.permissions || DEFAULT_PERMISSIONS.staff;
    } else if (decoded.role === "shopkeeper") {
      permissions = DEFAULT_PERMISSIONS.shopkeeper;
    } else {
      permissions = DEFAULT_PERMISSIONS.superadmin;
    }

    return { ...decoded, businessName, permissions };
  } catch (err) {
    console.error("JWT Error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
