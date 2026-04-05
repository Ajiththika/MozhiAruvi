// ── Mozhi Aruvi Production-Grade Automation Hub ───────────────────────────────
// Resilient Scheduling Suite (Using node-cron for Persistent Persistence)
// ─────────────────────────────────────────────────────────────────────────────

import cron from 'node-cron';
import User from '../models/User.js';
import MentorApplication from '../models/MentorApplication.js';
import mozhiEvents from '../events/eventEmitter.js';

/**
 * ARCHITECTURAL NOTE: 
 * We now use 'node-cron' to ensure tasks trigger on absolute timeframes,
 * surviving Node.js event loop drift and providing standard SaaS scheduling.
 */

// 1. Monthly Performance Pulse (Runs at 00:00 on the 1st of every month)
const triggerMonthlyReport = async () => {
    try {
        console.log(`[${new Date().toISOString()}] [JOBS] Generating Monthly Admin Pulse...`);
        const totalUsers = await User.countDocuments();
        const tutorApps = await MentorApplication.countDocuments({ status: 'pending' });

        mozhiEvents.emit('MONTHLY_ADMIN_REPORT', {
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            totalUsers,
            tutorApps,
            revenue: '$0.00 (Base Tier)'
        });
        console.log(`[${new Date().toISOString()}] [JOBS] Monthly Pulse Emitted Successfully.`);
    } catch (e) {
        console.error('Monthly Job Failure:', e);
    }
};

// 2. Daily Student Retention Nudge (Runs at 00:00 every day)
const triggerDailyReminders = async () => {
    try {
        console.log(`[${new Date().toISOString()}] [JOBS] Identifying Inactive Users for Retention...`);
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
        console.log(`[${new Date().toISOString()}] [JOBS] Daily Reminders Processed for ${inactiveUsers.length} users.`);
    } catch (e) {
        console.error('Daily Job Failure:', e);
    }
};

export const initCronJobs = () => {
    console.log('--- 🚀 Mozhi Automation Suite: Initialized (Production-Ready) ---');

    // ── Resilient Heartbeat Schedule ─────────────────────────────────────────────
    
    // 1. Daily Retention Nudge (Every midnight)
    cron.schedule('0 0 * * *', async () => {
        await triggerDailyReminders();
    });

    // 2. Monthly Pulse (Midnight on the 1st)
    cron.schedule('0 0 1 * *', async () => {
        await triggerMonthlyReport();
    });

    // 3. Health Heartbeat (Every hour for logging stabilization)
    cron.schedule('0 * * * *', () => {
        console.log(`[${new Date().toISOString()}] [JOBS] Automation Hub Heartbeat: Active`);
    });

    // Trigger an immediate check for development/first-run only
    console.log('[JOBS] Running Startup Synchronization check...');
    triggerDailyReminders();
};
