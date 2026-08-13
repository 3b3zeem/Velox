/**
 * MobileNavbarRenderer.tsx
 * ─────────────────────────────────────────────────────────────
 * Renders a smart mobile hamburger navbar for any container node
 * that is detected as a "navbar" by its name (see detection below).
 *
 * This component was extracted from CanvasNodeRenderer.tsx because
 * the mobile navbar logic alone was ~180 lines — enough to deserve
 * its own file so the main renderer stays focused on element types.
 *
 * WHAT IT DOES:
 *   • Shows brand/logo on the left, hamburger button on the right
 *   • CTA button can appear: in the dropdown menu, in the top bar
 *     (compact text or icon-only), or be hidden — controlled by
 *     node.mobileCtaMode
 *   • Hamburger button shape, icon, and color are customisable via
 *     node.mobileMenuBtnStyle / mobileMenuBtnIcon / mobileMenuBtnBg
 *   • Dropdown open/close uses smooth CSS max-height animation
 *   • Per-link hover effect controlled by node.mobileHoverEffect
 *
 * DETECTION: CanvasNodeRenderer decides to use this component when:
 *   - node.type is 'container', 'card', or 'section'
 *   - node.name contains 'navbar', 'navigation', 'header', or equals 'nav'
 *   - AND the canvas is in mobile / split-mobile view
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from "react";
import { Menu, X, MoreVertical, Grid, Send } from "lucide-react";
import type { CanvasNode } from "../../types/builder";

interface MobileNavbarRendererProps {
  node: CanvasNode;
  /** Passed down so children can render recursively in mobile mode. */
  renderChild: (childNode: CanvasNode) => React.ReactNode;
}

