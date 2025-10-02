import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { authMiddleware } from '@/lib/middleware/auth';
import { getNextPurchaseReturnInvoicePreview } from '@/controllers/newPurchaseReturnController';

export const GET = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;
  const preview = await getNextPurchaseReturnInvoicePreview(user);
  return NextResponse.json({ success: true, data: preview }, { status: 200 });
});