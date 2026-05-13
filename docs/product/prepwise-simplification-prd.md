# Prepwise Simplification PRD

## Problem Statement

Prepwise currently has too many product surfaces for its stage: student dashboard, lesson tree, lesson view, quiz, CBT exam, progress analytics, upgrade/payment, teacher portal, uploader portal, AI lesson generation, question upload, streaks, and role-specific navigation. This makes the codebase difficult to change because new features must fit around multiple half-finished flows, duplicated backend responsibilities, mock data, client-side role checks, and schema fields that do not consistently use Convex document IDs.

The product needs a smaller, clearer core that can prove whether students value and will pay for a syllabus-guided JAMB learning experience. The simplified product should keep the strongest loop: authenticated student opens dashboard, chooses a subject, follows the syllabus tree, studies a lesson, passes a short assessment, and unlocks the next lesson. Everything else should either support that loop or be removed/deferred.

## Solution

Simplify Prepwise into two active surfaces:

1. Student learning experience.
2. Admin content pipeline.

The student experience keeps a dashboard with subject cards, an upgrade quick action, syllabus tree navigation, lesson reading, and one short quiz after each lesson. The dashboard should remove streaks, global stats, mock exam shortcuts, bottom navigation, and the standalone progress page.

The admin experience replaces the teacher and uploader portals. It manages the content pipeline only: subjects, lessons, generation status, lesson review, quiz question review, publish/unpublish, regeneration, and failed generation recovery.

AI generation will be cron-driven and incremental. Cron should generate a small number of draft or retryable failed lessons per run, in syllabus order. Generated lessons require admin review before students can access them. AI output should be structured JSON containing lesson content and exactly five quiz questions.

Authentication will move to proper Convex Auth with Google OAuth only for now. The active role model becomes `student` and `admin`. Students must log in before using the product. Admin access is based on server-side role checks.

Payment remains in scope because the product needs to test willingness to pay. Free users can complete one new lesson per day across all subjects. Premium users can complete unlimited lessons. The free limit counts passed lesson completions, not lesson views or failed quiz attempts.

## User Stories

