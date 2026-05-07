# Prepwise — Architecture Deepening Opportunities

> Generated: 2026-05-07  
> Skill: `improve-codebase-architecture`  
> Status: candidates identified, none yet grilled

---

## Glossary (skill vocabulary)

| Term | Definition |
|------|-----------|
| **Module** | Anything with an interface and an implementation (function, class, file, slice). |
| **Interface** | Everything a caller must know to use the module: types, invariants, error modes, ordering, config. Not just the type signature. |
| **Depth** | Leverage at the interface — a lot of behaviour behind a small interface. **Deep** = high leverage. **Shallow** = interface nearly as complex as the implementation. |
| **Seam** | Where an interface lives; a place behaviour can be altered without editing in place. |
| **Adapter** | A concrete thing satisfying an interface at a seam. |
| **Leverage** | What callers get from depth. |
| **Locality** | What maintainers get from depth: change, bugs, and knowledge concentrated in one place. |
| **Deletion test** | Imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep. |

---

## Candidate #1 — Auth module is dangerously shallow (plaintext passwords)

**Status:** 🔴 Security risk  
**Files involved:**
- `convex/auth.ts`
- `convex/schema.ts` (users table, `password` field)
- `src/pages/student/Login.tsx`
- `src/pages/student/Register.tsx`

### Problem

`auth.ts` performs a plain string comparison (`user.password !== args.password`) against a plaintext `password` field stored directly in the `users` table. No hashing, no salting, no session token.

The `signIn` mutation returns the full user row — **including the raw password** — to the client. `getUser` is the only function that checks `ctx.auth.getUserIdentity()`, but it is unreachable because no Convex identity provider (Clerk, Auth0) is configured. Role-gating (`teacher`, `student`, `uploader`) exists only in the React router and is trivially bypassed.

### Solution

Introduce a proper auth seam:

1. Adopt Convex's built-in auth (Clerk or Auth0), which eliminates the need for a custom `signIn`/`signUp` flow entirely.
2. If keeping a custom flow: hash passwords (e.g. `bcrypt` in an action) and never return the `password` field to the client.
3. All protected functions should derive identity from `ctx.auth.getUserIdentity()`, not from a client-passed `userId` arg.

### Benefits

- **Locality:** All auth decisions live behind one seam; today every mutation trusts the caller blindly.
- **Leverage:** A deep auth module means every protected mutation gets security for free — callers do not need to remember to add checks.
- **Tests:** A single integration test suite can assert that no mutation accepts an unverified caller without touching individual business-logic functions.

---

## Candidate #2 — `aiGeneration.ts` is a god module (lesson lifecycle + AI tangled)

**Status:** 🟠 High development friction  
**Files involved:**
- `convex/aiGeneration.ts` (529 lines)
- `convex/teacher.ts` (31 lines — duplicates already present in aiGeneration.ts)

### Problem

`aiGeneration.ts` currently owns:

- LLM HTTP calls to OpenRouter
- Daily rate-limit tracking (`dailyGenerations` table)
- Lesson CRUD: create, update, approve, publish, reject
- Lesson-question insertion (`addLessonQuestions`)
- Subject lookups (`getSubjects`, `getSubject`)
- Teacher-facing queries (`getTeacherLessons`, `getAvailableLessons`)

`teacher.ts` is a 31-line stub that duplicates `getAvailableLessons` and `getSubjects` already found in `aiGeneration.ts`. The module's seam is too wide: a one-line change to the AI prompt requires opening the same file as a change to lesson status transitions.

**Deletion test:** Delete `aiGeneration.ts` and complexity floods into `teacher.ts`, `LessonReview.tsx`, and any future admin module — the module is earning its keep, but its seam needs narrowing.

### Solution

Split into three narrow modules:

| New module | Owns |
|-----------|------|
| `convex/lessons.ts` | Lesson CRUD, status machine (`draft → ai_generated → pending_review → approved → published`), question insertion |
| `convex/aiGeneration.ts` | LLM call + rate-limit enforcement only; callers pass lesson data in, get content back |
| `convex/teacher.ts` | Teacher-facing queries that compose the above two |

### Benefits

- **Locality:** A bug in AI generation (rate limits, prompt, model config) is isolated from a bug in lesson approval.
- **Leverage:** The lesson lifecycle module can be tested with mock content; the AI module can be tested against a fake HTTP endpoint.
- **Tests:** You can verify the lesson status machine without ever calling an LLM; you can verify the LLM retry logic without touching the database.

---

## Candidate #3 — Authorization is absent on all mutations

**Status:** 🔴 Security risk  
**Files involved:**
- `convex/aiGeneration.ts` (approveAndPublish, rejectAndRegenerate, saveAiContent, publishLesson, addLessonQuestions)
- `convex/student.ts` (submitLessonQuiz, submitMockExam)
- `convex/payment.ts` (verifyPayment, cancelSubscription)

### Problem

Every public mutation accepts a `userId` or `lessonId` as a plain argument with **no verification** that the caller is actually that user. For example:

