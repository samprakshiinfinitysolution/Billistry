// app/add-party/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import * as PartyController from "@/controllers/partyController";
import { asyncHandler } from "@/lib/asyncHandler";

// GET all parties (optional type filter: ?type=Customer|Supplier)
export const GET = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const url = new URL(req.url);
  const typeParam = url.searchParams.get("type");

  let type: "Customer" | "Supplier" | undefined = undefined;

  if (typeParam) {
    if (typeParam !== "Customer" && typeParam !== "Supplier") {
      return NextResponse.json({ success: false, message: "Invalid party type specified. Must be 'Customer' or 'Supplier'." }, { status: 400 });
    }
    type = typeParam;
  }

  const parties = await PartyController.getParties(user, type);
  return NextResponse.json({ success: true, parties });
});

// POST: create new party
export const POST = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const party = await PartyController.createParty(body, user);

  return NextResponse.json({ success: true, party }, { status: 201 });
});
