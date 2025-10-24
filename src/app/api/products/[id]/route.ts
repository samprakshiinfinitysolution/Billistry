import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { authMiddleware } from '@/lib/middleware/auth';

async function findProduct(id: string, businessId?: string, lean = true) {
  const q: any = { _id: id };
  if (businessId) q.business = businessId;
  const base = Product.findOne(q).select('-__v');
  if (lean) return await base.lean();
  return await base;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const auth = await authMiddleware(req, ['superadmin', 'shopkeeper']);
    if (auth instanceof NextResponse) return auth;

    const scopeBusinessId = auth.role === 'superadmin' ? undefined : auth.businessId;
    const p = await findProduct(params.id, scopeBusinessId, true);
    if (!p) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, product: p });
  } catch (err: any) {
    console.error('Product GET error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const auth = await authMiddleware(req, ['superadmin', 'shopkeeper']);
    if (auth instanceof NextResponse) return auth;

    const productDoc: any = await findProduct(params.id, auth.businessId, false);
    if (!productDoc) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    const body = await req.json();
    Object.keys(body).forEach(k => { (productDoc as any)[k] = (body as any)[k]; });
    (productDoc as any).updatedBy = auth.userId;
    await (productDoc as any).save();

    return NextResponse.json({ success: true, product: productDoc });
  } catch (err: any) {
    console.error('Product PUT error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const auth = await authMiddleware(req, ['superadmin', 'shopkeeper']);
    if (auth instanceof NextResponse) return auth;

    const productDoc: any = await findProduct(params.id, auth.businessId, false);
    if (!productDoc) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    (productDoc as any).isActive = false;
    (productDoc as any).updatedBy = auth.userId;
    await (productDoc as any).save();

    return NextResponse.json({ success: true, message: 'Product deactivated' });
  } catch (err: any) {
    console.error('Product DELETE error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
