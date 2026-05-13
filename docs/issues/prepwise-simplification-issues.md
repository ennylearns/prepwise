# Prepwise Simplification Issues

Parent PRD: `docs/product/prepwise-simplification-prd.md`

These issues are local markdown issues for the simplification project. They are written as vertical slices where possible: each slice should leave the app in a demoable or verifiable state.

## Proposed Breakdown

1. **Rebuild the core learning schema and seed data**
   - Type: AFK
   - Blocked by: None
   - User stories covered: 47, 48

2. **Return real student dashboard subject cards from Convex**
   - Type: AFK
   - Blocked by: Issue 1
   - User stories covered: 3, 4, 5, 6

3. **Compute syllabus tree lesson states server-side**
   - Type: AFK
   - Blocked by: Issue 1
   - User stories covered: 7, 8, 9, 10, 11, 12, 13, 46

4. **Implement lesson reading and coming-soon access rules**
   - Type: AFK
   - Blocked by: Issues 1, 3
   - User stories covered: 16, 17, 28

5. **Implement quiz attempts, completions, and unlock behavior**
   - Type: AFK
   - Blocked by: Issues 1, 3, 4
   - User stories covered: 18, 19, 20, 21, 22, 23, 24, 25, 48

6. **Enforce free daily lesson limit and premium bypass**
   - Type: AFK
   - Blocked by: Issue 5
   - User stories covered: 14, 15, 26, 27

7. **Simplify active student routes and navigation**
   - Type: AFK
   - Blocked by: Issues 2, 3, 4, 5, 6
   - User stories covered: 28, 45, 50

8. **Add Google-only Convex Auth and student/admin roles**
   - Type: HITL
   - Blocked by: Issue 1
   - User stories covered: 1, 2, 29, 30

9. **Build the admin content dashboard shell**
   - Type: AFK
   - Blocked by: Issues 1, 8
   - User stories covered: 31, 32

10. **Build admin lesson review, question editing, and publish validation**
    - Type: AFK
    - Blocked by: Issue 9
    - User stories covered: 33, 34, 35, 36, 37, 38

11. **Generate structured AI lesson content and questions**
    - Type: AFK
    - Blocked by: Issues 1, 10
    - User stories covered: 39, 40, 49

12. **Process lesson generation incrementally with cron**
    - Type: AFK
    - Blocked by: Issue 11
    - User stories covered: 41, 42, 43, 44

13. **Clean up old teacher, uploader, CBT, progress, and streak surfaces**
    - Type: AFK
    - Blocked by: Issues 7, 9, 10
    - User stories covered: 45, 50

---

## Issue 1: Rebuild the core learning schema and seed data

## What to build

Replace the active data model with the simplified learning core. The app should have typed Convex relationships for users, subjects, lessons, lesson questions, lesson attempts, lesson completions, and subscriptions. Development data can be wiped and reseeded. The seed should create all syllabus subjects and lessons as drafts, plus a tiny published demo path with five quiz questions so the student flow can be exercised immediately.

## Acceptance criteria

- [ ] Core relationship fields use Convex IDs instead of strings.
- [ ] Lessons support statuses `draft`, `generating`, `generated`, `published`, and `failed`.
- [ ] Lesson questions include a source field that can support `ai`, `past_question`, and `manual`.
- [ ] Attempts and completions are modeled separately.
- [ ] Completion records are unique per user and lesson.
- [ ] Seed creates all subjects and syllabus lessons.
- [ ] Seed includes at least one published demo lesson with exactly five questions.
- [ ] Removed/deferred tables are no longer used by active student flows.
- [ ] Build/typecheck still passes.

## Blocked by

None - can start immediately.

---

## Issue 2: Return real student dashboard subject cards from Convex

## What to build

Update the student dashboard data path so it returns only the simplified dashboard information: subject list, total lessons per subject, completed lessons per subject, and subscription/free-plan state needed for the upgrade quick action. The dashboard should not return or display streaks, global topics-done stats, CBT shortcuts, or progress analytics.

## Acceptance criteria

- [ ] Dashboard shows a welcome hero.
- [ ] Dashboard shows subject cards.
- [ ] Each subject card shows `completed / total` lesson counts.
- [ ] Dashboard includes an upgrade quick action.
- [ ] Dashboard does not show streaks, topics-done global stats, mock exam action, or progress action.
- [ ] Backend avoids N+1 lesson queries where practical.
- [ ] Build/typecheck still passes.

## Blocked by

Issue 1.

---

## Issue 3: Compute syllabus tree lesson states server-side

## What to build

Move syllabus tree state calculation into Convex. The tree API should return every lesson in syllabus order with a student-facing status: completed, available, sequence locked, daily-limit locked, or coming soon. The frontend should render these states rather than inventing them locally.

## Acceptance criteria

