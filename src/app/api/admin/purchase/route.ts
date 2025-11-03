// Legacy admin/purchase route removed.
// WP-admin now uses /api/admin/new_purchase. This file is kept as a stub to avoid accidental usage.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: false, message: 'api/admin/purchase has been removed; use /api/admin/new_purchase' }, { status: 410 });
}
