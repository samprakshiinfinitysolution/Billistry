import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { authMiddleware } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db';
import { getAllNewPurchaseReturns } from '@/controllers/newPurchaseReturnController';

function allowPublic(req: NextRequest) {
  try {
    if (process.env.ALLOW_PUBLIC_VIEW === '1') return true;
    if (process.env.NODE_ENV === 'development') return true;
    if (req.nextUrl.searchParams.get('public') === '1') return true;
  } catch (e) {}
  return false;
}

export const GET = asyncHandler(async (req: NextRequest) => {
  await connectDB();
  const authResult = await authMiddleware(req);
  let user: any;
  const { searchParams } = new URL(req.url);
  const businessIdParam = searchParams.get('businessId');

  if (authResult instanceof NextResponse) {
    if (!allowPublic(req)) return authResult;
    user = { userId: 'public', role: 'shopkeeper', businessId: businessIdParam || '' } as any;
    console.warn('/api/admin/new_purchase_return accessed in public mode (unauthenticated)');
  } else {
    user = authResult;
    if (user.role !== 'superadmin' && allowPublic(req)) {
      user = { userId: 'public', role: 'shopkeeper', businessId: businessIdParam || user.businessId } as any;
      console.warn('/api/admin/new_purchase_return accessed in public mode (authenticated non-superadmin)');
    }
  }

  const businessId = user.role === 'superadmin' && businessIdParam ? businessIdParam : user.businessId;
  if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 });

  const syntheticUser = { userId: user.userId, businessId, role: 'shopkeeper' } as any;
  let docs = await getAllNewPurchaseReturns(syntheticUser);
  if ((!docs || docs.length === 0) && businessIdParam) {
    try {
      const User = (await import('@/models/User')).default;
      const maybeUser = await User.findById(businessIdParam).select('business');
      if (maybeUser && maybeUser.business) {
        const altUser = { userId: user.userId, businessId: String(maybeUser.business), role: 'shopkeeper' } as any;
        const altDocs = await getAllNewPurchaseReturns(altUser);
        if (altDocs && altDocs.length > 0) docs = altDocs;
      }
    } catch (e) {
      console.warn('admin/new_purchase_return: fallback user->business lookup failed', e);
    }
  }

  return NextResponse.json({ success: true, data: docs });
});
