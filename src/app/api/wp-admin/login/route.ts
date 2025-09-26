import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { AdminUser } from '@/models/adminuser';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();

  const user = await AdminUser.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken({ email: user.email });

  const res = NextResponse.json({ success: true });
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });

  return res;
}
