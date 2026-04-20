# Cable Co / Zayin.ai — Developer Technical Assessment

Welcome to the Cable Co technical assessment. This is a stripped-down version of our production codebase, containing the core patterns and structure you would work with daily.

Your task is to implement a small, self-contained feature that touches the full stack: **database schema, backend API, frontend UI, and tests.**

---

## The Stack

| Layer | Technology | Version |
|---|---|---|
| Language | TypeScript (strict mode, end-to-end) | 5.9 |
| Frontend | React, Tailwind CSS, shadcn/ui, wouter | 19 / 4 |
| API | tRPC (type-safe RPC — no REST endpoints) | 11 |
| Backend | Express, Node.js | 4 / 22 |
| Database | MySQL / TiDB, Drizzle ORM | 0.44 |
| Testing | Vitest | 2.1 |
| Build | Vite, esbuild, pnpm | 7 |

---

## Project Structure

```
client/
  src/
    pages/            ← Page-level components (you'll add one here)
    components/ui/    ← shadcn/ui primitives (Button, Card, Textarea)
    lib/trpc.ts       ← Typed tRPC client binding
    App.tsx           ← Routes & layout
    main.tsx          ← Providers (tRPC, React Query)
server/
  _core/
    trpc.ts           ← Procedure definitions (publicProcedure, protectedProcedure, adminProcedure)
    context.ts        ← Request context with user
    cookies.ts        ← Cookie helpers
  routers.ts          ← Main appRouter (merge your router here)
  routers/
    example.ts        ← Example router showing the pattern to follow
  db.ts               ← Database helpers (follow this pattern)
drizzle/
  schema.ts           ← Database tables & types (add your table here)
shared/
  const.ts            ← Shared constants
  types.ts            ← Re-exported types
vitest.config.ts      ← Test configuration
```

**Key convention:** Only touch files marked with "←" above. Files under `server/_core` are framework-level — read them to understand patterns, but do not modify them.

---

## Task: Build a "Service Request Notes" Feature

Cable Co manages service requests from clients. Your task is to add an **internal notes system** that allows admin users to attach private notes to service requests. These notes are internal only — clients should never see them.

### Part 1 — Database Schema (`drizzle/schema.ts`)

Add a new `service_request_notes` table with the following columns:

| Column | Type | Description |
|---|---|---|
| `id` | int, auto-increment, primary key | Unique identifier |
| `serviceRequestId` | int, not null | Foreign key reference (assume an integer ID) |
| `authorId` | int, not null | The user ID of the note author |
| `content` | text, not null | The note body |
| `createdAt` | timestamp, not null, default now | When the note was created |

Export the `ServiceRequestNote` and `InsertServiceRequestNote` types following the existing pattern.

### Part 2 — Backend API (`server/routers/`)

Create a new tRPC router file at `server/routers/service-notes.ts` with the following procedures. **All procedures must be admin-only** (use `adminProcedure` from `server/_core/trpc.ts`).

| Procedure | Type | Input | Description |
|---|---|---|---|
| `serviceNotes.add` | mutation | `{ serviceRequestId: number, content: string }` | Creates a new note. Content must be at least 1 character. |
| `serviceNotes.list` | query | `{ serviceRequestId: number }` | Returns all notes for a given service request, ordered newest first. |
| `serviceNotes.delete` | mutation | `{ noteId: number }` | Deletes a note by ID. |

Wire the router into the main `appRouter` in `server/routers.ts`.

### Part 3 — Frontend UI (`client/src/`)

Create a `ServiceNotesPanel` component that can be embedded in an existing page. The component should:

1. Accept a `serviceRequestId` prop.
2. Display a list of existing notes (author name, timestamp, content).
3. Include a text input and "Add Note" button to create new notes.
4. Show a delete button on each note.
5. Use `trpc.serviceNotes.list.useQuery()` and `trpc.serviceNotes.add.useMutation()` with appropriate cache invalidation.
6. Handle loading, empty, and error states.

Use the shadcn/ui components provided (`Card`, `Button`, `Textarea`) and Tailwind CSS for styling. Follow the patterns in the existing example page.

### Part 4 — Tests (`server/service-notes.test.ts`)

Write Vitest tests covering at minimum:

1. **Auth gates:** Unauthenticated and non-admin users are rejected for all three procedures.
2. **Input validation:** Empty content is rejected for `add`; invalid types are rejected.
3. **Success path:** Admin user can add a note (mock the DB layer).
4. **Delete:** Admin user can delete a note.

Follow the test patterns in `server/example.test.ts`. Mock the database layer — do not hit a real database.

---

## Setup Instructions

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev

# Run tests
pnpm test

# Type-check
pnpm check
```

No database connection is required to complete the assessment — mock the DB in your tests.

---

## What We Evaluate

| Criteria | What We Look For |
|---|---|
| **Pattern recognition** | Did you follow existing conventions (file naming, router structure, context helpers, import style)? |
| **TypeScript proficiency** | Are types correct? Did you use Zod for input validation? Did you avoid `any`? |
| **tRPC understanding** | Are procedures correctly defined? Is the router merged properly? |
| **React competence** | Does the component handle loading/error/empty states? Is cache invalidation correct? |
| **Testing discipline** | Do tests cover auth, validation, and success paths? Are mocks structured cleanly? |
| **Code quality** | Is the code readable, well-organised, and free of obvious bugs? |

---

## Submission

1. Create a new branch named `assessment/your-name`.
2. Commit your changes with clear, descriptive commit messages.
3. Push the branch and send us the link.
4. Include a brief note (2-3 sentences) describing any decisions you made or trade-offs you considered.

**Time expectation:** 3-4 hours for a developer familiar with the stack. If you find yourself spending significantly longer, submit what you have — partial submissions that demonstrate understanding are valued over rushed complete ones.

---

## Questions?

If anything is unclear, email your point of contact. We would rather you ask than guess.
