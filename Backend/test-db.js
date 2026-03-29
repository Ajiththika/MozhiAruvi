import 'dotenv/config';
import mongoose from 'mongoose';

async function testConnection() {
    try {
        console.log('Attempting to connect to:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//****@'));
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully!');
        process.exit(0);
    } catch (err) {
        console.error('MongoDB connection error details:');
        console.error('Name:', err.name);
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
        if (err.reason) {
            console.error('Reason:', err.reason);
        }
        process.exit(1);
    }
}

testConnection();
