# Velox

> **A visual UI builder that compiles to clean React + Tailwind CSS code.**

Design UI components and full-page layouts on a live drag-and-drop canvas — then export production-ready React, HTML, or a complete Vite project in one click.

**[Live Demo](https://go-velox.vercel.app/)** · **[GitHub](https://github.com/3b3zeem/Velox)**

---

## Features

- **Visual Canvas Editor** — Drag, drop, reorder, and compose components on a live canvas.
- **Multi-Viewport Preview** — Switch between Desktop, Tablet, Mobile, Split-view, and full Preview modes.
- **Responsive Design System** — Apply breakpoint-specific overrides (e.g. `max-md:` classes) inside mobile frames.
- **Mobile Navbar Builder** — Hamburger menu with animated icon, dropdown transitions, custom CTA modes, and responsive behavior.
- **Style Inspector** — Control colors, spacing, typography, borders, shadows, gradients, and hover effects per element.
- **Content Inspector** — Edit text, links, images, and responsive props directly from the sidebar.
- **One-Click Global Themes** — Apply dark, light, glassmorphism, or accent themes across the entire canvas instantly.
- **AST Compiler** — Converts the visual tree into clean React + Tailwind code via an AST pipeline — not string templates.
- **ZIP Export** — Download a full Vite project scaffold with your design baked in.
- **Undo / Redo** — History stack with 30-step undo/redo support.
- **Component Library** — Pre-built sections: Navbar, Hero, Features Grid, Testimonials, Pricing, Stats, CTAs, Dashboard widgets, and more.
- **Mobile Studio UI** — Bottom navigation dock for Palette, Canvas, and Inspector on small screens.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repo
git clone https://github.com/3b3zeem/Velox.git
cd Velox

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── canvas/          # Canvas renderer & drag-and-drop logic
│   ├── header/          # Top toolbar (viewport switcher, export, theme)
│   ├── inspector/       # Right sidebar: Style, Content, and Class controls
│   ├── modals/          # Code export modal
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

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| State Management | Zustand |
| Drag & Drop | @dnd-kit |
| Code Editor | Monaco Editor |
| Icons | Lucide React |
| Export | JSZip + FileSaver |

---

## Export Options

| Format | Description |
|---|---|
| **React + Tailwind (TSX/JSX)** | Clean components with Tailwind utility classes |
| **HTML + Tailwind CDN** | Single-file HTML ready to open in a browser |
| **CodePen** | Opens your design in CodePen via form POST |
| **ZIP Project** | Full Vite scaffold with `src/`, `index.html`, and config files |

---

## License

MIT — free to use, modify, and distribute.
