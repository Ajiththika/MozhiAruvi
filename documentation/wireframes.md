# Wireframe & UI/UX Structure - Mozhi Aruvi

Mozhi Aruvi follows a premium, responsive web design using Next.js and custom CSS. Below is a structural description of the main user interfaces.

## 1. Landing Page (Public)
The landing page focuses on conversion and showcasing platform value.

- **Header**: Logo (Mozhi Aruvi), Navigation links (Features, Pricing, About), Login/Register buttons.
- **Hero Section**: Catchy title ("Master Tamil with Mozhi Aruvi"), Call to Action (CTA) button, and an illustrative AI/Language visual.
- **Features Section**: Icon-based cards describing "AI Tutor," "Expert Mentors," "Gamified Progress," and "Structured Lessons."
- **Pricing Section**: Stripe-integrated tiers (Free, Pro, Premium, Business).
- **Footer**: Social links, Contact, and Copyright.

## 2. Student Dashboard (Core Hub)
Designed for gamified engagement and ease of navigation.

- **Sidebar (Global Navigation)**:
  - `Home`: Dashboard overview.
  - `Lessons`: Browse learning paths.
  - `Tutors`: Book 1-on-1 sessions.
  - `Profile`: Settings and achievements.
- **Top Bar**: User XP, Points (Coins), and Daily Streak indicators.
- **Main Progress Area**: A "Learning Path" view (connected nodes) representing current modules and progress within each.
- **Right Sidebar/Widget**: Leaderboard, Daily Quests, and Recommended Tutors.

## 3. Lesson Interface (Interactive Learning)
A minimal, focused view to reduce cognitive load.

- **Progress Bar**: Top indicator showing percentage of lesson completed.
- **Question Area**: Prominent display of question text, audio (if applicable), and hints.
- **Answer Input**: Selectable cards for MCQ, matching pairs, or text-to-speech for speaking exercises.
- **Feedback Bottom-Bar**: Appears on submission; green for "Correct," red for "Incorrect" with an explanation.

## 4. Tutor Booking UI
A discovery-driven interface for personalized learning.

- **Tutor Filters**: Filter by level support (Beginner/Advanced), Hourly rate, and Availability.
- **Tutor Profiles**: Cards with photo, bio, rating, and specialization.
- **Booking Modal**: Calendar-based selection for slots and direct payment integration via Stripe.

## 5. Admin Panel (Management)
A clean, data-intensive dashboard for platform control.

- **Sidebar**: User Management, Content Editor (Lessons/Questions/Categories), Analytics, Payment History.
- **User Table**: Searchable/filterable list with status (Active/Suspended) and role labels.
- **Content Editor**: Forms for creating lessons and attaching questions with real-time validation.
- **Analytics Dashboard**: Growth charts for user signups, payment revenue, and lesson completion trends.
