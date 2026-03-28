# Mozhi Aruvi: Detailed Duplication & Redundancy Audit

## 1. Introduction
This report details the findings regarding duplicated and redundant code within the **Mozhi Aruvi** project. As a senior developer, I have audited both the Frontend (Next.js/React) and Backend (Node.js/Express) to identify areas where code reuse is lacking, leading to maintenance overhead and potential inconsistencies.

---

## 2. Redundant Files & Folders

### 2.1 Dashboard Layouts
There are three primary dashboard layouts that are almost identical in structure:
- `Frontend/src/app/admin/layout.tsx`
- `Frontend/src/app/student/layout.tsx`
- `Frontend/src/app/tutor/layout.tsx`

**The "Bad":**
- Each file manually imports `Sidebar`, `Topbar`, and `RoleProtectedRoute`.
- Changes to the general dashboard wrapper (e.g., padding, animation, background color) must be applied to all three files.
- Visual inconsistencies can creep in easily.

**The "Good":**
- Clearly separated link definitions for each role.

### 2.2 Unused Scripts & Residual Files
There are several "scratch" files in the root and project directories that should be moved or deleted:
- `f:\Mozhi Aruvi\fix_tailwind.js` (No longer needed after Tailwind v4 setup)
- `f:\Mozhi Aruvi\Frontend\ts_errors.txt`, `ts_errors2.txt`, `tsc_errors.txt` (Build logs)
- `f:\Mozhi Aruvi\Backend\seed.js` (Should be in a `seeds` or `scripts` folder)

---

## 3. Duplicated Code & Logic

### 3.1 Hardcoded Inline UI (Event Spotlight)
In `Frontend/src/app/events/page.tsx`, the "Spotlight Experience" carousel is hardcoded inline with 100+ lines of Tailwind/JSX. 

**The "Improvement":**
- This should be extracted into a `SpotlightCarousel` or `EventHero` component. 
- The styling for event cards should be unified (currently `EventCard` is used for the list, but the spotlight is manual).

### 3.2 Backend Error Handling (The "Try-Catch" Pattern)
Almost every controller in the `Backend/controllers` directory uses the same boilerplate:
```javascript
export async function someFunction(req, res, next) {
    try {
        // logic
    } catch (e) { next(e); }
}
```
**The "Improvement":** Use an `asyncHandler` wrapper to automatically catch errors and pass them to `next()`.

### 3.3 Redundant Service Call Logic
In `Frontend/src/app/events/page.tsx`, there is logic for deactivating/deleting events inside the page component:
```typescript
const handleDelete = async (id: string) => {
    if (!window.confirm("...")) return;
    try {
        await deleteEvent(id);
        // ...
    } catch (err) { ... }
};
```
This logic is repeated in `admin/events/page.tsx`.

---

## 4. Duplicated Types & Interfaces (Frontend)

One of the cleanest improvements we can make is centralizing user types. Currently, we have:
1. **`SafeUser`** in `authService.ts`
2. **`UserProfile`** in `userService.ts`
3. **`BaseUser`** in `adminService.ts`

They all contain nearly identical fields (`_id`, `name`, `email`, `role`, `bio`, etc.). Managing these across three files means we often miss updating one when the schema changes.

---

## 5. Improvement Roadmap: The "Senior Fix"

### Phase 1: Centralize Types (Highest Impact)
- Create `Frontend/src/types/index.ts` and `Frontend/src/types/user.ts`.
- Export a single `User` interface to be used across all services and components.

### Phase 2: Refactor Layouts
- Create a `components/layout/DashboardWrapper.tsx` that accepts `links`, `title`, and `allowedRoles`.
- Update each role layout to use this shared wrapper.

### Phase 3: Extract Common Components
- Move the "Spotlight" logic from `EventsPage` into its own component.
- Move "Event Actions" (Delete/Join) into a custom hook `useEventActions`.

### Phase 4: Backend Refinement
- Implement `Backend/utils/asyncHandler.js`.
- Refactor controllers to use the wrapper, reducing code size by ~15%.

---

## 6. Conclusion
The codebase is visually stunning and architecturally sound but suffers from **"Copy-Paste Scaling"**. By implementing the abstractions mentioned above, we will reduce the total code volume, improve type safety, and make the application significantly easier to maintain for future developers.
