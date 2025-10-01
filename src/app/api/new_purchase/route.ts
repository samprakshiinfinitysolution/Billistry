import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { authMiddleware } from '@/lib/middleware/auth';
import { createNewPurchase, getAllNewPurchases } from '@/controllers/newPurchaseController';

export const GET = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;
  const url = new URL(req.url);
  const includeDeleted = url.searchParams.get('includeDeleted') === 'true';
  const docs = await getAllNewPurchases(user, { includeDeleted });
  return NextResponse.json({ success: true, data: docs }, { status: 200 });
});

export const POST = asyncHandler(async (req: NextRequest) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;
  const body = await req.json();
  const doc = await createNewPurchase(body, user);
  return NextResponse.json({ success: true, data: doc, message: 'Created' }, { status: 201 });
});
