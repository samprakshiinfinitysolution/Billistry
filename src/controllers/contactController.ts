import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Contact } from '@/models/contactModel';

export async function submitContact(req: NextRequest) {
  await connectDB();
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !message) {
      return NextResponse.json({ success: false, error: 'Name and message are required' }, { status: 400 });
    }

    const saved = await Contact.create({ name, email, subject, message });
    return NextResponse.json({ success: true, contact: saved }, { status: 201 });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
