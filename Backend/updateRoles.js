import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const usersToUpdate = [
    {
        email: 'ajiththika17@gmail.com',
        role: 'superadmin',
        password: 'Ajiththika17'
    },
    {
        email: 'ajieajiththi@gmail.com',
        role: 'admin',
        password: 'Ajie5317'
    },
    {
        email: 'sivathas4@gmail.com',
        role: 'user',
        password: 'siva1234'
    },
    {
        email: 'abilash12@gmail.com',
        role: 'user',
        password: 'Abi12345'
    }
];

async function updatePasswordsAndRoles() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB. Correcting roles and passwords...');

        for (const data of usersToUpdate) {
            const user = await User.findOne({ email: data.email });
            if (user) {
                user.role = data.role;
                user.password = data.password; // Since we have pre-save hook, it will hash automatically
                await user.save();
                console.log(`Updated ${data.email} with newly requested password & role: ${data.role}`);
            }
        }
        console.log('Role/Password correction complete!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

updatePasswordsAndRoles();
