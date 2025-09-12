import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Staff } from "@/models/Staff";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { name, email, role, permissions, businessId } = req.body;

  if (!name || !email || !businessId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  await connectDB();

  // Generate invite token
  const token = crypto.randomBytes(32).toString("hex");

  // Create staff with pending invite
  const staff = await Staff.create({
    name,
    email,
    role,
    permissions,
    business: businessId,
    inviteToken: token,
    inviteStatus: "pending",
  });

  // Generate invite link
  const inviteLink = `${process.env.FRONTEND_URL}/staff/accept-invite/${token}`;

  // Send email (nodemailer example)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Business Team" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "You are invited to join the business",
    html: `<p>Hi ${name},</p>
           <p>You have been invited to join your business account.</p>
           <p><a href="${inviteLink}">Click here to accept the invite</a></p>`,
  });

  res.status(200).json({ message: "Invite sent successfully", inviteLink });
}
