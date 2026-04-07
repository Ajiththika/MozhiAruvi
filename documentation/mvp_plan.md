# MVP Implementation Plan - Mozhi Aruvi

Mozhi Aruvi is designed for a phased rollout, focusing on core language learning before expanding into premium mentor services.

## Phase 1: Foundation (Core Infrastructure)
*Completed*
- **Authentication**: JWT-based login/signup, Google OAuth integration.
- **Base Layout**: Responsive Frontend (Next.js), Sidebar navigation, Theme (Dark/Light).
- **Core Backend**: REST API (Express), MongoDB connection, Error handling, Logging.

## Phase 2: Learning Core (Lesson Experience)
*In Progress*
- **Content Management**: CRUD for Lessons, Questions, and Categories.
- **Lesson Engine**: Interactive frontend for MCQs, Matching, and Writing.
- **Progress Tracking**: XP gain on completion, Streak persistence, Level progression (Not Set -> Basic -> Advanced).

## Phase 3: Gamification & AI Integration
*Planned/Upcoming*
- **XP/Points System**: Dashboard widgets for daily goals and achievements.
- **AI Tutoring**: Integrating MozhiAruvi AI Chatbox as a persistent assistant.
- **Energy/Power System**: Limiting daily lessons with periodic refills (Duolingo-style).

## Phase 4: Premium & Mentorship
*Planned/Upcoming*
- **Stripe Integration**: Free/Pro/Premium subscription plans and checkout experience.
- **Tutor Ecosystem**: Tutor application flow, Slot-based booking, Payment escrow.
- **Premium Content**: Pay-gated lessons and exclusive events.

## Phase 5: Administration & Scaling
*Planned/Upcoming*
- **Organization Support**: Seats management for businesses (e.g., Business 30/60 plans).
- **Admin Dashboard**: Full CRUD for all models, User activity logs, Revenue analytics.
- **Global Deployment**: Multi-region hosting (Vercel/AWS), SEO optimization, Performance tuning.
