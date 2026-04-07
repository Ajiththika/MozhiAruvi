import * as mailService from './mailService.js';
import Notification from '../models/Notification.js';

/**
 * ── 📧 Central Dispatch for User Communications ──────────────────────────────
 */
export async function notifyBookingSuccess(student, tutor, bookingDetails) {
  const { date, startTime, amount } = bookingDetails;

  // 1. Notify Student (Email + In-App)
  await mailService.sendEmail(
    student.email,
    'Payment Confirmed - Mozhi Aruvi',
    `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #4F46E5;">Class Officially Booked!</h2>
      <p>Hello ${student.name}, your payment for the session with <strong>${tutor.name}</strong> was successful.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(date).toDateString()}</p>
        <p><strong>Time:</strong> ${startTime}</p>
        <p><strong>Status:</strong> Paid & Confirmed</p>
      </div>
      <p>Your mentor will provide the meeting link shortly. Check your dashboard for updates.</p>
    </div>
    `
  );

  await Notification.create({
    user: student._id,
    title: "Class Booked Successfully",
    message: `Your payment was accepted! Session with ${tutor.name} is now active.`,
    type: 'payment_success',
    bookingId: bookingDetails._id
  });

  // 2. Notify Tutor (Email + In-App)
  await mailService.sendEmail(
    tutor.email,
    'Payment Received! - Mozhi Aruvi',
    `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #10B981;">Payment Confirmed!</h2>
      <p>Hello ${tutor.name}, student <strong>${student.name}</strong> has paid for their session.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(date).toDateString()}</p>
        <p><strong>Time:</strong> ${startTime}</p>
        <p><strong>Earnings:</strong> Paid to your Stripe account</p>
      </div>
      <p>Please share the meeting link with the student from your "My Schedule" portal.</p>
      <a href="${process.env.FRONTEND_ORIGIN}/tutor/schedule" style="display:inline-block; padding: 10px 20px; background:#10B981; color:white; text-decoration:none; border-radius:6px; font-weight:bold;">Tutor Schedule</a>
    </div>
    `
  );

  await Notification.create({
    user: tutor._id,
    title: "Student Payment Received",
    message: `${student.name} has paid for the session on ${new Date(date).toLocaleDateString()}. Provide class link now.`,
    type: 'payment_success',
    bookingId: bookingDetails._id
  });
}

/**
 * ── 🕒 Automated Reminders (Scheduled) ───────────────────────────────────────
 */
export async function sendSessionReminder(student, tutor, booking) {
    const subject = "Class Reminder - Starting in 1 Hour";
    const body = `Your Tamil session is starting soon at ${booking.startTime}. Get ready!`;
    
    await mailService.sendEmail(student.email, subject, body);
    await mailService.sendEmail(tutor.email, subject, body);

    await Notification.create({
        user: student._id,
        title: "Session Starting Soon",
        message: body,
        type: 'session_reminder'
    });
}

/**
 * ── 📩 Generic Wrapper ──────────────────────────────────────────────────────
 */
export async function sendEmail(to, subject, html) {
    return mailService.sendEmail(to, subject, html);
}
