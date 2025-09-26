// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(1),
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
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    const { email, phone, password } = parsed.data;

    if (!email && !phone) {
      return NextResponse.json({ error: "Email or phone required" }, { status: 400 });
    }

    // 2️⃣ Find user
    const user = await User.findOne(email ? { email } : { phone });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3️⃣ Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 4️⃣ Sign JWT
    const token = signToken({ sub: user._id.toString(), role: user.role });

    // 5️⃣ Return response with cookie
    const res = NextResponse.json(
      {
        message: "Login successful",
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email ?? null,
          phone: user.phone ?? null,
          role: user.role,
          permissions: user.permissions,
        },
      },
      { status: 200 }
    );

    res.cookies.set(authCookie(token));
    return res;
  } catch (err: any) {
    console.error("LOGIN_ERROR:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
