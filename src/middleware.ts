// // middleware.ts
// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
// const PUBLIC_PATHS = ["/", "/api/auth/send-otp", "/api/auth/verify-otp"];

// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;
//   const token = req.cookies.get("token")?.value;

//   // Public pages
//   if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
//     if (token) {
//       try { jwt.verify(token, JWT_SECRET); req.nextUrl.pathname = "/dashboard"; return NextResponse.redirect(req.nextUrl); } 
//       catch {} 
//     }
//     return NextResponse.next();
//   }

//   // Protect /dashboard routes
//   if (pathname.startsWith("/dashboard")) {
//     if (!token) {
//       const url = req.nextUrl.clone();
//       url.pathname = "/";
//       url.searchParams.set("next", pathname);
//       return NextResponse.redirect(url);
//     }
//     try { jwt.verify(token, JWT_SECRET); return NextResponse.next(); } 
//     catch { const url = req.nextUrl.clone(); url.pathname = "/"; return NextResponse.redirect(url); }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };




// // middleware.ts
// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
// const PUBLIC_PATHS = ["/", "/api/auth/send-otp", "/api/auth/verify-otp"];

// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;
//   const token = req.cookies.get("token")?.value;

//   // 1️⃣ Allow public paths
//   if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
//     if (token) {
//       try {
//         jwt.verify(token, JWT_SECRET); // just verify, no need to store decoded
//         const url = req.nextUrl.clone();
//         url.pathname = "/dashboard";
//         return NextResponse.redirect(url);
//       } catch {
//         // invalid token: continue to public page
//       }
//     }
//     return NextResponse.next();
//   }

//   // 2️⃣ Protect other routes
//   if (!token) {
//     const url = req.nextUrl.clone();
//     url.pathname = "/";
//     url.searchParams.set("next", pathname);
//     return NextResponse.redirect(url);
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
//     const response = NextResponse.next();

//     // Add user info to headers so APIs can filter automatically
//     response.headers.set("x-user-id", decoded.id);
//     response.headers.set("x-user-role", decoded.role);

//     return response;
//   } catch {
//     const url = req.nextUrl.clone();
//     url.pathname = "/";
//     return NextResponse.redirect(url);
//   }
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };



// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Public routes that don't require auth
const PUBLIC_PATHS = ["/", "/login", "/api/auth/send-otp", "/api/auth/verify-otp"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (token) {
      try {
        // If token is valid, redirect logged-in user away from public page
        jwt.verify(token, JWT_SECRET);
        const url = req.nextUrl.clone();
<<<<<<< HEAD
        url.pathname = "/dashboard/home";
=======
        url.pathname = "/dashboard";
>>>>>>> dcc59acd5f59524ac9f5cc4448fa122e42a677b1
        return NextResponse.redirect(url);
      } catch {
        // invalid token, continue to public page
      }
    }
    return NextResponse.next();
  }

  // Protect other routes
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login"; // redirect to login if not authenticated
    url.searchParams.set("next", pathname); // optional: redirect back after login
    return NextResponse.redirect(url);
  }

  try {
    // Decode token and attach user info to headers
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const response = NextResponse.next();
    response.headers.set("x-user-id", decoded.id);
    response.headers.set("x-user-role", decoded.role);
    return response;
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login"; // invalid token: redirect to login
    return NextResponse.redirect(url);
  }
};

// Apply middleware only to these routes
export const config = {
  matcher: ["/dashboard/:path*", "/suppliers/:path*", "/customers/:path*"],
};
