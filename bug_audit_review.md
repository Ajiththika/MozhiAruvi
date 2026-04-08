# Mozhi Aruvi | Project Audit & Quality Review

This report provides a comprehensive analysis of the Mozhi Aruvi codebase as of April 8, 2026. It highlights architectural strengths, identifies potential areas of risk (bugs), and offers a critical review of the current implementation.

---

## 🛡️ The Good (Strengths)

### 1. Robust Security Model
- **Token Rotation**: The use of a decoupled Access/Refresh token system with HTTP-only cookies is a production-grade security practice. It minimizes the impact of XSS attacks.
- **Strict Validation**: Heavily utilizes `Zod` for request schema validation on the backend, preventing structural data injection and reducing 500 errors.
- **Access Control Middlewares**: Centralized logic in `accessControl.js` to handle gated content based on subscription levels ensures consistent monetization enforcement.

### 2. High-Density Aesthetic
- **Premium UI**: The application avoids generic "MVP" looks, opting for glassmorphism, smooth CSS transitions, and carefully curated HSL color palettes.
- **Consistent Branding**: Logo and navigation patterns are standardized across all device breakpoints.

### 3. Progressive AI Integration
- **Contextual Assistance**: AI handles the first line of student doubts, which drastically reduces tutor workload and provides immediate value to learners.
- **Fail-safe fallback**: AI responses are designed to complement, not replace, human tutors, maintaining the platform's focus on native expertise.

### 4. Resilient Backend Automation
- **Decoupled Jobs**: The use of `node-cron` for monthly resets and retention reminders ensures consistent platform state without manual admin intervention.
- **Event-Driven Notifications**: Using a central `eventEmitter` (mozhiEvents) allows for loose coupling between business logic and notification delivery (Emails, In-app pings).

---

## ⚠️ The Bad (Weaknesses & Technical Debt)

### 1. Testing Infrastructure
- **Observation**: No automated testing suites (Jest, Cypress, or Playwright) are currently initialized.
- **Risk**: High risk of regression errors when refactoring core logic like the payment webhook or access control middleware.

### 2. Code Density in View-Components
- **Observation**: Large pages like `AdminEventsPage` and `EventsPage` contain significant amounts of inline business logic and local components.
- **Recommendation**: Refactor these into scoped atomic components (e.g., `EventListHeader`, `EventTableBody`) to improve readability and unit testability.

### 3. Scalability of Scheduled Tasks
- **Observation**: The `triggerDailyReminders` job loops through all inactive users sequentially. 
- **Risk**: As the user base grows into the thousands, this operation could block the event loop or hit execution timeouts. Batch processing or worker threads should be considered.

---

## 🕵️ Potential Bugs & Edge Cases

| Issue Category | Description | Severity | Status |
|---|---|---|---|
| **Stripe Webhook Sync** | If a webhook fails to deliver due to network jitter, the `subscription.tutorSupportUsed` count might not reset. | **Medium** | Mitigation: Monthly cron reset handles this as a fallback. |
| **Price ID Hardcoding** | `.env` contains hardcoded Stripe Price IDs. Deleting these in the Stripe dashboard will cause the checkout flow to crash. | **Low** | Recommendation: Move product mapping to a database config table. |
| **AI Rate Limiting** | Publicly accessible AI-driven routes are vulnerable to rapid-fire requests which could deplete Gemini API quotas. | **Medium** | Fix: Implement `express-rate-limit` specifically on the AI routes. |
| **JWT Expiration Balance** | `JWT_ACCESS_EXPIRES` is currently set to `7d`. Typically, access tokens should be `15m-1h` for maximum security, with only the refresh token being long-lived. | **Low** | Review security requirements. |

---

## 🏁 Final Review Score: 8.5/10
**Mozhi Aruvi is a well-architected, visually stunning platform that is remarkably close to production readiness.** 

The transition from a simple React app to a full-stack Next.js/Express ecosystem has been handled cleanly. By addressing the lack of automated tests and refining the scalability of background jobs, the platform will be ready to handle high-volume traffic with minimal maintenance overhead.

---
*Report Generated: 2026-04-08*
