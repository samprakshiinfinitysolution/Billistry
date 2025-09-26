// import { NextRequest, NextResponse } from 'next/server';
// import {
//   getPurchaseById,
//   updatePurchase,
//   deletePurchase,
// } from '@/controllers/purchaseController';

// export async function GET(req: NextRequest, context: { params: { id: string } }) {
//   try {
//     const id = context.params.id;
//     const purchase = await getPurchaseById(id);
//     return NextResponse.json(purchase);
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 404 });
//   }
// }

// export async function PUT(req: NextRequest, context: { params: { id: string } }) {
//   try {
//     const id = context.params.id;
//     const body = await req.json();
//     const updated = await updatePurchase(id, body);
//     return NextResponse.json(updated);
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
//   try {
//     const id = context.params.id;
//     const deleted = await deletePurchase(id);
//     return NextResponse.json(deleted);
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }






import { NextRequest, NextResponse } from "next/server";
import {
  getPurchaseById,
  updatePurchase,
  deletePurchase,
} from "@/controllers/purchaseController";
import { asyncHandler } from "@/lib/asyncHandler";
import { authMiddleware } from "@/lib/middleware/auth";

// ✅ GET: Get single purchase
export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const purchase = await getPurchaseById(params.id, user);

  return NextResponse.json({ success: true, data: purchase }, { status: 200 });
});

// ✅ PUT: Update purchase
export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const purchase = await updatePurchase(params.id, body, user);

  return NextResponse.json(
    { success: true, data: purchase, message: "Purchase updated successfully" },
    { status: 200 }
  );
});

// ✅ DELETE: Soft delete purchase
export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const result = await deletePurchase(params.id, user);

  return NextResponse.json({ success: true, ...result }, { status: 200 });
});
