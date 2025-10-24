// // app/api/purchase/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { createPurchase, getAllPurchases } from '@/controllers/purchaseController';

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const purchase = await createPurchase(body);
//     return NextResponse.json(purchase, { status: 201 });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// export async function GET() {
//   try {
//     const purchases = await getAllPurchases();
//     return NextResponse.json(purchases, { status: 200 });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { authMiddleware } from "@/lib/middleware/auth";
import { getAllPurchases, createPurchase } from "@/controllers/purchaseController";

// ✅ GET all purchases
export const GET = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const purchases = await getAllPurchases(user);
  return NextResponse.json({ success: true, data: purchases }, { status: 200 });
});

// ✅ POST: Create new purchase
export const POST = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const purchase = await createPurchase(body, user);

  return NextResponse.json(
    { success: true, data: purchase, message: "Purchase created successfully" },
    { status: 201 }
  );
});
