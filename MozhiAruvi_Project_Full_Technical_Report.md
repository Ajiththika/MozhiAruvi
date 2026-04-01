# Mozhi Aruvi - Full Project Technical Audit & Design Report

## 1. Project Implementation Overview

**Mozhi Aruvi** is a modern, high-fidelity SaaS learning platform designed for Tamil language acquisition. The system transition from a simple point-based model to a sophisticated, gamified engagement system inspired by industry leaders like Duolingo.

### **Main Focus**
The primary objective of the platform is **consecutive daily engagement**. Instead of focusing on raw point accumulation, the system now prioritizes:
- **Consistency**: Tracking student participation through a robust server-side Streak System.
- **Resource Management**: Limiting activity via a 25-unit Energy/Power system to encourage sustainable learning cycles.
- **Interactive Validation**: Providing real-time feedback on MCQ, Speaking, Writing, and Matching exercises.

---

## 2. Technical Architecture & Data Models

The platform is powered by a robust **MERN stack** (MongoDB, Express, React/Next.js, Node.js) with 15 specialized database models.

### **Models Inventory (15 Total)**
1.  **User**: Central identity model tracking progress, energy, streaks, and subscription tiers.
2.  **Lesson**: Defines the curriculum structure (Categories, Modules, Levels).
3.  **Question**: Child of Lesson; supports 11 distinct interaction types (speaking, matching, etc.).
4.  **Progress**: Stores per-user completion stats, historical scores, and calculated accuracy.
5.  **Category**: Enables dynamic curriculum organization.
6.  **Blog**: Community engagement and educational content.
7.  **Event**: Live classes or cultural webinars.
8.  **EventJoinRequest**: Specialized middleware for event ticketing and registration.
9.  **TutorRequest**: Workflow for students seeking specialized guidance.
10. **TeacherApplication**: Onboarding pipeline for new educational staff.
11. **Organization**: Support for institutional/B2B learning environments.
12. **Session**: Secure JWT session rotation and device tracking.
13. **Payment**: Stripe-integrated transaction logging.
14. **Transaction**: Granular internal auditing for all credit/debit movements.
15. **PlanSettings**: Configuration for subscription tiers (FREE, PRO, PREMIUM).

---

## 3. AI Integrations (Cutting Edge Learning)

Mozhi Aruvi integrates **OpenAI** to provide a professional, AI-driven feedback loop:
- **Speech Evaluation (Whisper-1)**:
    - **Frontend**: Records student pronunciation via `AudioRecorder.tsx`.
    - **Backend**: Sends audio to OpenAI's Whisper model (Tamil-restricted) to transcribe and validate pronunciation accuracy.
- **Dynamic TTS (Text-to-Speech)**:
    - Automatically generates high-quality Tamil audio for any lesson text, enabling auditory learning.

---

## 4. UI/UX Audit & Findings

Based on a comprehensive review of the current design system, the following critical issues have been identified for correction to meet "Premium SaaS" standards:

### **Typography & Fonts**
> [!WARNING]
> **Issue: Conflicting Typography**
> The project currently loads both **Outfit** (Sans) and **Inter** (Mono). Having dual font families in a single application can create visual "noise."

-   **Findings**:
    -   **Outfit** is the dominant font for headings and UI markers.
    -   **Inter** is currently being used for mono-spaced text, which rarely appears in the student portal.
    -   **Size Mismatch**: Headings (H1) are scaled to `3rem`, while Button text is capped at `10px`. This Creates an extreme "Top Heavy" visual hierarchy.
    -   **Italics**: Several components use italicized placeholders which break the clean, professional aesthetic requested.

### **Color Palette & Theme**
> [!IMPORTANT]
> **Issue: Light Text & Color Inconsistency**
> The platform uses "Slate 400" (text-tertiary) in several high-visibility dashboard areas. This color is mathematically too light (low contrast), making it difficult to read on white backgrounds.

-   **Audit Results**:
    -   **Logo**: Currently references `logo.png`. If this image contains black, it must be updated to use the **Primary Indigo (#4f46e5)** theme.
    -   **Buttons**: Several variants use ad-hoc color shades instead of the centralized `primary` variables.
    -   **Black Usage**: The logo and several sidebar icons currently use full black (#000000). To follow the theme, these must transition to **Slate 900 (#0f172a)**.

---

## 5. Correction & Error Report

### **Identified Infrastructure Errors**
1.  **Streak Increment Bug**: (Recently Resolved) Streaks were only increasing on the *first* time a lesson was passed. 
    - *Correction*: Logic has been consolidated to trigger on ANY successful daily participation.
2.  **Stale State Inconsistency**: (Recently Resolved) The student dashboard was showing "0" immediately after passing a lesson due to stale JWT state. 
    - *Correction*: Controller now returns an atomic user object with fresh data.
3.  **Low Contrast Alerts**: Several error messages use light-red backgrounds with light-red text.
    - *Action Required*: Transition to `bg-red-50` and `text-red-700` for WCAG AA compliance.

### **UI Improvement Plan**
- [ ] **Normalize Font Sizes**: Increase Button `md` size from `10px` to `14px` for professional readability.
- [ ] **Standardize Theme Colors**: Replace all instances of `text-gray-*` with `--color-text-*` defined in `globals.css`.
- [ ] **Remove Italics**: Audit `student/progress` and `dashboard` to ensure all text is standard weight.
- [ ] **Primary Branding**: Enforce Indigo (#4f46e5) as the only interactive color.

---
*Report Generated By Antigravity AI Systems*
*Date: 2026-04-01*
