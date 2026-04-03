/**
 * server.js
 *
 * App Entry Point.
 */
import './config/env.js'; // MUST BE FIRST: Load and validate env
import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import { seedPlans } from './utils/seedPlans.js';
import { initNotificationService } from './services/notificationService.js';
import { initCronJobs } from './jobs/cronJobs.js';

const PORT = 5000;

// Catch unhandled rejections globally to prevent server crashes
process.on('unhandledRejection', (reason) => {
    console.error('❌ [CRITICAL] Unhandled Rejection at:', reason.stack || reason);
    // Don't crash immediately, but exit in prod if critical
});

const server = app.listen(PORT, async () => {
    console.log(`✅ [SERVER] Listening on http://localhost:${PORT}`);
    try {
        await connectDB();
        await seedPlans();
        
        // ── Mozhi Aruvi Automation Systems ────────────────────────────────────
        initNotificationService();
        initCronJobs();
        console.log('✅ [SERVER] Notification & Automation Systems: Operational');
        
    } catch (err) {
        console.error('❌ [SERVER] Start Failure during DB connection:', err.message);
    }
});

/** 
 * Proper Shutdown Handling
 */
const shutdown = async (signal) => {
    console.log(`\n🛑 [SHUTDOWN] ${signal} signal received.`);
    server.close(async () => {
        console.log('🛑 [SHUTDOWN] HTTP server closed.');
        try {
            await closeDB();
            console.log('🛑 [SHUTDOWN] Database connections closed.');
            process.exit(0);
        } catch (e) {
            console.error('❌ Error closing DB:', e);
            process.exit(1);
        }
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
