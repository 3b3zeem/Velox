# Velox Studio — Codebase Guide for New Developers

> هذا الملف موجود لأي حد يفتح المشروع لأول مرة.
> اقرأه وأنت هتعرف تشتغل في أي حاجة في 5 دقايق.

---

## 🗺️ Project Map

```
src/
├── App.tsx                   — Root layout + keyboard shortcuts
├── types/
│   └── builder.ts            — CanvasNode, NodeStyles, ViewportMode (the data contracts)
├── store/
│   ├── useBuilderStore.ts    — 🧠 THE BRAIN. Zustand store (read this first)
│   ├── treeHelpers.ts        — Pure tree traversal & mutation functions
│   └── themeHelpers.ts       — Recursive theme cascade engine
├── data/
│   └── componentLibrary.ts   — Palette items + INITIAL_CANVAS_NODE + PRESET_TEMPLATES
├── compiler/
│   └── astCompiler.ts        — Converts NodeStyles → Tailwind class strings + code export
├── components/
│   ├── header/
│   │   └── Header.tsx        — Top bar: undo/redo, viewport switcher, export, theme toggle
│   ├── sidebar/
│   │   ├── LeftSidebar.tsx   — Tab container for Components and Layers panels
│   │   ├── ComponentPalette.tsx — Draggable component library
│   │   └── TreeView.tsx      — Collapsible DOM hierarchy tree
│   ├── canvas/
│   │   ├── Canvas.tsx              — The design surface (handles drop zones + breadcrumbs)
│   │   ├── CanvasNodeRenderer.tsx  — Recursively renders each CanvasNode
│   │   └── MobileNavbarRenderer.tsx — Hamburger navbar for mobile frame view
│   └── inspector/
│       ├── RightSidebar.tsx         — Tab container for Styles / Content / Classes
│       ├── StyleControls.tsx        — 🎨 Orchestrates style sub-panels
│       ├── HoverEffectsPanel.tsx    — Motion, color, glow, pseudo FX controls
│       ├── LayoutTypographyPanel.tsx — Display, flex/grid, text, spacing, borders
│       ├── ContentControls.tsx      — Text, image src, link href, placeholder
│       └── stylePresets.ts          — Static preset arrays & color palettes
```

---

## 🔁 Data Flow (كيف تتحرك البيانات)

```
User Action (click / drag / type)
        ↓
CanvasNodeRenderer / StyleControls / ContentControls
        ↓
useBuilderStore action (e.g. updateNodeStyles, addNode, moveNode)
        ↓
treeHelpers / themeHelpers (pure functions, no side effects)
        ↓
New rootNode state → React re-render
        ↓
CanvasNodeRenderer reads new node styles
        ↓
astCompiler.getNodeClassNames(node.styles) → Tailwind class string
        ↓
DOM updates
```

---

## 🧠 The Store — Most Important File

**`src/store/useBuilderStore.ts`** — This is where everything lives:
- `rootNode` — the entire canvas as a tree of `CanvasNode` objects
- `selectedNodeId` — which node is selected in the inspector
- `history.past / future` — undo / redo stacks
- Every mutation (add, delete, move, update) pushes to `history.past`

**Read the store first.** The rest of the app is mostly "display layer".

---

## 🌳 CanvasNode — The Core Data Type

```ts
// Every element on the canvas is a CanvasNode:
interface CanvasNode {
  id: string;            // unique, e.g. "node_abc123"
  type: ComponentType;   // 'container' | 'heading' | 'button' | etc.
  name: string;          // human label shown in TreeView
  styles: NodeStyles;    // all visual styling (see below)
  children?: CanvasNode[]; // nested elements
  isContainer?: boolean; // can it accept children?
  content?: string;      // text for heading/text/button
  src?: string;          // image URL
  href?: string;         // link destination
  // ... more in types/builder.ts
}
```

---

## 🎨 StyleControls — Understanding the Inspector

The Styles tab panel is split into 4 files:

| File | Responsibility |
|------|---------------|
| `StyleControls.tsx` | Orchestrator: decides which panels to show |
| `HoverEffectsPanel.tsx` | Hover animations, transitions, pseudo FX |
| `LayoutTypographyPanel.tsx` | Display, flex/grid, font, spacing, borders |
| `stylePresets.ts` | Static data: preset arrays, colors, fonts |

**To add a new style control:**
1. Add the new style property to `NodeStyles` in `types/builder.ts`
2. Add it to `astCompiler.ts` so it compiles to a class string
3. Add the UI control in the appropriate panel file

---

## 🔧 Common Tasks

### Add a new element type to the palette
→ `src/data/componentLibrary.ts` → add to `COMPONENT_PALETTE`

### Add a new one-click style preset
→ `src/components/inspector/stylePresets.ts` → add to `BUTTON_PRESETS`, `TEXT_PRESETS`, etc.

### Change how a node renders on canvas
→ `src/components/canvas/CanvasNodeRenderer.tsx` → update the `switch` in `renderInnerComponent()`

### Add a new store action
→ `src/store/useBuilderStore.ts` → add to `BuilderState` interface + implement in `create()`
→ If it needs tree traversal, add a helper to `treeHelpers.ts`

### Change theme cascade behavior
→ `src/store/themeHelpers.ts` → update the `ROOT_THEME_STYLES`, `TEXT_THEME_COLORS`, etc.

---

## 📏 Conventions

- **Immutable tree mutations**: Always return a new tree object, never mutate in-place
- **Push to history** before any `rootNode` change (see `pushHistory` in the store)
- **File size guideline**: Keep component files under ~300 lines if possible
- **Comment standard**: Add a block comment at the top of each file explaining its purpose

---

## 🚀 Running Locally

```bash
npm install
npm run dev       # dev server on localhost:5173
npm run build     # production bundle
```
