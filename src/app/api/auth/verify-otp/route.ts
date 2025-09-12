// // app/api/auth/verify-otp/route.ts
// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import Business from "@/models/Business";

// export async function POST(req: Request) {
//   try {
//     await connectDB();
//     const { email, phone, otp } = await req.json();

//     if (!otp || (!email && !phone)) {
//       return NextResponse.json(
//         { error: "Email/Phone and OTP are required" },
//         { status: 400 }
//       );
//     }

//     // Find user by email or phone
//     const user = await User.findOne({
//       $or: [
//         ...(email ? [{ email }] : []),
//         ...(phone ? [{ phone }] : []),
//       ],
//     });

//     if (!user) {
//       return NextResponse.json(
//         { error: "User not found. Please request OTP again." },
//         { status: 404 }
//       );
//     }

//     // Verify OTP
//     const isValid = user.verifyOtp(otp);
//     if (!isValid) {
//       return NextResponse.json(
//         { error: "Invalid or expired OTP" },
//         { status: 400 }
//       );
//     }

//     // Clear OTP
//     user.clearOtp();
//     await user.save();

//     // Ensure business exists for shopkeepers
//     if (user.role === "shopkeeper" && !user.business) {
//       const businessName = user.name ?? phone ?? "My Shop";

//       const business = await Business.create({
//         name: `${businessName}'s Shop`,
//         owner: user._id,
//         isActive: true,
//       });

//       user.business = business._id;
//       await user.save();
//     }

//     // ✅ Generate JWT with correct payload shape
//     const token = jwt.sign(
//       {
//         userId: user._id.toString(),
//         businessId: user.business?.toString() ?? "",
//         role: user.role,
//       },
//       process.env.JWT_SECRET!,
//       { expiresIn: "7d" }
//     );

//     // Set cookie & return user info
//     const res = NextResponse.json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//         business: user.business,
//       },
//     });

//     res.cookies.set("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60, // 7 days
//       path: "/",
//     });

//     return res;
//   } catch (error) {
//     console.error("❌ Verify OTP Error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// // app/api/auth/verify-otp/route.ts
// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import Business from "@/models/Business";
// import { Staff } from "@/models/Staff";
// import { CompanyRole } from "@/models/CompanyRole";

// export async function POST(req: Request) {
//   try {
//     await connectDB();
//     const { email, phone, otp } = await req.json();

//     if (!otp || (!email && !phone)) {
//       return NextResponse.json(
//         { error: "Email/Phone and OTP are required" },
//         { status: 400 }
//       );
//     }

//     // 🔎 Find user
//     const user = await User.findOne({
//       $or: [
//         ...(email ? [{ email }] : []),
//         ...(phone ? [{ phone }] : []),
//       ],
//     });

//     if (!user) {
//       return NextResponse.json(
//         { error: "User not found. Please request OTP again." },
//         { status: 404 }
//       );
//     }

//     // 🔑 Verify OTP
//     const isValid = user.verifyOtp(otp);
//     if (!isValid) {
//       return NextResponse.json(
//         { error: "Invalid or expired OTP" },
//         { status: 400 }
//       );
//     }

//     // Clear OTP
//     user.clearOtp();
//     await user.save();

//     let businessId = user.business?.toString() ?? "";
//     let permissions: string[] = [];

//     // 🏪 Shopkeeper: auto-create business on first login
//     if (user.role === "shopkeeper" && !businessId) {
//       const businessName = user.name ?? phone ?? "My Shop";

//       const business = await Business.create({
//         name: `${businessName}'s Shop`,
//         owner: user._id,
//         isActive: true,
//       });

//       user.business = business._id;
//       await user.save();
//       businessId = business._id.toString();
//     }

//     // 👨‍💼 Staff: fetch role + permissions
//     if (user.role === "staff") {
//       const staff = await Staff.findOne({ phone: user.phone });
//       if (staff) {
//         businessId = staff.business.toString();
//         const role = await CompanyRole.findById(staff.role);
//         permissions = role?.permissions || [];
//       }
//     }

//     // 🛠 Generate JWT
//     const token = jwt.sign(
//       {
//         userId: user._id.toString(),
//         role: user.role,
//         businessId,
//         permissions,
//       },
//       process.env.JWT_SECRET!,
//       { expiresIn: "7d" }
//     );

//     // 🍪 Set cookie
//     const res = NextResponse.json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//         business: businessId,
//         permissions,
//       },
//     });

//     res.cookies.set("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60,
//       path: "/",
//     });

//     return res;
//   } catch (error) {
//     console.error("❌ Verify OTP Error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// // app/api/auth/verify-otp/route.ts
// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import Business from "@/models/Business";
// import { DEFAULT_PERMISSIONS } from "@/constants/permissions";

// const JWT_SECRET = process.env.JWT_SECRET;
// if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

// export async function POST(req: Request) {
//   try {
//     await connectDB();
//     const { email, phone, otp } = await req.json();

//     if (!otp || (!email && !phone)) {
//       return NextResponse.json({ error: "Email/Phone and OTP are required" }, { status: 400 });
//     }

