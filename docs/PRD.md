# Mozhi Aruvi — Product Requirements Document (PRD)

**Product:** Mozhi Aruvi (மொழி அருவி)
**Document type:** Product Requirements Document
**Version:** 1.0
**Last updated:** May 30, 2026
**Status:** Living document

---

## 1. Overview

### 1.1 Product summary
Mozhi Aruvi is a gamified Tamil-language learning platform that combines **self-paced interactive
lessons** (Duolingo-style) with a **live tutor marketplace**, **community events**, **blogs**, and a
**curated resource library**. It targets learners of Tamil at all levels and provides monetization
through subscription plans and pay-per-session tutoring.

### 1.2 Vision
> Make learning Tamil joyful, structured, and accessible — pairing bite-sized gamified practice with
> real human mentorship — so any learner worldwide can progress from the alphabet to fluency.

### 1.3 Goals
- Deliver an engaging, progressive lesson path with audio (TTS) support for authentic Tamil pronunciation.
- Provide a trustworthy tutor marketplace with bookings and payments.
- Monetize sustainably via tiered subscriptions (Basic / Plus / Pro).
- Maintain answer integrity, security, and reliable performance in production.

### 1.4 Non-goals (current release)
- Native mobile apps (web-responsive only).
- Offline mode.
- Languages other than Tamil.

---

## 2. Personas

| Persona | Description | Primary needs |
|---------|-------------|---------------|
| **Beginner Student** | New learner starting from the Tamil alphabet | Clear path, audio pronunciation, encouragement, free entry tier |
| **Progressing Student** | Learner advancing across levels | Premium content, tutor support, events, streak/XP motivation |
| **Tutor / Mentor** | Verified Tamil teacher | Profile, schedule, bookings, payouts via PayPal |
| **Admin** | Platform operator | CRUD over lessons/users/content, subscription oversight, moderation |
| **Organization** | B2B / institution | Group accounts and member management |

---

## 3. Plans & Monetization

| Plan | Audience | Representative entitlements |
|------|----------|-----------------------------|
| **Basic** (free) | Entry learners | First category free, limited levels, no tutor support |
| **Plus** | Committed learners | Expanded levels/categories, some events, tutor support quota |
| **Pro** | Power learners | Full access, higher tutor/event allowances |

> Plan naming is standardized to **Basic / Plus / Pro** across the product. Legacy values
> (`starter` → basic, `master` → pro) are normalized centrally.
> Payments are processed via **PayPal** (subscriptions and one-time bookings/events).

---

## 4. Functional Requirements

### 4.1 Authentication & Accounts
- **FR-1.1** Users can sign up with email/password or Google OAuth.
- **FR-1.2** Email verification is required before full access.
- **FR-1.3** Sessions use JWT access tokens + HttpOnly refresh cookie with silent refresh.
- **FR-1.4** Password reset via emailed token.
- **FR-1.5** Role selection (student/tutor) and role-based portal routing.

### 4.2 Lessons & Curriculum
- **FR-2.1** Lessons are grouped by **category** and **level** (Beginner→Advanced), ordered for a path.
- **FR-2.2** A lesson contains ordered **questions** of types: `mcq`, `matching`, `arrange`,
  `writing`, `speaking`.
- **FR-2.3** Lesson nodes unlock progressively; locked nodes are gated by completion and plan tier.
- **FR-2.4** Each question may include: question text, **Tamil word (TTS only)**, optional image,
  optional audio, options, and correct answer.

### 4.3 Text-to-Speech (Speaker)
- **FR-3.1** A speaker control is available on **all** question types.
- **FR-3.2** The speaker plays **only the admin-provided Tamil word**, never the full question text.
- **FR-3.3** Visibility rule: show speaker when `textToSpeech` is true and a Tamil word/audio exists; otherwise hide.
- **FR-3.4** Playback uses Google Cloud TTS (primary) with browser `SpeechSynthesis` fallback; optional auto-play on question load.

### 4.4 Answer Grading & Gamification
- **FR-4.1** Answer keys are **stripped server-side** before questions reach the student.
- **FR-4.2** Answers are graded **server-side**; the API returns correctness, the correct answer/hint, and XP.
- **FR-4.3** Energy (max 25), XP, points, daily streaks, and badges are tracked; energy regenerates over time.
- **FR-4.4** Completing a lesson updates progress and unlocks the next node.

