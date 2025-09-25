import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCategories, searchCategory, createCategory } from "@/controllers/categoryController";
import { asyncHandler } from "@/lib/asyncHandler";
import { authMiddleware } from "@/lib/middleware/auth";

// ✅ GET all categories or search by name
export const GET = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  let categories;
  if (q) {
    categories = await searchCategory(user.businessId, q);
  } else {
    categories = await getCategories(user);
  }

  return NextResponse.json({ success: true, categories });
});

// ✅ POST create single or multiple categories
export const POST = asyncHandler(async (req: NextRequest) => {
  await connectDB();

  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const categories = await createCategory(body, user);

  return NextResponse.json({ success: true, categories }, { status: 201 });
});
