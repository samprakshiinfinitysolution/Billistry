import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { authMiddleware } from "@/lib/middleware/auth";

function allowPublic(req: NextRequest) {
  try {
    if (process.env.ALLOW_PUBLIC_VIEW === "1") return true;
    if (process.env.NODE_ENV === "development") return true;
  } catch (e) {}
  return false;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const role = url.searchParams.get('role');
    const profilePath = url.pathname.endsWith('/profile');

    const authResult = await authMiddleware(req);

    let auth: any = undefined;
    if (authResult instanceof NextResponse) {
      if (!allowPublic(req)) return authResult;
      // public/dev mode -> act as synthetic superadmin
      auth = { userId: 'public', role: 'superadmin', businessId: undefined };
      console.warn('/api/users accessed in public mode (development)');
    } else {
      auth = authResult;
    }

    // /api/users/profile -> return current user (requires real auth)
    if (profilePath || url.pathname.endsWith('/profile')) {
      if (auth.userId === 'public') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const me = await User.findById(auth.userId).select('-passwordHash -otp -otpExpiresAt').lean();
      if (!me) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ success: true, user: me });
    }

    // Listing: superadmin can list all users; others limited to their business
    const q: any = { isDeleted: { $ne: true } };
    if (role) q.role = role;

    if (auth.role !== 'superadmin') {
      if (auth.businessId) q.business = auth.businessId;
    }

    // populate business details to expose store name and logo/signature URLs
    const items = await User.find(q)
      .select('-passwordHash -otp -otpExpiresAt')
  .populate({ path: 'business', select: 'name phone email logoUrl signatureUrl address city state pincode website currency timezone businessTypes industryTypes registrationType gstNumber panNumber enableEInvoicing enableTds enableTcs' })
      .lean();

    // enrich each user with convenient fields the frontend expects
    const users = items.map((u: any) => {
      const business = u.business || null;
      return {
        ...u,
        businessName: business?.name || (u.businessName ?? null),
        avatar: u.avatar || business?.logoUrl || null,
        signature: u.signature || business?.signatureUrl || null,
        // business fields front-end expects
        businessTypes: business?.businessTypes || u.businessTypes || [],
        industryTypes: business?.industryTypes || u.industryTypes || [],
        registrationType: business?.registrationType || u.registrationType || null,
        gstNumber: business?.gstNumber || u.gstNumber || null,
        panNumber: business?.panNumber || u.panNumber || null,
  // mirror business email/phone under convenient top-level keys
  companyEmail: business?.email || u.companyEmail || u.email || null,
  companyPhone: business?.phone || u.companyPhone || u.phone || u.contact || null,
        billingAddress: business?.address || u.address || null,
        city: business?.city || u.city || null,
        state: business?.state || u.state || null,
        pincode: business?.pincode || u.pincode || null,
        enableEInvoicing: !!business?.enableEInvoicing || !!u.enableEInvoicing,
        enableTds: !!business?.enableTds || !!u.enableTds,
        enableTcs: !!business?.enableTcs || !!u.enableTcs,
        website: business?.website || u.website || null,
      };
    });

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error('/api/users GET error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
