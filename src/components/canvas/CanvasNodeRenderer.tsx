/**
 * CanvasNodeRenderer.tsx
 * ─────────────────────────────────────────────────────────────
 * Recursively renders the CanvasNode tree onto the canvas.
 *
 * RESPONSIBILITIES:
 *   1. Pick the correct HTML element / component for each node type
 *   2. Apply Tailwind class strings (via astCompiler.getNodeClassNames)
 *   3. Handle responsive class overrides for mobile / tablet frames
 *   4. Show selection / hover outlines in edit mode
 *   5. Render the floating draggable toolbar on selected nodes
 *   6. Handle drag-and-drop for reordering / dropping from palette
 *   7. Inline text editing on double-click
 *   8. Image upload via file picker
 *
 * For the mobile navbar special case, rendering is delegated to:
 *   → MobileNavbarRenderer.tsx  (hamburger menu, dropdown, CTA logic)
 *
 * Element type → DOM element mapping:
 *   container / card / section → <div> or <section>
 *   grid      → <div> (grid layout)
 *   heading   → <h2>  (with inline edit on double-click)
 *   text      → <p>   (with inline edit on double-click)
 *   badge     → <span>
 *   button    → <button>
 *   input     → <input type="text">
 *   image     → <div> wrapping <img> (with upload overlay)
 *   link      → <a>
 * ─────────────────────────────────────────────────────────────
 */

import React, { memo, useState, useRef } from "react";
import {
  CornerUpLeft,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Upload,
  GripVertical,
} from "lucide-react";
import type { CanvasNode } from "../../types/builder";
import { getNodeClassNames } from "../../compiler/astCompiler";
import { useBuilderStore } from "../../store/useBuilderStore";
import { findParent } from "../../store/treeHelpers";
import { MobileNavbarRenderer } from "./MobileNavbarRenderer";

interface CanvasNodeRendererProps {
  node: CanvasNode;
  isRoot?: boolean;
  isMobileView?: boolean;
}

// Lazy-populate the icon map at module level — we import all needed icons at top
const getFaqIcon = (name: string): React.FC<{ className?: string }> => {
  // Dynamic lookup from a curated set of lucide icons
  const icons: Record<string, React.FC<{ className?: string }>> = {
    Plus, Minus, ChevronDown, ChevronUp,
    // We'll also alias some common names
    'Arrow Down': ChevronDown, 'Arrow Up': ChevronUp,
    'X': (() => {
      // Inline X icon
      const XIcon: React.FC<{ className?: string }> = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      );
      return XIcon;
    })(),
    'Circle Dot': (() => {
      const DotIcon: React.FC<{ className?: string }> = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2" fill="currentColor" /></svg>
      );
      return DotIcon;
    })(),
    'Circle': (() => {
      const CircleIcon: React.FC<{ className?: string }> = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /></svg>
      );
      return CircleIcon;
    })(),
  };
  return icons[name] || Plus;
};

const FAQ_TOGGLE_SIZES: Record<string, { box: string; icon: string }> = {
  sm: { box: 'w-6 h-6', icon: 'w-3 h-3' },
  md: { box: 'w-8 h-8', icon: 'w-4 h-4' },
  lg: { box: 'w-10 h-10', icon: 'w-5 h-5' },
};

