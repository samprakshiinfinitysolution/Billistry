// // app/api/auth/send-otp/route.ts
// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Otp from "@/models/Otp";
// import nodemailer from "nodemailer";
// import crypto from "crypto";
// import twilio from "twilio";

// const twilioClient = twilio(
//   process.env.TWILIO_SID!,
//   process.env.TWILIO_AUTH_TOKEN!
// );

// export async function POST(req: Request) {
//   try {
//     await connectDB();
//     const { email, phone } = await req.json();

//     if (!email && !phone) {
//       return NextResponse.json(
//         { error: "Either email or phone is required" },
//         { status: 400 }
//       );
//     }

//     const identifier = email || phone;

//     // check if OTP already exists and not expired (cooldown e.g. 30s)
//     const existingOtp = await Otp.findOne({ identifier }).sort({ createdAt: -1 });
//     if (existingOtp && existingOtp.createdAt) {
//       const diff = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
//       if (diff < 30) {
//         return NextResponse.json(
//           { error: "Please wait before requesting another OTP" },
//           { status: 429 }
//         );
//       }
//     }

//     // Generate 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

//     // Remove old OTPs for this identifier
//     await Otp.deleteMany({ identifier });

//     // Save new OTP (expires in 5 min)
//     await Otp.create({
//       identifier,
//       otp: hashedOtp,
//       expiresAt: new Date(Date.now() + 5 * 60 * 1000),
//     });

//     // Send OTP via email
//     if (email) {
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
//       });

//       await transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: "Your OTP Code",
//         text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
//       });
//     }

//     // Send OTP via SMS
//     if (phone) {
//       await twilioClient.messages.create({
//         body: `Your OTP is ${otp}. It will expire in 5 minutes.`,
//         from: process.env.TWILIO_PHONE_NUMBER,
//         to: phone,
//       });
//     }

//     return NextResponse.json({ message: "OTP sent successfully" });
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
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
