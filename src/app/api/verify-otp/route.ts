import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import  User  from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  await connectDB();
  const { phone, otp } = await req.json();
  const user = await User.findOne({ phone });

  if (!user || user.otp !== otp || Date.now() > user.otpExpiresAt) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

  // Create a response and set the cookie on it
  const response = NextResponse.json({ success: true });
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return response;
}
