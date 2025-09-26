import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { strongPassword } from '@/lib/validators';

export async function POST(req: Request) {
  await connectDB();
  const { identifier, password } = await req.json();
  if (!identifier || !password) return NextResponse.json({ error: 'identifier & password required' }, { status: 400 });
  if (!strongPassword(password)) return NextResponse.json({ error: 'weak password' }, { status: 400 });

  const user = await User.findOne({ $or: [{ phone: identifier }, { email: identifier }] });
  if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

  user.passwordHash = await hashPassword(password);
  await user.save();

  return NextResponse.json({ ok: true });
}
