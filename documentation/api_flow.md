# API Flow Reports - Mozhi Aruvi

Mozhi Aruvi uses a set of RESTful endpoints to manage learning state and user interactions. Below are the key API sequences.

## 1. Authentication & Session Flow
**Context**: Logging in a user and establishing an authorized session.

- **Request**: `POST /api/auth/login` (email, password)
- **Backend Process**: Verify email -> Compare bcrypt hash -> Generate JWT token.
- **Response**: JWT token + User object.
- **Client Action**: Store token in LocalStorage/Cookies; include in `Authorization: Bearer <token>` for subsequent requests.

## 2. Lesson Completion Flow
**Context**: A student completes an interactive lesson with a set of questions.

1. **Fetch Questions**: `GET /api/lessons/:lessonId/questions`
   - Returns a list of MCQ, Speaking, and Writing prompts.
2. **Submit Progress**: `POST /api/progress/complete` (lessonId, score)
   - **Backend Process**: 
     a. Validate lessonId.
     b. Create/Update `Progress` record.
     c. Recalculate User `XP` and `Points`.
     d. Add lesson to `User.progress.completedLessons`.
     e. Check for badges or level-up.
3. **Response**: New XP total, Streak status, and next recommended lesson.

## 3. Tutor Booking Flow (Premium)
**Context**: A student books a 1-on-1 session with a language mentor.

1. **Browse Tutors**: `GET /api/users?role=tutor&tutorStatus=approved`
2. **Fetch Availability**: `GET /api/bookings/availability/:tutorId`
3. **Initiate Payment**: `POST /api/payments/checkout-session` (tutorId, slot)
   - Returns Stripe `checkoutUrl`.
4. **Post-Payment Processing**: 
   - Stripe Webhook calls `POST /api/payments/webhook`.
   - Backend creates a `Booking` record with `status: 'confirmed'`.
   - Sends notification to Student and Tutor.

## 4. AI Chat Interaction Flow
**Context**: Student asks for help or practice from the AI Chatbox.

- **Request**: `POST /api/ai/chat` (message, context)
- **Backend Process**: Send request to AI Engine (Gemini/GPT) with system prompt context for Tamil learning.
- **Response**: AI provides a response, phonetic hints, and translations.
- **State Update**: (Optional) Deducts `learningCredits` or `power` from user profile.
