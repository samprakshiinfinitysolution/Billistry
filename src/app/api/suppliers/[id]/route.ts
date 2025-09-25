// import { NextRequest, NextResponse } from "next/server";
// import {
//   getSupplierById,
//   updateSupplier,
//   deleteSupplier,
// } from "@/controllers/supplierController";
// import { formatError } from "@/lib/errorHandler";

// export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const supplier = await getSupplierById(params.id);
//     if (!supplier) return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
//     return NextResponse.json(supplier);
//   } catch (error: unknown) {
//     return NextResponse.json({ message: formatError(error) }, { status: 500 });
//   }
// }

// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const updated = await updateSupplier(params.id, req);
//     return NextResponse.json(updated);
//   } catch (error: unknown) {
//     return NextResponse.json({ message: formatError(error) }, { status: 500 });
//   }
// }

// export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const deleted = await deleteSupplier(params.id);
//     return NextResponse.json(deleted);
//   } catch (error: unknown) {
//     return NextResponse.json({ message: formatError(error) }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import {
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "@/controllers/supplierController";
import { asyncHandler } from "@/lib/asyncHandler";

// GET single supplier by ID
export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const supplier = await getSupplierById(params.id, user);
  if (!supplier) return NextResponse.json({ success: false, message: "Supplier not found" }, { status: 404 });

  return NextResponse.json({ success: true, supplier });
});

// PUT: update supplier by ID
export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const updated = await updateSupplier(params.id, body, user);
  return NextResponse.json({ success: true, supplier: updated });
});

// DELETE: delete supplier by ID
export const DELETE = asyncHandler(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const user = await authMiddleware(_req);
  if (user instanceof NextResponse) return user;

  const deleted = await deleteSupplier(params.id, user);
  return NextResponse.json({ success: true, supplier: deleted });
});
