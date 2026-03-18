# vscode-pets (tabloomoo fork) — Copilot Instructions

Personal fork of tonybaloney/vscode-pets. We're adding a **sheep pet** and new interactive behaviors: click-to-drag and fling (throw pets with velocity). This is a VS Code extension — performance and bundle size are first-class constraints.

Full spec is in `AGENTS.md` at the repo root. These instructions are the concise technical reference; AGENTS.md takes precedence on any conflict.

---

## Stack

- TypeScript 4.7+ · Node.js 20
- VS Code Extension API (^1.73.0) — `src/extension/`
- webpack 5 panel bundle — `src/panel/` → `media/main-bundle.js`
- tsc strict mode for extension host — `out/`
- Mocha 10 + Chai 5 + nyc — `src/test/`
- ESLint 8 + Prettier 2

---

## Commands (run from repo root)

```bash
npm ci                    # Install deps — always run first on fresh clone
npm run compile           # Full build (panel + extension + tests)
npm run watch             # Incremental dev build
npm run lint              # ESLint + Prettier check
npm run lint:fix          # Auto-fix lint/format issues
npm test                  # Run Mocha suite (compile first)
npm run agent:verify      # compile + lint — run before marking any task done
```

**Always run `npm run agent:verify` before marking any task complete.**

---

## Project Layout

```
src/common/        # Shared types (PetType, PetColor enums), l10n, names
src/extension/     # VS Code host — commands, webview management, state persistence
src/panel/         # Webview bundle — animation loop, pet state machine
  pets/            # One class per species: cat.ts, dog.ts, sheep.ts …
  effects/         # Snow, leaves, stars
src/test/          # Mocha tests
media/             # Sprites — one folder per pet: media/[name]/
l10n/              # Localization bundles
```

---

## Key Rules

- **Never commit `.env`** — only `.env.example`.
- **Never open `.env` to debug** — read the source file consuming the variable instead. The bug is always there.
- **Use `||` not `??` for env var fallbacks** — `??` passes through empty strings; `||` catches them too.
- **Keep `.copilotignore` in sync with `.gitignore`** — secrets-related entries must appear in both.
- **Never self-merge a PR** — the human owner reviews all Copilot PRs.
- **Never open a PR against `tonybaloney/vscode-pets`** — all PRs must target `tabloomoo/vscode-pets` only.
- **Use `requestAnimationFrame` for all animation** — never `setInterval`/`setTimeout` loops.
- **No DOM layout reads inside animation loops** — `offsetWidth`, `getBoundingClientRect`, etc. cause forced reflow.
- **No heavy npm deps in the panel bundle** — the webview runs inside VS Code; keep it lightweight.
- **New pet = 4 required artifacts:** `PetType` enum entry · class in `src/panel/pets/` · case in `createPet` factory · sprites in `media/[name]/`.

---

## Naming

| Artifact       | Convention                            | Example                               |
| -------------- | ------------------------------------- | ------------------------------------- |
| Pet class file | lowercase species name                | `src/panel/pets/sheep.ts`             |
| Pet sprite dir | lowercase species name                | `media/sheep/`                        |
| Pet class      | PascalCase                            | `class Sheep extends BasePetType`     |
| VS Code command| `vscode-pets.` + kebab-case           | `vscode-pets.spawn-pet`               |

---

## PR Format

Every PR description must include:
1. **What** — one or two sentences
2. **Walkthrough** — which files changed and why, written for the reviewer reading the diff
