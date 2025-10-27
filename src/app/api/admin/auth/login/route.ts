import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in your environment variables');
}

const key = new TextEncoder().encode(JWT_SECRET);

export async function POST(request: Request) {
  try {
    // 1. Connect to the database
    await connectDB();

    // 2. Get credentials from the request body
    const { email, password } = await request.json();

    // 3. Find the active superadmin user
    const user = await User.findOne({ email, role: 'superadmin', isActive: true });
    if (!user) {
      return NextResponse.json({ error: 'Admin not found or not active' }, { status: 401 });
    }

    // 4. Verify the password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 5. Create the JWT token
    const token = await new SignJWT({ id: user._id.toString(), email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h') // Token is valid for 2 hours
      .sign(key);

    // 6. Set the token in a secure, httpOnly cookie
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 2 * 60 * 60, // 2 hours in seconds
    });

    return NextResponse.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