1. As a student, I want to sign in with Google, so that I can access Prepwise without creating another password.
2. As a student, I want my session to persist after refresh, so that I do not lose access during study.
3. As a student, I want to land on a dashboard after login, so that I can quickly choose a subject.
4. As a student, I want to see a clean list of subjects, so that I can decide what to study.
5. As a student, I want each subject card to show completed lessons out of total lessons, so that I understand my progress without a heavy analytics dashboard.
6. As a student, I want an upgrade quick action on the dashboard, so that I can easily find premium access.
7. As a student, I want to open a subject's syllabus tree, so that I can follow a structured JAMB path.
8. As a student, I want the syllabus tree to show all syllabus lessons, so that I understand the full scope of a subject.
9. As a student, I want unpublished lessons to show as coming soon, so that I know the topic exists but is not ready yet.
10. As a student, I want completed lessons to be visually distinct, so that I can see what I have already mastered.
11. As a student, I want only the next valid lesson to be available, so that I follow the syllabus in order.
12. As a student, I want sequence-locked lessons to explain that I must complete the previous lesson first, so that I know what action to take.
13. As a free student, I want daily-limit-locked lessons to explain that I completed today's free lesson, so that I understand the upgrade prompt.
14. As a free student, I want to complete one new lesson per day, so that I can experience the product before paying.
15. As a premium student, I want unlimited lesson completions, so that I can study without waiting.
16. As a student, I want to open a published lesson, so that I can study the topic.
17. As a student, I want lesson content to be clear and structured for JAMB preparation, so that I can learn efficiently.
18. As a student, I want to take a short quiz after a lesson, so that I can check whether I understood it.
19. As a student, I want each lesson quiz to have five multiple-choice questions, so that assessment is quick and focused.
20. As a student, I want to see explanations for quiz answers, so that mistakes help me learn.
21. As a student, I want to pass a lesson by getting at least four out of five questions correct, so that the mastery rule is easy to understand.
22. As a student, I want unlimited retries after failed quizzes, so that I can keep learning without punishment.
23. As a student, I want failed quiz attempts not to consume my free daily lesson, so that curiosity and mistakes are not penalized.
24. As a student, I want passing a quiz to unlock the next lesson, so that I can keep moving through the syllabus.
25. As a student, I want a result screen after passing, so that I understand my score and next action.
26. As a free student, I want the result screen to offer upgrade after I use my daily free lesson, so that I can continue immediately if I choose to pay.
27. As a free student, I want a clear modal when clicking a daily-limit-locked lesson, so that I know I can upgrade or come back tomorrow.
28. As a student, I want old removed routes to redirect safely, so that broken links do not strand me.
29. As an admin, I want to sign in with Google, so that I can manage content securely.
30. As an admin, I want admin access enforced server-side, so that students cannot access admin functions by manipulating the UI.
31. As an admin, I want a content dashboard, so that I can see lesson generation and publication status.
32. As an admin, I want to filter lessons by subject and status, so that I can find work that needs attention.
33. As an admin, I want to review generated lesson content before publishing, so that students do not see unverified AI content.
34. As an admin, I want to edit generated lesson content, so that I can correct inaccuracies and improve clarity.
35. As an admin, I want to review and edit quiz questions before publishing, so that wrong answer keys do not reach students.
36. As an admin, I want publish validation to require content and five complete questions, so that incomplete lessons cannot go live.
37. As an admin, I want to publish reviewed lessons, so that students can access approved content.
38. As an admin, I want to unpublish lessons, so that I can remove flawed content from student access.
39. As an admin, I want to regenerate a lesson, so that I can recover from poor generated content.
40. As an admin, I want failed generations to show their error and raw output, so that I can understand what went wrong.
41. As an admin, I want cron generation to process a small number of lessons per run, so that content creation is incremental and cost-controlled.
42. As an admin, I want failed lessons to retry automatically up to a limit, so that transient AI/API failures recover without manual work.
43. As an admin, I want lessons that fail repeatedly to remain failed, so that infinite retry loops do not waste API usage.
44. As an admin, I want all generated lessons to remain unpublished until reviewed, so that the product has human quality control.
45. As a developer, I want a smaller route map, so that feature work is easier to reason about.
46. As a developer, I want the backend to compute lesson tree states, so that the frontend does not duplicate progression, payment, and publication logic.
47. As a developer, I want core schema fields to use Convex IDs, so that relationships are type-safe.
48. As a developer, I want lesson attempts and completions separated, so that unlock logic stays clean while attempts remain available for future learning insights.
49. As a developer, I want AI output stored as structured content and questions, so that admin review and student quizzes do not depend on brittle text parsing.
50. As a developer, I want dead teacher/uploader/CBT/progress surfaces removed after replacement, so that the codebase stays simple.

## Implementation Decisions

