import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

import mongoose from 'mongoose';
mongoose.set('bufferCommands', false); 

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await connectDB();
    } catch (err) {
        console.error('Critical Database Failure:', err.message);
        console.warn('Backend is running in degraded mode (Offline). Check MongoDB Atlas IP whitelist.');
    }
});
