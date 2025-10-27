// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { jwtVerify } from 'jose';

// const JWT_SECRET = process.env.JWT_SECRET;
// if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

// const key = new TextEncoder().encode(JWT_SECRET);

// export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Protect /wp-admin routes except login
//   if (pathname.startsWith('/wp-admin') && pathname !== '/wp-admin') {
//     const token = req.cookies.get('admin_token')?.value;

//     if (!token) {
//       return NextResponse.redirect(new URL('/wp-admin', req.url), {
//         headers: { 'Cache-Control': 'no-store' },
//       });
//     }

//     try {
//       const { payload } = await jwtVerify(token, key);

//       if (!payload?.isAdmin) {
//         return NextResponse.redirect(new URL('/wp-admin', req.url), {
//           headers: { 'Cache-Control': 'no-store' },
//         });
//       }

//       return NextResponse.next();
//     } catch (err) {
//       console.error('JWT verification failed:', err);
//       return NextResponse.redirect(new URL('/wp-admin', req.url), {
//         headers: { 'Cache-Control': 'no-store' },
//       });
//     }
//   }

//   // Non-protected route
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/wp-admin/:path*'],
// };
