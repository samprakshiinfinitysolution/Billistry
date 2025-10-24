







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

    // We'll verify role and business from the DB to prevent stale/incorrect JWT claims
    await connectDB();

    const userDoc = await User.findById(decoded.userId).select("role business permissions name email");
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const roleFromDb = userDoc.role as Role;
    const businessIdFromDb = userDoc.business ? String(userDoc.business) : undefined;

    // Role enforcement using DB role
    if (allowedRoles && !allowedRoles.includes(roleFromDb)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 🔎 Business name (resolve from DB if available)
    let businessName = "";
    if (businessIdFromDb) {
      const business = await Business.findById(businessIdFromDb).select("name");
      businessName = business?.name || "";
    }

    // 🔑 Permissions: prefer stored permissions on user; fallback to defaults
    let permissions: IPermissions = (userDoc.permissions as IPermissions) || DEFAULT_PERMISSIONS[roleFromDb === 'superadmin' ? 'superadmin' : roleFromDb === 'shopkeeper' ? 'shopkeeper' : 'staff'];

    const payload = {
      userId: decoded.userId,
      businessId: businessIdFromDb || "",
      role: roleFromDb,
      businessName,
      permissions,
    } as UserPayload;

    return payload;
  } catch (err) {
    console.error("JWT Error:", err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
