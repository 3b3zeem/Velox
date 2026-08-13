/**
 * stylePresets.ts
 * ─────────────────────────────────────────────────────────────
 * All static preset arrays and color palettes used by StyleControls.
 *
 * Why a separate file?
 *   StyleControls.tsx was 1 456 lines. The bulk of that was data, not logic.
 *   Moving the data here keeps StyleControls focused on rendering & wiring.
 * ─────────────────────────────────────────────────────────────
 */

import type { NodeStyles } from "../../types/builder";

// ─── Shared type for one-click full preset cards ───────────────────────────
export interface PresetItem {
  name: string;
  /** Tailwind classes applied to the clickable preview badge */
  badgeClass: string;
  styles: Partial<NodeStyles>;
  /** When set, triggers a full recursive theme cascade instead of a flat style patch */
  themeKey?: "indigo" | "darkLuxe" | "clean" | "mint" | "rose" | "glass";
}

// ─── Hover motion / scale presets ─────────────────────────────────────────
export const HOVER_MOTION_PRESETS = [
  { name: "None", value: "" },
  { name: "Zoom In", value: "hover:scale-105" },
  { name: "Zoom Out", value: "hover:scale-95" },
  { name: "Float Up", value: "hover:-translate-y-1.5" },
  { name: "Push Down", value: "hover:translate-y-1.5" },
  { name: "Tilt", value: "hover:rotate-1" },
];

export const HOVER_BG_PRESETS = [
  { name: "None", value: "" },
  { name: "Indigo Hover", value: "hover:bg-indigo-600" },
  { name: "Dark Luxe Hover", value: "hover:bg-slate-900" },
  { name: "Emerald Hover", value: "hover:bg-emerald-600" },
  { name: "Rose Hover", value: "hover:bg-rose-600" },
  { name: "Cyan Hover", value: "hover:bg-cyan-500" },
  { name: "White Hover", value: "hover:bg-white" },
  { name: "Custom Color", value: "custom" },
];

export const HOVER_TEXT_PRESETS = [
  { name: "None", value: "" },
  { name: "Underline", value: "hover:underline" },
  { name: "Indigo Text", value: "hover:text-indigo-500" },
  { name: "Cyan Text", value: "hover:text-cyan-400" },
  { name: "Amber Text", value: "hover:text-amber-400" },
  { name: "White Text", value: "hover:text-white" },
  { name: "Dark Text", value: "hover:text-slate-900" },
  { name: "Custom Text Color", value: "custom" },
];

export const HOVER_GLOW_PRESETS = [
  { name: "None", value: "" },
  { name: "Elevate Shadow", value: "hover:shadow-2xl" },
  { name: "Indigo Glow", value: "hover:shadow-lg hover:shadow-indigo-500/40" },
  {
    name: "Emerald Glow",
    value: "hover:shadow-lg hover:shadow-emerald-500/40",
  },
  { name: "Rose Glow", value: "hover:shadow-lg hover:shadow-rose-500/40" },
  { name: "Cyan Glow", value: "hover:shadow-lg hover:shadow-cyan-500/40" },
];

// ─── ::before / ::after pseudo-hover animation presets ────────────────────
export const PSEUDO_HOVER_PRESETS = [
  { name: "None", value: "" },
  {
    name: "Center Expand Underline (خط سفلـي يمتد من المنتصف)",
    value: "effect-underline-expand",
  },
  {
    name: "Slide Left Underline (خط سفلـي يتسحب من اليسار)",
    value: "effect-underline-slide-left",
  },
  {
    name: "Vertical Left Indicator (مؤشر جانبي عمودي أنيق)",
    value: "effect-left-border-indicator",
  },
  {
    name: "Dual Parallel Lines (خطين متوازيين أعلى وأسفل)",
    value: "effect-top-bottom-lines",
  },
  {
    name: "Light Beam Sweep (شعاع مسح ضوئي ناعم)",
    value: "effect-shine-light",
  },
  {
    name: "Soft Pill Background (غيمة خلفية هادئة حول النص)",
    value: "effect-soft-pill-glow",
  },
  {
    name: "Glowing Neon Underline (خط نيون متوهج برّاق)",
    value: "effect-glowing-underline",
  },
];

