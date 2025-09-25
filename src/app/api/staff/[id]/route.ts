// // app/api/staff/[id]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { authMiddleware } from "@/lib/middleware/auth";
// import * as StaffController from "@/controllers/staffController";

// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   const user = await authMiddleware(req, ["shopkeeper"]);
//   if (user instanceof NextResponse) return user;

//   const staff = await StaffController.getStaffById(params.id, user);
//   if (!staff) return NextResponse.json({ error: "Not found" }, { status: 404 });

//   return NextResponse.json({ success: true, staff });
// }


import { NextRequest } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { getStaffById, updateStaff, deleteStaff } from "@/controllers/staffController";

// GET single staff
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authMiddleware(req, ["shopkeeper", "superadmin"]);
  if ("status" in user) return user;

  return getStaffById(req, user, params.id);
}

// PUT update staff
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authMiddleware(req, ["shopkeeper", "superadmin"]);
  if ("status" in user) return user;

  return updateStaff(req, user, params.id);
}

// DELETE staff
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await authMiddleware(req, ["shopkeeper", "superadmin"]);
  if ("status" in user) return user;

  return deleteStaff(req, user, params.id);
}
