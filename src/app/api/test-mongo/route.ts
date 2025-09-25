import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db'; // adjust the path if needed

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: 'success', message: 'MongoDB Connected!' });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json({ status: 'fail', message: 'Connection failed', error }, { status: 500 });
  }
}
