import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  await connectDB();
  const { phone, otp } = await req.json();
  const user = await User.findOne({ phone });

  if (!user || user.otp !== otp || Date.now() > user.otpExpiresAt) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

  // ✅ Correct usage
  cookies().set('token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return NextResponse.json({ success: true });
}
