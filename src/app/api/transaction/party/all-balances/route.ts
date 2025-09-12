import { NextRequest, NextResponse } from 'next/server';
import { getAllPartyBalance } from '@/controllers/transactionController';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') as 'Supplier' | 'Customer' | undefined;

  try {
    const result = await getAllPartyBalance(type);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
