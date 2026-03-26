# MozhiAruvi Project Audit

## 1. Project Overview
- **The System:** MozhiAruvi is a specialized EdTech platform designed to preserve and teach the Tamil language and culture. It combines structured learning (lessons), community engagement (blogs/events), and personalized mentorship (tutor requests).
- **Target Users:** Global Tamil diaspora, language enthusiasts, and certified tutors looking to monetize their expertise.
- **Product Clarity:** The product idea is solid and high-value. However, it currently tries to be three things at once: Duolingo (lessons), Medium (blogs), and Meetup (events). While this creates a "super-app" feel, it risks diluted user focus if transitions between these sections aren't seamless.

## 2. Current Implementation (What is Done)

### Landing Page
- **What exists:** A high-fidelity hero section with heritage-focused decorative elements and service overviews.
- **What works well:** The visual storytelling using Tamil typography (`அ`, `ழ`, `ஞ`) creates immediate cultural resonance.
- **What is incomplete:** Many CTA buttons feel "templatey" and don't lead to distinct, high-value landing experiences for each sub-brand (Events/Blogs).

### Events Page
- **What exists:** A listing of upcoming and past events with a registration modal.
- **What works well:** The distinction between Online and In-Person events and the "Featured Event" spotlight.
- **What is incomplete:** Large components (440+ lines) that lack proper internal modularity.

### Blogs Page
- **What exists:** CRUD functionality for stories with an administrative approval flow.
- **What works well:** Basic SEO structure (slugs) and role-based contribution (only students/teachers can write).
- **What is incomplete:** Media handling is basic; rich text editing is underserved in the UI.

### Dashboard (Admin / Tutor / Student)
- **What exists:** Role-specific views with stats and quick-access cards.
- **What works well:** The "StatCard" system and the "Next Lesson" resume feature.
- **What is incomplete:** The dashboards feel "hollow" because many data points (like progress percentages) are currently hardcoded or inconsistently calculated.

### Authentication & RBAC
- **What exists:** Full JWT-based flow with HttpOnly cookies, Google OAuth, and route guards.
- **What works well:** Axios interceptors for automatic token refresh use a singleton pattern (prevents race conditions).
- **What is incomplete:** Role name inconsistency (Backend uses `student`, Frontend uses `user` in types/services).

## 3. UI/UX Audit (Brutally Honest)
- **Color System Issues:** The `@theme` in `globals.css` defines `primary`, but the codebase is riddled with `text-mozhi-primary`. This breaks Tailwind utility generation and indicates a "copy-paste" residue from a previous skeleton.
- **Layout Consistency:** The "Heritage Hero" (Landing) uses organic, watermark-style letters, while the "Dashboard" uses ultra-modern "Bento Grid" styles. The transition feels like leaving a museum and entering a bank.
- **Over-Styling:** There is an obsession with extreme rounded corners (`rounded-[2.5rem]`). On small screens, this wastes significantly more container space than standard `rounded-2xl`.
- **Component Reuse:** `EventsPage.tsx` defines cards internally instead of using a global `EventCard`. This makes cross-page updates (like adding a date format change) a nightmare.

## 4. Code Architecture Review
- **Folder Structure:** Good separation of Frontend and Backend, but the Frontend `src/services` contains too much logic. Services should be "dumb" fetchers; logic belongs in hooks or server components.
- **Inconsistency in Roles:** `RoleProtectedRoute.tsx` refers to `user`, but `roleUtils.ts` handles `student`. This mismatch can lead to silent redirection bugs.
- **Separation of Concerns:** Many page components are 300+ lines. They manage API state, UI state, and modal state simultaneously.
- **API Structure:** Backend is well-structured with controllers/services, but lacks a centralized "Response Wrapper" (inconsistent success/error JSON shapes across different routes).

## 5. RBAC & Security Review
- **Insecure Registration:** The `/api/auth/register` route lacks rate-limiting. A simple script could flood your DB with "bot" students in minutes.
- **CSRF Risk:** While using HttpOnly cookies for refresh tokens is good, there is no explicit CSRF protection (anti-forgery tokens) for state-changing POST requests (like deleting a lesson).
- **Frontend-only Guards:** While `RoleProtectedRoute` works, it only protects the View. A malicious user can still inspect the bundle or mock the API response to see UI components they shouldn't (Admin links appearing in Student DOM).
- **Credential Leak Risks:** Some `.env` keys in the root might be accidentally committed if the `.gitignore` isn't strictly maintained.