### 4.5 Tutor Marketplace & Bookings
- **FR-5.1** Students browse tutor profiles (bio, rate, languages, levels, rating).
- **FR-5.2** Students request a booking; tutors confirm/decline; sessions can be completed and reviewed.
- **FR-5.3** Booking payment is handled via PayPal; status reflects `unpaid`/`paid`.
- **FR-5.4** Admins audit tutor↔student **mappings** and can remove a mapping; mappings for deleted users are hidden.
- **FR-5.5** Tutors apply via a mentor application flow subject to admin approval.

### 4.6 Subscriptions (Student + Admin)
- **FR-6.1** Students can view and purchase Plus/Pro plans (monthly/yearly) via PayPal.
- **FR-6.2** Admins can view, filter (Plus/Pro), and override subscriptions; stats show plan distribution.
- **FR-6.3** Plan limits (levels, categories, events, tutor support) are enforced via middleware.

### 4.7 Events
- **FR-7.1** Admins create live events; students join subject to plan limits or one-time payment.
- **FR-7.2** Join requests are tracked and gated by `checkEventAccess`.

### 4.8 Content: Blogs & Resources
- **FR-8.1** Blogs authored via Tiptap rich-text editor; published to the public blog.
- **FR-8.2** Resources are organized into sections; **Resources are managed by tutors**, viewable by students.

### 4.9 Feedback & Notifications
- **FR-9.1** Users submit ratings + comments; admins view/delete in a well-aligned feedback table.
- **FR-9.2** System notifications inform users of booking/payment/lesson events.

### 4.10 Media Upload
- **FR-10.1** Image and audio uploads (file-based, not URL) via multer → Cloudinary, with preview and progress.

### 4.11 AI Assistance
- **FR-11.1** Gemini-powered AI assistance is available for learning support.

---

## 5. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-1 | Security | Helmet, CSRF, rate limiting, HttpOnly cookies, role guards, server-side grading |
| NFR-2 | Performance | Compressed responses; key pages interactive < 2.5s on broadband; cached queries |
| NFR-3 | Reliability | Graceful `503` when DB unavailable; centralized error handling; health probe |
| NFR-4 | Portability | Identical behavior local vs production; env-driven config; no hardcoded URLs |
| NFR-5 | Accessibility | Keyboard-operable controls, sufficient contrast, audio support for pronunciation |
| NFR-6 | Scalability | Stateless API, externalized media, MongoDB Atlas |
| NFR-7 | Maintainability | Layered backend, typed frontend, reusable components |
| NFR-8 | Privacy | Secrets in env only; no answer keys or secrets exposed to clients |

---

## 6. Key User Flows

1. **Onboarding:** Sign up → verify email → role selection → placement/onboarding → lesson path.
2. **Learn a lesson:** Open lesson → hear Tamil word → answer questions → server grades → earn XP/streak → next node unlocks.
3. **Book a tutor:** Browse tutors → request booking → PayPal pay → tutor confirms → attend → review.
4. **Upgrade plan:** View plans → select Plus/Pro → PayPal checkout → entitlements applied.
5. **Admin manage:** CRUD lessons/questions, moderate content, audit mappings, oversee subscriptions.

---

## 7. Success Metrics (KPIs)

| Metric | Why it matters |
|--------|----------------|
| Lesson completion rate | Core learning engagement |
| D1 / D7 / D30 retention | Stickiness of the gamified loop |
| Free → paid conversion | Monetization health |
| Tutor booking volume & completion rate | Marketplace liquidity |
| Avg. session length & streak length | Habit formation |
| TTS usage per session | Value of pronunciation feature |
| Error rate / p95 API latency | Reliability & performance |

---

## 8. Release Scope & Status

| Capability | Status |
|------------|--------|
| Lessons, questions, gamification | Implemented |
| TTS on all question types (Tamil word only) | Implemented |
| Server-side answer grading & key stripping | Implemented |
| Image/audio upload (Cloudinary) | Implemented |
| PayPal subscriptions + bookings (Stripe removed) | Implemented |
| Standardized plan naming (Basic/Plus/Pro) | Implemented |
| Admin mappings with delete + hide deleted users | Implemented |
| Automated test suite | **Pending** |
| Monitoring / centralized logging | **Pending** |

---

## 9. Out of Scope / Future Considerations
- Native mobile apps and offline learning.
- Multi-language UI / additional target languages.
- Adaptive/AI-personalized learning paths.
- Live group classes and cohort programs.

---

## 10. Assumptions & Dependencies
- MongoDB Atlas, Cloudinary, PayPal, and Google Cloud (OAuth/TTS/Gemini) accounts are provisioned.
- SMTP credentials are available for transactional email.
- Production runs over HTTPS so secure cookies function correctly.
