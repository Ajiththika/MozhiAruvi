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
    'Booking Confirmed - Mozhi Aruvi',
    `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #4F46E5;">Booking Successful!</h2>
      <p>Hello ${student.name}, your session with <strong>${tutor.name}</strong> is scheduled.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(date).toDateString()}</p>
        <p><strong>Time:</strong> ${startTime}</p>
        <p><strong>Amount Paid:</strong> $${amount}</p>
      </div>
      <p>Please wait for the tutor to confirm the session. You will receive another notification once confirmed.</p>
    </div>
    `
  );

  await Notification.create({
    user: student._id,
    title: "Payment Successful",
    message: `Your booking with ${tutor.name} for ${startTime} is pending tutor confirmation.`,
    type: 'payment_success'
  });

  // 2. Notify Tutor (Email + In-App)
  await mailService.sendEmail(
    tutor.email,
    'New Booking Received! - Mozhi Aruvi',
    `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #10B981;">New Booking!</h2>
      <p>Hello ${tutor.name}, student <strong>${student.name}</strong> has booked a session with you.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Requested Date:</strong> ${new Date(date).toDateString()}</p>
        <p><strong>Requested Time:</strong> ${startTime}</p>
      </div>
      <p>Please log in to your dashboard to <strong>Confirm</strong> or <strong>Reschedule</strong> this session.</p>
      <a href="${process.env.FRONTEND_ORIGIN}/tutor/dashboard" style="display:inline-block; padding: 10px 20px; background:#10B981; color:white; text-decoration:none; border-radius:6px; font-weight:bold;">View Dashboard</a>
    </div>
    `
  );

  await Notification.create({
    user: tutor._id,
    title: "New Booking Request",
    message: `${student.name} has booked a session for ${startTime}.`,
    type: 'new_booking'
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
