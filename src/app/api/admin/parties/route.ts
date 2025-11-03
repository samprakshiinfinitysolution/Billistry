import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { authMiddleware } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db';
import Party from '@/models/Party';

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
  const { searchParams } = new URL(req.url);
  const businessIdParam = searchParams.get('businessId');

  let user: any;
  if (authResult instanceof NextResponse) {
    if (!allowPublic(req)) return authResult;
    user = { userId: 'public', role: 'shopkeeper', businessId: businessIdParam || '' } as any;
  } else {
    user = authResult;
    if (user.role !== 'superadmin' && allowPublic(req)) {
      user = { userId: 'public', role: 'shopkeeper', businessId: businessIdParam || user.businessId } as any;
    }
  }

  const businessId = user.role === 'superadmin' && businessIdParam ? businessIdParam : user.businessId;
  if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 });

  // query parties for business
  const q: any = { business: businessId, isDeleted: { $ne: true } };
  // optional type filter
  const type = searchParams.get('type');
  if (type) q.partyType = type;
  // optional search term
  const search = searchParams.get('search');
  let parties = await Party.find(q).lean();
  // in-memory search fallback
  if (search) {
    const s = String(search).toLowerCase();
    parties = parties.filter((p: any) => ((p.partyName || '') + '').toLowerCase().includes(s) || ((p.mobileNumber || '') + '').includes(s));
  }

  // fallback: if no parties and businessIdParam might be a user id, try resolve user's business
  if ((!(parties && parties.length) || parties.length === 0) && businessIdParam) {
    try {
      const User = (await import('@/models/User')).default;
      const maybeUser = await User.findById(businessIdParam).select('business');
      if (maybeUser && maybeUser.business) {
        const resolvedBusiness = String(maybeUser.business);
        // re-run query
        const q2: any = { business: resolvedBusiness, isDeleted: { $ne: true } };
        if (type) q2.partyType = type;
        let parties2 = await Party.find(q2).lean();
        if (search) {
          const s = String(search).toLowerCase();
          parties2 = parties2.filter((p: any) => ((p.partyName || '') + '').toLowerCase().includes(s) || ((p.mobileNumber || '') + '').includes(s));
        }
        if (parties2 && parties2.length) {
          parties = parties2;
          // update businessId to resolved for logging
          // eslint-disable-next-line no-param-reassign
          // (not reassigning request param, just for debug)
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // lightweight enrichment: transactions count and last transaction updatedAt
  try {
    const NewSale = (await import('@/models/NewSale')).default;
    const NewPurchase = (await import('@/models/NewPurchase')).default;
    for (const p of parties) {
      try {
        const pid = p._id;
        const [saleCount, purchaseCount] = await Promise.all([
          NewSale.countDocuments({ business: businessId, selectedParty: pid }),
          NewPurchase.countDocuments({ business: businessId, selectedParty: pid }),
        ]);
        p.transactionsCount = (saleCount || 0) + (purchaseCount || 0);
        p.lastTransaction = p.updatedAt || p.createdAt || null;
      } catch (e) {
        // ignore per-party enrichment failures
        p.transactionsCount = p.transactionsCount || 0;
        p.lastTransaction = p.lastTransaction || (p.updatedAt || p.createdAt || null);
      }
    }
  } catch (e) {
    // if models not available or query fails, skip enrichment
    console.warn('admin/parties: enrichment skipped', e);
  }

  // build fields metadata to help dynamic frontends
  const labelsMap: Record<string, string> = {
    partyName: 'Name',
    mobileNumber: 'Mobile',
    partyType: 'Type',
    balance: 'Balance',
    transactionsCount: 'Txns',
    lastTransaction: 'Last Updated',
    createdAt: 'Created',
    updatedAt: 'Updated',
  };
  const preferred = ['partyName', 'mobileNumber', 'partyType', 'balance', 'transactionsCount', 'lastTransaction', 'createdAt'];
  const keySet = new Set<string>();
  for (const pt of parties || []) {
    if (!pt || typeof pt !== 'object') continue;
    for (const k of Object.keys(pt)) keySet.add(k);
  }
  const keys: string[] = [];
  for (const pKey of preferred) if (keySet.has(pKey)) { keys.push(pKey); keySet.delete(pKey); }
  for (const k of Array.from(keySet)) keys.push(k);
  const fields = keys.map(k => ({ key: k, label: labelsMap[k] || String(k).replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, s => s.toUpperCase()) }));
  // debug log to help troubleshooting empty results in admin UI
  try {
    console.info('/api/admin/parties', { businessId, query: q, returned: Array.isArray(parties) ? parties.length : 0 });
  } catch (e) {}

  return NextResponse.json({ success: true, parties, fields, businessIdUsed: businessId, total: Array.isArray(parties) ? parties.length : 0 });
});
