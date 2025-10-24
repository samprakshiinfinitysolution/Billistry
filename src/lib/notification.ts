import Notification from "@/models/Notification";
import { sendEmail } from "@/lib/notification-mailer"; // your existing mailer

export async function sendNotification(userId: string, email: string, title: string, message: string) {
  // 1. Save notification in MongoDB with the recipient's ID
  const notification = new Notification({ recipient: userId, title, message });
  await notification.save();

  // 2. Send email
  if (email) {
    try {
      await sendEmail({
        to: email,
        subject: title,
        html: `<p>${message}</p>`,
      });
      notification.emailSent = true;
      await notification.save();
    } catch (error) {
      console.error("Email sending failed:", error);
    }
  }

  return notification;
}
