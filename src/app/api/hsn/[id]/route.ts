<<<<<<< HEAD
// import { NextResponse } from "next/server";
// import { connectDB } from '@/lib/db';
// import { getHSNById } from "@/controllers/hsnController";

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   await connectDB();
//   const hsn = await getHSNById(params.id);
//   if (!hsn) return NextResponse.json({ error: "Not found" }, { status: 404 });
//   return NextResponse.json(hsn);
// }



import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getHSNById, updateHSN, deleteHSN } from "@/controllers/hsnController";

// ✅ GET HSN by ID
=======
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getHSNById } from "@/controllers/hsnController";

>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
<<<<<<< HEAD
  await connectDB();
  const hsn = await getHSNById(params.id);
  if (!hsn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(hsn, { status: 200 });
}

// ✅ UPDATE HSN by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const body = await req.json();
  const updated = await updateHSN(params.id, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated, { status: 200 });
}

// ✅ DELETE HSN by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const deleted = await deleteHSN(params.id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
=======
  await dbConnect();
  const hsn = await getHSNById(params.id);
  if (!hsn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(hsn);
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
}
