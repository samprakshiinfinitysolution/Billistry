// import { NextRequest, NextResponse } from 'next/server';
// import {
//   getSaleById,
//   updateSale,
//   deleteSale,
// } from '@/controllers/saleController';

// export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const sale = await getSaleById(params.id);
//     return NextResponse.json(sale);
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 404 });
//   }
// }

// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const body = await req.json();
//     const updated = await updateSale(params.id, body);
//     return NextResponse.json(updated);
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const deleted = await deleteSale(params.id);
//     return NextResponse.json(deleted);
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }



import { NextRequest, NextResponse } from "next/server";
import {
  getSaleById,
  updateSale,
  deleteSale,
} from "@/controllers/saleController";
import { asyncHandler } from "@/lib/asyncHandler";
import { authMiddleware } from "@/lib/middleware/auth";

// ✅ GET: Get single sale
export const GET = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) return user;

    const sale = await getSaleById(params.id, user);

    return NextResponse.json({ success: true, data: sale }, { status: 200 });
  }
);

// ✅ PUT: Update sale
export const PUT = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) return user;

    const body = await req.json();
    const sale = await updateSale(params.id, body, user);

    return NextResponse.json(
      { success: true, data: sale, message: "Sale updated successfully" },
      { status: 200 }
    );
  }
);

// ✅ DELETE: Soft delete sale
export const DELETE = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) return user;

    const result = await deleteSale(params.id, user);

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  }
);