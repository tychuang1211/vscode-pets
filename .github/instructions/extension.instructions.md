---
applyTo: 'src/extension/**'
---

## Extension Host Rules

- All VS Code API calls (`vscode.*`) belong in `src/extension/extension.ts` only — never import `vscode` from panel or common code.
- Communicate with the webview exclusively via `panel.webview.postMessage(message)` and `panel.webview.onDidReceiveMessage` — no shared variables between extension host and webview.
- Register every command in the `activate` function and add its disposable to `context.subscriptions` — this ensures proper cleanup on deactivation.
- Never use `require()` inside extension host code. Use ES module imports; `tsc` compiles them to CommonJS via `tsconfig.extension.json`.
- Keep extension host startup minimal — defer any work that requires the webview panel until after the panel is opened.
- `tsconfig.extension.json` uses `strict: true` — all strict TypeScript checks apply. Never suppress with `as any` or `// @ts-ignore`.
- Webview message types are defined in `src/common/types.ts` as `WebviewMessage`. Add new message kinds there and keep the union exhaustive (add a `default` case to any switch on message type).
