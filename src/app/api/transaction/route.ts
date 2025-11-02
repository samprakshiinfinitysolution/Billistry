import { NextRequest, NextResponse } from 'next/server';
import {
  createTransaction,
  getAllTransactions,
} from '@/controllers/transactionController';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const txn = await createTransaction(body);
    return NextResponse.json(txn, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = Object.fromEntries(searchParams.entries());
    const txns = await getAllTransactions(filters);
    return NextResponse.json(txns, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
