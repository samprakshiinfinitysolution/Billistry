import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { authMiddleware } from "@/lib/middleware/auth";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await authMiddleware(req, ["superadmin", "shopkeeper"]);
    if (currentUser instanceof NextResponse) return currentUser;

    const params = req.nextUrl.searchParams;
    const roleFilter = params.get('role') || undefined;

    const query: any = { isDeleted: false };
    if (currentUser.role !== 'superadmin') {
      query.business = currentUser.businessId;
    } else if (roleFilter) {
      query.role = roleFilter;
    }

    const users = await User.find(query).select('-passwordHash');
    return NextResponse.json({ currentUser, returnedCount: users.length, sample: users.slice(0, 50) });
  } catch (err: any) {
    console.error('/api/debug/users error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
