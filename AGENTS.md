# AGENTS.md — vscode-pets (tabloomoo fork)

> This file is the authoritative instruction set for all AI coding agents (GitHub Copilot, Claude, Codex, and others) working on this repository. Read this entire file before taking any action. Follow every instruction exactly as written.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [How to Build & Run](#4-how-to-build--run)
5. [Environment Variables](#5-environment-variables)
6. [Testing](#6-testing)
7. [Self-Iteration Rules](#7-self-iteration-rules)
8. [Code Conventions](#8-code-conventions)
9. [Definition of Done](#9-definition-of-done)
10. [What NOT To Do](#10-what-not-to-do)
11. [Git & PR Behavior](#11-git--pr-behavior)

---

## 1. Project Overview

This is a personal fork of [tonybaloney/vscode-pets](https://github.com/tonybaloney/vscode-pets) — a VS Code extension that renders animated pixel-art pets inside the editor. This fork is maintained by two friends and extends the original with a **sheep pet** and new interactive behaviors: **click-to-drag** (grab and reposition a pet) and **fling** (throw the pet with velocity so it arcs through the air and lands somewhere).

---

## 2. Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Language       | TypeScript 4.7+                                     |
| Runtime        | Node.js 20 (build/test only)                        |
| VS Code API    | `@types/vscode` ^1.73.0                             |
| Webview bundle | webpack 5 + ts-loader (`src/panel/` → `media/main-bundle.js`) |
| Extension host | tsc (commonjs, `strict: true`, `tsconfig.extension.json`) |
| Test runner    | Mocha 10 + Chai 5 + nyc (coverage)                 |
| Linter         | ESLint 8 + @typescript-eslint                       |
| Formatter      | Prettier 2                                          |

---

## 3. Project Structure

```
src/
  common/        # Shared types (PetType, PetColor enums), l10n, pet names
  extension/     # VS Code extension host — commands, webview setup, state persistence
  panel/         # Webview JS bundle — animation loop, pet state machine, effects
    pets/        # One file per pet species (cat.ts, dog.ts, sheep.ts …)
    effects/     # Visual effects (snow.ts, leaves.ts, stars.ts)
  test/          # Mocha test suite

media/           # Sprite assets — one subfolder per pet type: media/[name]/
l10n/            # Localization bundles
```

### Naming Conventions

| Artifact           | Convention                            | Example                          |
| ------------------ | ------------------------------------- | -------------------------------- |
| Pet class file     | lowercase species name                | `src/panel/pets/sheep.ts`        |
| Pet sprite folder  | lowercase species name                | `media/sheep/`                   |
| Pet class name     | PascalCase                            | `Sheep`                          |
| State enum values  | camelCase                             | `States.sitIdle`                 |
| VS Code commands   | `vscode-pets.` + kebab-case           | `vscode-pets.spawn-pet`          |

---

## 4. How to Build & Run

### Prerequisites

- Node.js 20
- Run `npm ci` after every fresh clone or after any `package.json` change.

### Development (watch mode)

```bash
npm run watch
```

### Production Build

```bash
npm run compile
```

This runs: `webpack` (panel bundle → `media/main-bundle.js`) + `tsc -p tsconfig.extension.json` (extension host → `out/`) + `tsc -p tsconfig.test.json` (tests → `out/test/`).

### Verification (agent self-check)

```bash
npm run agent:verify
```

This chains `npm run compile && npm run lint` in one command. The agent **must** run this before considering any task done. All steps must pass with zero errors.

### Individual Commands

```bash
npm ci                    # Install dependencies
npm run compile           # Full build (panel + extension + tests)
npm run lint              # ESLint + Prettier check
npm run lint:fix          # Auto-fix lint and format issues
npm test                  # Run Mocha test suite (requires compiled output)
npm run test:coverage     # Run tests with nyc coverage
```

---

## 5. Environment Variables

This extension has **no runtime environment variables**. No `.env` file is needed.

If environment variables are introduced in the future: store them in `.env`, commit `.env.example` with all keys present but no values, and **never commit `.env`**. Always use `||` (not `??`) when reading `process.env` values with a fallback — `??` passes through blank strings; `||` does not.

---

## 6. Testing

### Philosophy

- Write tests for every feature added.
- When a bug is found, write a test that reproduces it **before** fixing it to prevent regression.
- Do not write redundant tests. Test core functionality only.
- Tests must be deterministic and fast.

### Commands

```bash
npm run compile && npm test        # Compile then run full test suite
npm run test:coverage              # Run with nyc coverage report
```

On Linux CI: `xvfb-run npm test` (requires virtual framebuffer).

### Unit Tests

Tests live in `src/test/suite/`. They use Mocha + Chai. The entry point is `src/test/runTest.ts`, compiled to `out/test/runTest.js`.

### Test Maintenance

1. Check existing tests for breakage and update them if any contract, signature, or behaviour changed.
2. Add a regression test for every bug fix — one that would have caught the bug before the fix.
3. Add at least one unit test (and one smoke test where user-visible) for every new feature.
4. Remove redundant tests that are now fully covered by newer tests.
5. Never mark a task done with a failing or degraded test suite.

---

## 7. Self-Iteration Rules

### Autonomous Error Fixing

The agent fixes its own errors autonomously without asking the user. Follow this loop:

1. **Attempt 1:** Implement the task. Run `npm run agent:verify`.
2. If verification fails: analyze the failure, produce a fix, run `npm run agent:verify` again.
3. **Attempt 3:** Apply the fix.
4. If verification still fails: **stop**. Flag the issue to the user with: what was attempted, what failed, and the full error output.

Never make more than **3 attempts** before flagging.

### Process Execution Rules

- Always pass non-interactive flags to CLI tools (e.g. `-y`, `--yes`, `CI=true`).
- Set an explicit timeout on every shell process. If a process has not exited within **120 seconds**, kill it and count it as a failed attempt.
- Never let an install or scaffold command block waiting for user input.

### Linting & Formatting

Always run before marking a task done:

```bash
npm run lint
```

Try `npm run lint:fix` first to auto-resolve fixable issues before attempting manual fixes.

---

## 8. Code Conventions

### Performance — Critical

This extension runs **inside VS Code**. Every millisecond of CPU and every kilobyte of bundle size counts.

- Use `requestAnimationFrame` for all animation — never `setInterval` or `setTimeout` as an animation loop.
- Keep per-frame work under ~1ms. Never read layout properties (`offsetWidth`, `getBoundingClientRect`, `clientWidth`, etc.) inside an animation loop — this causes forced reflow and degrades the entire editor.
- Prefer CSS `transform: translate(Xpx, Ypx)` over updating `left`/`bottom` in hot paths — transforms are GPU-composited and do not trigger reflow.
- Do not add large npm packages to the panel bundle (`media/main-bundle.js`). Keep it small.

### TypeScript

- `noImplicitAny: true` and `strictNullChecks: true` are enforced everywhere. The extension host also uses full `strict: true`.
- Never use `as SomeType` type assertions to silence errors — fix the underlying type.
- No floating promises: always `await` or `.catch()` async calls.

### Adding a New Pet

Every new pet **requires all four** of these — the build will succeed but the pet will be silently absent or crash at runtime if any are missing:

1. **`src/common/types.ts`** — add a value to the `PetType` const enum.
2. **`src/panel/pets/[name].ts`** — create a class extending `BasePetType`. Define `label`, `static possibleColors`, and `sequence` (startingState + sequenceStates).
3. **`src/panel/pets.ts`** — import the new class; add a case to the `createPet` factory function.
4. **`media/[name]/`** — add sprite PNG files named to match the states used in the sequence.

Use `src/panel/pets/cat.ts` as the canonical reference for the full pattern.

### Drag & Fling Pattern

When implementing click-to-drag and fling:

- Use `pointerdown` / `pointermove` / `pointerup` events (not mouse events) — these work for mouse, touch, and stylus uniformly.
- Call `element.setPointerCapture(e.pointerId)` in the `pointerdown` handler so the element keeps receiving events when the pointer moves outside it.
- Track velocity by recording position deltas over the last ~5 `pointermove` events and averaging — this smooths jitter and gives a stable fling vector.
- On `pointerup`, apply the averaged velocity as an initial impulse. Per `requestAnimationFrame` frame: `vx *= damping; vy = vy * damping + gravity; x += vx; y += vy`.
- Clamp `|vx|` and `|vy|` to a reasonable max (e.g. 30 px/frame) to prevent pets flying off-screen.
- When the pet lands (`bottom <= floor`), zero `vy` and apply horizontal friction until the pet stops.
- While being dragged, set a `holdState` on the pet (see `BasePetType`) to pause the normal state machine.

### Security

- Never hardcode secrets, API keys, credentials, or passwords in source code.
- Never log sensitive user data.
- Sanitize all user inputs before persisting or using them.
- Never expose internal errors to the webview — log extension-side, return safe generic messages.
- Never open `.env` to investigate an issue — read the source file that consumes the variable instead. The bug is always there.
- When a `.copilotignore` is present, keep it in sync with any secrets-related entries added to `.gitignore`.

### Environment Variables

Always use `||` (not `??`) when reading `process.env` values that have a fallback default. `??` only guards against `null`/`undefined`; a key present but blank in `.env` (e.g. `STORAGE_PATH=`) passes through as an empty string. `||` catches empty strings too.

---

## 9. Definition of Done

Before considering any task complete, every item on this checklist must pass. No exceptions.

- [ ] `npm run agent:verify` passes with zero errors
- [ ] New feature or fix is covered by at least one test
- [ ] Existing tests updated if any behaviour, signature, or contract changed
- [ ] Redundant or outdated tests removed if now fully covered by new tests
- [ ] No `console.log` or `console.debug` in panel or extension source (the existing debug-name guard in `BasePetType` is the only permitted exception)
- [ ] No new npm dependencies added without explicit user approval
- [ ] If a new pet was added: all four required artifacts are present (enum entry, class, factory registration, sprites)

Run the full chain with:

```bash
npm run agent:verify
```

---

## 10. What NOT To Do

- **Never open a PR against `tonybaloney/vscode-pets`** — this is a personal fork. All PRs must target `tabloomoo/vscode-pets`.
- Do not use `setInterval` or `setTimeout` loops for animation — use `requestAnimationFrame`.
- Do not read DOM layout properties inside the animation loop.
- Do not add heavy npm dependencies to the panel bundle.
- Do not commit `.env` files.
- Do not ship `console.log` / `console.debug` in production panel or extension code.
- Do not bypass TypeScript strict checks with `as any` or `// @ts-ignore`.
- Do not self-merge PRs — the human owner reviews all Copilot PRs.

---

## 11. Git & PR Behavior

### Branching

Work on feature branches. Copilot automatically creates branches prefixed with `copilot/`. This is expected and correct. Do not fight this behavior.

> **Critical:** All pull requests must target **`tabloomoo/vscode-pets`** (this fork). **Never open a PR against `tonybaloney/vscode-pets`** (the upstream original).

### Commit Messages

Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.

### Pull Requests

Every PR description must include:
1. **What** — one or two sentences describing what the PR does
2. **Walkthrough** — which files changed and why, written for the reviewer reading the diff
3. **Checklist** — confirm all Definition of Done items above are satisfied

### Review Workflow

The human owner reviews all PRs raised by Copilot coding agent. Do not self-merge. Request review from the repository owner when the PR is ready.
