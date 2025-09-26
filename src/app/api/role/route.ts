import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CompanyRole } from "@/models/CompanyRole";
import { authMiddleware } from "@/lib/middleware/auth"; // ✅ check shopkeeper

// Create Role
export async function POST(req: Request) {
  await connectDB();
  const user = await authMiddleware(req, ["shopkeeper"]);

  const { name, permissions } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Role name is required" }, { status: 400 });
  }

  const role = await CompanyRole.create({
    name,
    permissions,
    business: user.businessId,
    createdBy: user.userId,
  });

  return NextResponse.json({ success: true, role });
}

// Get Roles for business
export async function GET(req: Request) {
  await connectDB();
  const user = await authMiddleware(req, ["shopkeeper"]);

  const roles = await CompanyRole.find({ business: user.businessId });
  return NextResponse.json({ success: true, roles });
}
