
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Connecting to Atlas...');

async function test() {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ DATABASE_TEST_CONNECTED');
        process.exit(0);
    } catch (e) {
        console.error('❌ DATABASE_TEST_FAILED:', e.message);
        process.exit(1);
    }
}

test();
