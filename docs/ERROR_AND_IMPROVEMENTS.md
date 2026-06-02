# Mozhi Aruvi — Error Register & Improvement Suggestions

**Document type:** Error / Risk Register with prioritized improvements
**Version:** 1.0
**Last updated:** May 30, 2026
**Scope:** Codebase review of `Backend/` and `Frontend/`

This document catalogs known issues, latent risks, and concrete improvement suggestions. Each item
has a **severity**, the **location**, the **impact**, and a **recommended fix**.

**Severity key:** 🔴 P0 (critical / correctness or security) · 🟠 P1 (high) · 🟡 P2 (medium) · 🟢 P3 (polish)

---

## 1. Summary Table

| # | Severity | Area | Issue | Status |
|---|----------|------|-------|--------|
| 1 | 🟠 P1 | Data model | Residual Stripe fields after PayPal migration | Open |
| 2 | 🟠 P1 | Data model | Plan naming mismatch: `User.subscription.plan` (BASIC/PLUS/MASTER) vs normalized `basic/plus/pro` | Open |
| 3 | 🟡 P2 | Gamification | Duplicate energy fields: `power`/`learningCredits` vs `progress.energy` | Open |
| 4 | 🟠 P1 | Testing | No automated test suite | Open |
| 5 | 🟡 P2 | Observability | No centralized logging / monitoring / error tracking | Open |
| 6 | 🟡 P2 | UX consistency | `alert()` / `confirm()` still used instead of Toast/modal in places | Partially fixed |
| 7 | 🟡 P2 | Performance | Global `Cache-Control: no-store` on every response | Open |
| 8 | 🟠 P1 | Frontend reliability | Lesson "first click bounces / works on 2nd click" navigation race | Recommended fix |
| 9 | 🟢 P3 | Hygiene | Stale comments referencing Stripe (e.g. `payBooking`) | Open |
| 10 | 🟡 P2 | Upload reliability | Axios FormData uploads may inherit default JSON `Content-Type` | Verify |
| 11 | 🟢 P3 | Config | Hardcoded fallback values (`hourlyRate=30`, `rating=4.5`) | Open |
| 12 | 🟡 P2 | Security/Errors | `getMe` swallows 401/403; silent CORS rejection | Open |

---

## 2. Detailed Findings

### 🟠 #1 — Residual Stripe fields after PayPal migration
- **Location:** `Backend/models/User.js` (`stripeAccountId`, `isStripeVerified`,
  `subscription.stripeCustomerId`, `subscription.stripeSubscriptionId`, "Stripe" comments).
- **Impact:** Confusing schema; dead fields can mislead future development and reporting; risk of
  code paths referencing removed providers.
- **Recommendation:**
  - Rename/replace with PayPal equivalents: `paypalCustomerId`, `paypalSubscriptionId`,
    `subscription.paypalSubscriptionId`.
  - Add a one-off migration to copy/clear legacy values, then drop the Stripe-named fields.
  - Keep a thin compatibility read shim for one release if any historical data depends on them.

### 🟠 #2 — Plan naming mismatch across layers
- **Location:** `User.subscription.plan` enum is `['BASIC','PLUS','MASTER','BUSINESS']`, while
  `Subscription.planType` and `utils/planTypes.js` / `lib/planLabels.ts` use `basic/plus/pro`
  (with `starter`/`master` aliases).
- **Impact:** Two sources of truth for "plan"; mapping bugs (MASTER↔pro) and display inconsistencies
  (the "Starter" wording the user reported originated here).
- **Recommendation:**
  - Treat `utils/planTypes.js` as the single canonical mapping and route **all** reads/writes through
    `normalizePlanType` / `planTypeToUserPlan` / `userPlanToPlanType`.
  - Long term, align `User.subscription.plan` to the same casing/vocabulary (`basic/plus/pro`) and
    migrate `MASTER`→`pro`, drop unused `BUSINESS` if not productized.

### 🟡 #3 — Duplicate gamification (energy) fields
- **Location:** `User.js` has top-level `power`, `learningCredits`, `lastPowerUpdate` **and**
  `progress.energy`, `progress.lastEnergyUpdate`.
- **Impact:** Ambiguity about the authoritative energy value; the frontend already reads
  `user?.progress?.energy ?? user?.power ?? 25`, signaling drift.
- **Recommendation:** Pick `progress.energy` as canonical, backfill from `power`, and remove the
  redundant top-level fields. Centralize regen logic in one service.

### 🟠 #4 — No automated tests
- **Location:** Neither app has a test runner configured (`scripts` only have `dev/start/lint`).
- **Impact:** Regressions are caught manually; risky for payment, grading, and access-control logic.
- **Recommendation:**
  - Backend: add **Vitest/Jest + Supertest** for controllers/services; prioritize auth,
    answer grading (`evaluateQuestionAnswer`), access control, and PayPal sync.
  - Frontend: add **Vitest + React Testing Library** for critical components and **Playwright** for
    the learn-a-lesson and checkout flows.
  - Wire into CI with a coverage gate on the critical modules.

