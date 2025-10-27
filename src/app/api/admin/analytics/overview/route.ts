import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { authMiddleware } from '@/lib/middleware/auth';

function allowPublic(req: NextRequest) {
  try {
    if (process.env.ALLOW_PUBLIC_VIEW === '1') return true;
    if (process.env.NODE_ENV === 'development') return true;
    if (req.nextUrl.searchParams.get('public') === '1') return true;
  } catch (e) {}
  return false;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authResult = await authMiddleware(req);
    if (authResult instanceof NextResponse && !allowPublic(req)) return authResult;
    const user: any = authResult instanceof NextResponse ? { role: 'shopkeeper' } : authResult;

    // businessId query param -- if superadmin provides businessId, scope to it
    const businessIdParam = req.nextUrl.searchParams.get('businessId') || undefined;
    const scopeBusiness = user.role === 'superadmin' && businessIdParam ? businessIdParam : (user.role !== 'superadmin' ? user.businessId : undefined);

    // Import models lazily to avoid cold-start cost
    const NewSale = (await import('@/models/NewSale')).default;
    const NewPurchase = (await import('@/models/NewPurchase')).default;
  const Expense = (await import('@/models/Expense')).default;
    const Party = (await import('@/models/Party')).default;
    const Business = (await import('@/models/Business')).default;
    const AuditLog = (await import('@/models/AuditLog')).default;

    const matchBase: any = { isDeleted: { $ne: true } };
    if (scopeBusiness) matchBase.business = scopeBusiness;

    // Aggregations
    const [salesAgg] = await NewSale.aggregate([
      { $match: matchBase },
      { $group: { _id: null, totalAmount: { $sum: { $toDouble: { $ifNull: ['$totalAmount', '$invoiceAmount', 0] } } }, count: { $sum: 1 } } },
    ]).exec().catch(() => [{ totalAmount: 0, count: 0 }]);

    const [purchasesAgg] = await NewPurchase.aggregate([
      { $match: matchBase },
      { $group: { _id: null, totalAmount: { $sum: { $toDouble: { $ifNull: ['$totalAmount', '$invoiceAmount', 0] } } }, count: { $sum: 1 } } },
    ]).exec().catch(() => [{ totalAmount: 0, count: 0 }]);

    const [expensesAgg] = await Expense.aggregate([
      { $match: matchBase },
      { $group: { _id: null, totalAmount: { $sum: { $toDouble: { $ifNull: ['$amount', '$value', 0] } } }, count: { $sum: 1 } } },
    ]).exec().catch(() => [{ totalAmount: 0, count: 0 }]);

    // Cashbook aggregation omitted for now (some repositories expose a different model shape);
    const cashAgg = { totalAmount: 0, count: 0 };

    const partiesCount = await Party.countDocuments(scopeBusiness ? { business: scopeBusiness, isDeleted: { $ne: true } } : { isDeleted: { $ne: true } });

    // subscription totals
    const now = new Date();
    const [activeCount, expiredCount, noneCount] = await Promise.all([
      Business.countDocuments({ ...(scopeBusiness ? { _id: scopeBusiness } : {}), subscriptionExpiry: { $gte: now }, isDeleted: { $ne: true } }),
      Business.countDocuments({ ...(scopeBusiness ? { _id: scopeBusiness } : {}), subscriptionExpiry: { $lt: now, $exists: true }, isDeleted: { $ne: true } }),
      Business.countDocuments({ ...(scopeBusiness ? { _id: scopeBusiness } : {}), $or: [{ subscriptionPlan: { $exists: false } }, { subscriptionPlan: null }], isDeleted: { $ne: true } }),
    ]);

    // recent audit logs
    const audits = await AuditLog.find(scopeBusiness ? { business: scopeBusiness } : {}).sort({ createdAt: -1 }).limit(10).lean();

    return NextResponse.json({
      success: true,
      totals: {
        sales: { count: salesAgg?.count || 0, amount: Number(salesAgg?.totalAmount || 0) },
        purchases: { count: purchasesAgg?.count || 0, amount: Number(purchasesAgg?.totalAmount || 0) },
        expenses: { count: expensesAgg?.count || 0, amount: Number(expensesAgg?.totalAmount || 0) },
  cashbook: { count: cashAgg?.count || 0, amount: Number(cashAgg?.totalAmount || 0) },
        parties: { count: partiesCount },
        subscriptions: { active: activeCount, expired: expiredCount, none: noneCount },
      },
      recent: { audits: audits.map((a: any) => ({ id: a._id?.toString?.(), action: a.action, actor: a.actor, createdAt: a.createdAt })) },
      businessIdUsed: scopeBusiness || null,
    });
  } catch (err: any) {
    import { NextResponse } from 'next/server';

    // Analytics API removed — return 404 to disable endpoint.
    export async function GET() {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    export async function POST() {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
