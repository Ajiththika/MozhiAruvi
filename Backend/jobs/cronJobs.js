// ── Mozhi Aruvi Zero-Dependency Automation Hub ───────────────────────────────
// Resilient Scheduling Suite (Using Native Node Timers)
// ─────────────────────────────────────────────────────────────────────────────

import User from '../models/User.js';
import MentorApplication from '../models/MentorApplication.js';
import mozhiEvents from '../events/eventEmitter.js';

/**
 * ARCHITECTURAL NOTE: 
 * We use native setInterval to avoid external dependencies like node-cron,
 * ensuring the project structure remains lean and zero-footprint as requested.
 */

// 1. Monthly Performance Pulse
const triggerMonthlyReport = async () => {
    try {
        console.log('[JOBS] Generating Monthly Admin Pulse...');
        const totalUsers = await User.countDocuments();
        const tutorApps = await MentorApplication.countDocuments({ status: 'pending' });

        mozhiEvents.emit('MONTHLY_ADMIN_REPORT', {
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            totalUsers,
            tutorApps,
            revenue: '$0.00 (Base Tier)'
        });
    } catch (e) {
        console.error('Monthly Job Failure:', e);
    }
};

// 2. Daily Student Retention Nudge
const triggerDailyReminders = async () => {
    try {
        console.log('[JOBS] Identifying Inactive Users for Retention...');
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        
        // Find users inactive for > 3 days
        const inactiveUsers = await User.find({ 
            lastLogin: { $lt: threeDaysAgo },
            lastReminderSent: { $exists: false } 
        });

        for (const user of inactiveUsers) {
            mozhiEvents.emit('USER_INACTIVE_REMINDER', {
                name: user.name || 'User',
                email: user.email
            });
            user.lastReminderSent = new Date();
            await user.save();
        }
    } catch (e) {
        console.error('Daily Job Failure:', e);
    }
};

export const initCronJobs = () => {
    console.log('--- 🚀 Mozhi Automation Suite: Initialized (Zero-Dependency) ---');

    // ── Resilient Heartbeat Loop ─────────────────────────────────────────────
    // Logic: Runs every 24 hours. Prevents Timer Overflow (Node.js limit: 24.8 days)
    setInterval(async () => {
        const now = new Date();

        // 1. Daily Student Retention Nudge
        await triggerDailyReminders();

        // 2. Monthly Performance Pulse (Only runs on the 1st of every month)
        if (now.getDate() === 1) {
            await triggerMonthlyReport();
        }
    }, 24 * 60 * 60 * 1000);

    // Trigger an immediate check for development/first-run only
    console.log('[JOBS] Running First-Run Heartbeat...');
    triggerDailyReminders();
};
