import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { authMiddleware } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db';
import { getAllNewSales } from '@/controllers/newSaleController';
import mongoose from 'mongoose';

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
    console.warn('/api/admin/new_sale accessed in public mode (unauthenticated)');
  } else {
    user = authResult;
    if (user.role !== 'superadmin' && allowPublic(req)) {
      user = { userId: 'public', role: 'shopkeeper', businessId: businessIdParam || user.businessId } as any;
      console.warn('/api/admin/new_sale accessed in public mode (authenticated non-superadmin)');
    }
  }

  const businessId = user.role === 'superadmin' && businessIdParam ? businessIdParam : user.businessId;
  if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 });

  // construct synthetic user for controller
  const syntheticUser = { userId: user.userId, businessId, role: 'shopkeeper' } as any;
  let docs = await getAllNewSales(syntheticUser);
  // fallback: if docs empty and businessIdParam might be a user id, resolve user's business and try again
  if ((!docs || docs.length === 0) && businessIdParam) {
    try {
      const User = (await import('@/models/User')).default;
      const maybeUser = await User.findById(businessIdParam).select('business');
      if (maybeUser && maybeUser.business) {
        const altUser = { userId: user.userId, businessId: String(maybeUser.business), role: 'shopkeeper' } as any;
        const altDocs = await getAllNewSales(altUser);
        if (altDocs && altDocs.length > 0) docs = altDocs;
      }
    } catch (e) {
      console.warn('admin/new_sale: fallback user->business lookup failed', e);
    }
  }

  // Enrich sale items with product fields (lookup by productId or sku) so the client doesn't need to re-resolve
  try {
    if (docs && docs.length > 0) {
      const prodIdSet = new Set<string>();
      const skuSet = new Set<string>();
      for (const d of docs) {
        if (!d || !Array.isArray(d.items)) continue;
        for (const it of d.items) {
          if (!it) continue;
          const pid = it.productId || it.product || it.product_id || null;
          if (pid) prodIdSet.add(String(pid));
          const sku = it.sku || it.productSku || it.code || null;
          if (sku) skuSet.add(String(sku));
        }
      }

      if (prodIdSet.size || skuSet.size) {
        const Product = (await import('@/models/Product')).default;
        const orClauses: any[] = [];
        if (prodIdSet.size) {
          // only include valid ObjectId strings for _id match
          const ids = Array.from(prodIdSet).filter(id => mongoose.Types.ObjectId.isValid(id));
          if (ids.length) orClauses.push({ _id: { $in: ids } });
        }
        if (skuSet.size) orClauses.push({ sku: { $in: Array.from(skuSet) } });

  const query: any = { business: businessId };
        if (orClauses.length) query.$or = orClauses;

        const prods = await Product.find(query).lean();
        const byId = new Map(prods.map((p: any) => [String(p._id), p]));
        const bySku = new Map(prods.filter((p: any) => p.sku).map((p: any) => [String(p.sku), p]));

        for (const d of docs) {
          if (!d || !Array.isArray(d.items)) continue;
          d.items = d.items.map((it: any) => {
            if (!it) return it;
            const copy = { ...it };
            const pid = it.productId || it.product || it.product_id || null;
            const sku = it.sku || it.productSku || it.code || null;
            let matched: any = null;
            if (pid && byId.has(String(pid))) matched = byId.get(String(pid));
            else if (sku && bySku.has(String(sku))) matched = bySku.get(String(sku));

            if (matched) {
              // attach full product doc as _product and fill common fields if missing on item
              copy._product = matched;
              if (!copy.name) copy.name = matched.name || matched.productName || matched.title || copy.name;
              if (copy.rate == null) copy.rate = matched.price ?? matched.rate ?? matched.mrp ?? copy.rate;
              if (!copy.sku) copy.sku = matched.sku || copy.sku;
            }
            return copy;
          });
        }
      }
    }
  } catch (e) {
    console.warn('admin/new_sale: product enrichment failed', e);
  }

  // Build a fields array (key + label) to help dynamic frontends render columns without code changes
  try {
    const labelsMap: Record<string, string> = {
      invoiceNo: 'Invoice No',
      invoiceNumber: 'Invoice No',
      invoiceDate: 'Date',
      createdAt: 'Date',
      selectedParty: 'Party',
      partyName: 'Party',
      items: 'Items',
      paymentStatus: 'Payment Status',
      payment_status: 'Payment Status',
      totalAmount: 'Amount',
      invoiceAmount: 'Amount',
      amountReceived: 'Received',
      receivedAmount: 'Received',
      balanceAmount: 'Balance',
      balance: 'Balance',
      additionalCharges: 'Additional Charges'
    };

    const preferred = ['invoiceNo', 'invoiceNumber', 'invoiceDate', 'createdAt', 'selectedParty', 'partyName', 'items', 'paymentStatus', 'payment_status', 'totalAmount', 'invoiceAmount', 'amountReceived', 'receivedAmount', 'balanceAmount', 'balance', 'additionalCharges'];

    const keySet = new Set<string>();
    for (const d of docs || []) {
      if (!d || typeof d !== 'object') continue;
      for (const k of Object.keys(d)) {
        keySet.add(k);
      }
    }

    // create ordered list: preferred keys first, then others
    const keys: string[] = [];
    for (const p of preferred) if (keySet.has(p)) { keys.push(p); keySet.delete(p); }
    for (const k of Array.from(keySet)) keys.push(k);

    const fields = keys.map(k => ({ key: k, label: labelsMap[k] || String(k).replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, s => s.toUpperCase()) }));

    return NextResponse.json({ success: true, data: docs, fields });
  } catch (e) {
    // if anything goes wrong building fields, still return data
    return NextResponse.json({ success: true, data: docs });
  }
});
