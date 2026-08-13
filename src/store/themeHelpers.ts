/**
 * themeHelpers.ts
 * ─────────────────────────────────────────────────────────────
 * Recursive theme cascade logic — the engine behind
 * "Apply Theme Preset" (both per-element and global canvas).
 *
 * HOW IT WORKS:
 *   recursiveThemeCascade() walks the entire CanvasNode subtree and
 *   assigns new style values based on the chosen themeKey:
 *
 *     isTargetRoot = true  → applies root container styles (bg, shadow, border…)
 *     isTargetRoot = false → applies child-specific overrides based on node.type
 *                            (headings get title color, buttons get accent bg, etc.)
 *
 * Available theme keys:
 *   'indigo'   — vivid purple-indigo SaaS look
 *   'darkLuxe' — premium dark background with slate text
 *   'clean'    — pure white minimal card
 *   'mint'     — deep emerald dark tone
 *   'rose'     — deep rose/crimson dark tone
 *   'glass'    — frosted glass light surface
 * ─────────────────────────────────────────────────────────────
 */

import type { CanvasNode, NodeStyles } from "../types/builder";

export type ThemeKey =
  | "indigo"
  | "darkLuxe"
  | "clean"
  | "mint"
  | "rose"
  | "glass";

// ── Root container overrides (top-level of selected subtree) ───────────────
const ROOT_THEME_STYLES: Record<ThemeKey, Partial<NodeStyles>> = {
  indigo: {
    backgroundColor: "bg-indigo-600",
    textColor: "text-white",
    bgGradient: "",
    borderColor: "border-indigo-500",
    boxShadow: "shadow-xl shadow-indigo-600/30",
  },
  darkLuxe: {
    backgroundColor: "bg-slate-950",
    textColor: "text-slate-100",
    bgGradient: "",
    borderWidth: "border",
    borderColor: "border-slate-800",
    boxShadow: "shadow-2xl shadow-black/80",
  },
  clean: {
    backgroundColor: "bg-white",
    textColor: "text-slate-900",
    bgGradient: "",
    borderWidth: "border",
    borderColor: "border-slate-200",
    boxShadow: "shadow-md shadow-slate-200/50",
  },
  mint: {
    backgroundColor: "bg-emerald-950",
    textColor: "text-emerald-50",
    bgGradient: "",
    borderWidth: "border",
    borderColor: "border-emerald-800",
    boxShadow: "shadow-xl shadow-emerald-950/50",
  },
  rose: {
    backgroundColor: "bg-rose-950",
    textColor: "text-rose-50",
    bgGradient: "",
    borderWidth: "border",
    borderColor: "border-rose-800",
    boxShadow: "shadow-xl shadow-rose-950/50",
  },
  glass: {
    backgroundColor: "bg-slate-100/90",
    textColor: "text-slate-800",
    bgGradient: "",
    borderWidth: "border",
    borderColor: "border-slate-300/80",
    boxShadow: "shadow-lg",
  },
};

// ── Text / heading color overrides per theme ───────────────────────────────
const TEXT_THEME_COLORS: Record<ThemeKey, { heading: string; text: string }> = {
  indigo: { heading: "text-white", text: "text-indigo-100" },
  darkLuxe: { heading: "text-slate-100", text: "text-slate-400" },
  clean: { heading: "text-slate-900", text: "text-slate-600" },
  mint: { heading: "text-emerald-100", text: "text-emerald-300" },
  rose: { heading: "text-rose-100", text: "text-rose-300" },
  glass: { heading: "text-slate-900", text: "text-slate-600" },
};

// ── Button overrides per theme ─────────────────────────────────────────────
const BUTTON_THEME_STYLES: Record<ThemeKey, Partial<NodeStyles>> = {
  indigo: {
    backgroundColor: "bg-white",
    textColor: "text-indigo-600",
    fontWeight: "font-bold",
    boxShadow: "shadow-md",
  },
  darkLuxe: {
    backgroundColor: "bg-indigo-600",
    textColor: "text-white",
    fontWeight: "font-semibold",
    boxShadow: "shadow-lg shadow-indigo-600/30",
  },
  clean: {
    backgroundColor: "bg-indigo-600",
    textColor: "text-white",
    fontWeight: "font-semibold",
    boxShadow: "shadow-sm",
  },
  mint: {
    backgroundColor: "bg-emerald-500",
    textColor: "text-slate-950",
    fontWeight: "font-bold",
    boxShadow: "shadow-lg shadow-emerald-500/30",
  },
  rose: {
    backgroundColor: "bg-rose-500",
    textColor: "text-white",
    fontWeight: "font-bold",
    boxShadow: "shadow-lg shadow-rose-500/30",
  },
  glass: {
    backgroundColor: "bg-indigo-600",
    textColor: "text-white",
    fontWeight: "font-medium",
  },
};

