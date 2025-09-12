import { NextRequest, NextResponse } from 'next/server';
import { deleteTransaction, updateTransaction } from '@/controllers/transactionController';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await deleteTransaction(params.id);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const result = await updateTransaction(params.id, body);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
