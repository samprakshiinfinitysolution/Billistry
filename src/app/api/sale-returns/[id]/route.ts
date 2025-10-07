// // src/app/api/sale-returns/[id]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import "@/models/NewSaleReturn"; // Ensure model is registered to prevent build errors
// import {
//   getSaleReturnById,
//   updateSaleReturn,
//   deleteSaleReturn,
// } from "@/controllers/saleReturnController";
// import { authMiddleware } from "@/lib/middleware/auth";

// // ✅ GET one sale return
// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const user = await authMiddleware(req, ["superadmin", "shopkeeper", "staff"]);
//     if ("error" in user) return user;

//     const doc = await getSaleReturnById(params.id, user.businessId);
//     return NextResponse.json({ success: true, data: doc });
//   } catch (err: any) {
//     return NextResponse.json({ success: false, message: err.message }, { status: 404 });
//   }
// }

// // ✅ PUT update sale return
// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const user = await authMiddleware(req, ["superadmin", "shopkeeper"]);
//     if ("error" in user) return user;

//     const body = await req.json();
//     const updated = await updateSaleReturn(params.id, body, user.businessId);
//     return NextResponse.json({ success: true, data: updated });
//   } catch (err: any) {
//     return NextResponse.json({ success: false, message: err.message }, { status: 400 });
//   }
// }

// // ✅ DELETE sale return
// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const user = await authMiddleware(req, ["superadmin", "shopkeeper"]);
//     if ("error" in user) return user;

//     const result = await deleteSaleReturn(params.id, user.businessId);
//     return NextResponse.json({ success: true, ...result });
//   } catch (err: any) {
//     return NextResponse.json({ success: false, message: err.message }, { status: 400 });
//   }
// }





// src/app/api/sale-returns/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import "@/models/NewSaleReturn"; // Ensure model is registered
import {
  getSaleReturnById,
  updateSaleReturn,
  deleteSaleReturn,
} from "@/controllers/saleReturnController";
import { authMiddleware } from "@/lib/middleware/auth";

// ✅ GET one sale return
export async function GET(req: NextRequest, { params }:any) {
  try {
    const authResult = await authMiddleware(req, ["superadmin", "shopkeeper", "staff"]);
    if (!("userId" in authResult)) return authResult; // Type guard for NextResponse

    const doc = await getSaleReturnById(params.id, authResult.businessId);
    return NextResponse.json({ success: true, data: doc });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 404 });
  }
}

// ✅ PUT update sale return
export async function PUT(req: NextRequest, { params }: any) {
  try {
    const authResult = await authMiddleware(req, ["superadmin", "shopkeeper"]);
    if (!("userId" in authResult)) return authResult; // Type guard

    const body = await req.json();
    const updated = await updateSaleReturn(params.id, body, authResult.businessId);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

// ✅ DELETE sale return
export async function DELETE(req: NextRequest, { params }:any) {
  try {
    const authResult = await authMiddleware(req, ["superadmin", "shopkeeper"]);
    if (!("userId" in authResult)) return authResult; // Type guard

    const result = await deleteSaleReturn(params.id, authResult.businessId);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