## 6. Performance & Scalability
- **Client-Side Heavy:** Almost every page is marked `"use client"`. This negates the SEO and Performance benefits of Next.js 15. The Landing and About pages SHOULD be Server Components.
- **Redundant Fetches:** Navigating between dashboard tabs triggers full data re-fetches for `getDashboardData`. Lack of a client-side cache (like TanStack Query) makes the app feel "heavy" on slow networks.
- **Future Risk:** The `User` model in MongoDB is becoming a "God Object." It stores Auth, Profile, Tutor settings, Credits, and Learning Progress. This will cause slow queries as the user base grows.

## 7. What You Did Well
- **Voice Practice Implementation:** The `evaluateSpeaking` integration in lessons is genuinely impressive and sets this apart from basic CRUD apps.
- **Auth Robustness:** The token refresh logic with `refreshingPromise` is professional-grade and avoids the "Logout of nowhere" bug typical in junior projects.
- **Visual Polish:** Despite the inconsistencies, the individual components look premium. Transitions and "hover-to-translate" effects feel high-end.

## 8. Critical Problems (Top Priority)
1. **Broken Theme:** Fix the `mozhi-primary` vs `primary` inconsistency in Tailwind.
2. **Rate Limiting:** Protect the `register` route immediately.
3. **Role Unification:** Sync role names across DB schema, Frontend types, and Protected Routes (`student` vs `user`).
4. **Testing Deficit:** There is ZERO test coverage (Unit/Integration). High-risk for a platform handling "Credits" (virtual currency).
5. **Route Bloat:** Modularize `EventsPage` and `Dashboard` into sub-components.

## 9. Step-by-Step Improvement Roadmap

### Phase 1 (Foundation Fix)
- **Standardize UI Tokens:** Audit all components for `mozhi-primary` and replace with theme variables.
- **RBAC Audit:** Refactor `RoleProtectedRoute` to use centralized constants from a shared `roles.ts`.
- **Backend Hardening:** Add rate-limiting to `register` and `events/join-request`.

### Phase 2 (UI/UX Upgrade)
- **Visual Bridge:** Introduce the "Tamil Watermark" heritage elements into the Dashboard backgrounds to bridge the gap with the Landing page.
- **Card Standardization:** Create a unified `Card` component for Events, Blogs, and Lessons to ensure padding and corner-radius consistency.
- **Mobile optimization:** Reduce `rounded-[2.5rem]` to `rounded-2xl` on mobile devices.

### Phase 3 (Feature Maturity)
- **Server Component Conversion:** Migrate the Landing page and Blogs list to Server Components for 3x faster First Contentful Paint (FCP).
- **Cache Implementation:** Add `react-query` to dashboard data fetching.
- **Tutor Availability:** Move from a simple `isTutorAvailable` boolean to a structured "Weekly Schedule" object.

### Phase 4 (Production Readiness)
- **Error Boundaries:** Implement global error boundaries to catch "White Screen of Death" during API failures.
- **Testing:** Write unit tests for the Credit/XP deduction logic.
- **Logging:** Implement a production logger (like Pino or Winston) on the backend to track RBAC denials.

## 10. Recommended Tech Improvements
- **UI Library:** Use `Shadcn UI` for core components (Modals, Tabs, Buttons) to avoid reinventing the wheel with ad-hoc Tailwind.
- **State Management:** Use `TanStack Query (React Query)` for all API data. It handles caching and loading states automatically.
- **Forms:** Use `React Hook Form` + `Zod` in the Frontend to match your Backend validation schemas.
- **Logging:** Add `Sentry` for error tracking in production.

## 11. Final Verdict
- **Current Level:** **Intermediate.** You have built a functional, visually appealing system that works, but it's held together by "happy path" logic and theme hacks.
- **What is missing to become professional:**
    1. A consistent Design System (not just a bunch of CSS classes).
    2. Automated Test Coverage (CI/CD readiness).
    3. Proper usage of Next.js Server Components.
    4. Proactive security (Rate limiting, CSRF).
