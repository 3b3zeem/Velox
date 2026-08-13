/**
 * Canvas.tsx
 * ─────────────────────────────────────────────────────────────
 * Central design canvas area.
 *
 * Features:
 *   • Floating Interactive Breadcrumbs Bar
 *   • Smart Quick Alignment & Spacing Toolbar
 *   • AI Copy & Real Content Filler Button
 *   • Responsive Viewport & Device Frame Simulator (iPhone 15 Pro Notch, iPad, Laptop)
 *   • Device Orientation Switcher (Portrait 📱 ↔ Landscape 📲)
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from "react";
import { useBuilderStore } from "../../store/useBuilderStore";
import { CanvasNodeRenderer } from "./CanvasNodeRenderer";
import {
  ChevronRight,
  Layers,
  Box,
  RotateCw,
} from "lucide-react";

export const Canvas: React.FC = () => {
  const {
    rootNode,
    viewMode,
    addNode,
    setSelectedNodeId,
    selectedNodeId,
    studioTheme,
    getBreadcrumbs,
  } = useBuilderStore();

  const isLight = studioTheme === "light";
  const breadcrumbs = getBreadcrumbs();

  // Device Simulator state
  const [isLandscape, setIsLandscape] = useState(false);

  // Viewport framing classes
  const getViewportWidthClass = () => {
    const frameBorderColor = isLight
      ? "border-slate-300/90 shadow-slate-400/30"
      : "border-slate-800 shadow-black/80";
    switch (viewMode) {
      case "mobile":
        return isLandscape
          ? `w-[667px] max-w-[calc(100%-1rem)] min-h-[375px] shadow-2xl rounded-[32px] overflow-visible border-[10px] ${frameBorderColor} my-4 shrink-0 transition-all duration-300 relative`
          : `w-[375px] max-w-[calc(100%-1rem)] min-h-[667px] shadow-2xl rounded-[40px] overflow-visible border-[12px] ${frameBorderColor} my-4 shrink-0 transition-all duration-300 relative`;
      case "tablet":
        return isLandscape
          ? `w-[1024px] max-w-[calc(100%-1rem)] min-h-[768px] shadow-2xl rounded-[28px] overflow-visible border-[8px] ${frameBorderColor} my-4 shrink-0 transition-all duration-300 relative`
          : `w-[768px] max-w-[calc(100%-1rem)] min-h-[1024px] shadow-2xl rounded-[28px] overflow-visible border-[8px] ${frameBorderColor} my-4 shrink-0 transition-all duration-300 relative`;
      case "preview":
        return "w-full min-h-full border-none rounded-none my-0 overflow-hidden";
      case "desktop":
      default:
        return `w-full max-w-[1240px] min-h-[800px] rounded-2xl overflow-visible border ${frameBorderColor} shadow-2xl my-4 shrink-0 transition-all duration-300 relative`;
    }
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const paletteNodeJson = e.dataTransfer.getData("application/json");
    if (paletteNodeJson) {
      try {
        const newNodePayload = JSON.parse(paletteNodeJson);
        addNode(rootNode.id, newNodePayload);
      } catch (err) {
        console.error("Failed to parse dropped palette item:", err);
      }
    }
  };

  return (
    <main
      onClick={() => setSelectedNodeId(rootNode.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleRootDrop}
      className={`flex-1 flex flex-col items-center p-3 sm:p-5 md:p-6 overflow-y-auto relative select-none scroll-smooth transition-colors duration-200 ${
        isLight ? "bg-dot-pattern-light" : "bg-dot-pattern-dark"
      }`}
    >
      {/* TOP FLOATING TOOLBAR: BREADCRUMBS & DEVICE ROTATE TOGGLE */}
      {viewMode !== "preview" && (
        <div className="flex flex-wrap items-center justify-center gap-2 z-20 max-w-full">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md transition-all ${
                isLight
                  ? "bg-white/90 border-slate-300/80 text-slate-700 shadow-slate-200/50"
                  : "bg-slate-900/90 border-slate-800 text-slate-300 shadow-black/40"
              }`}
            >
              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 uppercase tracking-wider pl-1">
                <Layers className="w-3 h-3" /> Path:
              </span>
              {breadcrumbs.map((item, idx) => {
                const isSelected = item.id === selectedNodeId;
                return (
                  <React.Fragment key={`crumb-${item.id}`}>
                    {idx > 0 && (
                      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
                    <button
                      onClick={() => setSelectedNodeId(item.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer truncate max-w-[120px] ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-sm font-bold scale-105"
                          : isLight
                            ? "hover:bg-slate-200/70 text-slate-600"
                            : "hover:bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Box
                        className={`w-3 h-3 ${isSelected ? "text-white" : "text-indigo-400"}`}
                      />
                      <span className="truncate">{item.name}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* DEVICE ORIENTATION ROTATE TOGGLE (MOBILE / TABLET ONLY) */}
          {(viewMode === "mobile" || viewMode === "tablet") && (
            <button
              onClick={() => setIsLandscape(!isLandscape)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md text-xs font-semibold cursor-pointer transition-all ${
                isLight
                  ? "bg-white/90 border-slate-300 text-slate-700 hover:bg-slate-100"
                  : "bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800"
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
              {isLandscape ? "Landscape (📲)" : "Portrait (📱)"}
            </button>
          )}
        </div>
      )}

      {/* CANVAS VIEWPORT CONTAINER WITH REALISTIC DEVICE FRAMES */}
      {viewMode === "split" ? (
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 my-4 z-10 overflow-x-auto pb-4">
          {/* DESKTOP FRAME */}
          <div className="flex flex-col items-center w-full lg:w-[800px] shrink-0">
            <span
              className={`text-[10px] font-bold font-mono tracking-wider mb-2 px-3 py-1 rounded-full border shadow-sm ${
                isLight
                  ? "bg-white text-slate-700 border-slate-300"
                  : "bg-slate-900 text-slate-300 border-slate-800"
              }`}
            >
              DESKTOP VIEW (800px)
            </span>
            <div
              className={`w-full min-h-[750px] rounded-2xl overflow-visible border shadow-2xl transition-all duration-300 ${
                isLight
                  ? "bg-white border-slate-300"
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              <CanvasNodeRenderer node={rootNode} isRoot />
            </div>
          </div>

          {/* MOBILE FRAME */}
          <div className="flex flex-col items-center w-[375px] shrink-0">
            <span
              className={`text-[10px] font-bold font-mono tracking-wider mb-2 px-3 py-1 rounded-full border shadow-sm ${
                isLight
                  ? "bg-white text-slate-700 border-slate-300"
                  : "bg-slate-900 text-slate-300 border-slate-800"
              }`}
            >
              MOBILE VIEW (375px)
            </span>
            <div
              className={`w-full min-h-[667px] rounded-[40px] border-[12px] overflow-visible shadow-2xl transition-all duration-300 relative ${
                isLight
                  ? "bg-white border-slate-300"
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              {/* iPhone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 dark:bg-black rounded-b-xl z-30" />
              <CanvasNodeRenderer node={rootNode} isRoot isMobileView />
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`z-10 ${getViewportWidthClass()} ${isLight ? "bg-white" : "bg-slate-900"}`}
        >
          {/* Real iPhone Notch for Mobile Viewport */}
          {viewMode === "mobile" && !isLandscape && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 dark:bg-black rounded-b-2xl z-30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
            </div>
          )}

          <CanvasNodeRenderer
            node={rootNode}
            isRoot
            isMobileView={viewMode === "mobile"}
          />
        </div>
      )}
    </main>
  );
};
