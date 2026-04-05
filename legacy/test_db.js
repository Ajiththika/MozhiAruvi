
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'f:\\Mozhi Aruvi\\Backend\\.env' });

const uri = process.env.MONGODB_URI;
console.log('Connecting to:', uri.split('@')[1]); // Log host only for safety

async function test() {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('CONNECTED successfully');
        process.exit(0);
    } catch (e) {
        console.error('FAILED to connect:', e.message);
        process.exit(1);
    }
}

test();
