import mozhiEvents from '../events/eventEmitter.js';
import { sendEmail } from './mailService.js';
import { templates } from '../templates/emailTemplates.js';
import Notification from '../models/Notification.js';

// ── Smart Logic Orchestration ───────────────────────────────────────────────
// Smart Notification Controller: Prevents Spam, Ensures High-Touch Engagement
// ─────────────────────────────────────────────────────────────────────────────

// 4. Moderation & Governance Suite
mozhiEvents.on('USER_WARNED', async (user) => {
    // 1. Dashboard Notification Logic
    await Notification.create({
        user: user._id,
        title: "Official Account Warning Issued",
        message: `An administrator has issued a formal warning to your account. You now have ${user.warnings} warning nodes registered. Please adhere to community guidelines to avoid suspension.`,
        type: 'warning',
        actionUrl: '/dashboard/settings'
    });

    // 2. High-Priority Email Alert
    await sendEmail(
        user.email, 
        'Official Account Warning: Action Required', 
        `<h3>Hi ${user.name},</h3>
         <p>This is an official communication regarding your account status on Mozhi Aruvi.</p>
         <p>You have received a new warning node. <b>Total Warnings: ${user.warnings}</b></p>
         <p>Repeated violations of our expert community standards may lead to permanent deactivation of your mentor privileges.</p>
         <p><a href="${process.env.FRONTEND_ORIGIN}/dashboard">View Dashboard Settings</a></p>`
    );
});

// 1. User Engagement Suite
mozhiEvents.on('USER_REGISTERED', async (user) => {
    await sendEmail(user.email, 'Welcome to Mozhi Aruvi', templates.WELCOME(user.name));
    
    // Optional: WhatsApp Welcome Alert
    console.log(`[WHATSAPP] Hi ${user.name} 👋 Welcome to Mozhi Aruvi!`);
});

mozhiEvents.on('USER_LOGIN', async (user) => {
    // Smart Rule: Only send for new devices OR once per week (Placeholder)
    const isNewDevice = user.isNewDevice || false;
    if (isNewDevice) {
        await sendEmail(user.email, 'New Login Detected', `<p>Hi ${user.name}, we detected a login from a new device.</p>`);
    }
});

mozhiEvents.on('USER_INACTIVE_REMINDER', async (user) => {
    await sendEmail(user.email, 'We Miss Your Voice!', templates.INACTIVE_REMINDER(user.name));
});

// 2. Tutor Career Suite
mozhiEvents.on('TUTOR_APPLIED', async (user) => {
    await sendEmail(user.email, 'Tutor Application Received', `<p>Your request to guide students is under official review. We'll update you soon.</p>`);
});

mozhiEvents.on('TUTOR_APPROVED', async (user) => {
    await sendEmail(user.email, ' Official Decision: Approved', templates.TUTOR_APPROVED(user.name));
    
    // High-Priority WhatsApp Notification
    console.log(`[WHATSAPP] Hi ${user.name} 👋 You are now an approved Tutor on Mozhi Aruvi! Start your session today.`);
});

mozhiEvents.on('TUTOR_REJECTED', async (user) => {
    await sendEmail(user.email, 'Decision on your Application ', `<p>Thank you for applying. After careful review, we cannot proceed at this time. We invite you to try again in 30 days.</p>`);
});

// 3. System Insight Suite (Reports)
mozhiEvents.on('MONTHLY_ADMIN_REPORT', async (data) => {
    await sendEmail(process.env.ADMIN_EMAIL, 'Mozhi Aruvi: Monthly Operational Pulse ', templates.ADMIN_MONTHLY(data));
});

mozhiEvents.on('TUTOR_MONTHLY_REPORT', async (data) => {
    // Analytics for tutors: sessions, ratings, earnings
    await sendEmail(data.email, 'Your Monthly Performance Overview ', `<p>You completed ${data.sessions} sessions this month. Your rating: ${data.rating}⭐</p>`);
});

// 4. Help Request Suite
mozhiEvents.on('HELP_REQUEST_CREATED', async ({ student, teacher, request }) => {
    await sendEmail(teacher.email, `New Help Request: ${request.requestType}`, `
        <h3>Hi ${teacher.name},</h3>
        <p>A student (${student.name}) needs your expert guidance on a lesson.</p>
        <p><b>Question:</b> ${request.content}</p>
        <p><a href="${process.env.FRONTEND_ORIGIN}/tutor/questions">Attend to Student</a></p>
    `);
});

mozhiEvents.on('HELP_REQUEST_REPLIED', async ({ student, teacher, request, message }) => {
    await sendEmail(student.email, `Scholar Replied to your Query`, `
        <h3>Hi ${student.name},</h3>
        <p>Expert ${teacher.name} has responded to your inquiry.</p>
        <p><b>Response:</b> ${message}</p>
        <p><a href="${process.env.FRONTEND_ORIGIN}/student/lessons">View Response</a></p>
    `);
});

export const initNotificationService = () => {
    console.log('---  Mozhi Notification Service: Operational ---');
};

export async function getUserNotifications(userId) {
    return await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10);
}