export const PSEUDO_COLOR_PRESETS = [
  { name: "Indigo", value: "pseudo-indigo", color: "#6366f1" },
  { name: "Emerald", value: "pseudo-emerald", color: "#10b981" },
  { name: "Rose", value: "pseudo-rose", color: "#f43f5e" },
  { name: "Amber", value: "pseudo-amber", color: "#f59e0b" },
  { name: "Cyan", value: "pseudo-cyan", color: "#06b6d4" },
  { name: "Purple", value: "pseudo-purple", color: "#a855f7" },
  { name: "Pink", value: "pseudo-pink", color: "#ec4899" },
  { name: "Gold", value: "pseudo-gold", color: "#eab308" },
  { name: "White", value: "pseudo-white", color: "#ffffff" },
  { name: "Slate", value: "pseudo-slate", color: "#64748b" },
];

// ─── Font families ─────────────────────────────────────────────────────────
export const ARABIC_FONTS = [
  { name: "Cairo (عربي عصري وبسيط)", value: "font-cairo" },
  { name: "Tajawal (عربي أنيق وهندسي)", value: "font-tajawal" },
  { name: "Almarai (عربي نظيف مريح)", value: "font-almarai" },
  { name: "Alexandria (عربي فخم للمجلات)", value: "font-alexandria" },
  { name: "Readex Pro (عربي حديث للغاية)", value: "font-readex" },
  { name: "Amiri (عربي كلاسيكي صحفي)", value: "font-amiri" },
  { name: "Changa (عربي عريض للعناوين)", value: "font-changa" },
  { name: "Mada (عربي تقني وسلس)", value: "font-mada" },
  { name: "Kufam (كوفي حديث وأنيق)", value: "font-kufam" },
  { name: "Aref Ruqaa (رقعة عربي أصيل)", value: "font-ruqaa" },
  { name: "Vazirmatn (عربي رقمي واضح)", value: "font-vazir" },
  { name: "El Messiri (عربي انسيابي فاخر)", value: "font-messiri" },
];

export const ENGLISH_FONTS = [
  { name: "Inter (Modern UI Standard)", value: "font-inter" },
  { name: "Outfit (Bold Geometric)", value: "font-outfit" },
  { name: "Plus Jakarta Sans (Sleek SaaS)", value: "font-jakarta" },
  { name: "Poppins (Friendly Round)", value: "font-poppins" },
  { name: "Roboto (Google UI Classic)", value: "font-roboto" },
  { name: "Montserrat (Strong Branding)", value: "font-montserrat" },
  { name: "Playfair Display (Luxury Editorial)", value: "font-playfair" },
  { name: "Syne (Avant-Garde Trendy)", value: "font-syne" },
  { name: "Fira Code (Developer Monospace)", value: "font-firacode" },
  { name: "Cinzel (High-End Serif)", value: "font-cinzel" },
  { name: "Bebas Neue (Tall Impact)", value: "font-bebas" },
  { name: "Space Grotesk (Cyberpunk)", value: "font-space" },
];

