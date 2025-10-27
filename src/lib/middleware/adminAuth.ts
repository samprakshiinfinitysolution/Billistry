import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JwtUserPayload, UserPayload } from "./auth"; // Reuse types

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");
const key = new TextEncoder().encode(JWT_SECRET);

/**
 * Middleware specifically for authenticating a superadmin.
 * It checks for the 'admin_token' and verifies the role is 'superadmin'.
 */
export async function adminAuthMiddleware(
  req: NextRequest
): Promise<UserPayload | NextResponse> {
  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized: No admin token" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, key);
    const decoded = payload as unknown as JwtUserPayload;

    if (decoded.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden: Not a superadmin" }, { status: 403 });
    }

    // Return a payload consistent with the main authMiddleware
    return { ...decoded, permissions: {} }; // Superadmin has all permissions implicitly
  } catch (err) {
    console.error("Admin JWT Error:", err);
    return NextResponse.json({ error: "Invalid admin token" }, { status: 401 });
  }
}