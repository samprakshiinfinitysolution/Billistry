import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear the admin_token cookie
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0), // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
