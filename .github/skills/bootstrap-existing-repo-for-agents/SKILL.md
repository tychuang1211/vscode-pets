---
name: bootstrap-existing-repo-for-agents
description: 'Onboard an EXISTING codebase for autonomous GitHub Copilot coding agent operation. Use when: a project already has code and you want to add AGENTS.md, copilot-instructions.md, CI workflows, issue templates, and agent setup steps. Discovers the project from the code first, audits which standard files exist (and whether they are complete), shows what will change, and asks per-file before patching. For greenfield / new repos with no code yet, use the setup-repo-for-agents skill instead.'
argument-hint: 'Optional: path to repo root if not in current directory'
---

# Bootstrap Existing Repo for Agents

Audits an existing codebase and adds or patches all files needed for fully autonomous GitHub Copilot coding agent operation. Discovers as much as possible from the code before asking any questions.

## When to Use

- The repo already has code, but lacks `AGENTS.md`, `copilot-instructions.md`, CI workflows, issue templates, or path-specific instructions
- You want to onboard an existing project to Copilot coding agent without starting from scratch
- Some agent config files already exist but are incomplete — this skill identifies specific gaps and offers to patch them

> **Not for greenfield repos.** If the project has no code yet, use `setup-repo-for-agents` instead, which conducts a full interview before writing any files.

---

## Procedure

### Phase 1 — Codebase Discovery

Read the repository to build a complete picture of the project before asking the user anything. Use [./references/discovery-checklist.md](./references/discovery-checklist.md) as the authoritative guide for what to read and what to infer from each file.

**Files to read (in order):**

1. `package.json` (or `pyproject.toml`, `Cargo.toml`, `go.mod`) — stack, scripts, dependencies
2. `tsconfig.json` and any `tsconfig.*.json` variants — TypeScript strictness, paths
3. `.eslintrc.*` / `eslint.config.*` and `.prettierrc` — lint/format conventions
4. `vite.config.*`, `vitest.config.*`, `playwright.config.*` — build and test setup
5. `.env.example` (if present) — required env vars; scan source for `process.env.*` if absent
6. `README.md` — project description, existing setup docs
7. Full `src/` directory listing — layout, naming patterns, source structure
8. `.github/` directory — what agent config files already exist

**For each file that already exists in `.github/`, read it fully** and check it against the completeness criteria in [./references/discovery-checklist.md](./references/discovery-checklist.md).

**Produce an internal discovery summary** (not shown to the user) using the format in Section 10 of the discovery checklist. This summary drives Phase 1b.

---

### Phase 1b — Targeted Interview

Ask **only** about what discovery could not determine. Typical gaps:

- "What does this app do in one or two sentences?" (if README is absent or vague)
- Browser or runtime compatibility constraints not mentioned in the codebase
- Self-iteration rules: preferred max retry count before flagging to the user
- Branching strategy: feature branches vs. committing to main
- PR description requirements
- Domain-specific anti-patterns to hard-code into `AGENTS.md`

**Rules:**

- Ask all remaining questions at once — not one at a time.
- Never ask about something already inferred from code (e.g. do not ask what framework they use if `package.json` shows it).
- Aim for ≤10 questions total. If everything was discovered, skip Phase 1b entirely.
- After receiving answers, confirm understanding in 3–5 bullet points and ask the user to confirm or correct before proceeding.

---

### Phase 2 — Fetch Latest Documentation

Before generating any files, fetch the latest GitHub Copilot coding agent documentation to ensure accuracy. Retrieve all of the following:

1. `https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent`
2. `https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions`
3. `https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-environment`
4. `https://docs.github.com/en/copilot/tutorials/coding-agent/best-practices`
5. `https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-hooks`

Extract any new best practices, new file locations, new frontmatter fields, or changed workflow names. Compare them against the skill's bundled templates in [./assets/](./assets/) to identify drift.

---

### Phase 2b — Surface & Apply Skill Updates (Self-Update)

After comparing fetched documentation against the bundled templates, check for meaningful differences in:

- **New or renamed files** — e.g. a new required config file location, a renamed workflow key
- **New frontmatter fields** — e.g. a new `applyTo` option, new `copilot-setup-steps` job setting
- **Changed best practices** — e.g. new selector priority rules, deprecated patterns
- **New recommended sections** — e.g. a new checklist item in Definition of Done
- **Breaking changes** — e.g. a job name that Copilot coding agent now requires to be different

**If drift is found:**

1. Show the user a concise summary of what changed, grouped by template file:

   ```
   📋 Skill template updates found:

   copilot-setup-steps.yml.template
     + New: job now supports `timeout-minutes` (max: 59)
     ~ Changed: actions/checkout recommended version is now v5 (was v4)

   AGENTS.md.template
     + New: Section recommended — "Copilot Memory" (public preview)
   ```

2. Ask: **"Update the skill's templates with these changes so future bootstrapping uses the newer standards?"**
   - **Yes** → Update the relevant files in `.github/skills/bootstrap-existing-repo-for-agents/assets/` and `.github/skills/bootstrap-existing-repo-for-agents/references/`. Commit separately: `git commit -m "chore: update bootstrap-existing-repo-for-agents skill templates to latest Copilot docs"`
   - **No** → Proceed using existing templates, but incorporate latest standards into the generated/patched output for this repo.
   - **Some of them** → Apply selectively per user choice.

