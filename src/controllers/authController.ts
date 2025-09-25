import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '@/models/User';
import { connectDB } from '@/lib/db';

export const registerUser = async (req: NextRequest) => {
  await connectDB();
  const { name, email, phone, password } = await req.json();

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, password: hashedPassword });

  return NextResponse.json({ message: 'User registered', user });
};

export const loginUser = async (req: NextRequest) => {
  await connectDB();
  const { emailOrPhone, password } = await req.json();

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Simulate token creation or session logic
  return NextResponse.json({ message: 'Login successful', user });
};

export const logoutUser = async () => {
  // Session/token invalidation logic (optional)
  return NextResponse.json({ message: 'Logout successful' });
};

export const verifyOtp = async (req: NextRequest) => {
  await connectDB();
  const { phone, otp } = await req.json();
  const user = await User.findOne({ phone });

  if (!user || user.otp !== otp) {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
  }

  return NextResponse.json({ message: 'OTP Verified', user });
};
