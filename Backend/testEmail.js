import dotenv from 'dotenv';
dotenv.config();

import { sendVerificationEmail, testSmtpConnection } from './services/mailService.js';

async function run() {
    console.log("Testing SMTP...");
    try {
        await testSmtpConnection('ajiththika17@gmail.com');
        console.log("Test SMTP success!");
        
        console.log("Testing verification email...");
        await sendVerificationEmail('ajiththika17@gmail.com', 'http://localhost:3000/verify?token=123');
        console.log("Verification email done.");
    } catch (e) {
        console.error("Test failed:", e);
    }
}
run();
