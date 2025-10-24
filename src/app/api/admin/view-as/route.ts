import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { getDashboardData } from "@/controllers/dashboardController";

// Helper: determine if public view-as is allowed
function allowPublic(req: NextRequest) {
  try {
    if (process.env.ALLOW_PUBLIC_VIEW === "1") return true;
    if (process.env.NODE_ENV === "development") return true;
    if (req.nextUrl.searchParams.get("public") === "1") return true;
  } catch (e) {
    // ignore
  }
  return false;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const params = req.nextUrl.searchParams;
    const businessId = params.get("businessId") || undefined;
    const filter = (params.get("filter") as any) || "all";
    const start = params.get("start") || undefined;
    const end = params.get("end") || undefined;

    // Try to authenticate; if auth fails and public allowed, continue as public
    const authResult = await authMiddleware(req);
    let user: any = undefined;

    if (authResult instanceof NextResponse) {
      // Not authenticated
      if (!allowPublic(req)) return authResult;
      // allow public synthetic user
      user = { userId: "public", role: "shopkeeper" } as any;
      console.warn("/api/admin/view-as accessed in public mode (unauthenticated)");
    } else {
      // Authenticated user
      user = authResult;
      if (user.role !== "superadmin") {
        // If public viewing is allowed, let authenticated non-superadmin use public mode too
        if (!allowPublic(req)) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        user = { userId: "public", role: "shopkeeper" } as any;
        console.warn("/api/admin/view-as accessed in public mode (authenticated non-superadmin)");
      }
    }

    // If no businessId provided:
    // - if caller is DB superadmin => return global aggregates
    // - else if public viewing allowed => return global aggregates in public mode
    if (!businessId) {
      if (user.role === 'superadmin' || allowPublic(req)) {
        // synthetic superadmin to get global aggregation
        const syntheticUser = { userId: user.userId, role: 'superadmin' } as any;
        const data = await getDashboardData(filter, start, end, syntheticUser);
        return NextResponse.json({ success: true, data, public: authResult instanceof NextResponse });
      }
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    const syntheticUser = {
      userId: user.userId,
      businessId,
      role: "shopkeeper",
    } as any;

    const data = await getDashboardData(filter, start, end, syntheticUser);
    return NextResponse.json({ success: true, data, public: authResult instanceof NextResponse });
  } catch (err: any) {
    console.error('/api/admin/view-as GET error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await authMiddleware(req);
    if (user instanceof NextResponse) return user;

    // Only DB-verified superadmins allowed for POST
    if (user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const businessId = body.businessId as string | undefined;
    const filter = (body.filter as any) || "all";
    const start = body.start || undefined;
    const end = body.end || undefined;

    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

    // Construct a synthetic user payload scoped to the requested business
    const syntheticUser = {
      userId: user.userId,
      businessId,
      role: "shopkeeper",
    } as any;

    const data = await getDashboardData(filter, start, end, syntheticUser);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('/api/admin/view-as POST error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
