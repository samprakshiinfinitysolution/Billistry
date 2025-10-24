// src/app/api/sale-returns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSaleReturn, getSaleReturns } from "@/controllers/saleReturnController";
import { authMiddleware } from "@/lib/middleware/auth";

// ✅ GET all sale returns
export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req, ["superadmin", "shopkeeper", "staff"]);
    if (!("userId" in authResult)) return authResult; // Type guard to ensure authResult is UserPayload

    const returns = await getSaleReturns(authResult.businessId);
    return NextResponse.json({ success: true, data: returns });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ✅ POST create sale return
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req, ["superadmin", "shopkeeper", "staff"]);
    if (!("userId" in authResult)) return authResult; // Type guard

    const body = await req.json();
    const newReturn = await createSaleReturn(body, authResult);

    return NextResponse.json({ success: true, data: newReturn }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
