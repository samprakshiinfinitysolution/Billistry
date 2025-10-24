// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function POST(req: Request) {
  // Attempt to record logout in audit logs if we can identify the user from the token.
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenCookie = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="));
    const token = tokenCookie ? decodeURIComponent(tokenCookie.split("=")[1]) : null;

    if (token && JWT_SECRET) {
      try {
        const payload: any = jwt.verify(token, JWT_SECRET);
        await connectDB();
        const xf = req.headers.get("x-forwarded-for") || "";
        let ip = xf.split(',').map(s => s.trim()).find(Boolean) || req.headers.get("x-real-ip") || "";
        // fallback to underlying Node socket address for local dev
        try {
          const anyReq: any = req as any;
          ip = ip || anyReq?.socket?.remoteAddress || anyReq?.connection?.remoteAddress || ip;
        } catch (e) {}

        await AuditLog.create({
          business: payload?.businessId || undefined,
          user: payload?.userId || undefined,
          action: "logout",
          resourceType: "auth",
          after: { method: "logout" },
          ip,
        });
      } catch (err) {
        // Token invalid / DB write failed — don't block logout
        console.error("Could not create logout audit log:", err);
      }
    }
  } catch (err) {
    console.error("Logout audit log error:", err);
  }

  const res = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

  // Clear the token cookie properly
  res.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0, // expire immediately
  });

  return res;
}
