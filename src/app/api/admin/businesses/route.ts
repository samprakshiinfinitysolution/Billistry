import { adminAuthMiddleware } from "@/lib/middleware/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await adminAuthMiddleware(req);

  if (user instanceof NextResponse) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  // If middleware passes, the token is valid and the user is a superadmin
  return NextResponse.json({ valid: true, role: user.role, userId: user.userId });
}