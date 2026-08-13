import type { CanvasNode, NodeStyles } from '../types/builder';

// Helper to make standard Tailwind classes auto-responsive for mobile screens out of the box
export const makeAutoResponsiveClass = (rawClass: string): string => {
  if (!rawClass) return '';
  let updated = rawClass;

  // 1. Grid columns auto-responsive (e.g. "grid-cols-3" -> "grid-cols-1 md:grid-cols-3")
  if (/^grid-cols-[2-9]$/.test(updated)) {
    const num = updated.replace('grid-cols-', '');
    if (Number(num) >= 4) {
      updated = `grid-cols-1 sm:grid-cols-2 md:grid-cols-${num}`;
    } else {
      updated = `grid-cols-1 md:grid-cols-${num}`;
    }
  }

  // 2. Flex-row auto-responsive (e.g. "flex-row" -> "flex-col md:flex-row")
  if (updated === 'flex-row') {
    updated = 'flex-col md:flex-row';
  }

  // 3. Large Typography auto-responsive
  if (updated === 'text-6xl') updated = 'text-3xl sm:text-5xl md:text-6xl';
  else if (updated === 'text-5xl') updated = 'text-2xl sm:text-4xl md:text-5xl';
  else if (updated === 'text-4xl') updated = 'text-2xl sm:text-3xl md:text-4xl';

  // 4. Large Padding auto-responsive
  if (updated === 'p-12' || updated === 'p-16' || updated === 'p-20') {
    const val = updated.replace('p-', '');
    updated = `p-4 md:p-${val}`;
  } else if (updated === 'px-12' || updated === 'px-16' || updated === 'px-20') {
    const val = updated.replace('px-', '');
    updated = `px-4 md:px-${val}`;
  } else if (updated === 'py-12' || updated === 'py-16' || updated === 'py-20') {
    const val = updated.replace('py-', '');
    updated = `py-6 md:py-${val}`;
  }

  return updated;
};

// Utility to combine node styles into clean Tailwind CSS class string
export const getNodeClassNames = (styles: NodeStyles): string => {
  const classes: string[] = [];

  if (styles.display) classes.push(makeAutoResponsiveClass(styles.display));
  if (styles.flexDirection) classes.push(makeAutoResponsiveClass(styles.flexDirection));
  if (styles.alignItems) classes.push(styles.alignItems);
  if (styles.justifyContent) classes.push(styles.justifyContent);
  if (styles.gap) classes.push(styles.gap);
  if (styles.gridCols) classes.push(makeAutoResponsiveClass(styles.gridCols));
  if (styles.flexWrap) classes.push(styles.flexWrap);

  if (styles.padding) classes.push(makeAutoResponsiveClass(styles.padding));
  if (styles.margin) classes.push(styles.margin);

  // If customClasses explicitly contains height/width (e.g. h-screen, w-1/2), prioritize customClasses over default presets
  const custom = styles.customClasses || '';
  const hasCustomHeight = /\b(h-[^\s]+|min-h-[^\s]+|max-h-[^\s]+)/.test(custom);
  const hasCustomWidth = /\b(w-[^\s]+|min-w-[^\s]+|max-w-[^\s]+)/.test(custom);

  if (styles.width && !hasCustomWidth) classes.push(styles.width);
  if (styles.height && !hasCustomHeight) classes.push(styles.height);
  if (styles.objectFit) classes.push(styles.objectFit);
  if (styles.aspectRatio) classes.push(styles.aspectRatio);

  if (styles.fontSize) classes.push(makeAutoResponsiveClass(styles.fontSize));
  if (styles.fontWeight) classes.push(styles.fontWeight);
  if (styles.textColor) classes.push(styles.textColor);
  if (styles.textAlign) classes.push(styles.textAlign);
  if (styles.fontFamily) classes.push(styles.fontFamily);

  if (styles.backgroundColor) classes.push(styles.backgroundColor);
  if (styles.bgGradient) classes.push(styles.bgGradient);
  if (styles.opacity) classes.push(styles.opacity);

  if (styles.borderWidth) classes.push(styles.borderWidth);
  if (styles.borderColor) classes.push(styles.borderColor);
  if (styles.borderStyle) classes.push(styles.borderStyle);
  if (styles.borderRadius) classes.push(styles.borderRadius);

  if (styles.boxShadow) classes.push(styles.boxShadow);

  const hasHover = !!(styles.hoverEffect || styles.hoverBg || styles.hoverTextColor || styles.hoverShadow || styles.pseudoHover);
  if (hasHover) {
    const duration = styles.transitionDuration || 'duration-300';
    const timing = styles.transitionTiming || 'ease-out';
    classes.push(`transition-all ${duration} ${timing}`);
  }

  if (styles.hoverEffect) classes.push(styles.hoverEffect);
  if (styles.hoverBg) classes.push(styles.hoverBg);
  if (styles.hoverTextColor) classes.push(styles.hoverTextColor);
  if (styles.hoverShadow) classes.push(styles.hoverShadow);
  if (styles.pseudoHover) classes.push(styles.pseudoHover);
  if (styles.pseudoHoverColor) classes.push(styles.pseudoHoverColor);

  if (styles.customClasses) classes.push(styles.customClasses);

  return classes.filter(Boolean).join(' ');
};

