# Mozhi Aruvi | Project Technical Overview

## 1. Executive Summary
Mozhi Aruvi is a high-performance, premium Tamil language learning platform designed to bridge the gap between traditional learning and modern technology. It leverages AI-driven assistance, community-driven events, and a professional tutor marketplace to provide an immersive educational experience.

---

## 2. Technology Stack
| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | **Next.js 15 (App Router)** | SEO optimization, fast Server-Side Rendering (SSR), and superior developer experience with nested layouts. |
| **Backend** | **Node.js + Express** | High concurrency handling and seamless integration with the JavaScript ecosystem. |
| **Database** | **MongoDB (Mongoose)** | Flexible document-based schema suited for evolving educational content and user progress tracking. |
| **Styling** | **Tailwind CSS** | Atomic utility-first styling for the premium, high-density UI identity. |
| **AI Engine** | **Google Gemini 1.5 Pro** | State-of-the-art natural language processing for cultural and linguistic nuances. |
| **Storage** | **Cloudinary** | Distributed CDN for high-speed delivery of tutor posters and profile assets. |
| **Payments** | **Stripe Connect** | Secure subscription management and marketplace split-payments for tutors. |

---

## 3. Architecture & Design Patterns
### Folder Structure Style
The project follows a **Feature-Based Modular Structure** to ensure maintainability as the platform scales.

**Frontend:**
- `src/app/`: Next.js App Router (Admin, Student, Tutor portals).
- `src/components/ui/`: Atomic design components (Buttons, Modals, Cards).
- `src/components/features/`: Complex modules (Event listing, Lesson interactive sessions).
- `src/services/`: API abstraction layer using Axios.

**Backend:**
- `routes/`: Express endpoint definitions with Zod validation.
- `controllers/`: Request/Response orchestration.
- `services/`: Core business logic (AI interaction, stripe processing).
- `models/`: Mongoose schemas.
- `jobs/`: Automated cron tasks.

### Resilient API Flow
- **Axios Interceptors**: Handles automatic JWT access token rotation on 401 errors using a refresh token stored in HTTP-only cookies.
- **Response Wrapping**: All API responses follow a unified `{ success: boolean, data: unknown, error: { code, message } }` structure.
- **CSRF Protection**: Origin-based validation to ensure requests originate only from trusted platform domains.

---

## 4. Database Models (Schema Architecture)
1. **User**: Comprehensive profile including XP (points), power (energy), learning credits, and subscription status (FREE, PRO, PREMIUM, BUSINESS).
2. **Lesson**: Handles curriculum content segments, leveled difficulty, and interactive session data.
3. **Event**: Manages community workshops with participant capacity, status tracking (Active/Completed), and banner images.
4. **TutorRequest**: A threaded messaging system for expert doubt-solving, integrating AI-first responses.
5. **Booking**: Marketplace logic for 1:1 classes, tracking payment status and meeting links.
6. **PlanSettings**: Gated access control defining limits for events and tutor support per subscription tier.

---

## 5. AI Integration (Linguistic Expert Hub)
Mozhi Aruvi integrates **Google Gemini** to act as a 24/7 educational assistant:
- **Doubt Solving**: When a student submits a "Linguistic Challenge," the AI provides an immediate pedagogical response before the tutor follows up.
- **Context Awareness**: The AI is fed lesson-specific metadata to provide relevant translations and explanations based on the student's current progress.

---

## 6. Automation & Cron Jobs
The **Mozhi Automation Suite** (node-cron) handles persistent platform health:
- **Monthly Resets**: On the 1st of each month, tutor support counts and free event usage are restored for all accounts.
- **Retention Nudges**: Identifies users inactive for >3 days and triggers engagement events.
- **Admin Pulse**: Monthly reports generated for system administrators regarding user growth and marketplace activity.

---

## 7. Error Handling & Recent Resolutions
### Strategy
- **Frontend**: Global Error Boundaries and a centralized `api.ts` logger.
- **Backend**: Centralized `errorHandler` middleware sanitizing Zod and Mongoose errors.

### Recent Major Fixes
- **500 Authentication Error**: Resolved schema mismatch where `lastLogin` and `lastReminderSent` were missing from the User model during login tracking.
- **400 Tutor Request Error**: Fixed a validation failure in `AskTutorModal` where redundant student fields were conflicting with the backend's `.strict()` schema.
- **Token Restoration Logic**: Corrected an logic error where `NaN` values occurred during refresh token expiration calculations due to non-numeric environment variables.

---

## 8. Why Next.js?
Next.js was selected for the frontend to meet the platform's high standards for performance and SEO:
- **SEO**: Static generation for blog posts and landing pages ensures Mozhi Aruvi ranks high in educational search results.
- **Developer Speed**: The App Router allows for robust shared layouts (e.g., Sidebar/Navbar) across the Admin and Student dashboards without re-rendering.
- **Proxy Rewrites**: Built-in middleware allows the frontend to proxy API requests, resolving many common CORS and network resolution issues found in typical React/Express setups.

---

## 9. License
Distributed under the **MIT License**.
