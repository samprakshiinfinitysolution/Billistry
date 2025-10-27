import { authMiddleware } from "@/lib/middleware/auth";
import { createStaff, getStaff } from "@/controllers/staffController";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const user = await authMiddleware(req, ["shopkeeper", "superadmin"]);
  if ("status" in user) return user; // Return error response
  return createStaff(req, user);
}

export async function GET(req: NextRequest) {
  const user = await authMiddleware(req, ["shopkeeper", "superadmin"]);
  if ("status" in user) return user; // Return error response
  return getStaff(req, user);
}
