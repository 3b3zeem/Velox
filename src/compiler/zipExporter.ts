import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { CanvasNode } from '../types/builder';
import { compileToReactTSX } from './astCompiler';

export const exportProjectAsZip = async (rootNode: CanvasNode) => {
  const zip = new JSZip();

  // 1. package.json
  const packageJson = {
    "name": "exported-ui-app",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      "lucide-react": "^0.475.0"
    },
    "devDependencies": {
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      "@vitejs/plugin-react": "^4.3.0",
      "tailwindcss": "^4.0.0",
      "@tailwindcss/vite": "^4.0.0",
      "typescript": "^5.6.0",
      "vite": "^6.0.0"
    }
  };

  zip.file('package.json', JSON.stringify(packageJson, null, 2));

  // 2. index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Exported UI App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
  zip.file('index.html', indexHtml);

  // 3. vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});`;
  zip.file('vite.config.ts', viteConfig);

  // 4. src/index.css
  const indexCss = `@import "tailwindcss";

html, body, #root {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}`;
  zip.file('src/index.css', indexCss);

  // 5. src/main.tsx
  const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  zip.file('src/main.tsx', mainTsx);

  // 6. src/App.tsx (Compiled TSX)
  const appTsx = compileToReactTSX(rootNode);
  zip.file('src/App.tsx', appTsx);

  // 7. README.md
  const readme = `# Exported UI App

Generated with **HippoUI Studio** (Visual Web UI Builder & Code Exporter).

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run local dev server:
   \`\`\`bash
   npm run dev
   \`\`\`
`;
  zip.file('README.md', readme);

  // Generate ZIP blob and download
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'hippoui-project.zip');
};
