/**
 * Responsive navbar renderer.
 * Shows desktop links on wider widths and a collapsible menu on smaller widths.
 */

import React, { useState } from "react";
import { Menu, X, MoreVertical, Grid, Send } from "lucide-react";
import type { CanvasNode } from "../../types/builder";

interface MobileNavbarRendererProps {
  node: CanvasNode;
  renderChild: (childNode: CanvasNode) => React.ReactNode;
}

export const MobileNavbarRenderer: React.FC<MobileNavbarRendererProps> = ({
  node,
  renderChild,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const childrenNodes = node.children || [];

  const findAllButtons = (nodes: CanvasNode[]): CanvasNode[] => {
    let buttons: CanvasNode[] = [];
    for (const currentNode of nodes) {
      if (currentNode.type === "button") {
        buttons.push(currentNode);
      } else if (currentNode.children?.length) {
        buttons = buttons.concat(findAllButtons(currentNode.children));
      }
    }
    return buttons;
  };

  const allButtons = findAllButtons(childrenNodes);
  const ctaButton =
    allButtons.find((candidate) => {
      const lowerName = candidate.name.toLowerCase();
      return (
        lowerName.includes("cta") ||
        lowerName.includes("action") ||
        lowerName.includes("talk") ||
        lowerName.includes("contact") ||
        lowerName.includes("start") ||
        lowerName.includes("get")
      );
    }) || allButtons[0];

  const logoChild =
    childrenNodes.find(
      (child) =>
        !child.isContainer &&
        (child.type === "heading" ||
          child.type === "text" ||
          child.name.toLowerCase().includes("logo") ||
          child.name.toLowerCase().includes("brand")),
    ) ||
    childrenNodes.find((child) => !child.isContainer) ||
    childrenNodes[0];

  const navGroupChild = childrenNodes.find(
    (child) =>
      child.isContainer &&
      child !== logoChild &&
      (child.name.toLowerCase().includes("link") ||
        child.name.toLowerCase().includes("nav")),
  );

  const directLinks = childrenNodes.filter(
    (child) => child !== logoChild && child.type !== "button" && child !== navGroupChild,
  );

  const navItemsToRender = navGroupChild?.children?.length
    ? navGroupChild.children
    : directLinks;

  const activeBg = node.mobileMenuBg || node.styles.backgroundColor;
  const isHexOrRgb = activeBg && (activeBg.startsWith("#") || activeBg.startsWith("rgb"));
  const containerBgStyle = isHexOrRgb ? { backgroundColor: activeBg } : undefined;
  const containerBgClass =
    !isHexOrRgb && activeBg
      ? activeBg
      : activeBg
        ? ""
        : "bg-slate-900 dark:bg-slate-950";

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

  const isBtnHex = customBtnBg && (customBtnBg.startsWith("#") || customBtnBg.startsWith("rgb"));
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
      <div className="w-full flex items-center justify-between gap-3 px-4 py-3 min-h-[56px] border-b border-white/10">
        <div className="flex items-center text-left min-w-0 shrink-0">
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

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-6 min-w-0">
          {navItemsToRender.map((childNode) => (
            <div key={childNode.id} className="text-slate-100 font-medium text-xs whitespace-nowrap">
              {renderChild(childNode)}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {ctaButton && mobileCtaMode === "in_menu" && (
            <div className="hidden md:block shrink-0">
              {renderChild(ctaButton)}
            </div>
          )}

          {ctaButton && mobileCtaMode === "top_compact" && (
            <div className="hidden md:block shrink-0 max-w-[160px] whitespace-nowrap overflow-hidden">
              {renderChild(ctaButton)}
            </div>
          )}

          {ctaButton && mobileCtaMode === "top_icon" && (
            <>
              <div className="hidden md:block shrink-0">
                {renderChild(ctaButton)}
              </div>
              <button
                type="button"
                className="md:hidden w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                title={ctaButton.content || "Action"}
              >
                <Send className="w-4 h-4" />
              </button>
            </>
          )}

          {ctaButton && mobileCtaMode === "hide" && (
            <div className="hidden md:block shrink-0">
              {renderChild(ctaButton)}
            </div>
          )}

          <button
            type="button"
            style={btnStyleAttr}
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className={`md:hidden p-2.5 ${shapeClass} border transition-all duration-300 cursor-pointer shadow-xs active:scale-90 flex items-center justify-center ${btnClassAttr}`}
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

      <div
        style={isHexOrRgb ? { backgroundColor: activeBg } : undefined}
        className={`md:hidden w-full px-4 border-t border-white/10 backdrop-blur-md transition-all duration-300 ease-in-out origin-top overflow-hidden ${
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