export const MobileNavbarRenderer: React.FC<MobileNavbarRendererProps> = ({
  node,
  renderChild,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const childrenNodes = node.children || [];

  // ── Find CTA button (recursive search) ────────────────────────────────
  const findAllButtons = (nodes: CanvasNode[]): CanvasNode[] => {
    let btns: CanvasNode[] = [];
    for (const n of nodes) {
      if (n.type === "button") {
        btns.push(n);
      } else if (n.children?.length) {
        btns = btns.concat(findAllButtons(n.children));
      }
    }
    return btns;
  };

  const allButtons = findAllButtons(childrenNodes);
  const ctaButton =
    allButtons.find((c) => {
      const n = c.name.toLowerCase();
      return (
        n.includes("cta") ||
        n.includes("action") ||
        n.includes("talk") ||
        n.includes("contact") ||
        n.includes("start") ||
        n.includes("get")
      );
    }) || allButtons[0];

  // ── Find brand / logo element ──────────────────────────────────────────
  const logoChild =
    childrenNodes.find(
      (c) =>
        !c.isContainer &&
        (c.type === "heading" ||
          c.type === "text" ||
          c.name.toLowerCase().includes("logo") ||
          c.name.toLowerCase().includes("brand")),
    ) ||
    childrenNodes.find((c) => !c.isContainer) ||
    childrenNodes[0];

  // ── Find nav links container or direct links ───────────────────────────
  const navGroupChild = childrenNodes.find(
    (c) =>
      c.isContainer &&
      c !== logoChild &&
      (c.name.toLowerCase().includes("link") ||
        c.name.toLowerCase().includes("nav")),
  );
  const directLinks = childrenNodes.filter(
    (c) => c !== logoChild && c.type !== "button" && c !== navGroupChild,
  );
  const navItemsToRender = navGroupChild?.children?.length
    ? navGroupChild.children
    : directLinks;

  // ── Background color handling (supports both hex and Tailwind classes) ─
  const activeBg = node.mobileMenuBg || node.styles.backgroundColor;
  const isHexOrRgb =
    activeBg && (activeBg.startsWith("#") || activeBg.startsWith("rgb"));
  const containerBgStyle = isHexOrRgb
    ? { backgroundColor: activeBg }
    : undefined;
  const containerBgClass =
    !isHexOrRgb && activeBg
      ? activeBg
      : activeBg
        ? ""
        : "bg-slate-900 dark:bg-slate-950";

  // ── CTA alignment ──────────────────────────────────────────────────────
  const mobileCtaMode = node.mobileCtaMode || "in_menu";
  const mobileCtaAlign = node.mobileCtaAlign || "full";
  const ctaAlignClass =
    mobileCtaAlign === "center"
      ? "w-auto max-w-[240px] mx-auto text-center"
      : mobileCtaAlign === "left"
        ? "w-auto max-w-[240px] mr-auto"
        : mobileCtaAlign === "right"
          ? "w-auto max-w-[240px] ml-auto"
          : "w-full";

  // ── Hover effect for dropdown links ────────────────────────────────────
  const hoverEffect = node.mobileHoverEffect || "subtle";
  const hoverClass =
    hoverEffect === "indigo"
      ? "hover:bg-indigo-600/30 hover:text-indigo-300 hover:scale-[1.02] hover:shadow-md hover:shadow-indigo-500/20"
      : hoverEffect === "emerald"
        ? "hover:bg-emerald-600/30 hover:text-emerald-300 hover:scale-[1.02] hover:shadow-md hover:shadow-emerald-500/20"
        : hoverEffect === "pill"
          ? "hover:bg-white hover:text-slate-900 hover:font-bold hover:scale-[1.02] hover:shadow-lg"
          : hoverEffect === "lift"
            ? "hover:-translate-y-0.5 hover:shadow-lg hover:bg-white/20 hover:text-white"
            : "hover:bg-white/10 hover:text-white";

  // ── Hamburger button appearance ────────────────────────────────────────
  const btnStyle = node.mobileMenuBtnStyle || "rounded";
  const btnIcon = node.mobileMenuBtnIcon || "hamburger";
  const customBtnBg = node.mobileMenuBtnBg;

  const shapeClass =
    btnStyle === "circle"
      ? "rounded-full"
      : btnStyle === "square"
        ? "rounded-none"
        : btnStyle === "ghost"
          ? "rounded-xl border-none shadow-none"
          : "rounded-xl";

  const isBtnHex =
    customBtnBg &&
    (customBtnBg.startsWith("#") || customBtnBg.startsWith("rgb"));
  const btnStyleAttr = isBtnHex ? { backgroundColor: customBtnBg } : undefined;
  const btnClassAttr =
    !isBtnHex && customBtnBg
      ? customBtnBg
      : isMenuOpen
        ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/25"
        : "bg-white/10 hover:bg-white/20 text-slate-100 border-white/20";

  return (
    <div
      style={containerBgStyle}
      className={`w-full relative z-30 rounded-2xl border border-slate-700/50 ${containerBgClass} backdrop-blur-md shadow-lg transition-all overflow-hidden my-1`}
    >
      {/* ── Top Bar: Logo + CTA + Hamburger ── */}
      <div className="w-full flex items-center justify-between px-4 py-3 min-h-[56px] border-b border-white/10">
        {/* Logo / Brand (forced left) */}
        <div className="flex items-center text-left min-w-0 flex-1 pr-2 whitespace-nowrap overflow-hidden">
          {logoChild ? (
            <div className="text-left text-base font-bold truncate tracking-tight text-white whitespace-nowrap">
              {renderChild(logoChild)}
            </div>
          ) : (
            <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
              Brand Logo
            </span>
          )}
        </div>

        {/* Right: optional compact CTA + hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          {ctaButton && mobileCtaMode === "top_compact" && (
            <div className="shrink-0 max-w-[120px] whitespace-nowrap overflow-hidden">
              <button
                type="button"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-500/25 transition-all truncate cursor-pointer active:scale-95"
              >
                {ctaButton.content || "Action"}
              </button>
            </div>
          )}

          {ctaButton && mobileCtaMode === "top_icon" && (
            <button
              type="button"
              className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
              title={ctaButton.content || "Action"}
            >
              <Send className="w-4 h-4" />
            </button>
          )}

          {/* Hamburger / Close button */}
          <button
            type="button"
            style={btnStyleAttr}
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className={`p-2.5 ${shapeClass} border transition-all duration-300 cursor-pointer shadow-xs active:scale-90 flex items-center justify-center ${btnClassAttr}`}
            title={isMenuOpen ? "Close Menu" : "Open Menu"}
          >
            <div
              className={`transition-transform duration-300 transform-gpu ${isMenuOpen ? "rotate-90 scale-110 text-white" : "rotate-0 scale-100"}`}
            >
              {isMenuOpen ? (
                <X className="w-4 h-4" />
              ) : btnIcon === "dots" ? (
                <MoreVertical className="w-4 h-4" />
              ) : btnIcon === "grid" ? (
                <Grid className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* ── Dropdown Menu (smooth open / close) ── */}
      <div
        style={isHexOrRgb ? { backgroundColor: activeBg } : undefined}
        className={`w-full px-4 border-t border-white/10 backdrop-blur-md transition-all duration-300 ease-in-out origin-top overflow-hidden ${
          isMenuOpen
            ? "max-h-[600px] opacity-100 pt-3 pb-4 translate-y-0 scale-y-100"
            : "max-h-0 opacity-0 pt-0 pb-0 -translate-y-2 scale-y-95 pointer-events-none"
        } ${!isHexOrRgb && activeBg ? activeBg : "bg-black/10"}`}
      >
        <div className="w-full border-t border-white/10 my-0.5" />

        <div className="flex flex-col space-y-1.5 w-full">
          {navItemsToRender.map((childNode) => (
            <div
              key={childNode.id}
              className={`w-full text-center py-2.5 px-3 rounded-xl text-slate-100 font-medium transition-all duration-200 text-xs ${hoverClass}`}
            >
              {renderChild(childNode)}
            </div>
          ))}
        </div>

        {/* CTA in dropdown (when mode is 'in_menu') */}
        {ctaButton && (mobileCtaMode === "in_menu" || !mobileCtaMode) && (
          <div className="pt-3 border-t border-white/10 w-full">
            <div className={`${ctaAlignClass} transition-all`}>
              {renderChild(ctaButton)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

