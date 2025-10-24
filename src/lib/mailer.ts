import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASS in environment variables");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Billistry App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
}

export async function sendOtpEmail(to: string, otp: string) {
  return sendEmail(
    to,
    "Your OTP Code",
    `Your OTP is ${otp}. It will expire in 3 minutes.`
  );
}