//     // 🔎 Find user
//     const user = await User.findOne({
//       $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found. Please request OTP again." }, { status: 404 });
//     }

//     // 🔑 Verify OTP
//     if (!user.verifyOtp(otp)) {
//       return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
//     }

//     // Clear OTP
//     user.clearOtp();
//     await user.save();

//     let businessId = user.business?.toString() ?? "";
//     let permissions = DEFAULT_PERMISSIONS[user.role]; // use default by role

//     // 🏪 Shopkeeper: auto-create business on first login
//     if (user.role === "shopkeeper" && !businessId) {
//       const businessName = user.name ?? phone ?? "My Shop";

//       const business = await Business.create({
//         name: `${businessName}'s Shop`,
//         owner: user._id,
//         isActive: true,
//       });

//       user.business = business._id;
//       await user.save();
//       businessId = business._id.toString();
//     }

//     // 🛠 Generate JWT
//     const token = jwt.sign(
//       {
//         userId: user._id.toString(),
//         role: user.role,
//         businessId,
//         permissions,
//       },
//       JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // 🍪 Set cookie
//     const res = NextResponse.json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//         business: businessId,
//         permissions,
//       },
//     });

//     res.cookies.set("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60,
//       path: "/",
//     });

//     return res;
//   } catch (error) {
//     console.error("❌ Verify OTP Error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// // app/api/auth/verify-otp/route.ts
// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import Business from "@/models/Business";
// import { DEFAULT_PERMISSIONS } from "@/constants/permissions";

// const JWT_SECRET = process.env.JWT_SECRET;
// if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

// export async function POST(req: Request) {
//   try {
//     await connectDB();
//     const { email, phone, otp } = await req.json();

//     if (!otp || (!email && !phone)) {
//       return NextResponse.json({ error: "Email/Phone and OTP are required" }, { status: 400 });
//     }

//     // 🔎 Find user
//     const user = await User.findOne({
//       $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found. Please request OTP again." }, { status: 404 });
//     }

//     // 🔑 Verify OTP
//     if (!user.verifyOtp(otp)) {
//       return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
//     }

//     // Clear OTP
//     user.clearOtp();
//     await user.save();

//     // 🏪 Shopkeeper: auto-create business if first login
//     let businessId = user.business?.toString() ?? "";
//     if (user.role === "shopkeeper" && !businessId) {
//       const businessName = user.name ?? phone ?? "My Shop";
//       const business = await Business.create({
//         name: `${businessName}'s Shop`,
//         owner: user._id,
//         isActive: true,
//       });
//       user.business = business._id;
//       await user.save();
//       businessId = business._id.toString();
//     }

//     // ✅ Determine permissions: use stored if any truthy, otherwise fallback to defaults
//     const permissions =
//       Object.values(user.permissions || {}).some((v) => v === true)
//         ? user.permissions
//         : DEFAULT_PERMISSIONS[user.role] || {};

//     // 🛠 Generate JWT
//     const token = jwt.sign(
//       {
//         userId: user._id.toString(),
//         role: user.role,
//         businessId,
//         permissions,
//       },
//       JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // 🍪 Set cookie and respond
//     const res = NextResponse.json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//         business: businessId,
//         permissions,
//       },
//     });

//     res.cookies.set("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60,
//       path: "/",
//     });

//     return res;
//   } catch (error) {
//     console.error("❌ Verify OTP Error:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// app/api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import { DEFAULT_PERMISSIONS } from "@/constants/permissions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not set");

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, phone, otp } = await req.json();

    if (!otp || (!email && !phone)) {
      return NextResponse.json(
        { error: "Email/Phone and OTP are required" },
        { status: 400 }
      );
    }

    // 🔎 Find user
    const user = await User.findOne({
      $or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please request OTP again." },
        { status: 404 }
      );
    }

    // 🔑 Verify OTP
    if (!user.verifyOtp(otp)) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Clear OTP
    user.clearOtp();
    await user.save();

    // 🏪 Shopkeeper: auto-create business if first login
    let businessId = user.business?.toString() ?? "";
    if (user.role === "shopkeeper" && !businessId) {
      const businessName = user.name ?? phone ?? "My Shop";
      const business = await Business.create({
        name: `${businessName}'s Shop`,
        owner: user._id,
        isActive: true,
      });
      user.business = business._id;
      await user.save();
      businessId = business._id.toString();
    }

    // 📌 Fetch business name if exists
    let businessName = "";
    if (businessId) {
      const business = await Business.findById(businessId).select("name");
      businessName = business?.name || "";
    }

    const permissions = Object.values(user.permissions || {}).some(
      (v) => v === true
    )
      ? user.permissions
      : DEFAULT_PERMISSIONS[user.role as keyof typeof DEFAULT_PERMISSIONS] ||
        {};

    // 🛠 Generate JWT (lightweight: only businessId)
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        businessId,
        permissions,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🍪 Set cookie and respond with consistent payload
    const res = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        businessId,
        businessName, // 👈 keep consistent with authMiddleware
        permissions,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("❌ Verify OTP Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