- [ ] Student tree includes all syllabus lessons for the subject.
- [ ] Unpublished lessons return as `coming_soon`.
- [ ] Completed lessons return as `completed`.
- [ ] The next valid published lesson returns as `available` when the user is allowed to take it.
- [ ] Later published lessons return as `sequence_locked` until previous lessons are completed.
- [ ] Free users who completed today's free lesson see the next otherwise-available lesson as `daily_limit_locked`.
- [ ] Premium users do not receive daily-limit locks.
- [ ] Frontend no longer hardcodes "first lesson active, rest locked."
- [ ] Build/typecheck still passes.

## Blocked by

Issue 1.

---

## Issue 4: Implement lesson reading and coming-soon access rules

## What to build

Make lesson pages honor the simplified publication and tree rules. Published lessons can be opened by authenticated students when available/completed. Unpublished lessons should be represented as coming soon in the tree and not expose content to students. Old removed routes should redirect safely rather than showing stale feature pages.

## Acceptance criteria

- [ ] Published available/completed lessons can be opened.
- [ ] Unpublished lessons do not expose content to students.
- [ ] Coming-soon tree items are non-clickable or show a clear coming-soon message.
- [ ] Sequence-locked lessons explain that the previous lesson must be completed.
- [ ] Daily-limit-locked lessons open an upgrade explanation modal, not the lesson.
- [ ] Removed legacy routes redirect to dashboard or admin as appropriate.
- [ ] Build/typecheck still passes.

## Blocked by

Issues 1 and 3.

---

## Issue 5: Implement quiz attempts, completions, and unlock behavior

## What to build

Rework the lesson quiz flow around five-question lesson assessments. Every submission creates an attempt. Passing creates a single completion if the lesson was not already completed. Passing requires at least four out of five correct. Failed attempts are retryable immediately and do not unlock the next lesson.

## Acceptance criteria

- [ ] Lesson quiz renders exactly the lesson's five questions.
- [ ] Every quiz submission stores a lesson attempt.
- [ ] Passing requires at least four correct answers.
- [ ] Passing creates one completion record for the user and lesson.
- [ ] Re-passing an already completed lesson does not create duplicate completions.
- [ ] Failed attempts do not create completions.
- [ ] Failed attempts can be retried immediately.
- [ ] Passing result screen offers continue and back-to-syllabus actions.
- [ ] Tree unlock behavior reads completions.
- [ ] Build/typecheck still passes.

## Blocked by

Issues 1, 3, and 4.

---

## Issue 6: Enforce free daily lesson limit and premium bypass

## What to build

Keep payments/subscriptions active and enforce the simplified free plan rule: free users can complete one new lesson per day globally across all subjects; premium users can complete unlimited lessons. The limit should count passed lesson completions only, not views or failed attempts.

## Acceptance criteria

- [ ] Free users can complete one new lesson per day total.
- [ ] Failed attempts do not consume the daily free lesson.
- [ ] Reopening or retrying already completed lessons does not consume the daily free lesson.
- [ ] Premium users bypass the daily limit.
- [ ] Backend enforces the limit, not only the UI.
- [ ] Daily-limit-locked tree lessons show clear upgrade messaging.
- [ ] Result screen after a free user's daily completion points toward upgrade.
- [ ] Existing Paystack upgrade and callback flow remains functional or is adapted to the new auth/user model.
- [ ] Build/typecheck still passes.

## Blocked by

Issue 5.

---

## Issue 7: Simplify active student routes and navigation

## What to build

Reduce the active student app to dashboard, subject tree, lesson, quiz, upgrade, and payment callback. Remove bottom navigation and use simple top/back navigation. Redirect old routes for exam, progress, teacher, and uploader surfaces.

## Acceptance criteria

- [ ] Active student routes are login, dashboard, subject tree, lesson, lesson quiz, upgrade, and payment callback.
- [ ] Bottom navigation is removed from active screens.
- [ ] Top/back navigation supports the linear learning flow.
- [ ] `/progress` redirects to `/dashboard`.
- [ ] `/exam` redirects to `/dashboard`.
- [ ] `/teacher/*` redirects to `/admin` for admins or `/dashboard` for students.
- [ ] `/uploader/*` redirects to `/admin` for admins or `/dashboard` for students.
- [ ] No active navigation points to CBT, progress analytics, teacher, or uploader pages.
- [ ] Build/typecheck still passes.

## Blocked by

Issues 2, 3, 4, 5, and 6.

---

## Issue 8: Add Google-only Convex Auth and student/admin roles

## What to build

Replace the current homemade plaintext-password auth with Google-only Convex Auth. New users should sync into the users table. The active roles are student and admin only. Admin access must be enforced server-side.

## Acceptance criteria

