// ── Mozhi Aruvi Premium Email UI System ─────────────────────────────────────
// Clean Architecture, Soft Shadows, Rounded Architecture (Saas-Standard)
// ─────────────────────────────────────────────────────────────────────────────

const colors = {
    primary: '#4f46e5',
    secondary: '#818cf8',
    surface: '#f8fafc',
    text: '#1e293b',
    muted: '#64748b',
};

const layout = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap');
        body { font-family: 'Outfit', sans-serif; background: #fff; color: ${colors.text}; margin: 0; padding: 40px 0; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #f1f5f9; border-radius: 2.5rem; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.05); overflow: hidden; }
        .header { background: ${colors.primary}; padding: 40px; text-align: center; }
        .logo { color: #fff; font-size: 24px; font-weight: 800; letter-spacing: -1px; text-transform: uppercase; }
        .content { padding: 40px; line-height: 1.6; }
        .footer { padding: 40px; background: ${colors.surface}; text-align: center; font-size: 12px; color: ${colors.muted}; border-top: 1px solid #f1f5f9; }
        .cta-btn { display: inline-block; padding: 16px 32px; background: ${colors.primary}; color: #fff !important; text-decoration: none; border-radius: 1rem; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 20px 40px -10px rgba(79,70,229,0.3); transition: transform 0.3s ease; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .stat-card { background: ${colors.surface}; padding: 20px; border-radius: 1.5rem; text-align: center; }
        .stat-val { font-size: 24px; font-weight: 800; color: ${colors.primary}; display: block; }
        .stat-lab { font-size: 10px; color: ${colors.muted}; text-transform: uppercase; letter-spacing: 1px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <div class="logo">Mozhi Aruvi</div>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            &copy; 2026 Mozhi Aruvi. Mastering the Tamil language at scale.<br>
            Official Editorial Workspace &middot; Premium Ecosystem
        </div>
    </div>
</body>
</html>
`;

export const templates = {
    // ── User Templates ──────────────────────────────────────────────────────────
    WELCOME: (name) => layout(`
        <h1 style="font-size: 32px; letter-spacing: -1px; margin-bottom: 20px;">Welcome to the Flow, ${name}!</h1>
        <p>Your journey into the depths of the Tamil language begins today. We've built a world-class platform to guide you from beginner to linguistic mastery.</p>
        <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="cta-btn">Start Your First Lesson →</a>
        </div>
        <p style="color: ${colors.muted}">"Mozhi Aruvi" — Where your voice finds its roots.</p>
    `),

    INACTIVE_REMINDER: (name) => layout(`
        <h1 style="font-size: 32px; margin-bottom: 20px;">We miss your voice, ${name}.</h1>
        <p>It's been 3 days since your last practice. Language is a living river; keep it flowing to stay sharp!</p>
        <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="cta-btn">Continue Your Path →</a>
        </div>
    `),

    // ── Tutor Templates ─────────────────────────────────────────────────────────
    TUTOR_APPROVED: (name) => layout(`
        <h1 style="font-size: 32px; margin-bottom: 20px;">🎉 Congratulations, Tutor ${name}!</h1>
        <p>Official Decision: **Approved**. You are now a recognized guide in the Mozhi Aruvi community.</p>
        <p>Students are waiting to connect with your expertise. Set up your availability and start teaching.</p>
        <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL}/tutor/dashboard" class="cta-btn">Enter Tutor Suite →</a>
        </div>
    `),

    // ── Analytics Templates (High Value Reports) ───────────────────────────────
    ADMIN_MONTHLY: (data) => layout(`
        <h1 style="font-size: 24px; margin-bottom: 10px;">Mozhi Aruvi Systems: Monthly Pulse</h1>
        <p style="color: ${colors.muted}; font-size: 14px;">Analytics Snapshot &middot; ${data.month}</p>
        
        <div class="stats-grid" style="display: table; width: 100%; border-spacing: 10px;">
           <div style="display: table-cell; background: #f8fafc; padding: 20px; border-radius: 20px; text-align: center;">
             <span style="font-size: 24px; font-weight: 800; color: #4f46e5;">${data.totalUsers}</span>
             <br/><span style="font-size: 10px; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">Total Active Users</span>
           </div>
           <div style="display: table-cell; background: #f8fafc; padding: 20px; border-radius: 20px; text-align: center;">
             <span style="font-size: 24px; font-weight: 800; color: #4f46e5;">${data.newUsers}</span>
             <br/><span style="font-size: 10px; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">New Onboarding</span>
           </div>
        </div>

        <h3 style="margin-top: 30px;">Strategic Insights:</h3>
        <ul style="color: ${colors.muted}">
            <li>Tutor Applications: **${data.tutorApps}** Pending Analysis</li>
            <li>Engagement Score: **High (+12%)**</li>
            <li>Revenue Stream: **${data.revenue}**</li>
        </ul>
        <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/dashboard" class="cta-btn">Full Operational View →</a>
        </div>
    `),
};
