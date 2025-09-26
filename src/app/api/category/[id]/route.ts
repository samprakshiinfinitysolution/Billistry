import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCategoryById, updateCategory, deleteCategory } from "@/controllers/categoryController";
import { asyncHandler } from "@/lib/asyncHandler";
import { authMiddleware } from "@/lib/middleware/auth";

// GET category by ID
export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  await connectDB();

  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const category = await getCategoryById(params.id, user);
  if (!category) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true, category });
});

// PUT update category
export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  await connectDB();

  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const updated = await updateCategory(params.id, body, user);
  if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true, category: updated });
});

// DELETE (soft delete) category
export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  await connectDB();

  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const deleted = await deleteCategory(params.id, user);
  if (!deleted) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true, message: "Deleted successfully" });
});