- [ ] Login uses Google OAuth only.
- [ ] The app no longer stores plaintext passwords.
- [ ] Sessions persist across browser refresh.
- [ ] New non-admin users become students.
- [ ] Admin users are recognized by a controlled server-side role or allowlist.
- [ ] Student APIs derive the user from server-side auth identity rather than trusting client-provided user IDs for authorization.
- [ ] Admin APIs reject non-admin users server-side.
- [ ] Teacher and uploader roles are not part of active auth logic.
- [ ] Build/typecheck still passes.

## Blocked by

Issue 1.

## Notes

This is marked HITL because Google OAuth/Convex Auth setup requires provider configuration and environment values outside the codebase.

---

## Issue 9: Build the admin content dashboard shell

## What to build

Create the replacement admin dashboard focused only on content pipeline management. It should list subjects and lessons, show generation/publication status, and allow filtering by subject/status. It should not manage users, payments, analytics, or past-question upload in v1.

## Acceptance criteria

- [ ] Admin dashboard is accessible only to admins.
- [ ] Admin can view subjects.
- [ ] Admin can view lessons by subject.
- [ ] Admin can filter lessons by status.
- [ ] Status counts or filters include draft, generating, generated, published, and failed.
- [ ] Admin can open a lesson detail/review page.
- [ ] Dashboard does not include user management, payment management, analytics, or past-question upload.
- [ ] Build/typecheck still passes.

## Blocked by

Issues 1 and 8.

---

## Issue 10: Build admin lesson review, question editing, and publish validation

## What to build

Build the admin lesson detail workflow. Admins can review and edit lesson content, review and edit exactly five quiz questions, publish/unpublish lessons, and regenerate flawed content. Publishing should be blocked unless the lesson content and questions are complete.

## Acceptance criteria

- [ ] Admin can edit lesson title/content.
- [ ] Admin can edit five quiz questions.
- [ ] Admin can edit four options per question.
- [ ] Admin can select a correct answer that matches one option.
- [ ] Admin can edit explanations.
- [ ] Publish is blocked if content is empty.
- [ ] Publish is blocked unless exactly five complete questions exist.
- [ ] Publish is blocked if any question lacks four options, a valid correct answer, or explanation.
- [ ] Admin can publish a generated lesson.
- [ ] Admin can unpublish a published lesson.
- [ ] Admin can request regeneration for a lesson.
- [ ] Build/typecheck still passes.

## Blocked by

Issue 9.

---

## Issue 11: Generate structured AI lesson content and questions

## What to build

Refactor AI generation so it asks for strict JSON containing markdown lesson content and exactly five quiz questions. Validate the response before saving. Retry invalid output up to two times. If generation still fails, mark the lesson failed and store diagnostic information.

## Acceptance criteria

- [ ] AI prompt requests strict JSON with content and five questions.
- [ ] Valid AI output stores lesson content separately from questions.
- [ ] Each generated question has question text, four options, correct answer, explanation, and source `ai`.
- [ ] Invalid JSON is retried up to two times.
- [ ] Invalid question shape is retried up to two times.
- [ ] Persistent failure marks the lesson `failed`.
- [ ] Failed lessons store generation error and raw output when available.
- [ ] Successful generation marks lesson `generated`, not `published`.
- [ ] Build/typecheck still passes.

## Blocked by

Issues 1 and 10.

---

## Issue 12: Process lesson generation incrementally with cron

## What to build

Add cron-based incremental generation. Each cron run should process a small batch. It should retry failed lessons below the retry limit first, then generate the next draft lessons in syllabus order. Generated lessons remain unpublished until admin review.

## Acceptance criteria

- [ ] Cron is registered using Convex cron APIs.
- [ ] Cron processes only a small configured number of lessons per run.
- [ ] Retryable failed lessons are processed before new drafts.
- [ ] Failed lessons stop retrying after the configured attempt limit.
- [ ] Draft lessons are selected in syllabus order.
- [ ] In-progress lessons use `generating` status to avoid duplicate processing.
- [ ] Successful cron generation produces `generated` lessons.
- [ ] Cron never auto-publishes lessons.
- [ ] Build/typecheck still passes.

## Blocked by

Issue 11.

---

## Issue 13: Clean up old teacher, uploader, CBT, progress, and streak surfaces

## What to build

After the simplified student and admin flows are working, remove the old inactive product surfaces and backend code paths that are no longer part of the active app. Keep only code needed by the simplified product and payment flow.

## Acceptance criteria

- [ ] Teacher pages are deleted or fully disconnected from active routes.
- [ ] Uploader pages are deleted or fully disconnected from active routes.
- [ ] CBT exam page and backend functions are deleted or fully disconnected.
- [ ] Standalone progress page and progress/streak UI are deleted or fully disconnected.
- [ ] Old plaintext auth helpers are removed.
- [ ] Obsolete custom HTTP-style frontend API wrapper is removed if unused.
- [ ] Unused Convex functions are removed after replacements exist.
- [ ] Build/typecheck still passes.

## Blocked by

Issues 7, 9, and 10.