// ── Badge overrides per theme ──────────────────────────────────────────────
const BADGE_THEME_STYLES: Record<ThemeKey, Partial<NodeStyles>> = {
  indigo: {
    backgroundColor: "bg-white/20",
    textColor: "text-white",
    borderColor: "border-white/30",
  },
  darkLuxe: {
    backgroundColor: "bg-indigo-500/20",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-500/30",
  },
  clean: {
    backgroundColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-200",
  },
  mint: {
    backgroundColor: "bg-emerald-500/20",
    textColor: "text-emerald-300",
    borderColor: "border-emerald-500/30",
  },
  rose: {
    backgroundColor: "bg-rose-500/20",
    textColor: "text-rose-300",
    borderColor: "border-rose-500/30",
  },
  glass: {
    backgroundColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-200",
  },
};

// ── Nested container overrides per theme ───────────────────────────────────
const NESTED_CONTAINER_STYLES: Record<ThemeKey, Partial<NodeStyles>> = {
  indigo: {
    backgroundColor: "bg-indigo-700/60",
    borderColor: "border-indigo-500/50",
  },
  darkLuxe: {
    backgroundColor: "bg-slate-900/90",
    borderColor: "border-slate-800",
  },
  clean: { backgroundColor: "bg-slate-50", borderColor: "border-slate-200" },
  mint: {
    backgroundColor: "bg-emerald-900/60",
    borderColor: "border-emerald-700/50",
  },
  rose: {
    backgroundColor: "bg-rose-900/60",
    borderColor: "border-rose-700/50",
  },
  glass: {
    backgroundColor: "bg-slate-100",
    borderColor: "border-slate-300/80",
  },
};

// ─── Public cascade function ────────────────────────────────────────────────
/**
 * Walk the subtree rooted at `node` and apply theme-appropriate styles
 * to every node based on its type.
 *
 * @param node           - Root of the subtree to theme
 * @param themeKey       - Which theme to apply
 * @param isTargetRoot   - true only for the very top node (applies root container styles)
 */
export const recursiveThemeCascade = (
  node: CanvasNode,
  themeKey: ThemeKey,
  isTargetRoot: boolean = false,
): CanvasNode => {
  let updatedStyles: Partial<NodeStyles> = { ...node.styles };

  if (isTargetRoot) {
    // Top-level container: apply background, text, shadow, border
    const rootOverride = ROOT_THEME_STYLES[themeKey];
    updatedStyles = {
      ...updatedStyles,
      ...rootOverride,
      borderRadius: updatedStyles.borderRadius || "rounded-2xl",
    };
  } else {
    // Child nodes: theme based on their type
    if (["heading", "text", "link"].includes(node.type)) {
      const colors = TEXT_THEME_COLORS[themeKey];
      updatedStyles.textColor =
        node.type === "heading" ? colors.heading : colors.text;
      updatedStyles.bgGradient = "";
    } else if (node.type === "button") {
      updatedStyles = { ...updatedStyles, ...BUTTON_THEME_STYLES[themeKey] };
    } else if (node.type === "badge") {
      updatedStyles = { ...updatedStyles, ...BADGE_THEME_STYLES[themeKey] };
    } else if (["card", "container"].includes(node.type)) {
      updatedStyles = {
        ...updatedStyles,
        ...NESTED_CONTAINER_STYLES[themeKey],
      };
    }
  }

  const updatedChildren = node.children
    ? node.children.map((child) =>
        recursiveThemeCascade(child, themeKey, false),
      )
    : undefined;

  return { ...node, styles: updatedStyles, children: updatedChildren };
};