### 🟡 #5 — No centralized logging / monitoring
- **Location:** Logging is `console.*`, dev-only request logs; no error tracker.
- **Impact:** Hard to diagnose production incidents; no alerting.
- **Recommendation:** Add a structured logger (pino/winston) with levels, request IDs, and ship to a
  sink; integrate Sentry (frontend + backend) for error tracking; track p95 latency and error rates.

### 🟡 #6 — `alert()` / `confirm()` instead of Toast/modal
- **Location:** e.g. `admin/feedback/FeedbackList.tsx` (`confirm`, `alert`),
  `student/lessons/page.tsx` (`alert("No energy left…")`).
- **Impact:** Inconsistent UX vs the new `Toast`/confirmation-modal system already adopted in
  `admin/mappings`.
- **Recommendation:** Replace remaining `alert/confirm` with the `useToast` hook and the shared
  confirmation modal pattern for a consistent, on-brand experience.

### 🟡 #7 — Global `Cache-Control: no-store`
- **Location:** `app.js` sets `no-store` on **all** responses.
- **Impact:** Disables any HTTP caching, including for safe, cacheable GETs (categories, public
  blogs, tutor lists) — adds avoidable load and latency.
- **Recommendation:** Scope `no-store` to authenticated/sensitive routes only; allow short
  `Cache-Control: private/max-age` on read-only public endpoints.

### 🟠 #8 — Lesson navigation race ("first click bounces back")
- **Location:** `student/lessons/[id]/page.tsx` init effect calls `getMe()` first and redirects on a
  transient `null` before the data fetch / token refresh resolves.
- **Impact:** User reports clicking a level navigates back, and only works on the second attempt.
- **Recommendation:** Remove the standalone `getMe()` gate from the critical path; fetch
  `getLessonById` + `getLessonQuestions` in parallel (the questions endpoint returns the user and
  flows through the Axios refresh interceptor), and only redirect to sign-in if the data call itself
  returns `401`. This also reduces one network round-trip (faster load).

### 🟢 #9 — Stale Stripe comments
- **Location:** `Frontend/src/services/bookingService.ts` — `payBooking` returns
  `// { url: 'stripe_checkout_url' }`; other "Stripe" comments remain post-migration.
- **Impact:** Misleading documentation; no functional bug.
- **Recommendation:** Update comments to reflect PayPal; grep for "stripe" across the repo and clean
  remaining references.

### 🟡 #10 — Axios FormData `Content-Type`
- **Location:** Central Axios instance sets a default `application/json`; upload components post
  `FormData`.
- **Impact:** If the default header is applied to multipart requests, the boundary is missing and
  uploads can fail behind some proxies (AWS/nginx) even when they work locally.
- **Recommendation:** For upload calls, pass `{ headers: { 'Content-Type': 'multipart/form-data' } }`
  (Axios v1 then sets the boundary) or delete the content-type so the browser sets it. Verify image
  **and** audio upload end-to-end in production.

### 🟢 #11 — Hardcoded fallback values
- **Location:** `bookingController.js` (`tutor.hourlyRate || 30`), `User.js` (`rating: 4.5`).
- **Impact:** Magic numbers can produce surprising pricing/rating defaults.
- **Recommendation:** Move defaults to `PlanSettings`/config; set new-tutor `rating` to `0` with a
  "no reviews yet" UI state rather than a flattering default.

### 🟡 #12 — Silent auth/CORS failures
- **Location:** `authService.getMe` returns `null` on 401/403; CORS rejects with `callback(null,false)`.
- **Impact:** Failures are hard to distinguish from "logged out"; rejected origins fail silently.
- **Recommendation:** Differentiate "unauthenticated" vs "error" in `getMe`; log rejected CORS
  origins (already warned) and surface a clear client error for genuinely blocked requests.

---

## 3. Prioritized Improvement Roadmap

### Phase 1 — Correctness & reliability (1–2 weeks)
1. Fix lesson navigation race (#8).
2. Verify/repair production uploads (#10).
3. Unify plan naming end-to-end and add a migration (#2).
4. Replace remaining `alert/confirm` with Toast/modal (#6).

### Phase 2 — Hardening & quality (2–4 weeks)
5. Introduce automated tests for auth, grading, access control, payments (#4).
6. Add structured logging + Sentry + basic dashboards (#5).
7. Clean Stripe residue: schema fields + comments + migration (#1, #9).

### Phase 3 — Performance & polish (ongoing)
8. Scope caching headers; cache public GETs (#7).
9. Consolidate gamification energy fields (#3).
10. Externalize hardcoded defaults/config (#11).
11. Improve error differentiation in `getMe` and CORS visibility (#12).

---

## 4. Quick Wins (this week)
- [ ] Update `payBooking` comment and repo-wide "stripe" references → PayPal.
- [ ] Add explicit multipart header to image/audio upload calls; test on production.
- [ ] Replace `alert/confirm` in `FeedbackList` and `student/lessons` with Toast/modal.
- [ ] Parallelize lesson init fetch and drop the premature `getMe` redirect.
- [ ] Add a `test` script + one smoke test for `GET /health` and the auth happy path.

---

## 5. Notes
- Several items in this register were already partially addressed during recent work (PayPal
  migration, plan-label normalization in admin, mappings delete + hiding deleted users, feedback
  table alignment, compression). This document focuses on what remains to reach a fully hardened,
  test-backed production posture.
