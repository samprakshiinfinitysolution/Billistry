import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authMiddleware } from "@/lib/middleware/auth";
import { asyncHandler } from "@/lib/asyncHandler";
import {
  updateTransaction,
  deleteTransaction,
} from "@/controllers/transactionController";

interface RouteContext {
  params: {
    id: string;
  };
}

const paramsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Transaction ID"),
});

const updateTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
  type: z.enum(["You Gave", "You Got"]).optional(),
  description: z.string().optional(),
  date: z.string().datetime({ offset: true }).optional(),
});

export const PUT = asyncHandler(async (req: NextRequest, { params }: RouteContext) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { id } = paramsSchema.parse(params);
  const body = await req.json();
  const validatedData = updateTransactionSchema.parse(body);

  const updatedTransaction = await updateTransaction(id, validatedData, user);

  return NextResponse.json({
    success: true,
    transaction: updatedTransaction,
  });
});

export const DELETE = asyncHandler(async (req: NextRequest, { params }: RouteContext) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const { id } = paramsSchema.parse(params);

  await deleteTransaction(id, user);

  return NextResponse.json({
    success: true,
    message: "Transaction deleted successfully",
  });
});
