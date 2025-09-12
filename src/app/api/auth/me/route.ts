// // app/api/auth/me/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import User from "@/models/User";
// import { connectDB } from "@/lib/db";

// type JwtPayload = {
//   userId: string;
//   businessId: string;
//   role: "superadmin" | "shopkeeper" | "staff";
// };

// export async function GET(req: NextRequest) {
//   try {
//     await connectDB();

//     // ✅ Get token from cookies
//     const token = req.cookies.get("token")?.value;
//     if (!token) return NextResponse.json(null, { status: 200 });

//     // ✅ Verify token
//     let payload: JwtPayload;
//     try {
//       payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
//     } catch {
//       return NextResponse.json(null, { status: 200 });
//     }

//     // ✅ Fetch user
//     const user = await User.findById(payload.userId).select(
//       "name email phone role business"
//     );
//     if (!user) return NextResponse.json(null, { status: 200 });

//     // ✅ Return normalized response
//     return NextResponse.json({
//       userId: user._id.toString(),
//       businessId: user.business?.toString() ?? null,
//       name: user.name,
//       email: user.email,
//       phone: user.phone,
//       role: user.role,
//     });
//   } catch (err) {
//     console.error("❌ /api/auth/me error:", err);
//     return NextResponse.json(null, { status: 500 });
//   }
// }

// // app/api/auth/me/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import User from "@/models/User";
// import { connectDB } from "@/lib/db";
// import { DEFAULT_PERMISSIONS } from "@/constants/permissions";

// type Role = "superadmin" | "shopkeeper" | "staff";

// type JwtPayload = {
//   userId: string;
//   businessId: string;
//   role: Role;
// };

// export async function GET(req: NextRequest) {
//   try {
//     await connectDB();

//     // ✅ Get token from cookies
//     const token = req.cookies.get("token")?.value;
//     if (!token) return NextResponse.json(null, { status: 200 });

//     // ✅ Verify token
//     let payload: JwtPayload;
//     try {
//       payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
//     } catch {
//       return NextResponse.json(null, { status: 200 });
//     }

//     // ✅ Fetch user
//     const user = await User.findById(payload.userId).select(
//       "name email phone role business permissions"
//     );
//     if (!user) return NextResponse.json(null, { status: 200 });

//     // ✅ Determine permissions: use stored if any truthy, otherwise fallback to defaults
//     const permissions =
//       Object.values(user.permissions || {}).some((v) => v === true)
//         ? user.permissions
//         : DEFAULT_PERMISSIONS[user.role] || {};

//     // ✅ Return normalized response
//     return NextResponse.json({
//       userId: user._id.toString(),
//       businessId: user.business?.toString() ?? null,
//       name: user.name,
//       email: user.email,
//       phone: user.phone,
//       role: user.role,
//       permissions,
//     });
//   } catch (err) {
//     console.error("❌ /api/auth/me error:", err);
//     return NextResponse.json(null, { status: 500 });
//   }
// }

// // app/api/auth/me/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import User from "@/models/User";
// import Business from "@/models/Business";
// import { connectDB } from "@/lib/db";
// import { DEFAULT_PERMISSIONS } from "@/constants/permissions";

// type Role = "superadmin" | "shopkeeper" | "staff";

// type JwtPayload = {
//   userId: string;
//   businessId: string;
//   role: Role;
// };

// export async function GET(req: NextRequest) {
//   try {
//     await connectDB();

//     // ✅ Get token from cookies
//     const token = req.cookies.get("token")?.value;
//     if (!token) return NextResponse.json(null, { status: 200 });

//     // ✅ Verify token
//     let payload: JwtPayload;
//     try {
//       payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
//     } catch {
//       return NextResponse.json(null, { status: 200 });
//     }

//     // ✅ Fetch user
//     const user = await User.findById(payload.userId).select(
//       "name email phone role business permissions"
//     );
//     if (!user) return NextResponse.json(null, { status: 200 });

//     // ✅ Fetch business name
//     let businessName = "";
//     if (user.business) {
//       const business = await Business.findById(user.business).select("name");
//       businessName = business?.name || "";
//     }

//     // ✅ Determine permissions
//     const permissions =
//       Object.values(user.permissions || {}).some((v) => v === true)
//         ? user.permissions
//         : DEFAULT_PERMISSIONS[user.role] || {};

//     // ✅ Return normalized response
//     return NextResponse.json({
//       userId: user._id.toString(),
//       businessId: user.business?.toString() ?? null,
//       businessName, // 👈 added for consistency
//       name: user.name,
//       email: user.email,
//       phone: user.phone,
//       role: user.role,
//       permissions,
//     });
//   } catch (err) {
//     console.error("❌ /api/auth/me error:", err);
//     return NextResponse.json(null, { status: 500 });
//   }
// }

// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import Business from "@/models/Business";
import { connectDB } from "@/lib/db";
import { DEFAULT_PERMISSIONS } from "@/constants/permissions";

type Role = "superadmin" | "shopkeeper" | "staff";

type JwtPayload = {
  userId: string;
  businessId: string;
  role: Role;
};

// ✅ Helper: check if any nested permission is true
function hasAnyPermission(permissions: Record<string, any> = {}): boolean {
  return Object.values(permissions).some((val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "object" && val !== null) return hasAnyPermission(val);
    return false;
  });
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ✅ Get token
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json(null, { status: 200 });

    // ✅ Verify token
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch {
      return NextResponse.json(null, { status: 200 });
    }

    // ✅ Fetch user
    const user = await User.findById(payload.userId).select(
      "name email phone role business permissions"
    );
    if (!user) return NextResponse.json(null, { status: 200 });

    // ✅ Fetch business name
    let businessName = "";
    if (user.business) {
      const business = await Business.findById(user.business).select("name");
      businessName = business?.name || "";
    }

    // ✅ Normalize permissions
    const rawPerms = user.permissions
      ? user.permissions.toObject?.() || user.permissions
      : {};
    const permissions = hasAnyPermission(rawPerms)
      ? rawPerms
      : DEFAULT_PERMISSIONS[user.role as keyof typeof DEFAULT_PERMISSIONS] ||
        {};

    // ✅ Return normalized response
    return NextResponse.json({
      userId: user._id.toString(),
      businessId: user.business?.toString() ?? null,
      businessName,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions,
    });
  } catch (err) {
    console.error("❌ /api/auth/me error:", err);
    return NextResponse.json(null, { status: 500 });
  }
}
