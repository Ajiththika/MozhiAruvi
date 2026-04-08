# Mozhi Aruvi | Error & Vulnerability Report

This file lists specific technical errors, security vulnerabilities, and logic bugs identified within the current codebase that require attention before production deployment.

---

## 1. Security & API Vulnerabilities
### • Lack of Rate Limiting on AI Endpoints [RESOLVED]
*   **Fix Applied**: Implemented `express-rate-limit` with `strictLimiter` (20 req/hr) in `Backend/middleware/rateLimiter.js` and applied it to `aiRoutes` and `tutorRoutes`.

### • Imbalanced JWT Life-Cycle [RESOLVED]
*   **Fix Applied**: Updated `JWT_ACCESS_EXPIRES` to `1h` in `.env`. Assisted session security by implementing dynamic `secure` and `sameSite` cookie flags in `app.js`.

---

## 2. Logic & Scalability Bugs
### • Sequential Processing in Retention Jobs [RESOLVED]
*   **Fix Applied**: Refactored `triggerDailyReminders` to use a batch processing strategy (Chunk size: 10) with `Promise.all`, preventing event-loop blockage.

### • Single Point of Failure: Price ID Hardcoding [RESOLVED]
*   **Fix Applied**: Enhanced `stripeService.js` with stricter format validation and error boundaries to prevent application crashes during checkout.

---

## 3. Environment & Configuration
### • Missing 'Secure' Cookie Flag in Sandbox
*   **Location**: `Backend/server.js` (cookie-parser configuration)
*   **Error**: `COOKIE_SECURE` is set to `false` in the environment.
*   **Risk**: In a production HTTPS environment, cookies without the `Secure` flag are vulnerable to packet sniffing (Man-in-the-Middle attacks).
*   **Fix**: Ensure `COOKIE_SECURE=true` is set in the production `.env`.

---

## 4. Code Quality Errors
### • Prop Drilling & State Overhead
*   **Location**: `Frontend/src/app/admin/events/page.tsx`
*   **Error**: This file exceeds 500 lines and handles data fetching, sorting, filtering, and table rendering in one block.
*   **Risk**: High probability of "stale state" bugs where the UI shows incorrect data after an edit or delete operation until a full page refresh occurs.
*   **Fix**: Extract table logic into a dedicated `<EventManagementTable />` component and use `React Query` or `SWR` for state synchronization.
