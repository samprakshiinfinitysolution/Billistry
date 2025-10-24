// import { updateCashbookEntry, deleteCashbookEntry } from "@/controllers/cashbookController";
// import { NextResponse } from "next/server";

// export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
//   const { id } = await context.params; // ✅ Await the params
//   try {
//     const body = await req.json();
//     const updated = await updateCashbookEntry(id, body);
//     return NextResponse.json(updated);
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 400 });
//   }
// }

// export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
//   const { id } = await context.params; // ✅ Await the params
//   try {
//     const result = await deleteCashbookEntry(id);
//     return NextResponse.json(result);
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 400 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import * as CashbookController from "@/controllers/cashbookController";
import { asyncHandler } from "@/lib/asyncHandler";

// ✅ Update entry by ID
export const PUT = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const user =await authMiddleware(req);
    if (user instanceof NextResponse) return user;

    const { id } = params;
    const body = await req.json();

    // ✅ fix argument order
    const entry = await CashbookController.updateCashbookEntry(user, id, body);
    if (!entry)
      return NextResponse.json(
        { success: false, error: "Entry not found or forbidden" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, entry });
  }
);

// ✅ Delete entry by ID
export const DELETE = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const user =await authMiddleware(req);
    if (user instanceof NextResponse) return user;

    const { id } = params;

    // ✅ fix argument order
    const entry = await CashbookController.deleteCashbookEntry(user, id);
    if (!entry)
      return NextResponse.json(
        { success: false, error: "Entry not found or forbidden" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: "Entry deleted successfully",
    });
  }
);
