# Universal Rules

Rules that apply to **every repo** regardless of tech stack. These are hard-coded into the templates (not behind `{{PLACEHOLDERS}}`), so they are always present in every generated file.

When a new universal rule is discovered through experience — a recurring bug pattern, a footgun, a class of agent mistakes — add it here first, then propagate it into the relevant template files.

---

## How to propagate a new rule

| Where to add it                                             | When                                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `assets/copilot-instructions.md.template` — Key Rules block | Rule is short (one line) and must be in every agent's working context                             |
| `assets/AGENTS.md.template` — Security or relevant section  | Rule needs explanation or belongs in the authoritative spec                                       |
| Both                                                        | Most universal rules — the copilot-instructions entry is the reminder, AGENTS.md is the rationale |

---

## Current Universal Rules

### Environment Variables

**Rule:** Use `||` not `??` when reading `process.env` values that have a fallback default.

**Why:** `??` (nullish coalescing) only falls back for `null` and `undefined`. When a key exists in `.env` but is set to blank (`STORAGE_PATH=`), it evaluates to an empty string `""` — which is neither null nor undefined, so `??` passes it through unchanged. Downstream code then receives `""` as the path and fails with cryptic errors (e.g. `ENOENT: no such file or directory, open ''`). `||` treats empty strings as falsy and applies the default correctly.

**Example:**

```ts
// Wrong — silently passes through empty string
const storagePath = process.env.STORAGE_PATH ?? './data/store.json'

// Correct
const storagePath = process.env.STORAGE_PATH || './data/store.json'
```

---

### Secrets — Never read `.env` directly

**Rule:** Never open `.env` to investigate a bug. Read the source file that consumes the variable instead.

**Why:** The bug is never in the env file — it's always in the code that reads or uses the value. Opening `.env` may expose secrets to logs, context windows, or agents unnecessarily. It also trains bad habits: looking at the value rather than the code that misuses it.

---

### `.copilotignore` — Keep in sync with `.gitignore`

**Rule:** When a `.copilotignore` exists, keep it in sync with any secrets-related entries in `.gitignore`.

**Why:** `.gitignore` prevents secrets from being committed. `.copilotignore` prevents them from being read as agent context. Both protections are needed. A secret that doesn't get committed can still leak if an agent reads it and includes it in a prompt or log.

**Minimum `.copilotignore` content for any repo:**

```
# Prevent Copilot from reading secrets and credentials
.env
.env.*
!.env.example
```

---

### PRs — Never self-merge

**Rule:** Never self-merge a PR. The human owner reviews all Copilot PRs.

**Why:** Autonomous agents can introduce subtle regressions, architectural drift, or security issues. Human review is the last checkpoint before code reaches the default branch.
