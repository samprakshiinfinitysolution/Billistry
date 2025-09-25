



// import { NextRequest, NextResponse } from "next/server";
// import { authMiddleware } from "@/lib/middleware/auth";
// import * as SupplierController from "@/controllers/supplierController";
// import { asyncHandler } from "@/lib/asyncHandler";

// // GET all suppliers
// export const GET = asyncHandler(async (req: NextRequest) => {
//   const user = authMiddleware(req);
//   if (user instanceof NextResponse) return user;

//   const suppliers = await SupplierController.getSuppliers(user);
//   return NextResponse.json({ success: true, suppliers });
// });

// // POST: create new supplier
// export const POST = asyncHandler(async (req: NextRequest) => {
//   const user = authMiddleware(req);
//   if (user instanceof NextResponse) return user;

//   const body = await req.json();
//   const supplier = await SupplierController.createSupplier(body, user);

//   return NextResponse.json({ success: true, supplier });
// });

// // PUT: update supplier
// export const PUT = asyncHandler(async (req: NextRequest) => {
//   const user = authMiddleware(req);
//   if (user instanceof NextResponse) return user;

//   const body = await req.json();
//   const { id, ...updateData } = body;
//   if (!id) return NextResponse.json({ success: false, error: "Supplier ID is required" }, { status: 400 });

//   const supplier = await SupplierController.updateSupplier(id, updateData, user);
//   if (!supplier) return NextResponse.json({ success: false, error: "Supplier not found or forbidden" }, { status: 404 });

//   return NextResponse.json({ success: true, supplier });
// });

// // DELETE: soft delete supplier
// export const DELETE = asyncHandler(async (req: NextRequest) => {
//   const user = authMiddleware(req);
//   if (user instanceof NextResponse) return user;

//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");
//   if (!id) return NextResponse.json({ success: false, error: "Supplier ID is required" }, { status: 400 });

//   const supplier = await SupplierController.deleteSupplier(id, user);
//   if (!supplier) return NextResponse.json({ success: false, error: "Supplier not found or forbidden" }, { status: 404 });

//   return NextResponse.json({ success: true, message: "Supplier deleted successfully" });
// });


import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import * as SupplierController from "@/controllers/supplierController";
import { asyncHandler } from "@/lib/asyncHandler";

// GET all suppliers
export const GET = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const suppliers = await SupplierController.getSuppliers(user);
  return NextResponse.json({ success: true, suppliers });
});

// POST: create new supplier
export const POST = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const supplier = await SupplierController.createSupplier(body, user);

  return NextResponse.json({ success: true, supplier }, { status: 201 });
});

