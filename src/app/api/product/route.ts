// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { authMiddleware } from "@/lib/middleware/auth";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
} from "@/controllers/productController";

// CREATE product
export const POST = asyncHandler(async (req: NextRequest) => {
  const user =await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const product = await createProduct(body, user);

  return NextResponse.json({ success: true, product }, { status: 201 });
});

// READ ALL or ONE
export const GET = asyncHandler(async (req: NextRequest) => {
  const user =await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const product = await getProductById(id, user);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, product });
  }

  // If superadmin, return all products across businesses (useful for global dashboard)
  if (user.role === 'superadmin') {
    // getAllProducts returns an object { products, total, page, limit }
    const all = await getAllProducts(1, 10000);
    return NextResponse.json({ success: true, products: all.products });
  }

  const products = await getProducts(user);
  return NextResponse.json({ success: true, products });
});

// UPDATE product
export const PATCH = asyncHandler(async (req: NextRequest) => {
  const user =await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Product ID is required" },
      { status: 400 }
    );
  }

  const updateData = await req.json();
  const product = await updateProduct(id, updateData, user);
  if (!product) {
    return NextResponse.json(
      { success: false, error: "Product not found or forbidden" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, product });
});

// DELETE (soft delete)
export const DELETE = asyncHandler(async (req: NextRequest) => {
  const user =await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Product ID is required" },
      { status: 400 }
    );
  }

  const product = await deleteProduct(id, user);
  if (!product) {
    return NextResponse.json(
      { success: false, error: "Product not found or forbidden" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, product });
});
