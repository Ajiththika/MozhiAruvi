# Project Audit Report: Mozhi Aruvi

## 1. Overview
Mozhi Aruvi is a high-fidelity EdTech platform focused on Tamil language preservation and learning. It features a curriculum-based lesson system, a mentor (tutor) marketplace, community events, and a cultural blog. The project utilizes a cutting-edge tech stack (Tailwind CSS v4, Next.js 16/15, React 19) giving it a premium, modern feel.

---

## 2. Strengths
*   **Visual Aesthetics:** The design is top-tier. The use of Tamil typography as decorative watermarks (`க`, `அ`, `ழ`) creates immediate cultural resonance and a premium "fountain of knowledge" feel.
*   **Modern Tech Stack:** Adopting Tailwind CSS v4 and React 19 early allows for a highly performant and accessible UI system.
*   **Robust Authentication:** The JWT implementation with `HttpOnly` cookies, Google OAuth 2.0 via Passport, and a singleton Axios interceptor for token refreshes is professional-grade.
*   **Structured Backend:** The separation of Controllers, Services, and Models is clean and follows standard enterprise patterns.
*   **Zod Integration:** Strict validation schemas on the backend (especially in `userRoutes.js` and `authRoutes.js`) provide a strong first line of defense against corrupted data.

---

## 3. Weaknesses
*   **Feature Simulation:** The "AI Writing/Speaking Evaluation" is currently a **mockup**. The backend `evaluateSpeaking` controller returns simulated `passed: true` responses without actual processing.
*   **Component Bloat:** Several core pages are massive. `LessonInteractiveSession` (650+ lines) and `EventsPage` (365 lines) handle too many responsibilities (fetching, state, UI, modals, audio logic).
*   **Next.js "Client-Side Heavy" Pattern:** Almost every page is marked `"use client"`. This negates the SEO and performance benefits of the Next.js App Router (SSR/ISR).
*   **Naming Inconsistency:** The database uses the role `student`, but frontend types and some services refer to the same user as `user`, leading to potential type-safety friction.

---

## 4. Code Issues
*   **Large Files:**
    - `Frontend/src/app/student/lessons/[id]/page.tsx` (**653 lines**): Needs to be split into `AudioRecorder`, `QuestionCard`, `AskTutorModal`, and `LessonProgress` components.
    - `Frontend/src/app/events/page.tsx` (**365 lines**): The "Featured Event" UI is hardcoded inline instead of using a modified `EventCard`.
*   **Mixed Responsibilities:** Services in `Frontend/src/services` are clean, but page components are executing complex data transformations (e.g., `groupByCategory` in `PublicLessonsPage`) that should be handled in the API or custom hooks.
*   **Missing Abstraction:** Utility colors in `globals.css` are well-defined, but some components still use hardcoded hex values or previous theme remnants.

---

## 5. UI/UX Issues
*   **Design Inconsistency:** The landing page has an "Organic Heritage" look, while the dashboard is "Ultra-Modern Bento." These need a visual bridge (e.g., carrying over the heritage watermarks to the dashboard backgrounds).
*   **Extreme Borders:** The use of `rounded-[2.5rem]` or `rounded-[3rem]` on cards looks great on desktop but creates significant "dead space" on small mobile devices.
*   **Empty States:** Several sections (Archives, No Active Lessons) show "No Data" with low-contrast text. These should use beautiful illustrations or CTA prompts to prevent a "ghost town" feel.

---

## 6. Architecture Problems
*   **God Object Pattern:** The `User` model in MongoDB is becoming a "God Object," storing Auth, Profile, Tutor settings, Credits, XP, and Learning Progress. 
    - *Risk:* Queries will slow down significantly as the user base scales.
*   **Client-Side Fetching:** Relying on `useQuery` for everything makes the initial page load feel "hollow" (skeleton screens everywhere).

---

## 7. Performance Issues
*   **Initial Load:** Moving the Landing, About, and Blog List pages to **Server Components** could improve First Contentful Paint (FCP) by ~60%.
*   **Audio Handling:** Speaking evaluation uploads raw blobs. For production, these should be compressed on the client side before transmission to save bandwidth.

---

## 8. Security Risks
*   **Rate Limiting:** The `register` and `login` routes lack protection against brute-force or bot-flooding.
*   **CSRF:** While JWT-in-Cookie is used, there is no explicit anti-CSRF token mechanism for state-changing POST requests (like deleting a lesson or joining an event).
*   **Validation Gaps:** Some metadata objects in `TutorRequest` are stored as flexible `any`, which could be exploited to inject unexpected data types.

---

## 10. Tech Stack Evaluation
*   **Next.js 16 (Pre-release Bridge):** Using a bleeding-edge version of Next (16.1.6) is bold. It indicates better AI context support but may suffer from breaking changes in standard libraries.
*   **Tailwind 4:** Excellent choice. Performance is vastly superior to v3.
*   **Verdict:** The stack is **Optimal but Experimental**. It requires a robust testing suite to ensure future-proofing.

---

## 11. AI Integration
*   **Current State:** **Mocked.** The "Ask AI Tutor" button links to a human tutor request form.
*   **Improvement:** 
    - Implement **OpenAI Whisper** or **Google Speech-to-Text** for real `evaluateSpeaking` logic.
    - Integrate a "Linguistic LLM" (Gemini 2.0) to provide immediate automated feedback before the human tutor responds.

---

## 12. Project Level: **Intermediate (Ready for Beta)**
The project has a solid "Happy Path" and premium visuals but lacks the "Defensive Architecture" (Safety, Tests, Performance Ops) required for a public SaaS.

---

## 13. Improvement Roadmap

### Phase 1: Critical Fixes
1.  **Rate Limiting:** Add `express-rate-limit` to Auth and Register routes.
2.  **Role Unification:** Standardize on `student` vs `teacher` vs `admin` across all layers.
3.  **Error Handling:** Implement Global Error Boundaries in the Frontend to prevent white-screen crashes.

### Phase 2: Refactoring & SSR
1.  **SSR Migration:** Convert Landing and Lessons List to Server Components.
2.  **Component Splitting:** Refactor `LessonInteractiveSession` (650+ lines) into 4-5 sub-components.
3.  **UI Bridge:** Add Tamil watermarks to Dashboard to unify heritage/modern styles.

### Phase 3: Real AI & Features
1.  **Real Pronunciation Scoring:** Connect `evaluateSpeaking` to a real Speech-to-Text API.
2.  **Credit System:** Move XP/Credit logic to a dedicated `Transaction` model rather than just updating the `User` document.

### Phase 4: Production Readiness
1.  **Testing:** Reach 40% coverage on core credit/XP logic.
2.  **Monitoring:** Integrate Sentry and a logging service (Winston/Pino).

---

## 14. Cleanup Plan
*   **Delete:** `fix_tailwind.js`, `ts_errors.txt`, `ts_errors2.txt`.
*   **Move:** `seed.js` -> `Backend/seeds/`.
*   **Refactor:** `Frontend/src/app/student/lessons/[id]/page.tsx` (Split into smaller files).

---

## 15. Final Verdict
**Brutally Honest:** Mozhi Aruvi is beautiful but currently a "hollow shell" as an AI platform. Once the simulated evaluation is replaced with real AI logic and the large components are refactored into a scalable pattern, this will be a best-in-class SaaS.