const FaqAccordionItemRenderer: React.FC<{
  node: CanvasNode;
  classNameStr: string;
  renderChild: (child: CanvasNode) => React.ReactNode;
}> = ({ node, classNameStr, renderChild }) => {
  const [isOpen, setIsOpen] = useState(false);
  const children = node.children || [];

  // Read customization props from the FAQ Item card node
  const collapsedIconName = node.faqCollapsedIcon || 'Plus';
  const expandedIconName = node.faqExpandedIcon || 'Minus';
  const toggleBg = node.faqToggleBg || 'bg-slate-800';
  const toggleActiveBg = node.faqToggleActiveBg || 'bg-indigo-600';
  const toggleRadius = node.faqToggleRadius || 'rounded-xl';
  const toggleSizeKey = node.faqToggleSize || 'md';
  const sizeClasses = FAQ_TOGGLE_SIZES[toggleSizeKey] || FAQ_TOGGLE_SIZES.md;

  const CollapsedIcon = getFaqIcon(collapsedIconName);
  const ExpandedIcon = getFaqIcon(expandedIconName);

  const headerNode =
    children.find(
      (c) =>
        c.name.toLowerCase().includes("header") ||
        c.name.toLowerCase().includes("question"),
    ) || children[0];

  const contentNode =
    children.find(
      (c) =>
        c.name.toLowerCase().includes("content") ||
        c.name.toLowerCase().includes("answer"),
    ) || children[1];

  const otherChildren = children.filter(
    (c) => c.id !== headerNode?.id && c.id !== contentNode?.id,
  );

  // Render the toggle button with user-customizable icon and styles
  const renderToggleButton = (key?: string) => (
    <div
      key={key}
      className={`${sizeClasses.box} ${toggleRadius} flex items-center justify-center transition-all duration-300 shrink-0 ${
        isOpen
          ? `${toggleActiveBg} text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/50`
          : `${toggleBg} text-slate-300 hover:brightness-125 border border-slate-700/80`
      }`}
    >
      {isOpen ? (
        <ExpandedIcon className={`${sizeClasses.icon} stroke-[2.5]`} />
      ) : (
        <CollapsedIcon className={`${sizeClasses.icon} stroke-[2.5]`} />
      )}
    </div>
  );

  return (
    <div className={`${classNameStr} transition-all duration-300 select-none`}>
      {/* Clickable Accordion Header */}
      {headerNode && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="cursor-pointer group/faq-header flex items-center justify-between w-full"
        >
          {headerNode.children && headerNode.children.length > 0 ? (
            headerNode.children.map((c) => {
              if (
                c.type === "button" ||
                c.name.toLowerCase().includes("toggle") ||
                c.name.toLowerCase().includes("icon")
              ) {
                return renderToggleButton(c.id);
              }
              return renderChild(c);
            })
          ) : (
            <>
              {renderChild(headerNode)}
              {renderToggleButton()}
            </>
          )}
        </div>
      )}

      {/* Expandable Accordion Body Content */}
      {contentNode && (
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen
              ? "grid-rows-[1fr] opacity-100 mt-2"
              : "grid-rows-[0fr] opacity-0 h-0 overflow-hidden"
          }`}
        >
          <div className="overflow-hidden">{renderChild(contentNode)}</div>
        </div>
      )}

      {otherChildren.map((child) => renderChild(child))}
    </div>
  );
};

export const CanvasNodeRenderer: React.FC<CanvasNodeRendererProps> = memo(
  ({ node, isRoot = false, isMobileView = false }) => {
    const {
      selectedNodeId,
      selectedNodeIds,
      hoveredNodeId,
      setSelectedNodeId,
      toggleNodeSelection,
      setHoveredNodeId,
      deleteNode,
      duplicateNode,
      selectParentNode,
      moveNode,
      moveNodeOrder,
      addNode,
      updateNodeProps,
      viewMode,
      simulatedHoverNodeId,
      boxInspectorEnabled,
    } = useBuilderStore();

    const [isEditingInline, setIsEditingInline] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // ── Draggable floating toolbar ─────────────────────────────────────────
    const [manualToolbarOffset, setManualToolbarOffset] = useState<{
      x: number;
      y: number;
    } | null>(null);

    // Compute effective toolbar offset: if not manually dragged, default to floating 38px above node
    const getEffectiveToolbarOffset = (): { x: number; y: number } => {
      if (manualToolbarOffset !== null) return manualToolbarOffset;
      return { x: 0, y: -38 };
    };

    const currentToolbarOffset = getEffectiveToolbarOffset();

    const dragStartRef = useRef<{
      startX: number;
      startY: number;
      initialX: number;
      initialY: number;
    } | null>(null);

    const handleToolbarMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      if ("preventDefault" in e) e.preventDefault();

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      dragStartRef.current = {
        startX: clientX,
        startY: clientY,
        initialX: currentToolbarOffset.x,
        initialY: currentToolbarOffset.y,
      };

      const handleMove = (ev: MouseEvent | TouchEvent) => {
        if (!dragStartRef.current) return;
        const mx =
          "touches" in ev
            ? (ev as TouchEvent).touches[0].clientX
            : (ev as MouseEvent).clientX;
        const my =
          "touches" in ev
            ? (ev as TouchEvent).touches[0].clientY
            : (ev as MouseEvent).clientY;
        setManualToolbarOffset({
          x: dragStartRef.current.initialX + (mx - dragStartRef.current.startX),
          y: dragStartRef.current.initialY + (my - dragStartRef.current.startY),
        });
      };

      const handleEnd = () => {
        dragStartRef.current = null;
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleEnd);
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchend", handleEnd);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
    };

    // ── Node state ─────────────────────────────────────────────────────────
    const isSelected = selectedNodeId === node.id;
    const isMultiSelected = selectedNodeIds.includes(node.id) && selectedNodeIds.length > 1;
    const isHovered = hoveredNodeId === node.id;
    const isPreview = viewMode === "preview";

    if (node.hidden) return null;

    // ── Class name resolution ──────────────────────────────────────────────
    const canvasResponsiveMode = viewMode === 'desktop' || viewMode === 'preview' ? 'canvas-desktop' : viewMode === 'tablet' ? 'canvas-tablet' : 'canvas-mobile';
    let classNameStr = getNodeClassNames(node.styles, canvasResponsiveMode);

    // Simulated hover: strip hover: prefix and apply classes directly
    if (simulatedHoverNodeId === node.id) {
      const activeHoverClasses = [
        node.styles.hoverEffect,
        node.styles.hoverBg,
        node.styles.hoverTextColor,
        node.styles.hoverShadow,
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/hover:/g, "");
      classNameStr += ` ${activeHoverClasses}`;
    }

    // ── Responsive overrides for mobile / tablet frames ────────────────────
    const isMobileFrame = viewMode === "mobile" || isMobileView;

    if (isMobileFrame) {
      // Apply max-md: responsive overrides inside mobile frames
      const maxMdMatches = classNameStr.match(/\bmax-md:([^\s]+)/g);
      if (maxMdMatches) {
        maxMdMatches.forEach((fullMatch) => {
          const targetCls = fullMatch.replace("max-md:", "");
          if (targetCls.startsWith("text-")) {
            if (
              [
                "text-left",
                "text-center",
                "text-right",
                "text-justify",
              ].includes(targetCls)
            ) {
              classNameStr = classNameStr.replace(
                /\btext-(left|center|right|justify)\b/g,
                "",
              );
            } else if (/^text-(xs|sm|base|lg|xl|[2-9]xl)$/.test(targetCls)) {
              classNameStr = classNameStr.replace(
                /\btext-(xs|sm|base|lg|xl|[2-9]xl)\b/g,
                "",
              );
            }
          } else if (targetCls.startsWith("flex-")) {
            classNameStr = classNameStr.replace(/\bflex-(row|col)\b/g, "");
          } else if (targetCls.startsWith("grid-cols-")) {
            classNameStr = classNameStr.replace(/\bgrid-cols-\d+\b/g, "");
          } else if (
            targetCls.startsWith("p-") ||
            targetCls.startsWith("px-") ||
            targetCls.startsWith("py-")
          ) {
            const prefix = targetCls.startsWith("px-")
              ? "px-"
              : targetCls.startsWith("py-")
                ? "py-"
                : "p-";
            classNameStr = classNameStr.replace(
              new RegExp(`\\b${prefix}\\d+\\b`, "g"),
              "",
            );
          } else if (targetCls === "hidden") {
            classNameStr = classNameStr.replace(
              /\b(flex|block|grid|inline-block)\b/g,
              "",
            );
          }
          classNameStr += ` ${targetCls}`;
        });
        classNameStr = classNameStr.replace(/\bmax-md:[^\s]+/g, "");
      }

      // Mobile-specific type overrides
      if (node.type === "grid")
        classNameStr = classNameStr.replace(
          /grid-cols-\d+|md:grid-cols-\d+|sm:grid-cols-\d+/g,
          "grid-cols-1",
        );
      if (node.type === "heading")
        classNameStr = classNameStr.replace(
          /md:text-6xl|md:text-5xl|text-6xl|text-5xl|text-4xl/g,
          "text-2xl font-bold",
        );
      if (["section", "container", "card"].includes(node.type))
        classNameStr += " max-w-full overflow-hidden";
    } else if (viewMode === "tablet") {
      if (node.type === "grid")
        classNameStr = classNameStr.replace(
          /grid-cols-3|md:grid-cols-3/g,
          "grid-cols-2",
        );
    }

    // ── Selection / hover outline ──────────────────────────────────────────
    let outlineStyle = "";
    if (!isPreview) {
      if (boxInspectorEnabled && (isSelected || isHovered)) {
        outlineStyle =
          "relative ring-2 ring-emerald-500 ring-offset-2 bg-emerald-500/5 shadow-lg z-10";
      } else if (isSelected) {
        outlineStyle =
          "relative outline outline-2 outline-indigo-500 outline-offset-2 shadow-lg z-10";
      } else if (isMultiSelected) {
        outlineStyle =
          "relative outline-dashed outline-2 outline-violet-400 outline-offset-2 z-10";
      } else if (isHovered) {
        outlineStyle =
          "relative outline outline-1 outline-indigo-400/60 outline-offset-1 z-0";
      }
    }

    // ── Event handlers ─────────────────────────────────────────────────────
    const handleClick = (e: React.MouseEvent) => {
      if (isPreview) return;
      e.stopPropagation();
      if (e.ctrlKey || e.metaKey) {
        toggleNodeSelection(node.id);
      } else {
        setSelectedNodeId(node.id);
      }
    };
    const handleMouseEnter = (e: React.MouseEvent) => {
      if (isPreview) return;
      e.stopPropagation();
      setHoveredNodeId(node.id);
    };
    const handleMouseLeave = (e: React.MouseEvent) => {
      if (isPreview) return;
      e.stopPropagation();
      setHoveredNodeId(null);
    };
    const handleDragOver = (e: React.DragEvent) => {
      if (isPreview) return;
      e.preventDefault();
      e.stopPropagation();
      if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      if (isPreview) return;
      e.stopPropagation();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      if (isPreview) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      // Helper to detect whether a container node has horizontal layout (flex-row or multi-column grid)
      const getIsHorizontalLayout = (containerElem: HTMLElement | null, childrenIds: string[]): boolean => {
        if (!containerElem) return false;
        const style = window.getComputedStyle(containerElem);
        const display = style.display;
        const flexDirection = style.flexDirection;

        if (display.includes('flex') && (flexDirection === 'row' || flexDirection === 'row-reverse')) {
          return true;
        }

        if (display.includes('grid')) {
          const gridCols = style.gridTemplateColumns;
          if (gridCols && gridCols.split(' ').filter(Boolean).length > 1) {
            return true;
          }
        }

        // Fallback: check actual DOM positions of first two children if available
        if (childrenIds.length >= 2) {
          const el0 = document.getElementById(childrenIds[0]);
          const el1 = document.getElementById(childrenIds[1]);
          if (el0 && el1) {
            const r0 = el0.getBoundingClientRect();
            const r1 = el1.getBoundingClientRect();
            if (Math.abs(r1.top - r0.top) < 25 && r1.left > r0.left) {
              return true;
            }
          }
        }

        return false;
      };

      // Calculate precise target parent ID and insert index based on mouse cursor position
      const calculateDropLocation = () => {
        const { rootNode } = useBuilderStore.getState();

        // Case 1: Target node is a container with children
        if (node.isContainer && node.children && node.children.length > 0) {
          const containerElem = document.getElementById(node.id);
          const childrenIds = node.children.map((c) => c.id);
          const isHorizontal = getIsHorizontalLayout(containerElem, childrenIds);

          for (let i = 0; i < node.children.length; i++) {
            const childId = node.children[i].id;
            const childElem = document.getElementById(childId);
            if (childElem) {
              const rect = childElem.getBoundingClientRect();

              if (isHorizontal) {
                const midX = rect.left + rect.width / 2;
                if (e.clientX < midX) {
                  return { parentId: node.id, targetIndex: i };
                }
              } else {
                const midY = rect.top + rect.height / 2;
                if (e.clientY < midY) {
                  return { parentId: node.id, targetIndex: i };
                }
              }
            }
          }
          return { parentId: node.id, targetIndex: node.children.length };
        }

        // Case 2: Target node is inside a parent container
        const parent = findParent(rootNode, node.id);
        if (parent && parent.children) {
          const index = parent.children.findIndex((c) => c.id === node.id);
          const parentElem = document.getElementById(parent.id);
          const childrenIds = parent.children.map((c) => c.id);
          const isHorizontal = getIsHorizontalLayout(parentElem, childrenIds);

          const elem = document.getElementById(node.id);
          if (elem) {
            const rect = elem.getBoundingClientRect();
            const isBefore = isHorizontal
              ? e.clientX < rect.left + rect.width / 2
              : e.clientY < rect.top + rect.height / 2;

            return {
              parentId: parent.id,
              targetIndex: isBefore ? index : index + 1,
            };
          }
          return { parentId: parent.id, targetIndex: index + 1 };
        }

        // Default fallback to container or root
        return {
          parentId: node.isContainer ? node.id : "root_container",
          targetIndex: undefined,
        };
      };

      const { parentId, targetIndex } = calculateDropLocation();

      // Palette item drop (JSON payload)
      const paletteJson = e.dataTransfer.getData("application/json");
      if (paletteJson) {
        try {
          addNode(parentId, JSON.parse(paletteJson), targetIndex);
        } catch (err) {
          console.error("Failed to parse drag node:", err);
        }
        return;
      }

      // Tree / canvas reorder drop (plain text node id)
      const treeNodeId = e.dataTransfer.getData("text/plain");
      if (treeNodeId && treeNodeId !== node.id) {
        moveNode(treeNodeId, parentId, node.isContainer ? "inside" : "after", targetIndex);
      }
    };

    // ── Children (recursive) ───────────────────────────────────────────────
    const renderChild = (childNode: CanvasNode) => (
      <CanvasNodeRenderer
        key={childNode.id}
        node={childNode}
        isMobileView={isMobileView}
      />
    );

    const childrenContent = node.children?.length ? (
      node.children.map(renderChild)
    ) : node.isContainer && !isPreview ? (
      <div className="border-2 border-dashed border-slate-700/60 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 text-xs font-mono select-none my-2 bg-slate-950/20 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors">
        <span>+ Drop components into {node.name}</span>
      </div>
    ) : null;

    // ── Element type → DOM node ────────────────────────────────────────────
    const renderInnerComponent = () => {
      switch (node.type) {
        // Containers — with special mobile navbar detection
        case "container":
        case "card":
        case "section": {
          const nameLower = node.name.toLowerCase();
          const isNavGroup =
            nameLower.includes("group") ||
            nameLower.includes("links") ||
            nameLower.includes("items");
          const isNavbar =
            (nameLower.includes("navbar") ||
              nameLower.includes("navigation") ||
              nameLower.includes("header") ||
              nameLower === "nav") &&
            !isNavGroup;

          const isFaqItem =
            nameLower.includes("faq item") ||
            nameLower.includes("faq card") ||
            nameLower.includes("accordion item") ||
            nameLower.includes("q1 card") ||
            nameLower.includes("q2 card");

          if (isFaqItem && (node.children?.length ?? 0) >= 2) {
            return (
              <FaqAccordionItemRenderer
                node={node}
                classNameStr={classNameStr}
                renderChild={renderChild}
              />
            );
          }

          if (isNavbar && isMobileFrame) {
            // Delegate to the dedicated mobile navbar component
            return (
              <MobileNavbarRenderer node={node} renderChild={renderChild} />
            );
          }
          if (node.type === "section")
            return (
              <section className={classNameStr}>{childrenContent}</section>
            );
          return <div className={classNameStr}>{childrenContent}</div>;
        }

        case "grid":
          return <div className={classNameStr}>{childrenContent}</div>;

        // Heading — inline text edit on double-click
        case "heading":
          return isEditingInline ? (
            <input
              type="text"
              autoFocus
              value={node.content || ""}
              onChange={(e) =>
                updateNodeProps(node.id, { content: e.target.value })
              }
              onBlur={() => setIsEditingInline(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingInline(false)}
              className="w-full bg-slate-900 text-white font-bold text-3xl border border-indigo-500 rounded px-2 py-1 outline-none"
            />
          ) : (
            <h2
              onDoubleClick={() => !isPreview && setIsEditingInline(true)}
              className={classNameStr}
            >
              {node.content || "Heading Text"}
            </h2>
          );

        // Paragraph — inline text edit on double-click
        case "text":
          return isEditingInline ? (
            <textarea
              autoFocus
              rows={2}
              value={node.content || ""}
              onChange={(e) =>
                updateNodeProps(node.id, { content: e.target.value })
              }
              onBlur={() => setIsEditingInline(false)}
              className="w-full bg-slate-900 text-slate-100 border border-indigo-500 rounded p-2 outline-none text-base"
            />
          ) : (
            <p
              onDoubleClick={() => !isPreview && setIsEditingInline(true)}
              className={classNameStr}
            >
              {node.content || "Paragraph text content goes here..."}
            </p>
          );

        case "badge":
          return (
            <span className={classNameStr}>{node.content || "Badge Tag"}</span>
          );

        case "button":
          return (
            <button type="button" className={classNameStr}>
              {node.content || "Button"}
            </button>
          );

        case "input":
          return (
            <input
              type="text"
              readOnly={!isPreview}
              placeholder={node.placeholder || "Type here..."}
              className={classNameStr}
            />
          );

        // Image — with file upload overlay on selection
        case "image": {
          const objectFitClass = node.styles.objectFit || "object-cover";
          return (
            <div
              className={`relative group/img overflow-hidden ${classNameStr}`}
            >
              {node.src ? (
                <img
                  src={node.src}
                  alt={node.name}
                  className={`w-full h-full ${objectFitClass} pointer-events-none transition-all block`}
                />
              ) : (
                <div className="w-full h-full min-h-[160px] border-2 border-dashed border-slate-700/80 bg-slate-900/60 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs space-y-2 p-6">
                  <Upload className="w-6 h-6 text-indigo-400" />
                  <span className="font-semibold text-slate-300">
                    Empty Image Frame
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Click to Upload Image File
                  </span>
                </div>
              )}
              {!isPreview && isSelected && (
                <label className="absolute inset-0 bg-indigo-950/60 backdrop-blur-xs opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-xs font-semibold rounded cursor-pointer transition-opacity z-10">
                  <span className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                    <Upload className="w-4 h-4" /> Change / Upload Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result)
                            updateNodeProps(node.id, {
                              src: ev.target.result as string,
                            });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          );
        }

        case "link":
          return (
            <a
              href={node.href || "#"}
              onClick={(e) => e.preventDefault()}
              className={classNameStr}
            >
              {node.content || "Hyperlink"}
            </a>
          );

        default:
          return (
            <div className={classNameStr}>
              {node.content || childrenContent}
            </div>
          );
      }
    };

    // ── Final wrapper (adds selection outline + floating toolbar) ──────────
    return (
      <div
        id={node.id}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group/node ${outlineStyle} ${isDragOver ? "ring-2 ring-indigo-500 ring-dashed bg-indigo-500/10 transition-all" : ""}`}
      >
        {/* Box Model Inspector pill — shows type name + spacing values */}
        {boxInspectorEnabled && (isSelected || isHovered) && !isPreview && (
          <div className="absolute -top-6 left-0 px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-mono font-bold rounded-md shadow-lg z-40 pointer-events-none flex items-center gap-1.5 border border-emerald-400/60 animate-in fade-in duration-100">
            <span className="text-emerald-200">&lt;{node.type}&gt;</span>
            <span className="truncate max-w-[120px]">{node.name}</span>
            {node.styles.padding && (
              <span className="text-[8px] bg-emerald-800/80 px-1 rounded font-normal">
                p: {node.styles.padding}
              </span>
            )}
            {node.styles.margin && (
              <span className="text-[8px] bg-amber-700/80 px-1 rounded font-normal">
                m: {node.styles.margin}
              </span>
            )}
          </div>
        )}

        {/* Floating draggable selection toolbar */}
        {isSelected && !isPreview && !isRoot && (
          <div
            style={{
              transform: `translate(${currentToolbarOffset.x}px, ${currentToolbarOffset.y}px)`,
            }}
            className="absolute top-0 left-0 z-[9999] flex items-center space-x-1 px-2.5 py-1 bg-indigo-600 backdrop-blur-md text-white rounded-xl shadow-2xl text-xs font-sans font-semibold select-none border border-indigo-400/50 animate-in fade-in zoom-in-95 duration-100 shrink-0"
          >
            {/* Drag handle */}
            <div
              onMouseDown={handleToolbarMouseDown}
              onTouchStart={handleToolbarMouseDown}
              className="flex items-center gap-1 cursor-grab active:cursor-grabbing pr-1.5 border-r border-indigo-400/50 hover:text-indigo-200 transition-colors"
              title="Drag to reposition toolbar"
            >
              <GripVertical className="w-3.5 h-3.5 text-indigo-200" />
              <span className="text-[11px] font-mono font-bold tracking-tight">
                {node.name}
              </span>
            </div>

            {/* Move Up */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveNodeOrder(node.id, "up");
              }}
              className="p-1 hover:bg-indigo-500 rounded transition-colors cursor-pointer"
              title="Move Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            {/* Move Down */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveNodeOrder(node.id, "down");
              }}
              className="p-1 hover:bg-indigo-500 rounded transition-colors cursor-pointer"
              title="Move Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {/* Select Parent */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                selectParentNode(node.id);
              }}
              className="p-1 hover:bg-indigo-500 rounded transition-colors cursor-pointer"
              title="Select parent container"
            >
              <CornerUpLeft className="w-3.5 h-3.5" />
            </button>
            {/* Duplicate */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateNode(node.id);
              }}
              className="p-1 hover:bg-indigo-500 rounded transition-colors cursor-pointer"
              title="Duplicate node"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNode(node.id);
              }}
              className="p-1 hover:bg-red-500 rounded transition-colors text-rose-200 cursor-pointer"
              title="Delete node"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {renderInnerComponent()}
      </div>
    );
  },
);

CanvasNodeRenderer.displayName = "CanvasNodeRenderer";

