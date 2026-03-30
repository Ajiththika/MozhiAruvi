# Mozhi Arivu - Comprehensive Project Report

This document serves as a full architecture, stack, and codebase review for the **Mozhi Arivu** application.

## 1. Project Overview & Platform Details
**Mozhi Arivu** is a full-stack, SaaS-level educational web platform dedicated to language learning (specifically targeting Tamil, as seen in the audio processing modules) and tutor management. 
The application connects students, tutors, and administrators through a gamified learning experience, interactive lessons, audio recording challenges, and content blogs/events.

The project code is strictly separated into two distinct environments to ensure modularity and scalability:
- **Frontend Workspace:** Contains the user interface, routing, and client-side logic.
- **Backend Workspace:** Contains the REST API, database models, AI integrations, and authentication logic.

## 2. Technology Stack

### **Frontend (Client-Side)**
* **Framework:** Next.js (v16.1.6) using the modern App Router (`src/app/`).
* **UI/View Layer:** React.js (v19.2.3) with React DOM.
* **Styling:** Tailwind CSS (v4) coupled with PostCSS, using utility tools like `clsx` and `tailwind-merge` for dynamic classes.
* **Component Library Icons:** Lucide-React.
* **State Management & Data Fetching:** `@tanstack/react-query` for asynchronous state management and `axios` for structured API requests.
* **Language:** TypeScript for strict typing and scalable code.
* **Compiler:** `babel-plugin-react-compiler`.

### **Backend (Server-Side)**
* **Runtime & Framework:** Node.js with Express (v4.18.2).
* **Database:** MongoDB with `mongoose` (v8.1.1) Object Data Modeling.
* **Authentication & Security:** 
  * `jsonwebtoken` (JWT) for secure session rotation
  * `bcryptjs` for password hashing
  * `passport` and `passport-google-oauth20` for Google OAuth SSO integration
  * `helmet` for HTTP header security
  * `express-rate-limit` to prevent brute-force attacks.
* **Data Validation:** `zod` for robust schema validation for incoming payloads.
* **Media & File Handling:** `multer` and `multer-storage-cloudinary` for uploading and managing images (Events/Blogs headers) on Cloudinary.
* **Email Service:** `nodemailer` for handling transactional emails/SMTP.

## 3. AI Integrations
The platform leverages third-party AI to provide interactive language validation:
* **OpenAI Whisper (Speech-to-Text)**
  * **Location:** `f:\Mozhi Aruvi\Backend\controllers\lessonController.js`
  * **Implementation details:** During speech lessons, the user's recorded audio is sent from the frontend (`AudioRecorder.tsx`) to the backend as a Base64 string. The backend converts this buffer into a `.webm` file and sends it to the `openai.audio.transcriptions.create` API using the `whisper-1` model lock-targeted to the Tamil language (`language: 'ta'`).
  * **Logic:** The AI transcribes the audio, and the backend validates the length and content of the speech to automatically score the student's pronunciation. There's also a fallback "simulated mode" built-in if the OpenAI API key is missing or unavailable.

## 4. File Structure and Statistics
Based on a recursive scan of the project (ignoring build folders `node_modules`, `.next`, and `.git`):

* **Total Folders Created:** 70
* **Total Source Files Created:** 170
* **Separation of Concerns (No strict duplication):** The codebase leverages modularity. For instance, logic is broken down cleanly: `lessonController.js` handles HTTP request/responses and passes data to `lessonService.js` which manages business logic and database interactions. Frontend components are cleanly abstracted (e.g., `Card.tsx`, `AudioRecorder.tsx`).

## 5. Comprehensive Error Handling & Identified Error Points
The codebase employs strong error boundaries and try-catch blocks. Below is the list of localized errors and exception handling systems found across the application that might trigger during various points of failure:

### **Frontend Errors**
* **Global App Crashes:** Handled by a Next.js `error.tsx` boundary (`"Global Error Caught"`).
* **API / Network Failures (`lib/api.ts`):** 
  * `[API] Server Error:` Caught by Axios interceptors for 500/400 status codes.
  * `[API] Connection Failure:` Triggered when the Next.js app cannot reach the Node/Express backend on Port 5000.
  * `[API] Request Construction Error:` Request formulation mistakes.
* **Hardware/Permissions (`AudioRecorder.tsx`):** 
  * `"Audio Access Error:"` Triggers when the user denies microphone permission or the browser blocks the Audio API.
* **Data Fetching Fails:** Handled dynamically on individual pages matching routes like Admin Events (`admin/events/page.tsx`), Student Lessons (`student/lessons/page.tsx`), and Blog views (`blogs/[id]/page.tsx`).

### **Backend Errors**
* **Database & Infrastructure:**
  * `"Critical Database Failure":` Handled in `server.js` and `test-db.js` specifically structured to output MongoDB connection faults (Name, Message, Stack, Reason).
  * `"DNS SRV Resolution Failed":` Handled in `test-dns.js` when diagnosing MongoDB Atlas connection strings.
* **Authentication Security (`tokenService.js`):**
  * `"[rotateRefreshToken] Token reuse or invalid token detected for session"`: Security exception if a hijacked JWT refresh token is attempted.
* **External Services integration:**
  * `"[TEST-EMAIL] SMTP error":` Caught in `app.js` when Nodemailer fails to authenticate with external mail providers.
  * `"[AI Speech-to-Text] Error":` Caught in `lessonController.js` when the OpenAI API times out, lacks quotas, or throws up network exceptions. Reverts smoothly to a simulated response mode.
* **Global Router (`middleware/error.js`):**
  * Catch-all middleware `"[ERROR HANDLER]"` that stops server crashes and cleanly passes JSON formatted errors back to the frontend.

## 6. Project Quality Summary
The project operates as a standard high-quality SaaS pattern. 
- You have avoided redundant code (Spaghetti Code) by creating centralized utility components (e.g., `api.ts` for fetch, `tokenService.js` for secrets handling).
- Next.js and React 19 ensure rendering efficiency on the frontend, whilst Node/Express ensures non-blocking API processing. 
- The implementation of Cloudinary simplifies local storage burdens, and OpenAI integrations push it to an advanced gamification platform standard.
