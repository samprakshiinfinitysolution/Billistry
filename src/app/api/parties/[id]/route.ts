import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authMiddleware } from "@/lib/middleware/auth";
import * as PartyController from "@/controllers/partyController";
import { asyncHandler } from "@/lib/asyncHandler";

interface RouteParams {
  params: {
    id: string;
  };
}

const paramsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Party ID"),
});

// GET a single party
export const GET = asyncHandler(async (req: NextRequest, { params }: RouteParams) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { id } = paramsSchema.parse(params);
  const partyData = await PartyController.getPartyById(id, user);
  if (!partyData) {
    return NextResponse.json({ success: false, message: "Party not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, ...partyData });
});

// UPDATE a party
export const PUT = asyncHandler(async (req: NextRequest, { params }: RouteParams) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { id } = paramsSchema.parse(params);
  const body = await req.json();
  const updatedParty = await PartyController.updateParty(id, body, user);
  return NextResponse.json({ success: true, party: updatedParty });
});

// DELETE a party
export const DELETE = asyncHandler(async (req: NextRequest, { params }: RouteParams) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { id } = paramsSchema.parse(params);
  await PartyController.deleteParty(id, user);
  return NextResponse.json({ success: true, message: "Party deleted successfully" });
});
