# Mozhi Aruvi — Project Analysis & Improvement Report

**Platform:** Mozhi Aruvi (மொழி அருவி) — Tamil language learning  
**Report date:** May 22, 2026  
**Scope:** Full-stack review (`Backend/` + `Frontend/`) based on current repository state

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [What you have today](#2-what-you-have-today)
3. [Architecture overview](#3-architecture-overview)
4. [Strengths](#4-strengths)
5. [Critical issues (P0)](#5-critical-issues-p0)
6. [High priority (P1)](#6-high-priority-p1)
7. [Medium & long term (P2–P3)](#7-medium--long-term-p2p3)
8. [Module-by-module recommendations](#8-module-by-module-recommendations)
9. [Production readiness scorecard](#9-production-readiness-scorecard)
10. [Improvement roadmap](#10-improvement-roadmap)
11. [Quick wins (this week)](#11-quick-wins-this-week)
12. [Environment & deployment reference](#12-environment--deployment-reference)

---

## 1. Executive summary

Mozhi Aruvi is a **feature-rich, production-shaped** Tamil learning platform with a clear split between an Express/MongoDB API and a Next.js App Router frontend. You have built meaningful product surface area: leveled lessons, multiple question types, gamification (energy, XP, streaks), tutor marketplace, events, blogs, resources, AI chat, and subscriptions.

**Overall grade: B+ for features, C+ for production hardening.**

The codebase shows strong velocity and sensible patterns (layered backend, Zod validation, JWT + refresh sessions, role-based portals). The main gaps are **not missing features** but **integrity, testing, documentation accuracy, and operational safety**:

| Area | Status |
|------|--------|
| Feature completeness | Strong |
| UX / design system | Strong |
| Auth & middleware | Good |
| Lesson/question system (recent TTS work) | Improved; needs server-side grading |
| Answer integrity | **Critical gap** |
| Automated tests / CI | **Missing** |
| Docs vs code (payments, Next version) | **Out of sync** |
| Observability | Minimal |

**Recommendation:** Treat the next 2–4 weeks as a **“production hardening”** phase before adding major new features. Fix P0 security/integrity first, then CI/tests, then architecture consolidation.

---

## 2. What you have today

### Repository layout

```text
Mozhi Aruvi/
├── Backend/                 # Express 4, Mongoose 8, ESM
│   ├── server.js            # Entry: DB, cron, notifications
│   ├── app.js               # Middleware, routes, CORS, CSRF
│   ├── models/              # 19+ Mongoose models
│   ├── routes/              # Feature routers
│   ├── controllers/         # HTTP handlers
│   ├── services/            # Business logic
│   ├── middleware/          # auth, RBAC, limits, validate
│   ├── jobs/cronJobs.js     # Scheduled tasks
│   └── utils/               # e.g. questionNormalize.js
├── Frontend/                # Next.js 16, React 19, Tailwind 4
│   └── src/
│       ├── app/             # admin, student, tutor, auth, blogs…
│       ├── components/      # ui, layout, features
│       ├── services/        # API clients
│       └── lib/             # api.ts, questionTts.ts
├── README.md
├── DEPLOYMENT_CHECKLIST.md  # AWS / PM2 focused
└── project_health_report.md # Older; partially outdated
```

### Tech stack (actual vs documented)

| Layer | Documented (README) | Actual (`package.json`) |
|-------|---------------------|-------------------------|
| Frontend | Next.js 15 | **Next.js 16.2.2** |
| React | — | **React 19** |
| CSS | Tailwind | **Tailwind 4** |
| Payments | Stripe Connect (primary) | **PayPal** for subscriptions; **Stripe** for tutor Connect / split bookings |
| AI | Gemini | Gemini (+ Google Speech/TTS) |
| Media | Cloudinary | Cloudinary + multer |

### Major product modules

| Module | Backend | Frontend | Notes |
|--------|---------|----------|-------|
| Auth | `authRoutes`, JWT, Google OAuth | `AuthContext`, sign-in | Refresh token rotation |
| Lessons & questions | `lessonRoutes`, `Question` model | `student/lessons/[id]` | TTS, matching, speaking, writing |
| Admin CMS | Admin-only CRUD | `admin/lessons/page.tsx` | Large single file (~1900 lines) |
| Subscriptions | PayPal + `Subscription` model | `student/subscription` | Dual plan storage on `User` + `Subscription` |
| Tutors / bookings | Stripe Connect | `tutor/`, booking flows | Split payments |
| Events, blogs, resources | Dedicated routes | Public + admin pages | Resources = Moodle-style |
| Gamification | Energy, XP, streaks | Dashboard, lesson UI | Cron resets |
| Uploads | `/api/upload/*` | `ImageUpload`, `AudioUpload` | Cloudinary |

---

## 3. Architecture overview

```mermaid
flowchart TB
  subgraph Client
    Next[Next.js App Router]
    Axios[lib/api.ts + services]
  end

  subgraph API[Express Backend :5000]
    MW[Helmet / CORS / Rate limit / CSRF]
    Auth[/api/auth]
    Lessons[/api/lessons]
    Pay[/api/payments - PayPal]
    Upload[/api/upload]
    MW --> Routes
    Routes --> Controllers --> Services --> MongoDB
  end

  subgraph External
    Gemini[Gemini AI]
    GCloud[Google Speech / TTS / OAuth]
    PayPal[PayPal subscriptions]
    Stripe[Stripe Connect bookings]
    Cloudinary[Media CDN]
  end

  Next -->|rewrite /api| API
  Axios --> API
  Services --> External
```

### Request flow (lessons)

1. Student opens `/student/lessons/:id` → `GET /api/lessons/:id/questions`
2. Answers evaluated **in browser** for MCQ/fill (today) + live APIs for speaking/writing
3. Session ends → `POST /api/lessons/:id/submit` with answer payload
4. Backend scores and updates `Progress`, XP, mistakes

**Weak point:** Steps 2 and 3 trust client-supplied correctness for several types unless the payload is validated strictly server-side.

---

## 4. Strengths

### Backend

- **Clear layering:** `routes → controllers → services → models`
- **Env validation:** `Backend/config/env.js` (Zod) fails fast on bad config
- **Security baseline:** Helmet, rate limits, bcrypt, JWT access + hashed refresh in `Session`
- **Access control:** Lesson gates (`checkLessonAccess`, `checkPlanAccess`, `limitCategoryAccess`)
- **Consistent API envelope:** `responseWrapper` + frontend unwrap in `api.ts`
- **Question system evolution:** `tamilWord`, `textToSpeech`, `questionNormalize.js`, Google TTS chain
- **Cron automation:** Monthly resets, retention nudges (`jobs/cronJobs.js`)

### Frontend

- **Proxy-aware API:** `next.config.ts` rewrites `/api` → `BACKEND_URL` (works local + AWS)
- **Role-based portals:** Admin, student, tutor separated under `app/`
- **Design consistency:** Rounded cards, primary palette, Tamil font (`Arima`)
- **Interactive lesson UX:** Matching, speaking recorder, writing canvas, energy bar
- **Recent UX improvements:** Toasts, `QuestionSpeaker`, `AudioUpload`, action locking

### Product

- Real educational depth (levels, categories, multiple question types)
- Tutor marketplace + events + blogs = community moat
- Gamification increases retention

---

## 5. Critical issues (P0)

Fix these before marketing scale or public audits.

### P0-1 — Answer keys exposed to students (integrity / cheating)

**Problem:** `getQuestionsForLesson` returns `correctOptionIndex`, `correctAnswer`, and related fields to all users. The student lesson page grades many answers **client-side** using those fields.

**Evidence:**

- `Backend/services/lessonService.js` — select includes answer fields for non-admin
- `Frontend/src/app/student/lessons/[id]/page.tsx` — compares `typingValue` to `q.correctAnswer` locally

**Impact:** Anyone can inspect network responses or DevTools and pass lessons without learning. Final submit can be manipulated.

**Fix:**

1. Add `sanitizeQuestionForStudent(question)` that strips: `correctOptionIndex`, `correctAnswer`, `acceptedAnswers` (and optionally `hint` until after attempt).
2. Grade **only** in `submitAnswers` and evaluate endpoints; return `{ correct: boolean }` per question, not the answer key.
3. For MCQ: accept `selectedOptionIndex` only; compare server-side.
4. For speaking: never trust `isSpeakingCompleted` from client without server-side verification flag/session.

---

### P0-2 — Unauthenticated `/api/db-status`

**Problem:** Public endpoint returns collection counts (lessons, users, questions).

**Location:** `Backend/app.js`

**Fix:** Remove in production, or protect with `authenticate` + `authorizeRoles(ADMIN)`.

---

### P0-3 — Dangerous maintenance script in repo

**Problem:** `Backend/verify_all.js` can mass-set `isEmailVerified: true` for all users if run on production by mistake.

**Fix:** Move to `scripts/` with explicit `--confirm-production` flag, or delete from deploy artifact; document only for local dev.

---

### P0-4 — No automated tests or CI/CD

**Problem:** No `test` scripts, no Jest/Vitest/Playwright, no `.github/workflows`. Regressions (like TTS, uploads, scoring) will repeat.

**Fix:**

- Backend: Vitest or Jest + Supertest for auth, lesson submit, webhooks
- Frontend: Playwright for login → lesson → submit
- GitHub Actions: `lint`, `tsc`, `next build`, API smoke tests on PR

---

### P0-5 — Payment / documentation mismatch

**Problem:** README and `.env.example` emphasize **Stripe** subscriptions; live subscription flow uses **PayPal** (`paymentController.js` + `paypalService.js`). Stripe is used for **tutor Connect / bookings**.

**Impact:** Wrong env vars on deploy, broken checkout, confused operators.

**Fix:** Update README, `DEPLOYMENT_CHECKLIST.md`, and add `Frontend/.env.example` with a **payment matrix** (what provider powers what feature).

---

## 6. High priority (P1)

### Security & auth

| Issue | Location | Action |
|-------|----------|--------|
| JWT secret min length 8 | `config/env.js` | Require ≥32 chars in production |
| Cookie signing uses JWT secret | `app.js` | Separate `COOKIE_SECRET` |
| CSRF = origin check only | `middleware/csrf.js` | Add CSRF token for mutations |
| Broad CORS (`*.vercel.app`, etc.) | `app.js` | Whitelist exact origins |
| Password reset without rate limit | `authRoutes.js` | Add limiter like forgot-password |
| Verbose request logging | `app.js` | Redact tokens/PII in production |

### Backend quality

| Issue | Action |
|-------|--------|
| Dual subscription state (`User.subscription` + `Subscription` model) | Single source of truth + sync service |
| `compression` in package.json but unused | Enable in `app.js` or remove dep |
| `HUGGINGFACE_API_KEY` in `.env.example`, unused in code | Remove or implement |
| PayPal webhook body parsing | Verify raw body requirement for signature |
| Stripe dummy key allows boot without real key | Fail fast in production if bookings enabled |

### Frontend quality

| Issue | Action |
|-------|--------|
| No `Frontend/.env.example` | Add `NEXT_PUBLIC_API_URL`, `BACKEND_URL` |
| OAuth breaks if `NEXT_PUBLIC_API_URL` unset | Align fallback with `api.ts` |
| `.gitignore` missing `.next/` | Add build artifacts (git status shows many `.next` files) |
| `admin/lessons/page.tsx` ~1900 lines | Split by question type + hooks |
| Partial React Query adoption | Standardize data fetching for lessons/dashboard |

### Question / lesson system (post-TTS fixes)

| Issue | Action |
|-------|--------|
| Random 10 questions unseeded | Session-stable shuffle (userId + lessonId + date) |
| Mistakes API may leak answers | Apply same sanitization as lessons |
| Per-pair TTS in matching | UI for `pairs[].tamilWord` / `audioUrl` (schema ready) |
| Admin re-save legacy questions | Migration script: `expectedAudioText` → `tamilWord` |

---

## 7. Medium & long term (P2–P3)

### P2 — Quality & operations (1–2 months)

- **Observability:** Structured logging (pino), request IDs, Sentry for FE+BE
- **API docs:** OpenAPI from Zod schemas; version `/api/v1`
- **Health checks:** `/health` + `/ready` (MongoDB ping)
- **DB indexes:** Audit `userId`, `lessonId`, `questionId` on hot paths
- **Pagination:** Admin lists (users, lessons, questions)
- **E2E suite:** Critical paths covered in CI

### P3 — Scale & polish (3+ months)

- **i18n:** Tamil UI strings beyond content
- **Accessibility:** Keyboard nav, ARIA on lesson interactions
- **Content versioning:** Question history / draft publish
- **CDN:** Cloudinary already good; add Next `Image` for lesson images
- **Queue workers:** Move cron-heavy jobs to BullMQ/Redis if traffic grows
- **Multi-region:** MongoDB replica set, read preference for dashboards

---

## 8. Module-by-module recommendations

### 8.1 Lessons & questions

**Current state (good):**

- Types: MCQ (`quiz`), matching (`match`), tap-arrange (`fill`+`words`), speaking, writing
- TTS: `tamilWord`, `textToSpeech`, Google TTS → browser fallback
- Uploads: image + audio via Cloudinary
- Admin CRUD + reorder

**Improve:**

1. Server-side grading (P0)
2. Per-pair speaker in matching UI
3. Split `admin/lessons/page.tsx` into:
   - `QuestionEditor/`
   - `MCQForm.tsx`, `MatchingForm.tsx`, etc.
4. Question preview mode in admin (student view simulation)

### 8.2 Auth & users

**Good:** JWT + refresh, Google OAuth, email verification gate, role-based routes.

**Improve:**

- Account lockout after failed logins
- Session list / “log out everywhere”
- Audit log for admin actions (delete user, change plan)

### 8.3 Subscriptions & payments

**Clarify architecture:**

| Feature | Provider (code) |
|---------|-----------------|
| Student plans (BASIC/PLUS/MASTER) | PayPal |
| Tutor 1:1 / bundle bookings | Stripe Connect |
| User model fields | `stripeCustomerId` (legacy/partial) |

**Improve:**

- One `PaymentService` interface with PayPal + Stripe adapters
- Webhook dashboard doc (URLs, secrets, retry policy)
- Idempotent webhook handlers (store `eventId`)

### 8.4 Tutor marketplace

**Good:** Applications, bookings, Stripe Connect split.

**Improve:**

- Tutor availability timezone handling
- Booking cancellation/refund policy in code
- Rating aggregation indexes

### 8.5 AI features

**Good:** Gemini for chat/writing evaluation; Google STT for speaking.

**Improve:**

- Rate limit AI endpoints per user/plan
- Cost tracking (tokens per day)
- Fallback message when Gemini down (already partial in writing eval)

### 8.6 Content (blogs, events, resources)

**Good:** Rich admin, public SEO-facing pages.

**Improve:**

- `metadata` / Open Graph on public routes
- Sitemap generation
- Image `alt` text enforcement in admin

### 8.7 DevOps (AWS)

**You have:** `DEPLOYMENT_CHECKLIST.md` (PM2, Nginx, env vars).

**Add:**

- Staging environment identical to prod
- Backup strategy (MongoDB Atlas snapshots)
- Secret rotation runbook
- Rollback procedure (PM2 + previous build artifact)
- Optional: Docker Compose for local onboarding

---

## 9. Production readiness scorecard

| Criterion | Score | Notes |
|-----------|-------|-------|
| Feature completeness | 9/10 | Broad portal coverage |
| Code organization | 7/10 | Some god files (admin lessons) |
| Security middleware | 7/10 | Good base; CSRF/logging gaps |
| Data integrity (lessons) | 4/10 | Client-visible answers |
| Testing | 1/10 | No automated tests |
| CI/CD | 1/10 | None in repo |
| Documentation accuracy | 5/10 | README/payments/version drift |
| Observability | 3/10 | Console only |
| Media / uploads | 8/10 | Cloudinary + auth on routes |
| Deployment docs | 6/10 | AWS checklist exists; incomplete env matrix |
| **Overall production readiness** | **5.5/10** | Harden P0 before scale |

---

## 10. Improvement roadmap

### Phase 1 — Security & integrity (Weeks 1–2)

**Goal:** Safe to run publicly without trivial cheating or data leaks.

- [ ] Sanitize student question API responses
- [ ] Server-side-only grading for all question types
- [ ] Remove/lock `/api/db-status`
- [ ] Quarantine `verify_all.js`
- [ ] Add `Frontend/.env.example`
- [ ] Update README (Next 16, PayPal vs Stripe)
- [ ] Add `.next/` to `.gitignore`

**Success metric:** Student API responses contain zero answer keys; Playwright proves fake submit cannot pass.

---

### Phase 2 — Quality gates (Weeks 3–4)

**Goal:** Regressions caught before deploy.

- [ ] GitHub Actions: lint + `tsc` + `next build`
- [ ] Supertest: auth, lesson submit, upload auth
- [ ] Playwright: login → lesson → submit
- [ ] Expand `DEPLOYMENT_CHECKLIST.md` with webhook URLs and env matrix

**Success metric:** PRs cannot merge if build or smoke tests fail.

---

### Phase 3 — Architecture consolidation (Weeks 5–8)

**Goal:** Lower maintenance cost.

- [ ] Unify subscription state (User + Subscription)
- [ ] Payment abstraction (PayPal + Stripe)
- [ ] Refactor admin lesson editor into modules
- [ ] React Query hooks for lessons/progress
- [ ] Sentry + structured logs

**Success metric:** New question type can be added with <3 files touched.

---

### Phase 4 — Growth & polish (Ongoing)

- [ ] SEO (metadata, sitemap)
- [ ] Per-pair matching audio UI
- [ ] Performance (indexes, pagination, RSC where useful)
- [ ] Staging environment + load test lesson flow

---

## 11. Quick wins (this week)

These are small effort, high impact:

1. **Strip answer fields** from student question API (1 service function).
2. **Delete or admin-gate** `/api/db-status` (5 lines).
3. **Add `.next/` to `.gitignore`** (prevent bloated repo).
4. **Create `Frontend/.env.example`** (onboarding + deploy).
5. **README payment section** — “Subscriptions: PayPal; Tutor payouts: Stripe Connect”.
6. **Rename `project_health_report.md`** or update it — it claims “compression implemented” and “highly healthy” while tests and answer integrity are open gaps.
7. **Run `npm audit`** on Backend + Frontend and patch critical CVEs.

---

## 12. Environment & deployment reference

### Backend (`Backend/.env`) — minimum for production

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection |
| `JWT_ACCESS_SECRET` | Strong random (32+ chars) |
| `FRONTEND_ORIGIN` | Exact site URLs (no wildcard in prod) |
| `CLOUDINARY_*` | Uploads |
| `GEMINI_API_KEY` | AI chat / writing |
| `GOOGLE_APPLICATION_CREDENTIALS` | STT + TTS |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | Subscriptions |
| `STRIPE_SECRET_KEY` | Tutor bookings (if enabled) |
| `ELEVENLABS_API_KEY` | Optional TTS fallback |

### Frontend (`Frontend/.env.local` / AWS env)

| Variable | Typical production value |
|----------|--------------------------|
| `NEXT_PUBLIC_API_URL` | `/api` |
| `BACKEND_URL` | `http://127.0.0.1:5000` (internal, via Nginx) |

### Verification after deploy

1. Login + Google OAuth return to HTTPS domain  
2. Student lesson: speaker plays **Tamil word only**  
3. Admin: image + audio upload (no CORS errors)  
4. Submit lesson → progress updates  
5. Subscription checkout (PayPal) completes webhook  
6. Network tab: question payloads **must not** include `correctAnswer` (after P0 fix)

---

## Appendix A — Key file index

| Purpose | Path |
|---------|------|
| API bootstrap | `Backend/app.js`, `Backend/server.js` |
| Env validation | `Backend/config/env.js` |
| Questions API | `Backend/routes/lessonRoutes.js` |
| Question logic | `Backend/services/lessonService.js` |
| TTS endpoint | `Backend/controllers/lessonController.js` |
| Question model | `Backend/models/Question.js` |
| Normalize admin payload | `Backend/utils/questionNormalize.js` |
| PayPal subscriptions | `Backend/controllers/paymentController.js` |
| Stripe bookings | `Backend/services/stripeConnectService.js` |
| Frontend API client | `Frontend/src/lib/api.ts` |
| Student lesson UI | `Frontend/src/app/student/lessons/[id]/page.tsx` |
| Admin questions UI | `Frontend/src/app/admin/lessons/page.tsx` |
| TTS helpers | `Frontend/src/lib/questionTts.ts` |
| Deploy checklist | `DEPLOYMENT_CHECKLIST.md` |

---

## Appendix B — Recent question-system work (baseline for next steps)

Already implemented in your codebase:

- `tamilWord` + `textToSpeech` schema fields  
- Speaker on all major question types via `QuestionSpeaker`  
- Audio upload (`AudioUpload` → `/api/upload/audio`)  
- `referenceAudio` → `audioUrl` normalization  
- Google TTS with browser fallback  
- Match/fill/speaking submit scoring improvements  
- Toast notifications for admin/student errors  

**Next logical step:** Combine this with **P0 server-side grading** so UX and integrity match Duolingo-level trust.

---

## Bottom line

Mozhi Aruvi is **past the MVP stage** — you have a real platform. The highest-leverage improvements are:

1. **Trust** — students cannot see or fake answers.  
2. **Safety** — lock diagnostics and dangerous scripts.  
3. **Truth in docs** — payments and versions match code.  
4. **Automation** — tests and CI so fixes (like TTS) never regress.  

Execute **Phase 1** before scaling marketing or user count. Phases 2–4 turn the project from “works on my AWS server” into “maintainable product engineering.”

---

*Generated from repository analysis. For implementation of P0/P1 items, use Agent mode in Cursor and reference this document.*
