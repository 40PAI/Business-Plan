# Generation Flow — Sequential Plan + Pitch + Logo

**Date:** 2026-04-11  
**Status:** Approved  
**Scope:** `app/dashboard/[projectId]/page.tsx`

---

## Problem

The current `generateAll` runs `Promise.all([generatePlan, generatePitch, generateLogo])` in parallel. All three functions receive the same `proj` object by reference and mutate it concurrently. This causes a race condition: when `generatePitch` calls `updateProject(proj)`, it may overwrite `proj.artifacts.plan` with a stale generating/pending state, and vice-versa. The result is that one artifact ends up stuck as `"pending"` or `"error"` even though the API call succeeded.

---

## Solution: Sequential Generation with Phase Tracking

### State

Add `generationPhase: "idle" | "plan" | "pitch" | "logo" | "done" | "error"` to the page component.

### Flow

```
setPhase("plan")  → await generatePlan(freshProject)
setPhase("pitch") → await generatePitch(freshProject)
setPhase("logo")  → await generateLogo(freshProject)
setPhase("done")  → sendWebhook(freshProject)
```

Each `generate*` function reads fresh project state from React before running — it does NOT receive a shared mutable object. This eliminates all concurrent mutation.

### Smart Resume (Partial Retry)

Before each phase, check the current artifact status:

```ts
if (project.artifacts.plan.status !== "done") await generatePlan(project)
if (project.artifacts.pitch.status !== "done") await generatePitch(project)
if (project.artifacts.logo.status !== "done") await generateLogo(project)
```

If a previous run completed the plan but failed on pitch, clicking "Tentar novamente" skips the plan and starts from pitch.

### Error Handling

If a phase throws, set `generationPhase("error")` and stop. Show a banner:

```
⚠ Erro ao gerar Business Plan.  [Tentar novamente]
```

The retry button calls `generateAll` again — which uses the smart resume logic above to skip already-done phases.

---

## UI: Progress Banner

During generation, show a banner above the artifact cards:

- Phase label: "A gerar Business Plan... (1/3)"
- Progress bar: fills proportionally (plan = 33%, pitch = 66%, logo = 100%)
- When a phase finishes, its artifact card updates to "done" immediately
- Banner disappears when `generationPhase === "done"`
- Error state shows warning message + retry button

The 3 artifact cards remain visible throughout. Cards not yet started show "A aguardar..." instead of a spinner.

---

## Files Changed

| File | Change |
|------|--------|
| `app/dashboard/[projectId]/page.tsx` | Add `generationPhase` state; rewrite `generateAll` to sequential; add `GenerationBanner` component |

---

## Out of Scope

- No changes to API routes (`/api/generate/plan`, `/api/generate/pitch`, `/api/generate/logo`)
- No changes to artifact viewers
- No changes to the wizard flow
