import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { authMiddleware } from '@/lib/middleware/auth';

// GET /api/users/products?businessId=...&q=search
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await authMiddleware(req, ['superadmin', 'shopkeeper', 'staff']);
    if (currentUser instanceof NextResponse) return currentUser;

    const url = new URL(req.url);
    const businessId = url.searchParams.get('businessId') || (currentUser.role === 'superadmin' ? undefined : currentUser.businessId);
    if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 });

    const q: any = { business: businessId, isActive: { $ne: false } };
    const search = url.searchParams.get('q');
    if (search) q.$or = [{ name: new RegExp(search, 'i') }, { sku: new RegExp(search, 'i') }, { barcode: new RegExp(search, 'i') }];

    const items = await Product.find(q).select('name sku barcode category sellingPrice currentStock unit hsnCode').lean();
    return NextResponse.json({ success: true, products: items });
  } catch (err: any) {
    console.error('/api/users/products error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
