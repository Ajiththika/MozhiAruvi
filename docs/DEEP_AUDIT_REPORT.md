# Mozhi Aruvi — Deep Audit Report (Role-by-Role) & Product Growth Plan

**Prepared for:** Owner / engineering of mozhiaruvi.com
**Date:** May 30, 2026
**Method:** Static, code-level audit of the actual repository (`Frontend/` + `Backend/`), traced across the three real user roles — **Admin, Tutor, Student**.

---

## 0. Important first — security note about the credentials you shared

You pasted live **admin, tutor, and student email + password** combinations into chat.

- I did **not** and **cannot** log into your live site with them, and I don't need them — this audit is done by reading your code directly.
- **Please rotate all three passwords now.** Treat any credential that has been shared in plaintext (chat, email, screenshots) as compromised.
- Action items:
  1. Change the 3 passwords immediately.
  2. Add **rate limiting on the login route specifically** (you have a global limiter; add a stricter per-account/IP one for `/auth/login`).
  3. Consider 2FA for the admin account.
  4. Never commit or paste credentials; keep them only in a password manager.

---

## 1. Executive summary

Mozhi Aruvi is a genuinely feature-rich platform (gamified lessons, TTS, tutor marketplace, events, blogs, subscriptions). The architecture is sound (layered backend, typed frontend, role portals). The gap to a *valuable, error-free product* is concentrated in **four themes**:

1. **Answer/grade integrity** — some question types are effectively graded on the client and can't be failed server-side.
2. **Consistency of data & naming** — legacy Stripe field names persist after the PayPal migration; energy is tracked twice.
3. **Lesson delivery determinism** — large lessons serve a *random* 10-question subset that reshuffles on refresh.
4. **Reliability/trust polish** — silent failures, mixed `alert()`/toast UX, and no automated tests or monitoring.

None of these require restructuring. They are surgical fixes. Below is the evidence and the fix for each, grouped by role and then cross-cutting.

| Theme | Severity | Effort |
|-------|----------|--------|
| Matching/writing graded client-side | 🔴 High | Low–Med |
| Random question subset on big lessons | 🟠 Med | Low |
| Stripe-named fields storing PayPal data | 🟠 Med | Med (migration) |
| Duplicate energy fields | 🟡 Med | Med |
| Silent errors / mixed alert+toast | 🟡 Med | Low |
| No tests / monitoring | 🟠 Med | Med |

---

## 2. STUDENT role — functional audit

### 🔴 S1. Matching questions cannot be failed server-side (integrity)
- **Evidence:** `Backend/utils/sanitizeQuestion.js` strips `correctOptionIndex`, `correctAnswer`, `acceptedAnswers` before sending questions to students — but **not `pairs`**. For `match` questions, `pairs` *is* the answer key (left ↔ right). Grading in `evaluateQuestionAnswer` checks `selectedOptionIndex === (q.correctOptionIndex ?? 0)`, and the matching UI sets `selected = 0` on a client-side "correct" decision, so the submit always sends `0` → `0 === 0` → correct.
- **Impact:** A student (or anyone inspecting the network response) can always pass matching questions; the server never independently verifies the match.
- **Fix:**
  1. Send matching `pairs` to students **with the right-side shuffled and without the correct linkage**, OR keep the answer key server-side only.
  2. Add a real server check: the client submits the chosen left→right mapping; the server compares it against the stored `pairs`. Reuse the new `/questions/:qId/check` endpoint pattern.

### 🟠 S2. Big lessons serve a random, reshuffling subset
- **Evidence:** `Backend/services/lessonService.js` `getQuestionsForLesson` — when `sanitized.length > 10` it returns `sort(() => 0.5 - Math.random()).slice(0, 10)`.
- **Impact:** (a) Lessons with >10 questions only ever show 10, chosen at random; (b) the set **and order** change on every refresh, so a mid-lesson refresh gives a different quiz; (c) admin-defined `orderIndex` is ignored once shuffled.
- **Fix:** Make selection deterministic per attempt (respect `orderIndex`; if you want a subset, seed the random by `userId+lessonId+attemptDate` or make the count an explicit lesson setting). At minimum, drop the random shuffle so order follows `orderIndex`.

### 🟡 S3. Writing questions are pass-by-flag
- **Evidence:** `evaluateQuestionAnswer` returns correct for `writing` when `selectedOptionIndex === 0`; the canvas result sets `selected = 0` on the client. The AI handwriting check (`evaluateWriting`) is lenient by design, which is fine — but final submit trusts the client flag.
- **Impact:** Lower integrity risk than matching, but still client-trusted on submit.
- **Fix:** Persist the server's writing-evaluation result (per-attempt) and use it at submit time rather than the client `selected` flag.

