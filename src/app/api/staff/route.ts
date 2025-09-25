// import { NextRequest } from "next/server";
// import { authMiddleware } from "@/lib/middleware/auth";
// import { createStaff, getStaff, updateStaff, deleteStaff } from "@/controllers/staffController";

// // Route handler
// export async function POST(req: NextRequest) {
//   const user = await authMiddleware(req, ["shopkeeper", "superadmin"]);
//   if ("status" in user) return user; // Unauthorized or Forbidden

//   return createStaff(req, user);
// }

// export async function GET(req: NextRequest) {
//   const user = await authMiddleware(req, ["shopkeeper", "superadmin"]);
//   if ("status" in user) return user;

//   return getStaff(req, user);
// }

// export async function PUT(req: NextRequest) {
//   const user = await authMiddleware(req, ["shopkeeper", "superadmin"]);
//   if ("status" in user) return user;

//   const url = new URL(req.url);
//   const staffId = url.searchParams.get("id");
//   if (!staffId) return new Response(JSON.stringify({ error: "Staff ID required" }), { status: 400 });

//   return updateStaff(req, user, staffId);
// }

// export async function DELETE(req: NextRequest) {
//   const user = await authMiddleware(req, ["shopkeeper", "superadmin"]);
//   if ("status" in user) return user;

//   const url = new URL(req.url);
//   const staffId = url.searchParams.get("id");
//   if (!staffId) return new Response(JSON.stringify({ error: "Staff ID required" }), { status: 400 });

//   return deleteStaff(req, user, staffId);
// }


import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { createStaff, getStaff } from "@/controllers/staffController";

export async function POST(req: NextRequest) {
  const user = await authMiddleware(req, ["shopkeeper", "superadmin"]);
  if ("status" in user) return user;

  return createStaff(req, user);
}

export async function GET(req: NextRequest) {
  const user = await authMiddleware(req, ["shopkeeper", "superadmin"]);
  if ("status" in user) return user;

  return getStaff(req, user);
}
