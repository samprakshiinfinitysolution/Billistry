import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;
const key = new TextEncoder().encode(JWT_SECRET);

export async function verifyAdminToken(req: NextRequest) {
  try {
    // Get token from the request cookies
    const token = req.cookies.get("admin_token")?.value;
    if (!token) return { error: "No token" };

    const { payload } = await jwtVerify(token, key);
    return { payload };
  } catch (err) {
    return { error: "Invalid or expired token" };
  }
}
