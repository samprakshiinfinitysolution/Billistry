// import { NextRequest, NextResponse } from "next/server";
// import { addCashbookEntry, getCashbookEntries } from "@/controllers/cashbookController";

// export async function GET() {
//   try {
//     const data = await getCashbookEntries();
//     return NextResponse.json(data);
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const entry = await addCashbookEntry(body);
//     return NextResponse.json(entry, { status: 201 });
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 400 });
//   }
// }
// import { NextRequest, NextResponse } from "next/server";
// import { authMiddleware } from "@/lib/middleware/auth";
// import * as CashbookController from "@/controllers/cashbookController";
// import { asyncHandler } from "@/lib/asyncHandler";

// // ✅ Get all entries (scoped to user’s business)
// export const GET = asyncHandler(async (req: NextRequest) => {
//   const user = authMiddleware(req);
//   if (user instanceof NextResponse) return user;

//   const data = await CashbookController.getCashbookEntries(user);
//   return NextResponse.json({ success: true, ...data });
// });

// // ✅ Add new entry
// export const POST = asyncHandler(async (req: NextRequest) => {
//   const user = authMiddleware(req);
//   if (user instanceof NextResponse) return user;

//   const body = await req.json();
//   if (!body.type || !body.amount || !body.mode) {
//     return NextResponse.json(
//       { success: false, error: "type, amount, and mode are required" },
//       { status: 400 }
//     );
//   }

//   // ✅ fix argument order
//   const entry = await CashbookController.addCashbookEntry(user, body);
//   return NextResponse.json({ success: true, entry }, { status: 201 });
// });


import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import * as CashbookController from "@/controllers/cashbookController";
import { asyncHandler } from "@/lib/asyncHandler";

// ✅ GET all entries (scoped to user's business)
export const GET = asyncHandler(async (req: NextRequest) => {
  const user =await authMiddleware(req);
  if (user instanceof NextResponse) return user; // auth failed

  const data = await CashbookController.getCashbookEntries(user);
  return NextResponse.json({ success: true, ...data });
});

// ✅ POST: Add new cashbook entry
export const POST = asyncHandler(async (req: NextRequest) => {
  const user =await authMiddleware(req);
  if (user instanceof NextResponse) return user; // auth failed

  const body: {
    type?: "IN" | "OUT";
    amount?: number;
    mode?: "cash" | "online";
    description?: string;
  } = await req.json();

  // Validate required fields
  if (!body.type || !body.amount || body.amount <= 0 || !body.mode) {
    return NextResponse.json(
      { success: false, error: "Valid type, positive amount, and mode are required" },
      { status: 400 }
    );
  }

  // Create new entry
  const entry = await CashbookController.addCashbookEntry(user, {
    type: body.type,
    amount: body.amount,
    mode: body.mode,
    description: body.description || "",
  });

  return NextResponse.json({ success: true, entry }, { status: 201 });
});
