/**
 * StyleControls.tsx
 * ─────────────────────────────────────────────────────────────
 * The inspector panel shown in the Right Sidebar → "Styles" tab.
 *
 * This file acts as an **orchestrator**: it decides WHICH sub-panels
 * to show and handles the shared context (breakpoint targeting,
 * copy/paste styles). The actual UI for each concern lives in its
 * own focused file:
 *
 *   stylePresets.ts          — all static data / preset arrays
 *   HoverEffectsPanel.tsx    — motion, color, shadow, pseudo-FX
 *   LayoutTypographyPanel.tsx — display, flex/grid, text, spacing, borders
 *
 * Sections rendered here (in order):
 *   0. Copy / Paste Styles bar
 *   0.5 Target Breakpoint selector (All / Mobile / Desktop)
 *   1. One-click full-style preset cards
 *   1.5 Contextual quick palette (text colors, fonts, gradients, images, etc.)
 *   2. Hover Effects Panel
 *   3. Layout & Typography Panel
 *   4. "Show All Advanced Controls" toggle
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from "react";
import type { NodeStyles, ComponentType } from "../../types/builder";
import {
  Palette,
  Sparkles,
  Check,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Copy,
  ClipboardCheck,
  Type,
  Image as ImageIcon,
  BoxSelect,
  Smartphone,
  Monitor,
  Globe,
} from "lucide-react";
import { useBuilderStore } from "../../store/useBuilderStore";

// ── Sub-panels & shared data ───────────────────────────────────────────────
import { HoverEffectsPanel } from "./HoverEffectsPanel";
import { LayoutTypographyPanel } from "./LayoutTypographyPanel";
import {
  type PresetItem,
  ARABIC_FONTS,
  ENGLISH_FONTS,
  UNSPLASH_PRESETS,
  SPACING_PRESETS,
  GRADIENT_PRESETS,
  COLOR_SWATCHES,
  BUTTON_PRESETS,
  TEXT_PRESETS,
  CONTAINER_PRESETS,
  BADGE_PRESETS,
} from "./stylePresets";

// ── Component Props ────────────────────────────────────────────────────────
interface StyleControlsProps {
  nodeId?: string;
  componentType?: ComponentType;
  isContainer?: boolean;
  styles: NodeStyles;
  onChange: (newStyles: Partial<NodeStyles>) => void;
}

export const StyleControls: React.FC<StyleControlsProps> = ({
  nodeId,
  componentType,
  isContainer,
  styles,
  onChange,
}) => {
  // ── Store subscriptions ────────────────────────────────────────────────
  const isLight = useBuilderStore((s) => s.studioTheme) === "light";
  const applyFullThemePreset = useBuilderStore((s) => s.applyFullThemePreset);
  const copyStyles = useBuilderStore((s) => s.copyStyles);
  const pasteStyles = useBuilderStore((s) => s.pasteStyles);
  const copiedStyles = useBuilderStore((s) => s.copiedStyles);
  const updateNodeProps = useBuilderStore((s) => s.updateNodeProps);
  const targetBreakpoint = useBuilderStore((s) => s.targetBreakpoint);
  const setTargetBreakpoint = useBuilderStore((s) => s.setTargetBreakpoint);

  // ── Local state ────────────────────────────────────────────────────────
  const [showAllAdvanced, setShowAllAdvanced] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  // ── Element-type flags ─────────────────────────────────────────────────
  const isTextElement = ["heading", "text", "link"].includes(
    componentType || "",
  );
  const isButton = componentType === "button";
  const isBadge = componentType === "badge";
  const isButtonOrBadge = isButton || isBadge;
  const isLayoutElement =
    isContainer ||
    ["container", "section", "grid", "card", "hero", "pricingCard"].includes(
      componentType || "",
    );
  const isImageElement = componentType === "image";
  const isDividerElement = componentType === "divider";

  // Pick the right preset list for this element type
  let activePresets: PresetItem[] = CONTAINER_PRESETS;
  if (isButton) activePresets = BUTTON_PRESETS;
  else if (isTextElement) activePresets = TEXT_PRESETS;
  else if (isBadge) activePresets = BADGE_PRESETS;

  // ── Shared CSS class strings (derived from current theme) ─────────────
  const cardBgClass = isLight
    ? "bg-slate-50 border-slate-200"
    : "bg-slate-950/60 border-slate-800/80";
  const labelClass = isLight ? "text-slate-600 font-medium" : "text-slate-400";
  const headerLabelClass = isLight
    ? "text-slate-500 font-bold"
    : "text-slate-400 font-bold";
  const selectClass = isLight
    ? "bg-white border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 text-xs font-medium"
    : "bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 text-xs font-medium";
  const btnGroupBg = isLight
    ? "bg-slate-200/70 border border-slate-300"
    : "bg-slate-900 border border-slate-800";

  // ── Responsive breakpoint-aware onChange ──────────────────────────────
  /**
   * When a breakpoint target (Mobile / Desktop) is active, style changes
   * are automatically prefixed (max-md: or md:) and appended to customClasses
   * instead of touching the base style properties.
   */
  const handleStyleChange = (newStyles: Partial<NodeStyles>) => {
    if (targetBreakpoint === "all") {
      onChange(newStyles);
      return;
    }

    const currentCustom = styles.customClasses || "";
    const prefix = targetBreakpoint === "mobile" ? "max-md:" : "md:";

    const classesToAdd: string[] = [];
    Object.entries(newStyles).forEach(([_, value]) => {
      if (!value || typeof value !== "string") return;
      const splitClasses = value.split(" ").map((cls) => {
        const cleanCls = cls.replace(/^(max-md:|md:|sm:|lg:)/, "");
        return `${prefix}${cleanCls}`;
      });
      classesToAdd.push(...splitClasses);
    });

    const updatedCustomClasses = [currentCustom, ...classesToAdd]
      .filter(Boolean)
      .join(" ");
    onChange({ ...newStyles, customClasses: updatedCustomClasses });
  };

  // ── Copy / paste helpers ───────────────────────────────────────────────
  const handleCopy = () => {
    if (nodeId) {
      copyStyles(nodeId);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    }
  };

  const handlePaste = () => {
    if (nodeId && copiedStyles) pasteStyles(nodeId);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      className={`flex flex-col space-y-4 text-xs select-none ${isLight ? "text-slate-800" : "text-slate-200"}`}
    >
      {/* ─────────────────────────────────────────────────────
          0. COPY / PASTE STYLES BAR
          Lets users clone visual styles between elements.
      ───────────────────────────────────────────────────── */}
      <div
        className={`flex items-center justify-between p-2 rounded-xl border ${cardBgClass}`}
      >
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shadow-sm ${
              justCopied
                ? "bg-emerald-600 text-white"
                : isLight
                  ? "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  : "bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800"
            }`}
            title="Copy all styles from this element"
          >
            {justCopied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-indigo-500" />
            )}
            {justCopied ? "Styles Copied!" : "Copy Style"}
          </button>

          <button
            onClick={handlePaste}
            disabled={!copiedStyles}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              copiedStyles
                ? "bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer shadow-sm"
                : "opacity-40 cursor-not-allowed bg-slate-300 dark:bg-slate-800 text-slate-500"
            }`}
            title={
              copiedStyles
                ? "Paste copied styles onto this element"
                : "No style copied yet"
            }
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            Paste Style
          </button>
        </div>

        {copiedStyles && (
          <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
            Ready to Paste
          </span>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────
          0.5 TARGET BREAKPOINT SELECTOR
          Controls whether style changes apply globally,
          mobile-only (max-md:), or desktop-only (md:).
      ───────────────────────────────────────────────────── */}
      <div className={`p-2.5 rounded-xl border space-y-2 ${cardBgClass}`}>
        <div className="flex items-center justify-between">
          <span
            className={`uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${headerLabelClass}`}
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
            Target Breakpoint
          </span>
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
              targetBreakpoint === "mobile"
                ? "bg-amber-500/20 text-amber-500"
                : targetBreakpoint === "desktop"
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "bg-emerald-500/20 text-emerald-500"
            }`}
          >
            {targetBreakpoint === "mobile"
              ? "Mobile (max-md)"
              : targetBreakpoint === "desktop"
                ? "Desktop (md:)"
                : "All (Base)"}
          </span>
        </div>

        <div
          className={`grid grid-cols-3 gap-1 p-1 rounded-lg border ${btnGroupBg}`}
        >
          {[
            {
              label: "All (Base)",
              value: "all" as const,
              icon: <Globe className="w-3 h-3" />,
              active: "bg-indigo-600",
            },
            {
              label: "Mobile",
              value: "mobile" as const,
              icon: <Smartphone className="w-3 h-3" />,
              active: "bg-amber-600",
            },
            {
              label: "Desktop",
              value: "desktop" as const,
              icon: <Monitor className="w-3 h-3" />,
              active: "bg-indigo-600",
            },
          ].map(({ label, value, icon, active }) => (
            <button
              key={value}
              onClick={() => setTargetBreakpoint(value)}
              className={`py-1 px-2 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
                targetBreakpoint === value
                  ? `${active} text-white shadow-sm`
                  : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-400 hover:text-white"
              }`}
              title={`Apply styles for ${label}`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          1. ONE-CLICK FULL PRESET CARDS
          Each card applies a complete, coherent visual style
          (colors + shadows + border radius) in one click.
      ───────────────────────────────────────────────────── */}
      <div className={`space-y-2.5 p-3 rounded-xl border ${cardBgClass}`}>
        <div className="flex items-center justify-between">
          <span
            className={`uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${headerLabelClass}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            1-Click Full Presets
          </span>
          <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-mono font-medium">
            Instant Apply
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {activePresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                if (preset.themeKey && nodeId) {
                  applyFullThemePreset(nodeId, preset.themeKey);
                } else {
                  handleStyleChange(preset.styles);
                }
              }}
              className={`p-2.5 rounded-xl text-[11px] font-semibold text-center truncate transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-sm border border-black/5 ${preset.badgeClass}`}
              title={`Apply ${preset.name} Full Style`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          1.5 CONTEXTUAL QUICK PALETTE
          Shows smart quick-picks tailored to element type:
            • Text/Button → color swatches + fonts + gradients
            • Image       → Unsplash gallery
            • All         → visual spacing presets
      ───────────────────────────────────────────────────── */}
      <div className={`space-y-3 p-3 rounded-xl border ${cardBgClass}`}>
        <div className="flex items-center justify-between">
          <span
            className={`uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${headerLabelClass}`}
          >
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            {isTextElement && "Typography & Colors"}
            {isLayoutElement && !isTextElement && "Container Style Presets"}
            {isButtonOrBadge && "Button & Badge Styles"}
            {isImageElement && "Image Fit & Framing"}
            {isDividerElement && "Line Styling"}
            {!isTextElement &&
              !isLayoutElement &&
              !isButtonOrBadge &&
              !isImageElement &&
              !isDividerElement &&
              "Quick Swatches"}
          </span>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono font-medium">
            {componentType || "Element"}
          </span>
        </div>

        {/* Text / Button — color swatches + font picker + gradient clips */}
        {(isTextElement || isButtonOrBadge) && (
          <div className="space-y-2.5">
            {/* Text Color Swatches */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={`text-[11px] ${labelClass}`}>
                  Text Color Swatches
                </label>
                <span className="text-[9px] font-mono text-slate-400">
                  {styles.textColor || "default"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_SWATCHES.map((swatch) => {
                  const isSelected = styles.textColor === swatch.text;
                  return (
                    <button
                      key={`text-${swatch.name}`}
                      onClick={() => onChange({ textColor: swatch.text })}
                      className={`w-6 h-6 rounded-full ${swatch.dot} transition-all transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-sm relative ${
                        isSelected
                          ? "ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-900"
                          : ""
                      }`}
                      title={`Text Color: ${swatch.name}`}
                    >
                      {isSelected && (
                        <Check className="w-3 h-3 text-indigo-400 stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Family Picker */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <label
                className={`text-[11px] flex items-center gap-1 mb-1.5 ${labelClass}`}
              >
                <Type className="w-3.5 h-3.5 text-indigo-500" /> Font Family /
                عائلة الخط
              </label>
              <select
                value={styles.fontFamily || "font-inter"}
                onChange={(e) => onChange({ fontFamily: e.target.value })}
                className={`w-full ${selectClass}`}
              >
                <optgroup label="🇸🇦 الخطوط العربية (Arabic Fonts)">
                  {ARABIC_FONTS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🇬🇧 English Fonts">
                  {ENGLISH_FONTS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Gradient Text Clip */}
            <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
              <label
                className={`text-[11px] flex items-center gap-1 mb-1.5 ${labelClass}`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" /> Gradient Text
                Effect
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {GRADIENT_PRESETS.map((grad) => (
                  <button
                    key={`text-grad-${grad.name}`}
                    onClick={() =>
                      onChange({
                        bgGradient: `${grad.class} bg-clip-text`,
                        textColor: "text-transparent",
                      })
                    }
                    className={`h-6 rounded-lg ${grad.class} transition-all transform hover:scale-105 cursor-pointer shadow-sm border border-white/20`}
                    title={`Gradient Text: ${grad.name}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image — Unsplash gallery */}
        {isImageElement && (
          <div className="space-y-2 pt-2">
            <label
              className={`text-[11px] flex items-center gap-1.5 ${labelClass}`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> 1-Click
              Unsplash Gallery
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {UNSPLASH_PRESETS.map((item) => (
                <button
                  key={item.name}
                  onClick={() =>
                    nodeId && updateNodeProps(nodeId, { src: item.url })
                  }
                  className="relative aspect-square rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 hover:scale-105 transition-transform group cursor-pointer shadow-sm"
                  title={`Set image to ${item.name}`}
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-0.5 text-[8px] font-bold text-white text-center">
                    {item.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Visual Spacing Presets (shown for all types) */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              className={`text-[11px] flex items-center gap-1 ${labelClass}`}
            >
              <BoxSelect className="w-3.5 h-3.5 text-emerald-500" /> Visual
              Spacing (Padding)
            </label>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {SPACING_PRESETS.map((sp) => (
              <button
                key={sp.name}
                onClick={() => onChange({ padding: sp.padding })}
                className={`py-1 px-1.5 rounded text-[10px] font-medium border text-center transition-all cursor-pointer ${
                  styles.padding === sp.padding
                    ? "bg-emerald-600 text-white border-emerald-500 font-bold"
                    : isLight
                      ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {sp.name}
              </button>
            ))}
          </div>
        </div>

        {/* Container / Button background color swatches */}
        {(isLayoutElement || isButtonOrBadge) && (
          <div className="space-y-2.5">
            <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex justify-between items-center mb-1">
                <label className={`text-[11px] ${labelClass}`}>
                  Background Color Swatches
                </label>
                <span className="text-[9px] font-mono text-slate-400">
                  {styles.backgroundColor || "transparent"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Transparent option */}
                <button
                  onClick={() =>
                    onChange({ backgroundColor: "bg-transparent" })
                  }
                  className={`w-6 h-6 rounded-full border border-dashed border-slate-400 transition-all transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                    styles.backgroundColor === "bg-transparent" ||
                    !styles.backgroundColor
                      ? "ring-2 ring-indigo-500"
                      : ""
                  }`}
                  title="Transparent"
                >
                  <span className="text-[9px] text-slate-400 font-mono">
                    N/A
                  </span>
                </button>
                {COLOR_SWATCHES.map((swatch) => {
                  const isSelected = styles.backgroundColor === swatch.bg;
                  return (
                    <button
                      key={`bg-${swatch.name}`}
                      onClick={() => onChange({ backgroundColor: swatch.bg })}
                      className={`w-6 h-6 rounded-full ${swatch.dot} transition-all transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-sm ${
                        isSelected
                          ? "ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-900"
                          : ""
                      }`}
                      title={`Bg: ${swatch.name}`}
                    >
                      {isSelected && (
                        <Check className="w-3 h-3 text-indigo-400 stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Image object-fit quick controls */}
        {isImageElement && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Object Fit</label>
              <div className={`flex p-0.5 rounded-lg ${btnGroupBg}`}>
                {["object-cover", "object-contain", "object-fill"].map(
                  (fit) => (
                    <button
                      key={fit}
                      onClick={() => onChange({ objectFit: fit })}
                      className={`px-2 py-1 rounded-md text-[10px] capitalize transition-colors ${
                        styles.objectFit === fit ||
                        (!styles.objectFit && fit === "object-cover")
                          ? "bg-indigo-600 text-white font-semibold"
                          : isLight
                            ? "text-slate-600"
                            : "text-slate-400"
                      }`}
                    >
                      {fit.replace("object-", "")}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────
          2. HOVER EFFECTS PANEL
          Extracted into HoverEffectsPanel.tsx for clarity.
      ───────────────────────────────────────────────────── */}
      <HoverEffectsPanel
        nodeId={nodeId}
        styles={styles}
        onChange={onChange}
        isLight={isLight}
        labelClass={labelClass}
        headerLabelClass={headerLabelClass}
        selectClass={selectClass}
        cardBgClass={cardBgClass}
      />

      {/* ─────────────────────────────────────────────────────
          3. LAYOUT, TYPOGRAPHY, SPACING & BORDERS
          Extracted into LayoutTypographyPanel.tsx for clarity.
          handleStyleChange is passed so breakpoint prefixing works.
      ───────────────────────────────────────────────────── */}
      <LayoutTypographyPanel
        styles={styles}
        componentType={componentType}
        isContainer={isContainer}
        showAllAdvanced={showAllAdvanced}
        onChange={handleStyleChange}
        isLight={isLight}
        labelClass={labelClass}
        headerLabelClass={headerLabelClass}
        selectClass={selectClass}
        cardBgClass={cardBgClass}
        btnGroupBg={btnGroupBg}
      />

      {/* ─────────────────────────────────────────────────────
          4. SHOW ALL ADVANCED CONTROLS TOGGLE
          When on, shows layout / typography sections even for
          element types where they are normally hidden.
      ───────────────────────────────────────────────────── */}
      <button
        onClick={() => setShowAllAdvanced(!showAllAdvanced)}
        className={`w-full py-2 px-3 rounded-xl border text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          isLight
            ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300"
            : "bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800"
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>
          {showAllAdvanced
            ? "Hide Unrelated Controls"
            : "Show All Advanced Controls"}
        </span>
        {showAllAdvanced ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};
