# Discovery Checklist

This file defines what to read and what to infer during **Phase 1 — Codebase Discovery** of the `bootstrap-existing-repo-for-agents` skill. Work through each section in order. Produce a machine-readable internal summary when done (not shown to the user yet).

---

## 1. Core Project Files

### `package.json` (or `pyproject.toml`, `Cargo.toml`, `go.mod`, etc.)

Read the package manifest to infer:

| Property              | Where to look                                       | Infers                                              |
| --------------------- | --------------------------------------------------- | --------------------------------------------------- |
| Project name          | `name`                                              | `{{PROJECT_NAME}}`                                  |
| Description           | `description`                                       | First draft of project one-liner                    |
| Runtime / language    | `engines`, dependencies, file extension             | Node.js version, Python version, etc.               |
| Framework             | `dependencies` — react, vue, express, fastapi, etc. | Frontend/backend framework                          |
| Test runner           | `devDependencies`, `scripts.test`                   | Vitest / Jest / pytest / etc.                       |
| Lint/format tooling   | `devDependencies` — eslint, prettier, ruff, etc.    | Linter, formatter, their config file names          |
| Build tool            | `devDependencies` — vite, webpack, tsc, esbuild     | Bundler and build command                           |
| Key scripts           | `scripts`                                           | `dev`, `build`, `start`, `lint`, `format`, `test:*` |
| `agent:verify` script | `scripts.agent:verify`                              | `✅ present`, `⚠️ partial`, or `❌ missing`         |

---

## 2. TypeScript / Language Config

### `tsconfig.json` (and `tsconfig.*.json` variants)

| Property                 | Where to look            | Infers                            |
| ------------------------ | ------------------------ | --------------------------------- |
| Strict mode enabled      | `compilerOptions.strict` | Whether `never any` rule applies  |
| Path aliases             | `compilerOptions.paths`  | Import alias conventions          |
| Target / module          | `target`, `module`       | Browser/Node compatibility target |
| Source root(s)           | `rootDir`, `include`     | Where source code lives           |
| Separate server tsconfig | filename pattern         | Split client/server build         |

---

## 3. Lint & Format Config

### `.eslintrc.*`, `eslint.config.*`, `.eslintignore`

| Property          | Infers                                   |
| ----------------- | ---------------------------------------- |
| Extends / plugins | Ruleset strictness, TypeScript awareness |
| `no-any` rules    | Whether `any` is already banned          |
| Rules list        | Project-specific code style requirements |

### `.prettierrc`, `prettier.config.*`

| Property              | Infers                     |
| --------------------- | -------------------------- |
| `printWidth`          | Line length convention     |
| `singleQuote`         | Quote style                |
| `semi`                | Semicolons required or not |
| `tabWidth`, `useTabs` | Indentation convention     |

---

## 4. Build & Dev Tooling

### `vite.config.*`, `webpack.config.*`, `rollup.config.*`

| Property         | Infers                                       |
| ---------------- | -------------------------------------------- |
| Entry points     | Client bundle entry (e.g. `src/main.tsx`)    |
| SSR config       | Whether SSR is in use                        |
| Proxy / port     | Dev server port and API proxy                |
| Env var handling | How build-time env vars are passed to client |

### `vitest.config.*`, `jest.config.*`

| Property             | Infers                       |
| -------------------- | ---------------------------- |
| Test include/exclude | Test file patterns           |
| Environment          | `jsdom`, `node`, `happy-dom` |
| Coverage config      | Coverage tooling in use      |

### `playwright.config.*`, `cypress.config.*`

| Property        | Infers                     |
| --------------- | -------------------------- |
| `testDir`       | E2E test directory         |
| `baseURL`       | Expected dev server URL    |
| Browser targets | Which browsers are covered |

---

## 5. Environment Variables

### `.env.example`

| Property            | Infers                                  |
| ------------------- | --------------------------------------- |
| Key names           | Required env vars for the app           |
| Value shapes        | PORT numbers, URL patterns, path values |
| Presence of secrets | Any keys suggesting API tokens          |

If `.env.example` is absent, scan `process.env.*` references across source files using grep.

---

## 6. Source Code Structure

Scan `src/` (or equivalent) to infer:

| What to look for                | Infers                                    |
| ------------------------------- | ----------------------------------------- |
| Directory layout                | `{{FOLDER_STRUCTURE}}` for templates      |
| `client/`, `server/`, `shared/` | Split architecture                        |
| `screens/`, `pages/`, `views/`  | Frontend routing pattern                  |
| `routes/`, `controllers/`       | Backend routing pattern                   |
| `hooks/`, `composables/`        | Frontend state pattern                    |
| `services/`, `lib/`             | Business logic and utility placement      |
| `types/`, `shared/types/`       | Where shared types live                   |
| File naming pattern             | PascalCase vs kebab-case (scan filenames) |

---

## 7. Existing `.github/` Configuration

Scan `.github/` to inventory what already exists:

