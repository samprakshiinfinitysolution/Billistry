import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import { getHSNById } from "@/controllers/hsnController";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const hsn = await getHSNById(params.id);
  if (!hsn) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(hsn);
}
