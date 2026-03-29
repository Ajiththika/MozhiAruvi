import mongoose from 'mongoose';

export async function connectDB() {
    const options = {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        connectTimeoutMS: 10000,
        // bufferCommands: false, // Disable buffering so it fails immediately
    };
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('MongoDB connected');
}
