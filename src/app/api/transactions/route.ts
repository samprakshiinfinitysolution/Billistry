import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authMiddleware } from "@/lib/middleware/auth";
import { asyncHandler } from "@/lib/asyncHandler";
import {
  createTransaction,
  getTransactions,
} from "@/controllers/transactionController";

const transactionSchema = z.object({
  partyId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Party ID"),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["You Gave", "You Got"]),
  description: z.string().optional(),
});

export const GET = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const filters = {
    partyId: searchParams.get("partyId") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
  };

  const transactions = await getTransactions(user, filters);
  return NextResponse.json({ success: true, transactions });
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const validatedData = transactionSchema.parse(body);

  const newTransaction = await createTransaction(validatedData, user);

  return NextResponse.json(
    {
      success: true,
      transaction: newTransaction,
    },
    { status: 201 }
  );
});
