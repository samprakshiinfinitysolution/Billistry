// import { NextRequest, NextResponse } from 'next/server';
// import { createSale, getAllSales } from '@/controllers/saleController';

// export async function POST(req: NextRequest) {
//   try {
//     const data = await req.json();
//     const sale = await createSale(data);
//     return NextResponse.json(sale, { status: 201 });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// export async function GET() {
//   try {
//     const sales = await getAllSales();
//     return NextResponse.json(sales);
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }


// app/api/sales/route.ts
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { authMiddleware } from "@/lib/middleware/auth";
import { createSale, getAllSales } from "@/controllers/saleController";

// ✅ GET all sales
export const GET = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const sales = await getAllSales(user);
  return NextResponse.json({ success: true, data: sales }, { status: 200 });
});

// ✅ POST: Create new sale
export const POST = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const sale = await createSale(body, user);

  return NextResponse.json(
    { success: true, data: sale, message: "Sale created successfully" },
    { status: 201 }
  );
});
