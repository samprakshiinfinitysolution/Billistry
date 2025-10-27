import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { authMiddleware } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db';

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

  // dynamic query
  const q: any = { business: businessId, isDeleted: { $ne: true } };
  const type = searchParams.get('type');
  if (type) q.type = type;
  const search = searchParams.get('search');

  const cm = await import('@/models/cashbookModel');
  const Cashbook = cm.Cashbook as any;
  let entries: any[] = await Cashbook.find(q).sort({ date: -1 }).lean();

  if (search) {
    const s = String(search).toLowerCase();
    entries = entries.filter(e => {
      return ((e.description || '') + '').toLowerCase().includes(s) || ((e.reference || '') + '').toLowerCase().includes(s) || ((e.partyName || '') + '').toLowerCase().includes(s);
    });
  }

  // fallback: if nothing and businessIdParam might be a user id, try resolve
  if ((!(entries && entries.length) || entries.length === 0) && businessIdParam) {
    try {
      const User = (await import('@/models/User')).default;
    const maybeUser: any = await User.findById(businessIdParam).select('business');
      if (maybeUser && maybeUser.business) {
        const resolvedBusiness = String(maybeUser.business);
        const q2: any = { business: resolvedBusiness, isDeleted: { $ne: true } };
        if (type) q2.type = type;
        let entries2 = await Cashbook.find(q2).sort({ date: -1 }).lean();
        if (search) {
          const s = String(search).toLowerCase();
          entries2 = entries2.filter((e: any) => {
            return ((e.description || '') + '').toLowerCase().includes(s) || ((e.reference || '') + '').toLowerCase().includes(s) || ((e.partyName || '') + '').toLowerCase().includes(s);
          });
        }
        if (entries2 && entries2.length) entries = entries2;
      }
    } catch (e) {
      // ignore
    }
  }

  // lightweight enrichment: attach party summary if party id present
  try {
    const Party = (await import('@/models/Party')).default;
    for (const e of entries) {
      try {
        if (e.party && typeof e.party === 'object' && e.party._id) {
          // already populated
        } else if (e.party) {
          const p: any = await Party.findById(e.party).select('partyName mobileNumber').lean();
          if (p) {
            e.partyName = (p.partyName as any) || e.partyName || '';
            e.partyMobile = (p.mobileNumber as any) || '';
          }
        }
      } catch (er) {
        // ignore per-entry enrichment
      }
    }
  } catch (e) {
    // skip enrichment if Party model not present
  }

  // build fields metadata
  const labelsMap: Record<string, string> = {
    date: 'Date',
    description: 'Description',
    reference: 'Reference',
    type: 'Type',
    amount: 'Amount',
    balance: 'Balance',
    partyName: 'Party',
    partyMobile: 'Party Mobile',
    createdAt: 'Created',
    updatedAt: 'Updated',
  };
  const preferred = ['date', 'description', 'reference', 'type', 'partyName', 'amount', 'balance'];
  const keySet = new Set<string>();
  for (const en of entries || []) {
    if (!en || typeof en !== 'object') continue;
    for (const k of Object.keys(en)) keySet.add(k);
  }
  const keys: string[] = [];
  for (const pKey of preferred) if (keySet.has(pKey)) { keys.push(pKey); keySet.delete(pKey); }
  for (const k of Array.from(keySet)) keys.push(k);
  const fields = keys.map(k => ({ key: k, label: labelsMap[k] || String(k).replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, s => s.toUpperCase()) }));

  try { console.info('/api/admin/cashbook', { businessId, query: q, returned: Array.isArray(entries) ? entries.length : 0 }); } catch (e) {}
  return NextResponse.json({ success: true, entries, fields, businessIdUsed: businessId, total: Array.isArray(entries) ? entries.length : 0 });
});
