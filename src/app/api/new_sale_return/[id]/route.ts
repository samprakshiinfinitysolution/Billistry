import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { authMiddleware } from '@/lib/middleware/auth';
import { getNewSaleReturnById } from '@/controllers/newSaleReturnController';
import { updateNewSaleReturn, deleteNewSaleReturn } from '@/controllers/newSaleReturnController';

export const GET = asyncHandler(async (req: NextRequest, context?: any) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const params = await context?.params;
  const id = params?.id as string;
  const doc = await getNewSaleReturnById(id, user);
  return NextResponse.json({ success: true, data: doc }, { status: 200 });
});

export const PUT = asyncHandler(async (req: NextRequest, context?: any) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const params = await context?.params;
  const id = params?.id as string;
  const body = await req.json();
  const updated = await updateNewSaleReturn(id, body, user);
  return NextResponse.json({ success: true, data: updated, message: 'Updated' }, { status: 200 });
});

export const DELETE = asyncHandler(async (req: NextRequest, context?: any) => {
  const user = await authMiddleware(req);
  if (user instanceof NextResponse) return user;

  const params = await context?.params;
  const id = params?.id as string;
  const res = await deleteNewSaleReturn(id, user);
  return NextResponse.json({ success: true, data: res, message: 'Deleted' }, { status: 200 });
});
