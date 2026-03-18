# Path-Specific Instructions Guide

Path-specific instructions live in `.github/instructions/*.instructions.md`.
Each file must have YAML frontmatter with an `applyTo` glob pattern.

## When to Create a Path-Specific File

Create **one file per major source area** where conventions differ from the general rules in `AGENTS.md`. Typical candidates:

| Area                | File Name                             | `applyTo` Example                        |
| ------------------- | ------------------------------------- | ---------------------------------------- |
| Frontend components | `frontend-components.instructions.md` | `src/client/**/*.tsx,src/client/**/*.ts` |
| Backend/server      | `server.instructions.md`              | `src/server/**/*.ts`                     |
| Tests               | `tests.instructions.md`               | `tests/**/*.ts,tests/**/*.spec.ts`       |
| Database models     | `database.instructions.md`            | `src/db/**,src/models/**`                |
| API routes          | `api-routes.instructions.md`          | `src/api/**,src/routes/**`               |
| Scripts             | `scripts.instructions.md`             | `scripts/**`                             |

**Do not create a path-specific file** if its content would duplicate `AGENTS.md`. Path-specific files are for conventions that only apply to that file area.

## Format

```markdown
---
applyTo: 'src/client/**/*.tsx,src/client/**/*.ts'
---

## [Area Name] Rules

- Rule 1: Be specific and imperative ("Always use...", "Never use...")
- Rule 2: One rule per bullet point
- Rule 3: Keep each rule to one sentence where possible
```

## Content Guidelines

- Keep each file under 40 bullet points. If longer, split into two files.
- Rules must be **imperative**: "Always X", "Never Y", "Use Z for W".
- Do not repeat rules that are already in `AGENTS.md` — reference it instead: `See AGENTS.md §9 for general TypeScript rules.`
- Include examples only when the rule is non-obvious.
- Do not include boilerplate (`## Introduction`, `## Overview`) — just rules.

## Common Rules by Domain

### Frontend (React/Vue/Svelte)

- Component file naming (PascalCase vs kebab-case)
- Props typing convention (`type Props = {}` vs inline)
- Hook file naming and location
- State management patterns
- CSS/styling approach
- Browser/device compatibility constraints
- Forbidden DOM manipulation patterns
- Icon library conventions

### Server/Backend

- Router/framework in use — never use others
- Request validation approach
- Error handling: never expose internals to clients
- Response shape consistency
- Async I/O requirements
- ORM/query builder conventions
- Middleware patterns

### Tests

- Test file location mirroring source structure
- Mocking approach (never real network calls in unit tests)
- Selector priority for E2E tests (ARIA roles > text > test IDs)
- What triggers a regression test requirement
- Forbidden test patterns (e.g. `setTimeout` waits, shared state)

### Database

- Migration tool in use
- Naming conventions for tables, columns, indexes
- Forbidden raw SQL patterns
- Seeding approach for tests
