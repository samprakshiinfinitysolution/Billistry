import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JwtUserPayload, UserPayload } from "./auth"; // Reuse types
import { connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { DEFAULT_PERMISSIONS } from "@/constants/permissions";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");
const key = new TextEncoder().encode(JWT_SECRET);

/**
 * Middleware specifically for authenticating a superadmin.
 * It checks for the 'admin_token' cookie or Authorization header and verifies the role is 'superadmin'.
 */
export async function adminAuthMiddleware(
  req: NextRequest
): Promise<UserPayload | NextResponse> {
  // accept token from cookie or authorization header (Bearer)
  const cookieToken = req.cookies.get("admin_token")?.value;
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const headerToken = authHeader?.toString().startsWith("Bearer ")
    ? authHeader.toString().split(" ")[1]
    : authHeader;

  const token = cookieToken || headerToken;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized: No admin token" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, key);
    const decoded = payload as unknown as JwtUserPayload;

    if (decoded.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden: Not a superadmin" }, { status: 403 });
    }

    // optionally resolve business name if present on the token
    let businessName = "";
    if (decoded.businessId) {
      try {
        await connectDB();
        const business = await Business.findById(decoded.businessId).select("name");
        businessName = business?.name || "";
      } catch (err) {
        // non-fatal: we'll still return the payload without businessName
        console.warn("adminAuth: failed to resolve business name", err);
      }
    }

    const userPayload: UserPayload = {
      ...decoded,
      businessName,
      // superadmin gets superadmin default permissions
      permissions: DEFAULT_PERMISSIONS.superadmin,
    };

    return userPayload;
  } catch (err) {
    console.error("Admin JWT Error:", err);
    return NextResponse.json({ error: "Invalid admin token" }, { status: 401 });
  }
}