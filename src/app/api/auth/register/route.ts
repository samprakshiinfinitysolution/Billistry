// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User, { Role } from "@/models/User";
import { signToken } from "@/lib/jwt";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(["superadmin", "shopkeeper", "staff"]).optional(),
});

function authCookie(token: string) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

export async function POST(req: Request) {
  try {
    // 1️⃣ Validate input
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const { name, email, phone, password, role } = parsed.data;

    if (!email && !phone) {
      return NextResponse.json({ error: "Email or phone required" }, { status: 400 });
    }

    // 2️⃣ Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
      if (existingUser.phone === phone) {
        return NextResponse.json({ error: "Phone already in use" }, { status: 409 });
      }
    }

    // 3️⃣ Create new user
    const user = new User({
      name,
      email,
      phone,
      passwordHash: password, // hashed in pre-save hook
      role: (role as Role) || "shopkeeper",
    });

    await user.save();

    // 4️⃣ Sign JWT
    const token = signToken({ sub: user._id, role: user.role });

    // 5️⃣ Return response with cookie
    const res = NextResponse.json(
      {
        message: "User registered",
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email ?? null,
          phone: user.phone ?? null,
          role: user.role,
          permissions: user.permissions,
        },
      },
      { status: 201 }
    );

    res.cookies.set(authCookie(token));
    return res;
  } catch (err: any) {
    console.error("REGISTER_ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
