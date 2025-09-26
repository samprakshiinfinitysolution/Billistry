import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { signSession } from '@/lib/auth';
import { setSessionCookie } from '@/lib/cookies';

export async function POST(req: Request) {
  await connectDB();
  const { identifier } = await req.json();
  const user = await User.findOne({ $or: [{ phone: identifier }, { email: identifier }] });
  if (!user || !user.isActive) return NextResponse.json({ error: 'invalid user' }, { status: 401 });

  const token = signSession({
    sub: String(user._id),
    role: user.role,
    perms: user.permissions as any,
    name: user.name,
    phone: user.phone,
    email: user.email,
  });
  setSessionCookie(token);
  return NextResponse.json({ ok: true, role: user.role });
}
