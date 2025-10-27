import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLedger } from "@/controllers/ledgerController";
import { authMiddleware } from "@/lib/middleware/auth";
import { asyncHandler } from "@/lib/asyncHandler";

interface LedgerContext {
  params: {
    partyId: string;
  };
}
 
// Define a schema for validating the route parameters
const paramsSchema = z.object({
  partyId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Party ID"),
});
 
export const GET = asyncHandler(
  async (req: NextRequest, context: LedgerContext) => {
    // Authenticate the user
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) return user;
 
    // Validate the partyId from the URL
    const { partyId } = paramsSchema.parse(context.params);
 
    // Fetch the ledger data using the controller
    const ledgerData = await getLedger(partyId, user);
 
    return NextResponse.json(ledgerData);
  }
);