| File / Path                         | Status to report           |
| ----------------------------------- | -------------------------- |
| `copilot-instructions.md`           | ✅ present / ❌ missing    |
| `AGENTS.md` (repo root)             | ✅ present / ❌ missing    |
| `workflows/ci.yml`                  | ✅ present / ❌ missing    |
| `workflows/copilot-setup-steps.yml` | ✅ present / ❌ missing    |
| `pull_request_template.md`          | ✅ present / ❌ missing    |
| `ISSUE_TEMPLATE/copilot-task.yml`   | ✅ present / ❌ missing    |
| `ISSUE_TEMPLATE/bug-report.yml`     | ✅ present / ❌ missing    |
| `ISSUE_TEMPLATE/config.yml`         | ✅ present / ❌ missing    |
| `.copilotignore`                    | ✅ present / ❌ missing    |
| `instructions/*.instructions.md`    | list files found / ❌ none |

For each **present** file, check completeness against the corresponding template:

### Completeness Checks

#### `copilot-instructions.md`

- [ ] Has a Stack section
- [ ] Has a Commands section with `agent:verify`
- [ ] Has a Key Rules section
- [ ] Includes the 4 universal rules (`||` not `??`, never open `.env`, keep `.copilotignore` in sync, never self-merge)
- [ ] Has a PR Format section

#### `AGENTS.md`

- [ ] Sections 1–11 present (Project Overview through Git & PR Behavior)
- [ ] Definition of Done checklist present
- [ ] Self-Iteration Rules with autonomous fix loop and max retry count
- [ ] Test Maintenance subsection (5 rules)
- [ ] Security section (never hardcode secrets, never expose server errors, etc.)
- [ ] `||` not `??` rule for env vars

#### `workflows/ci.yml`

- [ ] Triggers on `main`, `copilot/**`, feat/fix/chore branches
- [ ] Has a verify/build/test job

#### `workflows/copilot-setup-steps.yml`

- [ ] Job is named exactly `copilot-setup-steps`
- [ ] Installs dependencies
- [ ] Passes non-interactive flags

#### `pull_request_template.md`

- [ ] Has a "What" section
- [ ] Has a "Walkthrough" section
- [ ] Has a checklist

#### `ISSUE_TEMPLATE/copilot-task.yml`

- [ ] Has `description`, `acceptance-criteria`, `files`, `context` fields

#### `ISSUE_TEMPLATE/bug-report.yml`

- [ ] Has `description`, `reproduction`, `expected`, `actual` fields

#### `.copilotignore`

- [ ] Excludes `.env` and `.env.*`
- [ ] Has `!.env.example` exception

---

## 8. README.md

Read to infer:

| Property        | Infers                              |
| --------------- | ----------------------------------- |
| App description | Draft for `{{PROJECT_DESCRIPTION}}` |
| Setup steps     | Existing install/run documentation  |
| Feature list    | High-level app capabilities         |

---

## 9. Existing AGENTS.md / copilot-instructions.md (if present)

If either file exists, read it fully to:

- Extract established conventions the user has already committed to
- Identify sections already present (skip regenerating those)
- Flag any sections that are present but incomplete (report as `⚠️`)
- Detect any rules that contradict the universal rules (flag for user attention)

---

## 10. Discovery Summary Format

After completing all checks above, produce an internal summary in this format before moving to Phase 1b:

```
DISCOVERY SUMMARY
=================
Project name:       <name>
Description:        <one-liner or "unknown — ask">
Language/runtime:   <e.g. TypeScript / Node.js v20>
Framework:          <e.g. React 19, Hono>
Test runner:        <e.g. Vitest + Playwright>
Lint/format:        <e.g. ESLint + Prettier>
Build tool:         <e.g. Vite + tsc>
Dev command:        <npm run dev>
Build command:      <npm run build>
Start command:      <npm start>
Verify script:      <✅ npm run agent:verify | ⚠️ partial | ❌ missing>

env vars found:     <list from .env.example>
source structure:   <brief folder summary>

EXISTING FILES
--------------
copilot-instructions.md:    <✅ complete | ⚠️ gaps: [list] | ❌ missing>
AGENTS.md:                  <✅ complete | ⚠️ gaps: [list] | ❌ missing>
ci.yml:                     <✅ complete | ⚠️ gaps: [list] | ❌ missing>
copilot-setup-steps.yml:    <✅ complete | ⚠️ gaps: [list] | ❌ missing>
pull_request_template.md:   <✅ complete | ⚠️ gaps: [list] | ❌ missing>
copilot-task.yml:           <✅ complete | ⚠️ gaps: [list] | ❌ missing>
bug-report.yml:             <✅ complete | ⚠️ gaps: [list] | ❌ missing>
ISSUE_TEMPLATE/config.yml:  <✅ complete | ⚠️ gaps: [list] | ❌ missing>
.copilotignore:             <✅ complete | ⚠️ gaps: [list] | ❌ missing>
instructions/ files:        <list filenames or "none">

GAPS TO ASK ABOUT IN 1b
------------------------
<list only what discovery could NOT determine>
```

This summary drives Phase 1b — only ask the user about what appears in "GAPS TO ASK ABOUT".