- Product scope is reduced to a student dashboard, syllabus tree, lesson view, quiz flow, upgrade/payment flow, and admin content pipeline.
- The active role model is `student` and `admin` only.
- Google OAuth is the only supported login method for now.
- Students must log in before accessing the product.
- After login, admins go to the admin dashboard and students go to the student dashboard.
- The student dashboard keeps a welcome hero, subject cards, completed lesson counts, and an upgrade quick action.
- The student dashboard removes streaks, global topics-done stats, mock exam action, progress action, and profile/bottom navigation.
- The bottom navigation should be removed in favor of simple top/back navigation.
- Removed routes should redirect to active routes rather than showing placeholder pages.
- The active student route set is login, dashboard, subject tree, lesson, lesson quiz, upgrade, and payment callback.
- The active admin route set is admin dashboard and admin lesson detail/review.
- The teacher and uploader portals should be hidden first, then deleted after replacement is verified.
- CBT exam, standalone progress page, streaks, and global stats are out of the active product.
- The lesson tree should show the full syllabus, including unpublished lessons as coming soon.
- Students can only access published lesson content.
- Lesson tree status should be calculated by Convex, not invented by React.
- Lesson tree statuses are `completed`, `available`, `sequence_locked`, `daily_limit_locked`, and `coming_soon`.
- Sequence locks mean the previous lesson has not been completed.
- Daily-limit locks mean the free student has completed one new lesson today.
- Clicking a daily-limit-locked lesson opens an explanatory modal with upgrade and back/dashboard actions.
- Backend functions must enforce sequence and daily free limits; UI checks are not sufficient.
- Free users can complete one new lesson per day globally across all subjects.
- The daily free limit counts passed lesson completions only.
- Failed quiz attempts and lesson page views do not consume the free daily limit.
- Premium users have unlimited lesson completions.
- Payment and subscription logic remains in scope because willingness to pay must be tested.
- A lesson quiz has exactly five multiple-choice questions.
- Passing means at least four out of five correct.
- Failed quizzes can be retried immediately with no retry limit.
- After passing, the result screen shows the score and offers continue/back actions.
- If a free user just used the daily free lesson, the result screen should lead toward upgrade rather than the next lesson.
- Current `progress` should be replaced by `lessonAttempts` and `lessonCompletions`.
- `lessonAttempts` stores every submitted quiz attempt.
- `lessonCompletions` stores one completion per user and lesson.
- Unlock logic and daily free-limit logic read from `lessonCompletions`.
- Core schema should include `users`, `subjects`, `lessons`, `lessonQuestions`, `lessonAttempts`, `lessonCompletions`, and `subscriptions`.
- `pastQuestions`, `examAttempts`, old `progress`, teacher/uploader support tables, and teacher daily generation quota are not part of the simplified active model.
- Core relationship fields should use Convex IDs rather than strings.
- Lesson status should use `draft`, `generating`, `generated`, `published`, and `failed`.
- Lesson generation metadata should include attempts, last attempt time, error message, and raw generated output.
- Lesson questions should include a source value such as `ai`, `past_question`, or `manual` to support future past-question attachment.
- Development data can be wiped and reseeded.
- Seed should create all subjects and syllabus lessons as drafts.
- Seed should include a tiny demo set of published lessons and five questions so the student flow is immediately testable.
- AI generation should use strict JSON output containing lesson content and five questions.
- The lesson content itself can be markdown stored as a string.
- AI generation should validate JSON before saving.
- AI generation should retry invalid/failed output up to two times in the same generation attempt.
- If AI output remains invalid, mark the lesson failed and store raw output plus error details.
- Cron should generate the next small batch of draft lessons in syllabus order.
- Cron should retry failed lessons with attempts below the retry limit before continuing through drafts.
- Generated lessons require admin review and publish before students can see them.
- Admin dashboard v1 manages content pipeline only, not users, payments, analytics, or past-question upload.
- Admin lesson review supports editing lesson content and five quiz questions before publish.
- Publish validation requires non-empty content, exactly five questions, four options per question, a valid correct answer, and explanations.
- Past-question upload is deferred but the schema should leave a path for attaching real past questions to lessons later.

## Testing Decisions

- Tests should verify external behavior and business rules rather than implementation details.
- Convex backend tests should focus on auth/authorization, lesson tree state calculation, quiz submission, free-limit enforcement, subscription handling, and admin publish validation.
- The lesson tree module should be tested with combinations of published/unpublished lessons, completed lessons, free users, premium users, and daily limit states.
- Quiz submission tests should verify attempts are recorded, completions are deduplicated, failed attempts do not consume the free limit, and passing unlocks the next lesson.
- Free-limit tests should verify one completion per day globally across subjects for free users and unlimited completions for premium users.
- Admin publish tests should verify incomplete content/questions cannot be published.
- AI generation validation should be tested with mocked valid JSON, invalid JSON, wrong question counts, invalid correct answers, and provider failures.
- Payment tests should verify subscription state is read by lesson access logic without relying only on UI checks.
- Route/UI tests should focus on visible behavior: removed routes redirect, daily-limit lock shows an upgrade modal, dashboard shows subject cards and upgrade action, and bottom nav/progress/exam links are absent.
- Existing `npm run build` should remain a baseline verification step.

## Out of Scope

- Teacher portal.
- Uploader portal.
- CBT exam mode.
- Standalone progress analytics page.
- Streaks.
- Global stats cards.
- Leaderboards.
- Admin user management.
- Admin payment dashboard.
- Past-question upload UI in the first simplification pass.
- Multiple OAuth providers.
- Email/password auth.
- Public anonymous browsing.
- Full automated AI publishing without admin review.
- Detailed learning analytics beyond stored attempts/completions.
- Preserving existing development data.

## Further Notes

- The simplification should be implemented in small vertical slices rather than one large rewrite.
- Recommended implementation order is schema/core backend first, then student dashboard/tree/quiz, then routes/UI simplification, then Google auth, then admin dashboard, then cron AI generation, then cleanup.
- Old teacher/uploader/review UI can be harvested temporarily for admin dashboard pieces before deletion.
- The previous architecture refactor PRD should be treated as superseded where it conflicts with this direction, especially around teacher roles and Auth0.
- The core product promise after simplification is: log in, choose a subject, follow the syllabus tree, study one lesson, pass a short quiz, and unlock the next lesson.
