import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const usersToSeed = [
    {
        name: 'Super Admin',
        email: 'ajiththika17@gmail.com',
        password: 'Ajiththika17',
        role: 'superadmin'
    },
    {
        name: 'Admin',
        email: 'ajieajiththi@gmail.com',
        password: 'Ajie5317',
        role: 'admin'
    },
    {
        name: 'Sivathas',
        email: 'sivathas4@gmail.com',
        password: 'siva1234',
        role: 'user'
    },
    {
        name: 'Abilash',
        email: 'abilash12@gmail.com',
        password: 'Abi12345',
        role: 'user'
    },
    {
        name: 'User 3',
        email: 'user3@example.com',
        password: 'password123',
        role: 'user'
    },
    {
        name: 'User 4',
        email: 'user4@example.com',
        password: 'password123',
        role: 'user'
    },
    {
        name: 'User 5',
        email: 'user5@example.com',
        password: 'password123',
        role: 'user'
    }
];

async function seed() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in the .env file');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        console.log('Seeding users...');
        for (const userData of usersToSeed) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.email} already exists. Skipping...`);
                continue;
            }

            // Mongoose pre-save hook in User model will hash the password
            await User.create(userData);
            console.log(`Created user: ${userData.email} (${userData.role})`);
        }

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    }
}

seed();