**If no drift is found:** Show `✅ Skill templates are up to date with the latest documentation.` and proceed.

---

### Phase 3 — Audit Existing Files

For each file in the standard checklist, report one of:

- `✅ EXISTS — complete` — no action needed
- `⚠️ EXISTS — gaps found` — list the specific missing sections or items
- `❌ MISSING — will generate` — file does not exist at all

Also check `package.json` for `agent:verify` script — report `✅ present`, `⚠️ partial`, or `❌ missing`.

**Show the audit table to the user before any generation or patching.** Example format:

```
📋 Agent Configuration Audit
═══════════════════════════════════════════════════════════════════
File                                   Status
───────────────────────────────────────────────────────────────────
AGENTS.md                              ⚠️ EXISTS — gaps found
  Missing: Test Maintenance subsection in Self-Iteration Rules
  Missing: || not ?? rule in Code Conventions

.github/copilot-instructions.md        ✅ EXISTS — complete

.github/workflows/ci.yml               ✅ EXISTS — complete

.github/workflows/copilot-setup-steps.yml  ❌ MISSING — will generate

.github/pull_request_template.md       ✅ EXISTS — complete

.github/ISSUE_TEMPLATE/copilot-task.yml    ❌ MISSING — will generate

.github/ISSUE_TEMPLATE/bug-report.yml      ✅ EXISTS — complete

.github/ISSUE_TEMPLATE/config.yml          ❌ MISSING — will generate

.copilotignore                         ⚠️ EXISTS — gaps found
  Missing: !.env.example exception

.github/instructions/                  ✅ 3 files found

package.json agent:verify script       ❌ MISSING — will add
═══════════════════════════════════════════════════════════════════
```

---

### Phase 4 — Show Diffs for Incomplete Files

For each `⚠️` file, show specifically what will be added:

- List the missing sections or rules in human-readable form (not raw diff)
- Example: "Will add a **Test Maintenance** subsection to Section 7 (Self-Iteration Rules) with 5 rules."
- Ask: **"Add these to [filename]? [Yes / No / Show more detail]"**

For each `❌` file, show a condensed preview of what will be generated:

- Show the section headings or top-level structure only
- Ask: **"Generate [filename]?"**

For the `agent:verify` script, show the proposed command and ask: **"Add this script to package.json?"**

Handle each file's confirmation individually — do not bundle them into one yes/no.

---

### Phase 5 — Confirm All Changes

After collecting per-file responses, show a final consolidated table:

```
✅ Will generate:
  - .github/workflows/copilot-setup-steps.yml
  - .github/ISSUE_TEMPLATE/copilot-task.yml
  - .github/ISSUE_TEMPLATE/config.yml

✏️ Will patch:
  - AGENTS.md (add Test Maintenance subsection, add || vs ?? rule)
  - .copilotignore (add !.env.example exception)
  - package.json (add agent:verify script)

⏭️ Unchanged:
  - .github/copilot-instructions.md
  - .github/workflows/ci.yml
  - .github/pull_request_template.md
  - .github/ISSUE_TEMPLATE/bug-report.yml
  - .github/instructions/ (3 files)
```

Ask: **"Ready to apply all of the above?"**

Do not write any files until the user confirms.

---

### Phase 6 — Write, Commit, Push

1. Write all approved new files using the templates in [./assets/](./assets/), fully populated with discovered and interviewed values. Never use placeholder text like `<YOUR_PROJECT>` in output — all files must be immediately usable.
2. Apply all approved patches to existing files. Patch surgically — add only what is missing, preserve all existing content.
3. Stage all changes: `git add -A`
4. Commit: `git commit -m "chore: bootstrap existing repo for autonomous Copilot coding agent"`
5. Push: `git push origin <default-branch>`

**When writing files, observe these rules:**

**Universal rules** in [./references/universal-rules.md](./references/universal-rules.md) must always be present. When patching an existing file, check that these rules are included; add them if absent.

The `AGENTS.md` **Definition of Done checklist must include**:

- `[ ] Existing tests updated if any behaviour, signature, or contract changed`
- `[ ] Redundant or outdated tests removed if now fully covered by new tests`

The `AGENTS.md` **Self-Iteration section must include a Test Maintenance subsection** with these five rules:

> 1. Check existing tests for breakage and update them if any contract, signature, or behaviour changed.
> 2. Add a regression test for every bug fix — one that would have caught the bug before the fix.
> 3. Add at least one unit test (and one E2E/smoke test where user-visible) for every new feature.
> 4. Remove redundant tests that are now fully covered by newer tests.
> 5. Never mark a task done with a failing or degraded test suite.

The `tests` instructions file **must include a Test Maintenance section** with the same five rules.

**For path-specific instructions** (`.github/instructions/*.instructions.md`): if none exist, generate one file per major source area discovered in Phase 1. Use [./references/path-instructions-guide.md](./references/path-instructions-guide.md) for guidance. Base `applyTo` globs on the actual directory structure discovered. Only generate path-specific files for areas where conventions meaningfully differ from the general `AGENTS.md` content.

---

### Phase 7 — Done

Report:

1. Files created (with paths)
2. Files patched (with a one-line description of what was added to each)
3. Files left unchanged
4. The commit hash

Then remind the user of the next step:

> To assign a task to Copilot, create an issue using the **Copilot Task** template, fill in description and acceptance criteria, then assign it to `copilot-swe-agent` from the Assignees sidebar.
