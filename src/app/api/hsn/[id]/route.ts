


import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getHSNById, updateHSN, deleteHSN } from "@/controllers/hsnController";

// ✅ GET HSN by ID
export async function GET(req: Request, { params }: any) {
  await connectDB();
  const { id } = params;
  const hsn = await getHSNById(id);

  if (!hsn) return NextResponse.json({ success: false, error: "HSN not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: hsn }, { status: 200 });
}

// ✅ UPDATE HSN by ID
export async function PUT(req: Request, { params }: any) {
  await connectDB();
  const { id } = params;
  const body = await req.json();
  const updated = await updateHSN(id, body);

  if (!updated) return NextResponse.json({ success: false, error: "HSN not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: updated, message: "HSN updated successfully" }, { status: 200 });
}

// ✅ DELETE HSN by ID
export async function DELETE(req: Request, { params }: any) {
  await connectDB();
  const { id } = params;
  const deleted = await deleteHSN(id);

  if (!deleted) return NextResponse.json({ success: false, error: "HSN not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "HSN deleted successfully" }, { status: 200 });
}
