// utils/emailHelper.ts
import nodemailer from 'nodemailer';
import { config } from 'dotenv';
config();

export const sendInvoiceEmail = async (to: string, pdfBuffer: Buffer, invoiceNo: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Sales Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Invoice - ${invoiceNo}`,
    text: `Dear customer,\n\nPlease find attached the invoice ${invoiceNo}.\n\nThank you for your business!`,
    attachments: [
      {
        filename: `${invoiceNo}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};