- A student can call `approveAndPublish` with any `lessonId`.
- A student can call `submitMockExam` with another student's `userId`.
- A student can call `cancelSubscription` for any `userId`.

Role checks (`teacher`, `student`, `uploader`) exist **only in the frontend router** — which is trivially bypassed by calling the Convex API directly.

### Solution

Add a narrow authorization seam:

```typescript
// convex/lib/auth.ts
export async function requireAuth(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Unauthorized")
  const user = await ctx.db.query("users")
    .withIndex("email", q => q.eq("email", identity.email!))
    .first()
  if (!user) throw new Error("User not found")
  return user
}

export function requireRole(user: Doc<"users">, role: string) {
  if (user.role !== role) throw new Error("Forbidden")
}
```

Every mutation calls `requireAuth` once at the top and uses the resolved user. Role-specific mutations add `requireRole(user, "teacher")`.

### Benefits

- **Locality:** Auth enforcement is in one place; adding a new role check is one line.
- **Leverage:** All callers are protected by default — adding a new mutation doesn't require remembering to add auth checks.
- **Tests:** A test can assert that any mutation called without a valid identity always throws, without touching the specific business logic of each function.

---

## Candidate #4 — `getDashboardData` is a read-amplification hotspot (N+1 per subject)

**Status:** 🟡 Performance + locality issue  
**Files involved:**
- `convex/student.ts` (`getDashboardData`)
- `convex/schema.ts` (subjects table — no metadata fields)

### Problem

`getDashboardData` runs one `ctx.db.query("lessons")` per subject inside a `Promise.all`, making it **O(N) DB round-trips** where N = number of subjects. As the subject list grows this will become a visible latency spike.

Additionally, subject metadata — icons (`calculate`, `menu_book`, `science`), colors (`bg-blue-50 text-primary`), and category tags (`Core`, `Science`) — are **hardcoded inside the query handler** via `if (sub.name === "Mathematics")` branches. This is display logic that has leaked through the seam into the backend.

**Deletion test:** Delete the icon/color/tag branches — they reappear in every page that renders a subject card.

### Solution

1. Add `icon`, `color`, and `tag` as optional fields to the `subjects` schema (populated at seed time).
2. Replace the per-subject `lessons` loop with a single `lessons` table fetch filtered by a compound index, then group in memory.

### Benefits

- **Locality:** Subject presentation rules live in one schema definition — not duplicated across query handlers and pages.
- **Leverage:** Any module that queries subjects gets metadata for free, without embedding knowledge of subject names.
- **Tests:** The dashboard query becomes a pure data-fetch, testable without mocked display logic.

---

## Candidate #5 — Auth state in `App.tsx` useState loses session on refresh

**Status:** 🟡 UX reliability issue  
**Files involved:**
- `src/App.tsx`
- `src/lib/api.ts` (largely dead code)
- All `src/pages/*/` files that receive `user` as a prop

### Problem

The `user` object is held in `App.tsx` via `useState`. On a hard refresh, `user` is `null` and **every authenticated route immediately redirects to `/login`**, even if the user has a valid session.

There is no persistence (`localStorage`, `sessionStorage`, cookie), no rehydration, and no loading state to distinguish "not yet loaded" from "not logged in".

`src/lib/api.ts` builds raw `fetch` calls directly to the Convex HTTP endpoint, bypassing the Convex React client. It defines functions (`signIn`, `getLesson`, `getProgress`, etc.) that duplicate the typed, auto-generated `api.*` bindings used everywhere else. The file is effectively dead code.

### Solution

1. **Short-term:** Persist the session ID in `localStorage` and rehydrate in a `useEffect` on mount. Add a `sessionLoading` boolean to prevent premature redirects.
2. **Long-term (aligns with Candidate #1):** Adopt Convex Auth, which handles session persistence automatically via browser storage.
3. **Cleanup:** Remove `src/lib/api.ts` entirely — it is superseded by the generated `api.*` bindings and the Convex React client.

### Benefits

- **Locality:** Session state becomes one concept in one place, rather than split across `App.tsx` state, individual page workarounds, and dead HTTP helpers.
- **Leverage:** Every page gets persistence for free; no page needs to manually re-fetch the user.
- **Tests:** Route-guard tests can assert redirect behaviour without needing a running auth server.

---

## Priority order (suggested)

| # | Candidate | Urgency |
|---|-----------|---------|
| 1 | Plaintext passwords | 🔴 Fix before any real users |
| 3 | No server-side authorization | 🔴 Fix before any real users |
| 2 | God module split (aiGeneration.ts) | 🟠 High dev friction now |
| 5 | Session lost on refresh | 🟡 UX fix |
| 4 | N+1 dashboard queries | 🟡 Performance, benign at current scale |

---

## Next steps

Pick a candidate to explore. The grilling loop will walk through:
- Constraints and dependencies
- The shape of the deepened module
- What sits behind the seam
- Which tests survive and which new tests become possible

New domain terms surfaced during grilling will be added to `CONTEXT.md`. Rejected candidates with load-bearing reasons will be recorded as ADRs in `docs/adr/`.
