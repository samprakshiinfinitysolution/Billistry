
// app/api/auth/send-otp/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    await connectDB();
    let { email, phone, name } = await req.json();

    // ✅ Trim values
    email = email?.trim() || undefined;
    phone = phone?.trim() || undefined;
    name = name?.trim() || undefined;

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    // 🔎 Find user by email or phone
    let user = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    });

    // If no user → create new
    if (!user) {
      user = new User({
        name: name || (email ? email.split("@")[0] : phone),
        email,
        phone,
        role: "shopkeeper",
        isActive: true,
      });
    }

    // ⏱ Cooldown check (30s)
    // if (user.otpExpiresAt && user.otpExpiresAt > new Date(Date.now() - 30 * 1000)) {
    //   return NextResponse.json(
    //     { error: "Please wait before requesting another OTP" },
    //     { status: 429 }
    //   );
    // }

    // 🔐 Generate OTP and save
    const otp = generateOTP();
    user.setOtp(otp);
    await user.save();

    // 🔔 Log OTP (replace with email/SMS in production)
    console.log(`OTP for ${email || phone}:`, otp);

    // 📧 Send email if configured
    if (email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      });
    }

    // 📱 Send SMS if configured
    if (phone && process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = (await import("twilio")).default;
      const twilioClient = twilio(
        process.env.TWILIO_SID!,
        process.env.TWILIO_AUTH_TOKEN!
      );

      await twilioClient.messages.create({
        body: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
    }

    return NextResponse.json({
      message: "OTP sent successfully",
      identifier: email || phone,
    });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
