import { NextResponse } from 'next/server';
import { Invoice } from '@/models/invoiceModel'; // Adjust the import path as necessary

export async function GET() {
  try {
    const sales = await Invoice.find({ type: 'sale' }).populate('party').sort({ date: -1 }).lean();
    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error: String(error) }, { status: 500 });
  }
}
