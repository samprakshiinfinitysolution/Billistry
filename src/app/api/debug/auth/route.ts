import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { authMiddleware } from "@/lib/middleware/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) return user;
    return NextResponse.json({ serverUser: user });
  } catch (err: any) {
    console.error('/api/debug/auth error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
