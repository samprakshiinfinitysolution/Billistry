import { NextResponse } from "next/server";

import { connectDB } from '@/lib/db';
import { createHSN, searchHSN } from "@/controllers/hsnController";

// ✅ GET /api/hsn?search=code_or_name
export async function GET(req: Request) {
  await connectDB();
  const { search } = Object.fromEntries(new URL(req.url).searchParams);
  const results = await searchHSN(search as string);
  return NextResponse.json(results);
}

// ✅ POST /api/hsn
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const hsn = await createHSN(body);
  return NextResponse.json(hsn, { status: 201 });
}
