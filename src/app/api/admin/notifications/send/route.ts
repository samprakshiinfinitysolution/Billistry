import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

type ReqBody = {
  recipients: string[];
  subject: string;
  message: string;
  scheduleAt?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;
    if (!body || !Array.isArray(body.recipients) || body.recipients.length === 0) {
      return NextResponse.json({ success: false, error: 'No recipients provided' }, { status: 400 });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.FROM_EMAIL || smtpUser;

    let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
    let usingEthereal = false;

    if (smtpHost && smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
    } else {
      // Development fallback: if not in production, create an Ethereal test account
      if (process.env.NODE_ENV !== 'production') {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        usingEthereal = true;
      } else {
        return NextResponse.json({ success: false, error: 'SMTP not configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS environment variables.' }, { status: 500 });
      }
    }

  const results: Array<{ to: string; accepted?: string[]; rejected?: string[]; error?: string; previewUrl?: string | null }> = [];

    // send sequentially to keep things simple; for production consider batching/concurrency
    for (const to of body.recipients) {
      try {
        const info = await transporter.sendMail({
          from: fromEmail,
          to,
          subject: body.subject,
          text: body.message,
          html: body.message.replace(/\n/g, '<br/>'),
        });
        const accepted = (info.accepted || []).map(String);
        const rejected = (info.rejected || []).map(String);
  const previewUrl = usingEthereal ? nodemailer.getTestMessageUrl(info) || null : null;
  results.push({ to, accepted, rejected, previewUrl });
      } catch (err: any) {
        results.push({ to, error: String(err?.message || err) });
      }
    }

    const failures = results.filter(r => r.error || (r.rejected && r.rejected.length));
    if (failures.length) {
      return NextResponse.json({ success: false, message: 'Some emails failed to send', results }, { status: 500 });
    }

    // If using Ethereal, include a notice and the first preview URL for easy viewing
    if (usingEthereal) {
      const firstPreview = results.find(r => r.previewUrl && r.previewUrl.length)?.previewUrl || null;
      return NextResponse.json({ success: true, message: 'Emails sent via Ethereal (dev only)', results, previewUrl: firstPreview });
    }

    return NextResponse.json({ success: true, message: 'Emails sent', results });
  } catch (err: any) {
    console.error('api/admin/notifications/send error', err);
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 });
  }
}
