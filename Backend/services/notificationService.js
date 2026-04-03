import mozhiEvents from '../events/eventEmitter.js';
import { sendEmail } from './mailService.js';
import { templates } from '../templates/emailTemplates.js';

// ── Smart Logic Orchestration ───────────────────────────────────────────────
// Smart Notification Controller: Prevents Spam, Ensures High-Touch Engagement
// ─────────────────────────────────────────────────────────────────────────────

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

export const initNotificationService = () => {
    console.log('---  Mozhi Notification Service: Operational ---');
};
