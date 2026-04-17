/**
 * config/db.js
 *
 * Mongoose connection management with retry logic and standardized options.
 */
import mongoose from 'mongoose';

export async function connectDB() {
    const options = {
        serverSelectionTimeoutMS: 15000, // Wait 15s before saying DB is gone
        connectTimeoutMS: 10000,
        maxPoolSize: 10, // Maintain pool size
        socketTimeoutMS: 45000, // Close sockets after 45s if no activity
        family: 4, // Force IPv4 to avoid resolution issues (Atlas common pitfall)
        retryWrites: true,
        w: 'majority',
    };

    const mongoUri = process.env.MONGODB_URI;

    try {
        if (mongoose.connection.readyState >= 1) return;
        await mongoose.connect(mongoUri, options);
        const { host, name } = mongoose.connection;
        console.log(`✅ [DATABASE] Connected successfully to ${host}/${name}`);
    } catch (err) {
        console.error('❌ [DATABASE] Initial Connection Failure:', err.message);
        
        // If initial connection fails, we don't exit process if we want to run in degraded mode.
        // But for production, failing early is often better.
        if (process.env.NODE_ENV === 'production') {
            console.error('[CRITICAL] Exiting in production node due to DB failure.');
            process.exit(1);
        }

        console.warn('⚠️ [DATABASE] Running in degraded mode (Database Offline). Check IP whitelist.');
    }

    // Set up listeners for runtime connection issues
    mongoose.connection.on('error', (err) => {
        console.error('⚠️ [DATABASE] Runtime Connection Error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ [DATABASE] Connection lost, Mongoose will auto-retry in the background.');
    });
}

/** 
 * Gracefully close DB if process terminates 
 */
export async function closeDB() {
    await mongoose.connection.close();
}
