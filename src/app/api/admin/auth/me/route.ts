import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in your environment variables');
}

const key = new TextEncoder().encode(JWT_SECRET);

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token.value, key, {
      algorithms: ['HS256'],
    });

    // Token is valid, now let's fetch the user to ensure they still exist
    await connectDB();
    const user = await User.findById(payload.id).select('name email role');

    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized: Invalid user' }, { status: 401 });
    }

    // Return user data from the database
    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    // This will catch errors from jwtVerify (e.g., expired token) or database issues
    return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
  }
}
