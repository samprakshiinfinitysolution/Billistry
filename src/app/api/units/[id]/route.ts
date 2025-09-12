import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Unit } from '@/models/unit';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();

  const deleted = await Unit.findByIdAndDelete(params.id);
  return NextResponse.json({ success: !!deleted });
}
