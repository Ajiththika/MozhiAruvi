import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PlanSettings from './models/PlanSettings.js';
import User from './models/User.js';

dotenv.config();

const migrate = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        // 1. Update PlanSettings collection
        console.log("Migrating PlanSettings...");
        await PlanSettings.updateMany({ plan: 'FREE' }, { $set: { plan: 'BASIC' } });
        await PlanSettings.updateMany({ plan: 'PRO' }, { $set: { plan: 'PLUS' } });
        await PlanSettings.updateMany({ plan: 'PREMIUM' }, { $set: { plan: 'MASTER' } });
        console.log("PlanSettings migrated.");

        // 2. Update User collection
        console.log("Migrating Users...");
        await User.updateMany({ 'subscription.plan': 'FREE' }, { $set: { 'subscription.plan': 'BASIC' } });
        await User.updateMany({ 'subscription.plan': 'PRO' }, { $set: { 'subscription.plan': 'PLUS' } });
        await User.updateMany({ 'subscription.plan': 'PREMIUM' }, { $set: { 'subscription.plan': 'MASTER' } });
        console.log("Users migrated.");

        console.log("Migration complete.");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
};

migrate();
