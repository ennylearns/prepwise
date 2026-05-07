## Problem Statement

The Prepwise backend architecture currently suffers from several critical security and structural flaws that prevent it from scaling safely. Passwords are stored in plaintext and returned to the client, while mutations lack proper server-side authorization, allowing roles to be bypassed via direct API calls. The session state is brittle, causing users to be logged out on a hard page refresh.

Furthermore, the `aiGeneration` module has become a tightly-coupled "god module" that handles LLM logic, lesson CRUD, and teacher queries simultaneously, creating high development friction. Finally, the student dashboard suffers from an N+1 query issue that degrades performance, with UI metadata inappropriately hardcoded into the backend. 

## Solution

We will refactor the core architecture to secure the platform and improve maintainability:
1. **Authentication:** Migrate entirely to Convex Auth paired with Auth0.
2. **Role Management:** Default all new signups to the `student` role, with manual upgrades to `teacher` done securely via an admin dashboard.
3. **Authorization:** Implement strict server-side role validation using `customFunction` wrappers for all queries and mutations.
4. **Decomposition:** Split the `aiGeneration` god module into three isolated, deep modules (`lessons`, `aiGeneration`, and `teacher`).
5. **Performance & UI:** Resolve the dashboard N+1 queries with a single database fetch and migrate hardcoded UI metadata (icons, colors, tags) to the frontend configuration.

## User Stories

1. As a new student, I want to sign up securely using Auth0, so that my credentials are not stored in plaintext in the database.
2. As a logged-in user, I want my session to persist across hard browser refreshes, so that I don't have to log in repeatedly.
3. As a platform administrator, I want all new users to default to the student role, so that unauthorized users cannot access teacher tools.
4. As a platform administrator, I want to manually upgrade vetted individuals to the teacher role, so that quality control over lesson content is maintained.
5. As a developer, I want to use a simple `teacherMutation` wrapper, so that I can easily enforce authorization without remembering to write boilerplate role checks.
6. As a developer, I want all backend functions to implicitly reject requests from users without the correct role, so that the API cannot be abused.
7. As a developer, I want the AI generation logic fully separated from lesson database operations, so that I can test the lesson status machine without triggering LLM calls.
8. As a developer, I want the lesson status transitions strictly enforced at the database level, so that invalid states (e.g., publishing a draft directly) are impossible.
9. As a teacher, I want the backend queries powering my dashboard to be isolated from AI logic, so that bugs in the LLM integrations do not break my portal.
10. As a student, I want the subject dashboard to load quickly, so that I can access my learning materials without latency spikes caused by N+1 queries.
11. As a frontend developer, I want to configure subject colors and icons directly in the frontend codebase, so that I can iterate on the UI without modifying database logic.

## Implementation Decisions

### Authentication & Role Assignment
- **Auth Provider:** Convex Auth will be implemented using Auth0 as the identity provider. 
- **User Synchronization:** A `storeUser` mutation will be created to fire upon a successful Auth0 login. It will create a record in the `users` table if one does not exist.
- **Default Roles:** The `storeUser` mutation will strictly assign the `student` role by default. A separate mechanism (future scope) will allow admins to upgrade these roles.

### Server-Side Authorization
- **Custom Wrappers:** We will utilize the `customFunction` utility from `convex-helpers` to build custom wrappers for our API endpoints.
- **Interfaces:** We will expose `protectedQuery`, `studentMutation`, and `teacherMutation`. These wrappers will automatically invoke `ctx.auth.getUserIdentity()`, fetch the user document, validate the required role, and inject the `user` object into the handler context.

### Decomposing `aiGeneration`
- The current god module will be split into three distinct modules:
  1. **Lesson Lifecycle Module:** Manages all DB operations for lessons (CRUD) and enforces the strict status state machine (`draft → ai_generated → pending_review → approved → published`).
  2. **AI Generation Module:** A pure module that handles OpenRouter LLM calls, prompting, and rate-limit tracking. It accepts context and returns content without touching the lessons database.
  3. **Teacher Portal Module:** Consolidates all queries required for the teacher dashboard.

### Dashboard Performance
- **N+1 Fix:** The dashboard query will be refactored to query the `lessons` table once and group the results by subject in memory.
- **UI Metadata Extraction:** The hardcoded Material icons, category tags, and Tailwind color classes will be entirely removed from the backend query and relocated to a static configuration file in the frontend.

## Testing Decisions

A good test should verify external behavior rather than internal implementation details. Tests should fail when business requirements are broken, but survive internal refactoring. All modified modules will be heavily tested:

1. **Authorization Wrappers:** 
   - Tests will mock `ctx.auth.getUserIdentity()` and the `users` table.
   - We will assert that a `teacherMutation` throws an error when invoked by a user with a `student` role or an unauthenticated user.
2. **User Synchronization:**
   - Tests will verify that duplicate Auth0 logins do not create duplicate rows in the `users` table.
   - Tests will assert that the default role assigned is always `student`.
3. **Lesson Lifecycle (State Machine):**
   - Tests will attempt to force invalid state transitions (e.g., `draft` directly to `published`) and assert they are blocked.
   - Tests will verify valid transitions succeed without needing a mocked LLM.
4. **AI Generation:**
   - Tests will use mocked HTTP responses to verify that rate limits correctly block excessive generations.
5. **Dashboard Queries:**
   - Tests will seed multiple subjects and verify the returned lesson counts match, ensuring the N+1 refactor did not break data aggregation.

## Out of Scope

- Building the actual Admin Dashboard UI for manually upgrading students to teachers.
- Implementing any new LLM prompts or migrating to a different AI model provider.
- Implementing payment workflows or subscription tiers.

## Further Notes

- These refactoring steps form the necessary foundation for safely scaling the marketplace pivot, ensuring that as more hand-picked teachers are onboarded, they cannot exceed their privileges and their content is strictly routed through the approval workflow.
