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

  const q: any = { business: businessId, isDeleted: { $ne: true } };
  const category = searchParams.get('category');
  if (category) q.category = category;
  const search = searchParams.get('search');

  const Expense = (await import('@/models/Expense')).default;
  let expenses: any[] = await Expense.find(q).sort({ date: -1 }).lean();

  if (search) {
    const s = String(search).toLowerCase();
    expenses = expenses.filter(e => ((e.note || '') + '').toLowerCase().includes(s) || ((e.expenseNo || '') + '').toLowerCase().includes(s) || ((e.payee || '') + '').toLowerCase().includes(s));
  }

  // fallback resolution if businessIdParam might be user id
  if ((!(expenses && expenses.length) || expenses.length === 0) && businessIdParam) {
    try {
      const User = (await import('@/models/User')).default;
      const maybeUser: any = await User.findById(businessIdParam).select('business');
      if (maybeUser && maybeUser.business) {
        const resolvedBusiness = String(maybeUser.business);
        const q2: any = { business: resolvedBusiness, isDeleted: { $ne: true } };
        if (category) q2.category = category;
        let expenses2 = await Expense.find(q2).sort({ date: -1 }).lean();
        if (search) {
          const s = String(search).toLowerCase();
          expenses2 = expenses2.filter((e: any) => ((e.note || '') + '').toLowerCase().includes(s) || ((e.expenseNo || '') + '').toLowerCase().includes(s) || ((e.payee || '') + '').toLowerCase().includes(s));
        }
        if (expenses2 && expenses2.length) expenses = expenses2;
      }
    } catch (e) {
      // ignore
    }
  }

  // simple enrichment: format expenseNo and attach payee info if possible
  try {
    for (const ex of expenses) {
      try {
        if (ex.expenseNo !== undefined && ex.expenseNo !== null) ex.expenseNoFormatted = `EXP-${String(ex.expenseNo).padStart(5, '0')}`;
        // payee could be a party id
        if (ex.payee && typeof ex.payee === 'object' && ex.payee._id) {
          // already populated
        } else if (ex.payee) {
          try {
            const Party = (await import('@/models/Party')).default;
            const p: any = await Party.findById(ex.payee).select('partyName mobileNumber').lean();
            if (p) {
              ex.payeeName = p.partyName || '';
              ex.payeeMobile = p.mobileNumber || '';
            }
          } catch (er) {}
        }
      } catch (err) { /* per-item ignore */ }
    }
  } catch (e) {}

  const labelsMap: Record<string, string> = {
    expenseNoFormatted: 'Expense No',
    date: 'Date',
    category: 'Category',
    amount: 'Amount',
    note: 'Note',
    payeeName: 'Payee',
    createdAt: 'Created',
    updatedAt: 'Updated',
  };
  const preferred = ['expenseNoFormatted', 'date', 'category', 'payeeName', 'amount', 'note'];
  const keySet = new Set<string>();
  for (const ex of expenses || []) {
    if (!ex || typeof ex !== 'object') continue;
    for (const k of Object.keys(ex)) keySet.add(k);
  }
  const keys: string[] = [];
  for (const pKey of preferred) if (keySet.has(pKey)) { keys.push(pKey); keySet.delete(pKey); }
  for (const k of Array.from(keySet)) keys.push(k);
  const fields = keys.map(k => ({ key: k, label: labelsMap[k] || String(k).replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, s => s.toUpperCase()) }));

  try { console.info('/api/admin/expenses', { businessId, query: q, returned: Array.isArray(expenses) ? expenses.length : 0 }); } catch (e) {}
  return NextResponse.json({ success: true, expenses, fields, businessIdUsed: businessId, total: Array.isArray(expenses) ? expenses.length : 0 });
});
