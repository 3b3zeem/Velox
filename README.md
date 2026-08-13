# HippoUI Studio

> **A professional visual UI builder that compiles to clean React + Tailwind CSS code.**

HippoUI Studio is a drag-and-drop canvas builder for designing UI components and full-page layouts. Select, style, and arrange elements visually — then export production-ready React or HTML code in one click.

---

## ✨ Features

- **Visual Canvas Editor** — Drag, drop, resize, and reorder components on a live canvas.
- **Multi-Viewport Preview** — Instantly switch between Desktop, Tablet, Mobile, and Split-view modes.
- **Responsive Design System** — Apply responsive overrides (e.g. `max-md:` classes) that activate inside mobile frames.
- **Mobile Navbar Builder** — Smart hamburger menu with animated morphing icon, dropdown transitions, custom button shape/icon/color, and configurable CTA modes.
- **Style Inspector** — Full control over color, spacing, typography, borders, shadows, gradients, and hover effects per element.
- **Content Inspector** — Edit text, links, image sources, and responsive props directly from the sidebar.
- **One-Click Global Themes** — Apply dark, light, glassmorphism, or accent themes across the entire canvas instantly.
- **AST Compiler** — Converts the visual tree to a clean React + Tailwind AST, ready to paste or export.
- **ZIP Export** — Download a complete Vite project scaffold with your design baked in.
- **Undo / Redo** — Full history stack with 30-step undo/redo support.
- **Component Library** — Pre-built sections: Navbar, Hero, Features Grid, Testimonials, Pricing, Stats, CTAs, Dashboard widgets, and more.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Project Structure

```
src/
├── components/
│   ├── canvas/          # Canvas renderer & drag-and-drop logic
│   ├── header/          # Top toolbar (viewport switcher, export, theme)
│   ├── inspector/       # Right sidebar: Style, Content, and Class controls
│   └── sidebar/         # Left sidebar: Component library & layer tree
├── compiler/
│   ├── astCompiler.ts   # Visual tree → React/HTML AST transformer
│   └── zipExporter.ts   # Vite project ZIP generator
├── data/
│   └── componentLibrary.ts  # Pre-built component definitions & templates
├── store/
│   └── useBuilderStore.ts   # Zustand global state (canvas, history, UI)
└── types/
    └── builder.ts       # TypeScript interfaces (CanvasNode, NodeStyles, etc.)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| State Management | Zustand |
| Drag & Drop | @dnd-kit |
| Icons | Lucide React |
| Export | JSZip |

---

## 📦 Export Options

| Format | Description |
|---|---|
| **React + Tailwind** | Clean JSX with Tailwind utility classes |
| **HTML + Tailwind CDN** | Single-file HTML ready to open in a browser |
| **CodePen** | Auto-opens your design in CodePen via form POST |
| **ZIP Project** | Full Vite scaffold with `src/`, `index.html`, and config files |

---

## 📄 License

MIT — free to use, modify, and distribute.
