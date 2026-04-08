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

// 2. Monthly Support Limit Reset (Runs at 00:00 on the 1st of every month)
const triggerMonthlyReset = async () => {
    try {
        console.log(`[${new Date().toISOString()}] [JOBS] Resetting Monthly Tutor Support Counts for all scholars...`);
        // Note: Paid users also reset via Stripe Webhook on their specific billing date, 
        // but this ensures a clean slate for Free users and redundant safety for all.
        const result = await User.updateMany(
            {}, 
            { $set: { 'subscription.tutorSupportUsed': 0 } }
        );
        console.log(`[${new Date().toISOString()}] [JOBS] Monthly Reset Finished. Impacted: ${result.modifiedCount} accounts.`);
    } catch (e) {
        console.error('Monthly Reset Job Failure:', e);
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
        }).limit(500);

        const BATCH_SIZE = 10;
        for (let i = 0; i < inactiveUsers.length; i += BATCH_SIZE) {
            const batch = inactiveUsers.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (user) => {
                mozhiEvents.emit('USER_INACTIVE_REMINDER', {
                    name: user.name || 'User',
                    email: user.email
                });
                await User.findByIdAndUpdate(user._id, { $set: { lastReminderSent: new Date() } });
            }));
        }
        console.log(`[${new Date().toISOString()}] [JOBS] Daily Reminders processed in batches for ${inactiveUsers.length} users.`);
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

    // 2. Monthly Pulse & Count Reset (Midnight on the 1st)
    cron.schedule('0 0 1 * *', async () => {
        await triggerMonthlyReport();
        await triggerMonthlyReset();
    });

    // 3. Health Heartbeat (Every hour for logging stabilization)
    cron.schedule('0 * * * *', () => {
        console.log(`[${new Date().toISOString()}] [JOBS] Automation Hub Heartbeat: Active`);
    });

    // Trigger an immediate check for development/first-run only
    console.log('[JOBS] Running Startup Synchronization check...');
    triggerDailyReminders();
};
