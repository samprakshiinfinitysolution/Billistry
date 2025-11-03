import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { authMiddleware } from '@/lib/middleware/auth';
import { getProductsByBusiness } from '@/controllers/productController';
import { getAllProducts } from '@/controllers/productController';
import { connectDB } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import User from '@/models/User';

function allowPublic(req: NextRequest) {
  try {
    if (process.env.ALLOW_PUBLIC_VIEW === '1') return true;
    if (process.env.NODE_ENV === 'development') return true;
    if (req.nextUrl.searchParams.get('public') === '1') return true;
  } catch (e) {
    // ignore
  }
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
    // allow public synthetic user
    user = { userId: 'public', role: 'shopkeeper', businessId: businessIdParam || '' } as any;
    console.warn('/api/admin/products accessed in public mode (unauthenticated)');
  } else {
    user = authResult;
    // if authenticated non-superadmin requested public mode and it's allowed, we can fall back
    if (user.role !== 'superadmin' && allowPublic(req)) {
      user = { userId: 'public', role: 'shopkeeper', businessId: businessIdParam || user.businessId } as any;
      console.warn('/api/admin/products accessed in public mode (authenticated non-superadmin)');
    }
  }

  const businessId = user.role === 'superadmin' && businessIdParam ? businessIdParam : user.businessId;
  const allFlag = searchParams.get('all') === '1' || searchParams.get('all') === 'true';

  // If all=1 requested, allow only DB-verified superadmins
  if (allFlag) {
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden: superadmin required for all businesses' }, { status: 403 });
    }
    const page = Math.max(1, parseInt(String(searchParams.get('page') || '1'), 10));
    const limit = Math.min(200, Math.max(1, parseInt(String(searchParams.get('limit') || '50'), 10)));
    // record audit log (best-effort)
    try {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
      await createAuditLog({ user: user.userId, action: 'admin:products:query-all', ip, after: { page, limit } as any });
    } catch (e) {
      console.warn('failed to create audit log for aggregated products', e);
    }

    const result = await getAllProducts(page, limit);
    return NextResponse.json({ success: true, ...result });
  }

  if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 });

  const products = await getProductsByBusiness(businessId);
  // If no products found and the incoming businessIdParam might be a user id,
  // try to resolve the user's business and query again.
  if ((!products || products.length === 0) && businessIdParam) {
    try {
      const maybeUser = await User.findById(businessIdParam).select('business');
      if (maybeUser && maybeUser.business) {
        const altProducts = await getProductsByBusiness(String(maybeUser.business));
        if (altProducts && altProducts.length > 0) {
          return NextResponse.json({ success: true, products: altProducts });
        }
      }
    } catch (e) {
      // ignore and return original empty list
      console.warn('admin/products: fallback user->business lookup failed', e);
    }
  }

  return NextResponse.json({ success: true, products });
});
