// src/app/api/sale-returns/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getSaleReturnById,
  updateSaleReturn,
  deleteSaleReturn,
} from "@/controllers/saleReturnController";
import { authMiddleware } from "@/lib/middleware/auth";

// ✅ GET one sale return
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authMiddleware(req, ["superadmin", "shopkeeper", "staff"]);
    if ("error" in user) return user;

    const doc = await getSaleReturnById(params.id, user.businessId);
    return NextResponse.json({ success: true, data: doc });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 404 });
  }
}

// ✅ PUT update sale return
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authMiddleware(req, ["superadmin", "shopkeeper"]);
    if ("error" in user) return user;

    const body = await req.json();
    const updated = await updateSaleReturn(params.id, body, user.businessId);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

// ✅ DELETE sale return
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authMiddleware(req, ["superadmin", "shopkeeper"]);
    if ("error" in user) return user;

    const result = await deleteSaleReturn(params.id, user.businessId);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
