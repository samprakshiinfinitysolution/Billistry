

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
