import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendPasswordResetEmail(to, resetUrl) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('\n⚠️ SMTP_USER or SMTP_PASS not set in .env! Logging reset link to console instead:');
        console.log(`[MAIL] Reset link for ${to}: ${resetUrl}\n`);
        return;
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || `"Mozhi Arivu" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Please click on the following link or paste it into your browser to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; color: #333;">
                <h2 style="color: #007bff; text-align: center;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>You recently requested to reset your password for your Mozhi Arivu account. Click the button below to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px; font-weight: bold; cursor: pointer;">Reset Password</a>
                </div>
                <p>If the button above does not work, copy and paste the following link into your browser:</p>
                <p style="word-break: break-all; color: #007bff;">
                    <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                <p style="font-size: 12px; color: #777; text-align: center;">
                    If you did not request a password reset, please ignore this email or contact support if you have questions.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[MAIL] Password reset email successfully sent to ${to}`);
    } catch (error) {
        console.error(`[MAIL] Failed to send password reset email to ${to}:`, error);
        throw new Error('Failed to send reset email. Please check your email configuration.');
    }
}