// Traversal compiler for React TSX / JSX
// Traversal compiler for React TSX / JSX
const compileNodeToJSX = (node: CanvasNode, indentLevel: number = 2): string => {
  if (node.hidden) return '';

  const indent = ' '.repeat(indentLevel);
  const classNameStr = getNodeClassNames(node.styles);
  const classAttr = classNameStr ? ` className="${classNameStr}"` : '';

  switch (node.type) {
    case 'container':
    case 'card':
    case 'section': {
      const tag = node.type === 'card' ? 'div' : 'div';
      const nameLower = node.name.toLowerCase();
      const isNavGroup = nameLower.includes('group') || nameLower.includes('links') || nameLower.includes('items');
      const isNavbar = (nameLower.includes('navbar') || nameLower.includes('navigation') || nameLower.includes('header') || nameLower === 'nav') && !isNavGroup;
      
      if (isNavbar) {
        const childrenNodes = node.children || [];
        const logoChild = childrenNodes.find((c) => c.type === 'heading' || c.type === 'text' || c.name.toLowerCase().includes('logo') || c.name.toLowerCase().includes('brand')) || childrenNodes[0];
        const ctaButton = childrenNodes.find((c) => c.type === 'button' || c.name.toLowerCase().includes('cta') || c.name.toLowerCase().includes('talk') || c.name.toLowerCase().includes('contact')) || childrenNodes.find((c) => c.type === 'button');
        const navGroupChild = childrenNodes.find((c) => c.isContainer && c !== logoChild);
        const directLinks = childrenNodes.filter((c) => c !== logoChild && c !== ctaButton && c !== navGroupChild);

        const logoJSX = logoChild ? compileNodeToJSX(logoChild, indentLevel + 6) : '';
        const ctaJSX = ctaButton ? compileNodeToJSX(ctaButton, indentLevel + 6) : '';
        const navItems = navGroupChild && navGroupChild.children ? navGroupChild.children : directLinks;
        const navItemsJSX = navItems.map((item) => compileNodeToJSX(item, indentLevel + 8)).join('\n');

        const mobileCtaMode = node.mobileCtaMode || 'in_menu';

        let ctaDesktopAndMobileCode = '';
        if (ctaButton) {
          if (mobileCtaMode === 'in_menu') {
            ctaDesktopAndMobileCode = `
${indent}    {/* Desktop CTA */}
${indent}    <div className="hidden md:block">
${ctaJSX}
${indent}    </div>`;
          } else if (mobileCtaMode === 'top_compact') {
            ctaDesktopAndMobileCode = `
${indent}    {/* Compact Top Bar CTA */}
${indent}    <div className="scale-95 md:scale-100">
${ctaJSX}
${indent}    </div>`;
          } else if (mobileCtaMode === 'top_icon') {
            ctaDesktopAndMobileCode = `
${indent}    {/* Icon on Mobile, Button on Desktop */}
${indent}    <div className="block md:hidden">
${indent}      <button type="button" className="p-2 rounded-full bg-indigo-600 text-white font-bold text-xs">⚡</button>
${indent}    </div>
${indent}    <div className="hidden md:block">
${ctaJSX}
${indent}    </div>`;
          } else if (mobileCtaMode === 'hide') {
            ctaDesktopAndMobileCode = `
${indent}    <div className="hidden md:block">
${ctaJSX}
${indent}    </div>`;
          }
        }

        return `${indent}<nav className="w-full relative z-40 ${classNameStr}">
${indent}  <div className="w-full flex items-center justify-between">
${indent}    {/* Brand / Logo */}
${indent}    <div>
${logoJSX}
${indent}    </div>

${indent}    {/* Desktop Links */}
${indent}    <div className="hidden md:flex md:items-center md:gap-6">
${navItemsJSX}
${indent}    </div>

${indent}    {/* Right Bar Actions (CTA & Hamburger) */}
${indent}    <div className="flex items-center gap-3">
${ctaDesktopAndMobileCode}
${indent}      {/* Hamburger Toggle Button */}
${indent}      <button
${indent}        type="button"
${indent}        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
${indent}        className="md:hidden p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40"
${indent}        aria-label="Toggle Navigation Menu"
${indent}      >
${indent}        {isMobileMenuOpen ? '✕' : '☰'}
${indent}      </button>
${indent}    </div>
${indent}  </div>

${indent}  {/* Mobile Menu Dropdown */}
${indent}  {isMobileMenuOpen && (
${indent}    <div className="md:hidden w-full mt-3 p-4 flex flex-col items-center space-y-3 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 animate-in slide-in-from-top-2">
${navItemsJSX}
${ctaButton && (mobileCtaMode === 'in_menu' || !mobileCtaMode) ? `\n${indent}      <div className="pt-2 w-full flex justify-center border-t border-slate-800">\n${ctaJSX}\n${indent}      </div>` : ''}
${indent}    </div>
${indent}  )}
${indent}</nav>`;
      }

      if (!node.children || node.children.length === 0) {
        return `${indent}<${tag}${classAttr} />`;
      }
      const childrenJSX = node.children
        .map((child) => compileNodeToJSX(child, indentLevel + 2))
        .filter(Boolean)
        .join('\n');
      return `${indent}<${tag}${classAttr}>\n${childrenJSX}\n${indent}</${tag}>`;
    }

    case 'section':
      if (!node.children || node.children.length === 0) {
        return `${indent}<section${classAttr} />`;
      }
      const sectionChildren = node.children
        .map((child) => compileNodeToJSX(child, indentLevel + 2))
        .filter(Boolean)
        .join('\n');
      return `${indent}<section${classAttr}>\n${sectionChildren}\n${indent}</section>`;

    case 'grid':
      if (!node.children || node.children.length === 0) {
        return `${indent}<div${classAttr} />`;
      }
      const gridChildren = node.children
        .map((child) => compileNodeToJSX(child, indentLevel + 2))
        .filter(Boolean)
        .join('\n');
      return `${indent}<div${classAttr}>\n${gridChildren}\n${indent}</div>`;

    case 'heading':
      return `${indent}<h2${classAttr}>${node.content || ''}</h2>`;

    case 'text':
      return `${indent}<p${classAttr}>${node.content || ''}</p>`;

    case 'badge':
      return `${indent}<span${classAttr}>${node.content || ''}</span>`;

    case 'button':
      return `${indent}<button type="button"${classAttr}>\n${indent}  ${node.content || 'Button'}\n${indent}</button>`;

    case 'input':
      return `${indent}<input type="text" placeholder="${node.placeholder || ''}"${classAttr} />`;

    case 'image':
      return `${indent}<img src="${node.src || ''}" alt="${node.name}"${classAttr} />`;

    case 'link':
      return `${indent}<a href="${node.href || '#'}"${classAttr}>${node.content || 'Link'}</a>`;

    default:
      if (node.children && node.children.length > 0) {
        const inner = node.children
          .map((child) => compileNodeToJSX(child, indentLevel + 2))
          .filter(Boolean)
          .join('\n');
        return `${indent}<div${classAttr}>\n${inner}\n${indent}</div>`;
      }
      return `${indent}<div${classAttr}>${node.content || ''}</div>`;
  }
};

