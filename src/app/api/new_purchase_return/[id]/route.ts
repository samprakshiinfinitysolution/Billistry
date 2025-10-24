import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { authMiddleware } from '@/lib/middleware/auth';
import { getNewPurchaseReturnById } from '@/controllers/newPurchaseReturnController';
import { updateNewPurchaseReturn, deleteNewPurchaseReturn } from '@/controllers/newPurchaseReturnController';

export const GET = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;
  const doc = await getNewPurchaseReturnById(params.id, user);
  return NextResponse.json({ success: true, data: doc }, { status: 200 });
});

export const PUT = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;
  const body = await req.json();
  const doc = await updateNewPurchaseReturn(params.id, body, user);
  return NextResponse.json({ success: true, data: doc, message: 'Updated' }, { status: 200 });
});

export const DELETE = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;
  const res = await deleteNewPurchaseReturn(params.id, user);
  return NextResponse.json({ success: true, data: res, message: 'Deleted' }, { status: 200 });
});
