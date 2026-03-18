---
applyTo: 'src/panel/**'
---

## Panel (Webview) Rules

### Performance — Non-Negotiable

- Always use `requestAnimationFrame` for animation. Never use `setInterval` or `setTimeout` as an animation loop.
- Keep all per-frame work under ~1ms. Profile before adding logic to the animation hot path.
- Never read layout properties (`offsetWidth`, `offsetHeight`, `getBoundingClientRect`, `clientWidth`, `scrollTop`, etc.) inside the animation loop — this forces synchronous reflow and degrades the entire VS Code editor.
- Prefer CSS `transform: translate(Xpx, Ypx)` over mutating `left`/`bottom` in hot paths — transforms are GPU-composited and do not trigger reflow.
- Do not import large npm packages into panel code. The panel bundles to `media/main-bundle.js` and runs inside a VS Code webview — keep it small.

### Adding a New Pet

Every new pet **requires all four of these** — missing any one will cause the pet to be silently absent or crash:

1. Add a value to the `PetType` const enum in `src/common/types.ts`.
2. Create `src/panel/pets/[name].ts` with a class that `extends BasePetType`. Define `label`, `static possibleColors`, and `sequence` (startingState + sequenceStates).
3. Import the class in `src/panel/pets.ts` and add a case for it in the `createPet` factory function.
4. Add sprite PNG files to `media/[name]/` — filenames must match the sprite states referenced in the sequence.

See `src/panel/pets/cat.ts` as the canonical reference for the full state-machine pattern.

### Drag & Fling Implementation

When implementing click-to-drag and fling behavior:

- Use `pointerdown` / `pointermove` / `pointerup` events — not `mousedown`/`mouseup`. Pointer events work for mouse, touch, and stylus uniformly.
- Call `element.setPointerCapture(e.pointerId)` in `pointerdown` so the element keeps receiving move events when the pointer leaves its bounds.
- Track velocity by storing position deltas over the last ~5 `pointermove` events and averaging — this smooths jitter and yields a stable fling vector.
- On `pointerup`, apply the averaged velocity as an initial impulse. Per `requestAnimationFrame` frame: `vx *= damping; vy = vy * damping + gravity; x += vx; y += vy`.
- Clamp `|vx|` and `|vy|` to a reasonable max (e.g. 30 px/frame) to prevent pets from flying instantly off-screen.
- When the pet lands (`bottom <= floor`), zero `vy` and apply horizontal friction until it stops.
- While a pet is being dragged, set its `holdState` / `holdStateEnum` (see `BasePetType`) to pause the normal sequence state machine.

### State Machine

- Pet behavior is driven by a `sequence` state machine in each pet class (`ISequenceTree`).
- States are defined in the `States` enum in `src/panel/states.ts`. Add new states there when a behavior requires one not already present.
- The `nextFrame()` method (inherited from `BasePetType`) drives state transitions each animation frame.
- Use `holdState` / `holdStateEnum` to temporarily freeze the state machine during player-controlled interactions (drag, fling arc in flight).

### Code Quality

- Never ship `console.log` or `console.debug` calls in panel code. The only permitted exception is the existing debug-name guard in `BasePetType`'s constructor.
- Do not add new module-level mutable globals without a clear justification.
- Sprite frame images must use `image-rendering: pixelated` (already set globally in `media/pets.css`); do not override this.