// ─── Unsplash quick-pick image gallery ────────────────────────────────────
export const UNSPLASH_PRESETS = [
  {
    name: "Modern Tech",
    category: "Tech",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Cyber Workspace",
    category: "Tech",
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Minimal Architecture",
    category: "Design",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "3D Wave Art",
    category: "Abstract",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Executive Portrait",
    category: "People",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Tech Lead Avatar",
    category: "People",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Designer Avatar",
    category: "People",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
];

// ─── Visual spacing quick-pick ─────────────────────────────────────────────
export const SPACING_PRESETS = [
  { name: "Compact", padding: "px-3 py-1.5" },
  { name: "Normal", padding: "px-5 py-3" },
  { name: "Spacious", padding: "px-8 py-6" },
  { name: "Hero Box", padding: "px-12 py-10" },
];

// ─── One-click full style presets (per element type) ──────────────────────
export const BUTTON_PRESETS: PresetItem[] = [
  {
    name: "Indigo Gradient",
    badgeClass:
      "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30",
    styles: {
      bgGradient: "bg-gradient-to-r from-indigo-600 to-purple-600",
      textColor: "text-white",
      borderRadius: "rounded-xl",
      boxShadow: "shadow-lg shadow-indigo-600/30",
      padding: "px-6 py-3",
      fontWeight: "font-semibold",
    },
  },
  {
    name: "Dark Luxe Pill",
    badgeClass: "bg-slate-950 text-white border border-slate-800",
    styles: {
      backgroundColor: "bg-slate-950",
      textColor: "text-white",
      borderWidth: "border",
      borderColor: "border-slate-800",
      borderRadius: "rounded-full",
      boxShadow: "shadow-md",
      padding: "px-6 py-3",
      fontWeight: "font-medium",
    },
  },
  {
    name: "Neon Emerald",
    badgeClass: "bg-emerald-600 text-white shadow-md shadow-emerald-600/20",
    styles: {
      backgroundColor: "bg-emerald-600",
      textColor: "text-white",
      borderRadius: "rounded-xl",
      boxShadow: "shadow-lg shadow-emerald-600/20",
      padding: "px-6 py-3",
      fontWeight: "font-semibold",
    },
  },
  {
    name: "Clean Light",
    badgeClass: "bg-white text-slate-800 border border-slate-300",
    styles: {
      backgroundColor: "bg-white",
      textColor: "text-slate-800",
      borderWidth: "border",
      borderColor: "border-slate-300",
      borderRadius: "rounded-xl",
      boxShadow: "shadow-sm",
      padding: "px-6 py-3",
      fontWeight: "font-medium",
    },
  },
  {
    name: "Crimson Glow",
    badgeClass: "bg-rose-600 text-white shadow-md shadow-rose-600/30",
    styles: {
      backgroundColor: "bg-rose-600",
      textColor: "text-white",
      borderRadius: "rounded-xl",
      boxShadow: "shadow-lg shadow-rose-600/30",
      padding: "px-6 py-3",
      fontWeight: "font-semibold",
    },
  },
  {
    name: "Cyan Cyber",
    badgeClass: "bg-cyan-500 text-slate-950 font-bold",
    styles: {
      backgroundColor: "bg-cyan-500",
      textColor: "text-slate-950",
      borderRadius: "rounded-xl",
      boxShadow: "shadow-md shadow-cyan-500/20",
      padding: "px-6 py-3",
      fontWeight: "font-bold",
    },
  },
];

export const TEXT_PRESETS: PresetItem[] = [
  {
    name: "Gradient Hero",
    badgeClass:
      "bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 text-white font-extrabold",
    styles: {
      bgGradient:
        "bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 bg-clip-text",
      textColor: "text-transparent",
      fontSize: "text-4xl md:text-6xl",
      fontWeight: "font-black",
    },
  },
  {
    name: "Cyber Cyan",
    badgeClass: "bg-cyan-500 text-slate-950 font-bold",
    styles: {
      textColor: "text-cyan-500",
      fontSize: "text-3xl",
      fontWeight: "font-extrabold",
    },
  },
  {
    name: "Dark Midnight",
    badgeClass: "bg-slate-950 text-white font-semibold",
    styles: {
      textColor: "text-slate-900",
      fontSize: "text-2xl",
      fontWeight: "font-bold",
    },
  },
  {
    name: "Emerald Mint",
    badgeClass: "bg-emerald-600 text-white font-bold",
    styles: {
      textColor: "text-emerald-500",
      fontSize: "text-xl",
      fontWeight: "font-bold",
    },
  },
  {
    name: "Muted Subtitle",
    badgeClass: "bg-slate-200 text-slate-700 font-medium",
    styles: {
      textColor: "text-slate-500",
      fontSize: "text-sm",
      fontWeight: "font-medium",
    },
  },
  {
    name: "Crimson Alert",
    badgeClass: "bg-rose-600 text-white font-bold",
    styles: {
      textColor: "text-rose-600",
      fontSize: "text-lg",
      fontWeight: "font-bold",
    },
  },
];

export const CONTAINER_PRESETS: PresetItem[] = [
  {
    name: "Indigo Primary",
    badgeClass: "bg-indigo-600 text-white",
    themeKey: "indigo",
    styles: {
      backgroundColor: "bg-indigo-600",
      textColor: "text-white",
      borderRadius: "rounded-xl",
      boxShadow: "shadow-lg shadow-indigo-600/30",
    },
  },
  {
    name: "Dark Luxe Box",
    badgeClass: "bg-slate-950 text-white border border-slate-800",
    themeKey: "darkLuxe",
    styles: {
      backgroundColor: "bg-slate-950",
      textColor: "text-slate-100",
      borderWidth: "border",
      borderColor: "border-slate-800",
      borderRadius: "rounded-xl",
    },
  },
  {
    name: "Clean Elevation",
    badgeClass: "bg-white text-slate-900 border border-slate-200",
    themeKey: "clean",
    styles: {
      backgroundColor: "bg-white",
      textColor: "text-slate-900",
      borderWidth: "border",
      borderColor: "border-slate-200",
      borderRadius: "rounded-xl",
      boxShadow: "shadow-md",
    },
  },
  {
    name: "Mint Fresh Card",
    badgeClass: "bg-emerald-600 text-white",
    themeKey: "mint",
    styles: {
      backgroundColor: "bg-emerald-600",
      textColor: "text-white",
      borderRadius: "rounded-xl",
      boxShadow: "shadow-lg shadow-emerald-600/20",
    },
  },
  {
    name: "Rose Accent Box",
    badgeClass: "bg-rose-600 text-white",
    themeKey: "rose",
    styles: {
      backgroundColor: "bg-rose-600",
      textColor: "text-white",
      borderRadius: "rounded-xl",
      boxShadow: "shadow-lg shadow-rose-600/20",
    },
  },
  {
    name: "Soft Glass Box",
    badgeClass: "bg-slate-100 text-slate-800 border border-slate-300",
    themeKey: "glass",
    styles: {
      backgroundColor: "bg-slate-100",
      textColor: "text-slate-800",
      borderWidth: "border",
      borderColor: "border-slate-300/80",
      borderRadius: "rounded-2xl",
    },
  },
];

export const BADGE_PRESETS: PresetItem[] = [
  {
    name: "Indigo Pill",
    badgeClass: "bg-indigo-600 text-white font-mono",
    styles: {
      backgroundColor: "bg-indigo-500/10",
      textColor: "text-indigo-600",
      borderWidth: "border",
      borderColor: "border-indigo-500/20",
      borderRadius: "rounded-full",
      padding: "px-3 py-1",
      fontSize: "text-xs",
      fontWeight: "font-semibold",
    },
  },
  {
    name: "Live Status",
    badgeClass: "bg-emerald-600 text-white font-semibold",
    styles: {
      backgroundColor: "bg-emerald-500/10",
      textColor: "text-emerald-600",
      borderWidth: "border",
      borderColor: "border-emerald-500/20",
      borderRadius: "rounded-full",
      padding: "px-3 py-1",
      fontSize: "text-xs",
      fontWeight: "font-medium",
    },
  },
  {
    name: "Hot Rose",
    badgeClass: "bg-rose-600 text-white font-bold",
    styles: {
      backgroundColor: "bg-rose-500/10",
      textColor: "text-rose-600",
      borderWidth: "border",
      borderColor: "border-rose-500/20",
      borderRadius: "rounded-full",
      padding: "px-3 py-1",
      fontSize: "text-xs",
      fontWeight: "font-bold",
    },
  },
];

// ─── Color swatches (used for both background & text pickers) ──────────────
export const COLOR_SWATCHES = [
  {
    name: "Dark Slate",
    bg: "bg-slate-900",
    text: "text-slate-900",
    border: "border-slate-800",
    dot: "bg-slate-900",
  },
  {
    name: "Muted Gray",
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-300",
    dot: "bg-slate-400",
  },
  {
    name: "Pure White",
    bg: "bg-white",
    text: "text-white",
    border: "border-slate-200",
    dot: "bg-white border border-slate-300",
  },
  {
    name: "Indigo",
    bg: "bg-indigo-600",
    text: "text-indigo-600",
    border: "border-indigo-500",
    dot: "bg-indigo-600",
  },
  {
    name: "Purple",
    bg: "bg-purple-600",
    text: "text-purple-600",
    border: "border-purple-500",
    dot: "bg-purple-600",
  },
  {
    name: "Emerald",
    bg: "bg-emerald-600",
    text: "text-emerald-600",
    border: "border-emerald-500",
    dot: "bg-emerald-600",
  },
  {
    name: "Rose",
    bg: "bg-rose-600",
    text: "text-rose-600",
    border: "border-rose-500",
    dot: "bg-rose-600",
  },
  {
    name: "Amber",
    bg: "bg-amber-500",
    text: "text-amber-600",
    border: "border-amber-400",
    dot: "bg-amber-500",
  },
  {
    name: "Cyan",
    bg: "bg-cyan-500",
    text: "text-cyan-600",
    border: "border-cyan-400",
    dot: "bg-cyan-500",
  },
];

// ─── Gradient presets (for gradient text + gradient backgrounds) ───────────
export const GRADIENT_PRESETS = [
  {
    name: "Indigo -> Purple",
    class: "bg-gradient-to-r from-indigo-600 to-purple-600",
  },
  { name: "Cyan -> Blue", class: "bg-gradient-to-r from-cyan-500 to-blue-600" },
  {
    name: "Emerald -> Teal",
    class: "bg-gradient-to-r from-emerald-500 to-teal-700",
  },
  {
    name: "Rose -> Amber",
    class: "bg-gradient-to-r from-rose-500 to-amber-500",
  },
  {
    name: "Midnight",
    class: "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900",
  },
];