export const compileToReactTSX = (rootNode: CanvasNode): string => {
  const jsxTree = compileNodeToJSX(rootNode, 4);
  const hasNavbar = jsxTree.includes('isMobileMenuOpen');

  return `import React${hasNavbar ? ', { useState }' : ''} from 'react';

export default function ExportedComponent() {
${hasNavbar ? '  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n' : ''}  return (
${jsxTree}
  );
}
`;
};

export const compileToHTML = (rootNode: CanvasNode): string => {
  const compileNodeToHTMLStr = (node: CanvasNode, indentLevel: number = 4): string => {
    if (node.hidden) return '';
    const indent = ' '.repeat(indentLevel);
    const classNameStr = getNodeClassNames(node.styles);
    const classAttr = classNameStr ? ` class="${classNameStr}"` : '';

    switch (node.type) {
      case 'container':
      case 'card':
        if (!node.children || node.children.length === 0) return `${indent}<div${classAttr}></div>`;
        return `${indent}<div${classAttr}>\n${node.children.map((c) => compileNodeToHTMLStr(c, indentLevel + 2)).join('\n')}\n${indent}</div>`;

      case 'section':
        if (!node.children || node.children.length === 0) return `${indent}<section${classAttr}></section>`;
        return `${indent}<section${classAttr}>\n${node.children.map((c) => compileNodeToHTMLStr(c, indentLevel + 2)).join('\n')}\n${indent}</section>`;

      case 'grid':
        if (!node.children || node.children.length === 0) return `${indent}<div${classAttr}></div>`;
        return `${indent}<div${classAttr}>\n${node.children.map((c) => compileNodeToHTMLStr(c, indentLevel + 2)).join('\n')}\n${indent}</div>`;

      case 'heading':
        return `${indent}<h2${classAttr}>${node.content || ''}</h2>`;

      case 'text':
        return `${indent}<p${classAttr}>${node.content || ''}</p>`;

      case 'badge':
        return `${indent}<span${classAttr}>${node.content || ''}</span>`;

      case 'button':
        return `${indent}<button type="button"${classAttr}>${node.content || 'Button'}</button>`;

      case 'input':
        return `${indent}<input type="text" placeholder="${node.placeholder || ''}"${classAttr}>`;

      case 'image':
        return `${indent}<img src="${node.src || ''}" alt="${node.name}"${classAttr}>`;

      case 'link':
        return `${indent}<a href="${node.href || '#'}"${classAttr}>${node.content || 'Link'}</a>`;

      default:
        return `${indent}<div${classAttr}>${node.content || ''}</div>`;
    }
  };

  const bodyHTML = compileNodeToHTMLStr(rootNode, 4);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported UI Component</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
${bodyHTML}
</body>
</html>`;
};
