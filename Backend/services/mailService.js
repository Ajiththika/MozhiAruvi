import nodemailer from 'nodemailer';

/**
 * Creates a fresh Nodemailer transporter using current env values.
 * Called lazily (inside functions) so env is guaranteed to be loaded.
 */
function createTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_USER || !SMTP_PASS) {
        throw new Error('SMTP_USER or SMTP_PASS is not set in environment variables.');
    }

    const port = Number(SMTP_PORT) || 587;

    return nodemailer.createTransport({
        host: SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: port === 465, // true only for port 465, false for 587 (STARTTLS)
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
}

// ── Send Password Reset Email ─────────────────────────────────────────────────
export async function sendPasswordResetEmail(to, resetUrl) {
    let transporter;
    try {
        transporter = createTransporter();
    } catch (configError) {
        console.warn('[MAIL] SMTP not configured —', configError.message);
        console.log(`[MAIL] Reset link for ${to}: ${resetUrl}`);
        return;
    }

    // Strip surrounding quotes from SMTP_FROM if present (dotenv quirk)
    const rawFrom = process.env.SMTP_FROM || '';
    const from = rawFrom.replace(/^["']|["']$/g, '') || `"Mozhi Aruvi" <${process.env.SMTP_USER}>`;

    const mailOptions = {
        from,
        to,
        subject: 'Password Reset Request – Mozhi Aruvi',
        text: `You requested a password reset.\n\nClick the link below (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; color: #333;">
                <h2 style="color: #007bff; text-align: center;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>You recently requested to reset your password for your <strong>Mozhi Aruvi</strong> account. Click the button below to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p>If the button above does not work, copy and paste the following link into your browser:</p>
                <p style="word-break: break-all;">
                    <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
                </p>
                <p style="font-size: 12px; color: #777;">This link expires in <strong>1 hour</strong>.</p>
                <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                <p style="font-size: 12px; color: #777; text-align: center;">
                    If you did not request a password reset, you can safely ignore this email.
                </p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[MAIL] ✅ Reset email sent to ${to} — messageId: ${info.messageId}`);
    } catch (error) {
        console.error('[MAIL] ❌ SMTP sendMail failed:', error);
        throw new Error('Failed to send reset email. Please check your email configuration.');
    }
}

// ── SMTP Connection Test (used by /api/test-email) ───────────────────────────
export async function testSmtpConnection(to) {
    const transporter = createTransporter();

    // verify() checks the connection and auth before sending
    await transporter.verify();

    const rawFrom = process.env.SMTP_FROM || '';
    const from = rawFrom.replace(/^["']|["']$/g, '') || `"Mozhi Aruvi" <${process.env.SMTP_USER}>`;

    const info = await transporter.sendMail({
        from,
        to,
        subject: '[Test] Mozhi Aruvi SMTP Check',
        text: 'This is a test email to verify SMTP configuration is working correctly.',
    });

    return info.messageId;
}
