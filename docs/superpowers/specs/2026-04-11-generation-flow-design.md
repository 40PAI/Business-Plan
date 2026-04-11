# Generation Flow — Sequential Plan + Pitch + Logo

**Date:** 2026-04-11  
**Status:** Approved  
**Scope:** `app/dashboard/[projectId]/page.tsx`

---

## Problem

The current `generateAll` runs `Promise.all([generatePlan, generatePitch, generateLogo])` in parallel. All three functions receive the same `proj` object by reference and mutate it concurrently. This causes a race condition: when `generatePitch` calls `updateProject(proj)`, it may overwrite `proj.artifacts.plan` with a stale generating/pending state, and vice-versa. The result is one artifact stuck as `"pending"` or `"error"` even though the API call succeeded.

---

## Solution: Sequential Generation with Phase Tracking

### State

Add to the page component:
- `generationPhase: "idle" | "plan" | "pitch" | "logo" | "done" | "error"` — controls banner display
- `failedPhase: "plan" | "pitch" | "logo" | null` — records which phase threw; cleared at start of every `generateAll` call

No refs are needed for phase tracking. The current phase is tracked via a local `let currentPhase` variable inside `generateAll` — the catch block reads this local variable directly, avoiding all stale closure risk.

### `generateAll` — single entry point, always uses smart resume

```ts
const generateAll = useCallback(async (proj: Project) => {
  setFailedPhase(null)
  let currentPhase: "plan" | "pitch" | "logo" = "plan"

  try {
    // Each generate* function mutates proj.artifacts.X in place and calls
    // updateProject(proj). Because calls are sequential (awaited), there
    // are zero concurrent mutations — no race condition possible.

    if (proj.artifacts.plan.status !== "done") {
      currentPhase = "plan"
      setGenerationPhase("plan")
      await generatePlan(proj)
    }
    if (proj.artifacts.pitch.status !== "done") {
      currentPhase = "pitch"
      setGenerationPhase("pitch")
      await generatePitch(proj)
    }
    if (proj.artifacts.logo.status !== "done") {
      currentPhase = "logo"
      setGenerationPhase("logo")
      await generateLogo(proj)
    }

    setGenerationPhase("done")

    // sendWebhook has its own internal try/catch — failures are logged but
    // do not affect generationPhase or failedPhase
    sendWebhook(proj)

  } catch (err) {
    setFailedPhase(currentPhase)
    setGenerationPhase("error")
  }
}, [generatePlan, generatePitch, generateLogo, sendWebhook])
```

**Mutation contract:** All three `generate*` functions receive and mutate the **same `proj` object reference** — not a clone. `generatePlan(proj)` sets `proj.artifacts.plan = { status: "done", ... }` in place. When `generatePitch(proj)` is called next, it reads `proj.artifacts.plan` (already updated) from the same object. This is safe because the calls are sequential — there is no concurrent access to `proj`.

**Smart resume:** The initial call (on page load) passes the project loaded from Supabase. On retry, the current `project` state is passed — artifacts already marked "done" are skipped automatically.

**`failedPhase` lifecycle:** Set to the local `currentPhase` variable when an error is caught. Cleared to `null` at the start of every `generateAll` call (including retries).

**`sendWebhook` isolation:** Called after `setGenerationPhase("done")`, wrapped in its own `try/catch` block separate from the main one — not as a fire-and-forget. This guarantees that even if `sendWebhook`'s internal catch contract breaks, the thrown error is caught by its own wrapper, never reaches the main catch, and never sets `failedPhase` or triggers the error banner.

---

## UI: Progress Banner

An inline `GenerationBanner` component rendered directly above the artifact cards grid inside `<main>` (not sticky, not portaled — flows with page content):

```
[ ████████░░░░ ]  A gerar Business Plan... (1/3)
```

| Phase | Label | Bar % |
|-------|-------|-------|
| `"plan"` | A gerar Business Plan... (1/3) | 15% → 33% animated |
| `"pitch"` | A gerar Pitch Deck... (2/3) | 33% → 66% animated |
| `"logo"` | A gerar Logo... (3/3) | 66% → 100% animated |
| `"done"` | hidden | — |
| `"idle"` | hidden | — |
| `"error"` | ⚠ Erro ao gerar [phase name]. [Tentar novamente] | — |

Phase names for error message: `"plan"` → "Business Plan", `"pitch"` → "Pitch Deck", `"logo"` → "Logo".

The 3 artifact cards remain visible throughout. Cards whose phase has not yet started show "A aguardar..." instead of a spinner.

---

## Files Changed

| File | Change |
|------|--------|
| `app/dashboard/[projectId]/page.tsx` | Add `generationPhase` + `failedPhase` state; rewrite `generateAll` to sequential with smart resume + local phase tracking; add inline `GenerationBanner` component above artifact grid; isolate `sendWebhook` from error path |

---

## Out of Scope

- No changes to API routes (`/api/generate/plan`, `/api/generate/pitch`, `/api/generate/logo`)
- No changes to artifact viewers
- No changes to the wizard flow
