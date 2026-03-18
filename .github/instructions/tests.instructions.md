---
applyTo: 'src/test/**'
---

## Test Rules

### Test Maintenance

1. Check existing tests for breakage and update them if any contract, signature, or behaviour changed.
2. Add a regression test for every bug fix — one that would have caught the bug before the fix.
3. Add at least one unit test (and one smoke test where user-visible) for every new feature.
4. Remove redundant tests that are now fully covered by newer tests.
5. Never mark a task done with a failing or degraded test suite.

### Structure & Location

- Mirror the source structure: tests for `src/panel/pets/cat.ts` belong in `src/test/suite/`.
- Test file naming: `[feature].test.ts` or `[module].test.ts`.
- The test entry point is `src/test/runTest.ts`, compiled to `out/test/runTest.js`.

### Writing Tests

- Use Mocha's `suite` / `test` functions and Chai's `assert` / `expect`.
- No real network calls in unit tests — stub external I/O if needed.
- No `setTimeout`-based waits — use deterministic, synchronous assertions.
- Do not share mutable state between test cases. Each test must be self-contained.
- On Linux, the test runner requires a virtual framebuffer: `xvfb-run npm test`. Write tests that work headlessly.

### What Requires a Test

- Every new pet class: at minimum one test verifying the class can be instantiated and that `label` and `sequence` are defined.
- Every new interaction behavior (drag, fling): unit tests for the velocity/physics calculation logic in isolation.
- Every bug fix: a regression test that would have failed before the fix.
