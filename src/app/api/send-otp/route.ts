import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import {User} from '@/models/User';
import { generateOtp, sendOtp } from '@/utils/otp';

export async function POST(req: NextRequest) {
  await connectDB();
  const { phone, name } = await req.json();
  if (!phone || !name) return NextResponse.json({ error: 'Phone and Name required' }, { status: 400 });

  const otp = generateOtp();
  const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes

  await User.findOneAndUpdate(
    { phone },
    { phone, name, otp, otpExpiresAt: expiresAt },
    { upsert: true, new: true }
  );

  await sendOtp(phone, otp); // mock or implement real SMS

  return NextResponse.json({ success: true });
}