### 🟢 S4. Things that are already good (student)
- Lesson navigation race fixed (parallel fetch + interceptor refresh).
- Server-side grading for MCQ/fill via `/check`; answer keys stripped for those types.
- Multi-tier, mic-forgiving speech assessment (perfect/close/retry) with Tamil-tuned fuzzy matching.
- Energy/XP/streak gamification and three-tier feedback banner.

---

## 3. TUTOR role — functional audit

### 🟠 T1. Payments stored under Stripe-named fields
- **Evidence:** `Backend/controllers/bookingController.js` `initiateBookingPayment` writes a **PayPal** order id into `Payment.stripeSessionId` (`findOneAndUpdate({ stripeSessionId: order.id }, …)`).
- **Impact:** Confusing/incorrect schema after the Stripe→PayPal migration; future reporting and debugging will be error-prone. Functionally works, semantically wrong.
- **Fix:** Rename to a provider-neutral `providerOrderId` (or `paypalOrderId`) with a migration; keep a temporary read alias for old rows.

### 🟢 T2. Leftover artifact (harmless)
- **Evidence:** `returnUrl.replace('{PAYPAL_ORDER_ID}', '')` in the same function is a no-op (the token isn't present).
- **Fix:** Remove the dead `.replace(...)`.

### T3. Booking lifecycle is sound
- Request → tutor confirm/decline → student pays via PayPal → complete/review, with notifications + emails, is coherent. Verify the **return/verify** step always flips `paymentStatus` to `paid` and credits the tutor (trace `verifySubscriptionSession`/booking verify end-to-end in staging).

### T4. Resources ownership
- Per your product intent, **Resources should be tutor-managed and student-viewable**, not in the admin sidebar. Confirm the admin "Resources" link is removed and the tutor portal has full CRUD. (Track as a small, explicit task.)

---

## 4. ADMIN role — functional audit

### 🟢 A1. Question management (recently hardened)
- Optimistic create (temp id → real `_id`), optimistic delete with rollback + **per-item** spinner, optimistic edit without full refetch. This removed the freezes/stale states. Good.

### 🟡 A2. Mixed `alert()`/`confirm()` vs Toast
- **Evidence:** `handleDelete` (lesson/category), `handleMoveQuestion`, `handleUpdateLesson`, `handleMoveCategory` still use `alert()`/`confirm()`, while questions use the Toast system.
- **Impact:** Inconsistent, less polished admin UX.
- **Fix:** Standardize on `useToast` + the shared confirmation modal everywhere.

### 🟡 A3. Subscriptions & plan naming
- Standardize **Basic / Plus / Pro** everywhere (you already added `planTypes.js` / `planLabels.ts`). Ensure `User.subscription.plan` (`BASIC/PLUS/MASTER/BUSINESS`) and `Subscription.planType` (`basic/plus/pro`) are reconciled through one normalizer to avoid `MASTER↔pro` display drift.

### A4. Bulk content tooling (product gap, not a bug)
- Admins build questions one lesson at a time. For a real curriculum, add **CSV/JSON import/export** of questions and a **duplicate-lesson** action.

---

## 5. Cross-cutting findings

### 🟠 X1. Stripe residue in the data model
- `Backend/models/User.js` still has `stripeAccountId`, `isStripeVerified`, `subscription.stripeCustomerId`, `subscription.stripeSubscriptionId`. Rename to PayPal equivalents with a migration; remove dead fields after one release.

### 🟡 X2. Duplicate energy/credits fields
- `User` has top-level `power`/`learningCredits`/`lastPowerUpdate` **and** `progress.energy`/`progress.lastEnergyUpdate`; the frontend already reads `user?.progress?.energy ?? user?.power ?? 25`. Pick `progress.energy` as canonical (it's what `energyManager.js` should own), backfill, and delete the duplicates.

### 🟡 X3. Global `Cache-Control: no-store`
- `app.js` disables HTTP caching on **every** response. Scope it to authenticated/sensitive routes; allow short caching for public GETs (categories, blogs, tutor list) to cut latency.

### 🟡 X4. Silent failures
- `authService.getMe()` swallows 401/403 → `null`; CORS rejects with `callback(null, false)` silently. Differentiate "logged out" vs "error" and log blocked origins so production issues are diagnosable.

### 🟠 X5. No automated tests / no monitoring
- No test runner; logging is `console.*`. This is the single biggest risk to "error-free" at scale.

---

## 6. Consolidated bug/risk register

| ID | Severity | Area | Where | Fix summary |
|----|----------|------|-------|-------------|
| S1 | 🔴 | Integrity | `utils/sanitizeQuestion.js`, `evaluateQuestionAnswer` (match) | Strip/secure `pairs`; grade matching server-side |
| S2 | 🟠 | Lessons | `services/lessonService.js` (random slice) | Deterministic order/subset by `orderIndex` |
| S3 | 🟡 | Integrity | `evaluateQuestionAnswer` (writing) | Persist server writing result; use at submit |
| T1 | 🟠 | Payments | `controllers/bookingController.js` | Rename `stripeSessionId` → provider-neutral |
| T2 | 🟢 | Hygiene | booking returnUrl | Remove dead `.replace()` |
| A2 | 🟡 | Admin UX | `app/admin/lessons/page.tsx` etc. | Replace `alert/confirm` with Toast/modal |
| A3 | 🟡 | Plans | User vs Subscription models | One normalizer for Basic/Plus/Pro |
| X1 | 🟠 | Data model | `models/User.js`, `Payment.js` | Migrate Stripe-named fields → PayPal |
| X2 | 🟡 | Gamification | `models/User.js` | Unify energy on `progress.energy` |
| X3 | 🟡 | Performance | `app.js` | Scope cache headers |
| X4 | 🟡 | Reliability | `authService.ts`, `app.js` | Differentiate errors; log rejects |
| X5 | 🟠 | Quality | repo-wide | Tests + Sentry + structured logs |

---

## 7. How to make Mozhi Aruvi a *valuable* product

Fixing bugs makes it stable; the items below make it **worth paying for and recommending**.

### 7.1 Learning value (retention engine)
- **Spaced repetition / mistakes review:** you already store `Mistake` records — surface a daily "Review your mistakes" deck. This is the #1 retention lever for language apps.
- **Deterministic, progressive difficulty:** fix S2 so lessons feel intentional, not random.
- **Pronunciation as a hero feature:** the Tamil TTS + lenient speech scoring is a real differentiator — make a "Pronunciation Lab" that scores a word and shows the close/perfect/retry meter.
- **Placement test → personalized path:** you have onboarding/placement; convert results into a visible, adaptive path.

### 7.2 Trust & quality (so people pay)
- **Server-authoritative grading for every type** (closes S1/S3): trust is the product.
- **Reliability:** add tests for auth, grading, payments; add Sentry. A paid product can't silently fail.
- **Clear plan value:** make Basic/Plus/Pro benefits explicit on one comparison page; show exactly what a learner unlocks.

### 7.3 Tutor marketplace (revenue)
- **Transparent tutor profiles & reviews** (real ratings, not a default 4.5).
- **Reliable payout/receipt flow** on PayPal with email receipts and a tutor earnings dashboard.
- **Calendar/availability + reminders** to reduce no-shows.

### 7.4 Growth loops
- **Streaks + daily reminders (email/push)** — you already track streaks; notify on risk of losing one.
- **Shareable milestones** ("I hit a 7-day streak") and referral credits.
- **SEO content via blogs** (you have the blog system) targeting "learn Tamil" queries.

### 7.5 Operational excellence
- Structured logging + dashboards (error rate, p95 latency, conversion funnel).
- Backups + a staging environment that mirrors production.
- A lightweight admin "content health" view (lessons missing questions, questions missing answers/audio).

---

## 8. Prioritized roadmap

**Phase 1 — Integrity & correctness (1–2 weeks)**
1. Server-side grading for matching (S1) and writing (S3); stop trusting client flags.
2. Deterministic lesson question delivery (S2).
3. Remove booking `.replace()` artifact; verify PayPal booking → `paid` end-to-end (T1/T2).

**Phase 2 — Consistency & trust (2–4 weeks)**
4. Migrate Stripe-named fields → PayPal across `User`/`Payment` (X1, T1).
5. Unify energy on `progress.energy` (X2).
6. Reconcile plan naming through one normalizer (A3).
7. Replace remaining `alert/confirm` with Toast/modal (A2).

**Phase 3 — Reliability & growth (ongoing)**
8. Tests (auth, grading, payments) + Sentry + structured logs (X5).
9. Scope cache headers (X3); differentiate silent errors (X4).
10. Ship the retention features: mistakes review, pronunciation lab, streak reminders (§7).

---

## 9. Definition of done (quality gates)
- No question type can be passed without server verification.
- A page refresh never changes a lesson's question set/order mid-attempt.
- No field named `stripe*` stores PayPal data; one canonical energy field.
- Every user-facing failure shows a toast/message (never console-only) and is captured by error tracking.
- Critical flows (login, grade, pay) have automated tests that run in CI.

---

### Appendix — how to reproduce the key finding (S1) safely
On a lesson with a `match` question, open browser DevTools → Network → load questions. The response for a `match` question still includes `pairs` (the correct linkage). Because submit grading accepts `selectedOptionIndex = 0`, the match is effectively always gradable as correct client-side. Fixing S1 removes this.
