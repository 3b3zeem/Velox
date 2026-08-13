import React, { useState } from 'react';
import type { NodeStyles, ComponentType } from '../../types/builder';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
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
  MousePointerClick,
  RotateCcw,
  Smartphone,
  Monitor,
  Globe,
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';

interface StyleControlsProps {
  nodeId?: string;
  componentType?: ComponentType;
  isContainer?: boolean;
  styles: NodeStyles;
  onChange: (newStyles: Partial<NodeStyles>) => void;
}

interface PresetItem {
  name: string;
  badgeClass: string;
  styles: Partial<NodeStyles>;
  themeKey?: 'indigo' | 'darkLuxe' | 'clean' | 'mint' | 'rose' | 'glass';
}

const HOVER_MOTION_PRESETS = [
  { name: 'None', value: '' },
  { name: 'Zoom In', value: 'hover:scale-105' },
  { name: 'Zoom Out', value: 'hover:scale-95' },
  { name: 'Float Up', value: 'hover:-translate-y-1.5' },
  { name: 'Push Down', value: 'hover:translate-y-1.5' },
  { name: 'Tilt', value: 'hover:rotate-1' },
];

const HOVER_BG_PRESETS = [
  { name: 'None', value: '' },
  { name: 'Indigo Hover', value: 'hover:bg-indigo-600' },
  { name: 'Dark Luxe Hover', value: 'hover:bg-slate-900' },
  { name: 'Emerald Hover', value: 'hover:bg-emerald-600' },
  { name: 'Rose Hover', value: 'hover:bg-rose-600' },
  { name: 'Cyan Hover', value: 'hover:bg-cyan-500' },
  { name: 'White Hover', value: 'hover:bg-white' },
  { name: 'Custom Color', value: 'custom' },
];

const HOVER_TEXT_PRESETS = [
  { name: 'None', value: '' },
  { name: 'Underline', value: 'hover:underline' },
  { name: 'Indigo Text', value: 'hover:text-indigo-500' },
  { name: 'Cyan Text', value: 'hover:text-cyan-400' },
  { name: 'Amber Text', value: 'hover:text-amber-400' },
  { name: 'White Text', value: 'hover:text-white' },
  { name: 'Dark Text', value: 'hover:text-slate-900' },
  { name: 'Custom Text Color', value: 'custom' },
];

const HOVER_GLOW_PRESETS = [
  { name: 'None', value: '' },
  { name: 'Elevate Shadow', value: 'hover:shadow-2xl' },
  { name: 'Indigo Glow', value: 'hover:shadow-lg hover:shadow-indigo-500/40' },
  { name: 'Emerald Glow', value: 'hover:shadow-lg hover:shadow-emerald-500/40' },
  { name: 'Rose Glow', value: 'hover:shadow-lg hover:shadow-rose-500/40' },
  { name: 'Cyan Glow', value: 'hover:shadow-lg hover:shadow-cyan-500/40' },
];

const PSEUDO_HOVER_PRESETS = [
  { name: 'None', value: '' },
  { name: 'Center Expand Underline (خط سفلـي يمتد من المنتصف)', value: 'effect-underline-expand' },
  { name: 'Slide Left Underline (خط سفلـي يتسحب من اليسار)', value: 'effect-underline-slide-left' },
  { name: 'Vertical Left Indicator (مؤشر جانبي عمودي أنيق)', value: 'effect-left-border-indicator' },
  { name: 'Dual Parallel Lines (خطين متوازيين أعلى وأسفل)', value: 'effect-top-bottom-lines' },
  { name: 'Light Beam Sweep (شعاع مسح ضوئي ناعم)', value: 'effect-shine-light' },
  { name: 'Soft Pill Background (غيمة خلفية هادئة حول النص)', value: 'effect-soft-pill-glow' },
  { name: 'Glowing Neon Underline (خط نيون متوهج برّاق)', value: 'effect-glowing-underline' },
];

const PSEUDO_COLOR_PRESETS = [
  { name: 'Indigo', value: 'pseudo-indigo', color: '#6366f1' },
  { name: 'Emerald', value: 'pseudo-emerald', color: '#10b981' },
  { name: 'Rose', value: 'pseudo-rose', color: '#f43f5e' },
  { name: 'Amber', value: 'pseudo-amber', color: '#f59e0b' },
  { name: 'Cyan', value: 'pseudo-cyan', color: '#06b6d4' },
  { name: 'Purple', value: 'pseudo-purple', color: '#a855f7' },
  { name: 'Pink', value: 'pseudo-pink', color: '#ec4899' },
  { name: 'Gold', value: 'pseudo-gold', color: '#eab308' },
  { name: 'White', value: 'pseudo-white', color: '#ffffff' },
  { name: 'Slate', value: 'pseudo-slate', color: '#64748b' },
];

const ARABIC_FONTS = [
  { name: 'Cairo (عربي عصري وبسيط)', value: 'font-cairo' },
  { name: 'Tajawal (عربي أنيق وهندسي)', value: 'font-tajawal' },
  { name: 'Almarai (عربي نظيف مريح)', value: 'font-almarai' },
  { name: 'Alexandria (عربي فخم للمجلات)', value: 'font-alexandria' },
  { name: 'Readex Pro (عربي حديث للغاية)', value: 'font-readex' },
  { name: 'Amiri (عربي كلاسيكي صحفي)', value: 'font-amiri' },
  { name: 'Changa (عربي عريض للعناوين)', value: 'font-changa' },
  { name: 'Mada (عربي تقني وسلس)', value: 'font-mada' },
  { name: 'Kufam (كوفي حديث وأنيق)', value: 'font-kufam' },
  { name: 'Aref Ruqaa (رقعة عربي أصيل)', value: 'font-ruqaa' },
  { name: 'Vazirmatn (عربي رقمي واضح)', value: 'font-vazir' },
  { name: 'El Messiri (عربي انسيابي فاخر)', value: 'font-messiri' },
];

const ENGLISH_FONTS = [
  { name: 'Inter (Modern UI Standard)', value: 'font-inter' },
  { name: 'Outfit (Bold Geometric)', value: 'font-outfit' },
  { name: 'Plus Jakarta Sans (Sleek SaaS)', value: 'font-jakarta' },
  { name: 'Poppins (Friendly Round)', value: 'font-poppins' },
  { name: 'Roboto (Google UI Classic)', value: 'font-roboto' },
  { name: 'Montserrat (Strong Branding)', value: 'font-montserrat' },
  { name: 'Playfair Display (Luxury Editorial)', value: 'font-playfair' },
  { name: 'Syne (Avant-Garde Trendy)', value: 'font-syne' },
  { name: 'Fira Code (Developer Monospace)', value: 'font-firacode' },
  { name: 'Cinzel (High-End Serif)', value: 'font-cinzel' },
  { name: 'Bebas Neue (Tall Impact)', value: 'font-bebas' },
  { name: 'Space Grotesk (Cyberpunk)', value: 'font-space' },
];

const UNSPLASH_PRESETS = [
  { name: 'Modern Tech', category: 'Tech', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cyber Workspace', category: 'Tech', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Minimal Architecture', category: 'Design', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80' },
  { name: '3D Wave Art', category: 'Abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
  { name: 'Executive Portrait', category: 'People', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { name: 'Tech Lead Avatar', category: 'People', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { name: 'Designer Avatar', category: 'People', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
];

const SPACING_PRESETS = [
  { name: 'Compact', padding: 'px-3 py-1.5' },
  { name: 'Normal', padding: 'px-5 py-3' },
  { name: 'Spacious', padding: 'px-8 py-6' },
  { name: 'Hero Box', padding: 'px-12 py-10' },
];

const BUTTON_PRESETS: PresetItem[] = [
  {
    name: 'Indigo Gradient',
    badgeClass: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30',
    styles: { bgGradient: 'bg-gradient-to-r from-indigo-600 to-purple-600', textColor: 'text-white', borderRadius: 'rounded-xl', boxShadow: 'shadow-lg shadow-indigo-600/30', padding: 'px-6 py-3', fontWeight: 'font-semibold' },
  },
  {
    name: 'Dark Luxe Pill',
    badgeClass: 'bg-slate-950 text-white border border-slate-800',
    styles: { backgroundColor: 'bg-slate-950', textColor: 'text-white', borderWidth: 'border', borderColor: 'border-slate-800', borderRadius: 'rounded-full', boxShadow: 'shadow-md', padding: 'px-6 py-3', fontWeight: 'font-medium' },
  },
  {
    name: 'Neon Emerald',
    badgeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20',
    styles: { backgroundColor: 'bg-emerald-600', textColor: 'text-white', borderRadius: 'rounded-xl', boxShadow: 'shadow-lg shadow-emerald-600/20', padding: 'px-6 py-3', fontWeight: 'font-semibold' },
  },
  {
    name: 'Clean Light',
    badgeClass: 'bg-white text-slate-800 border border-slate-300',
    styles: { backgroundColor: 'bg-white', textColor: 'text-slate-800', borderWidth: 'border', borderColor: 'border-slate-300', borderRadius: 'rounded-xl', boxShadow: 'shadow-sm', padding: 'px-6 py-3', fontWeight: 'font-medium' },
  },
  {
    name: 'Crimson Glow',
    badgeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/30',
    styles: { backgroundColor: 'bg-rose-600', textColor: 'text-white', borderRadius: 'rounded-xl', boxShadow: 'shadow-lg shadow-rose-600/30', padding: 'px-6 py-3', fontWeight: 'font-semibold' },
  },
  {
    name: 'Cyan Cyber',
    badgeClass: 'bg-cyan-500 text-slate-950 font-bold',
    styles: { backgroundColor: 'bg-cyan-500', textColor: 'text-slate-950', borderRadius: 'rounded-xl', boxShadow: 'shadow-md shadow-cyan-500/20', padding: 'px-6 py-3', fontWeight: 'font-bold' },
  },
];

const TEXT_PRESETS: PresetItem[] = [
  {
    name: 'Gradient Hero',
    badgeClass: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 text-white font-extrabold',
    styles: { bgGradient: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 bg-clip-text', textColor: 'text-transparent', fontSize: 'text-4xl md:text-6xl', fontWeight: 'font-black' },
  },
  {
    name: 'Cyber Cyan',
    badgeClass: 'bg-cyan-500 text-slate-950 font-bold',
    styles: { textColor: 'text-cyan-500', fontSize: 'text-3xl', fontWeight: 'font-extrabold' },
  },
  {
    name: 'Dark Midnight',
    badgeClass: 'bg-slate-950 text-white font-semibold',
    styles: { textColor: 'text-slate-900', fontSize: 'text-2xl', fontWeight: 'font-bold' },
  },
  {
    name: 'Emerald Mint',
    badgeClass: 'bg-emerald-600 text-white font-bold',
    styles: { textColor: 'text-emerald-500', fontSize: 'text-xl', fontWeight: 'font-bold' },
  },
  {
    name: 'Muted Subtitle',
    badgeClass: 'bg-slate-200 text-slate-700 font-medium',
    styles: { textColor: 'text-slate-500', fontSize: 'text-sm', fontWeight: 'font-medium' },
  },
  {
    name: 'Crimson Alert',
    badgeClass: 'bg-rose-600 text-white font-bold',
    styles: { textColor: 'text-rose-600', fontSize: 'text-lg', fontWeight: 'font-bold' },
  },
];

const CONTAINER_PRESETS: PresetItem[] = [
  {
    name: 'Indigo Primary',
    badgeClass: 'bg-indigo-600 text-white',
    themeKey: 'indigo',
    styles: { backgroundColor: 'bg-indigo-600', textColor: 'text-white', borderRadius: 'rounded-xl', boxShadow: 'shadow-lg shadow-indigo-600/30' },
  },
  {
    name: 'Dark Luxe Box',
    badgeClass: 'bg-slate-950 text-white border border-slate-800',
    themeKey: 'darkLuxe',
    styles: { backgroundColor: 'bg-slate-950', textColor: 'text-slate-100', borderWidth: 'border', borderColor: 'border-slate-800', borderRadius: 'rounded-xl' },
  },
  {
    name: 'Clean Elevation',
    badgeClass: 'bg-white text-slate-900 border border-slate-200',
    themeKey: 'clean',
    styles: { backgroundColor: 'bg-white', textColor: 'text-slate-900', borderWidth: 'border', borderColor: 'border-slate-200', borderRadius: 'rounded-xl', boxShadow: 'shadow-md' },
  },
  {
    name: 'Mint Fresh Card',
    badgeClass: 'bg-emerald-600 text-white',
    themeKey: 'mint',
    styles: { backgroundColor: 'bg-emerald-600', textColor: 'text-white', borderRadius: 'rounded-xl', boxShadow: 'shadow-lg shadow-emerald-600/20' },
  },
  {
    name: 'Rose Accent Box',
    badgeClass: 'bg-rose-600 text-white',
    themeKey: 'rose',
    styles: { backgroundColor: 'bg-rose-600', textColor: 'text-white', borderRadius: 'rounded-xl', boxShadow: 'shadow-lg shadow-rose-600/20' },
  },
  {
    name: 'Soft Glass Box',
    badgeClass: 'bg-slate-100 text-slate-800 border border-slate-300',
    themeKey: 'glass',
    styles: { backgroundColor: 'bg-slate-100', textColor: 'text-slate-800', borderWidth: 'border', borderColor: 'border-slate-300/80', borderRadius: 'rounded-2xl' },
  },
];

const BADGE_PRESETS: PresetItem[] = [
  {
    name: 'Indigo Pill',
    badgeClass: 'bg-indigo-600 text-white font-mono',
    styles: { backgroundColor: 'bg-indigo-500/10', textColor: 'text-indigo-600', borderWidth: 'border', borderColor: 'border-indigo-500/20', borderRadius: 'rounded-full', padding: 'px-3 py-1', fontSize: 'text-xs', fontWeight: 'font-semibold' },
  },
  {
    name: 'Live Status',
    badgeClass: 'bg-emerald-600 text-white font-semibold',
    styles: { backgroundColor: 'bg-emerald-500/10', textColor: 'text-emerald-600', borderWidth: 'border', borderColor: 'border-emerald-500/20', borderRadius: 'rounded-full', padding: 'px-3 py-1', fontSize: 'text-xs', fontWeight: 'font-medium' },
  },
  {
    name: 'Hot Rose',
    badgeClass: 'bg-rose-600 text-white font-bold',
    styles: { backgroundColor: 'bg-rose-500/10', textColor: 'text-rose-600', borderWidth: 'border', borderColor: 'border-rose-500/20', borderRadius: 'rounded-full', padding: 'px-3 py-1', fontSize: 'text-xs', fontWeight: 'font-bold' },
  },
];

const COLOR_SWATCHES = [
  { name: 'Dark Slate', bg: 'bg-slate-900', text: 'text-slate-900', border: 'border-slate-800', dot: 'bg-slate-900' },
  { name: 'Muted Gray', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-300', dot: 'bg-slate-400' },
  { name: 'Pure White', bg: 'bg-white', text: 'text-white', border: 'border-slate-200', dot: 'bg-white border border-slate-300' },
  { name: 'Indigo', bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-500', dot: 'bg-indigo-600' },
  { name: 'Purple', bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-500', dot: 'bg-purple-600' },
  { name: 'Emerald', bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-500', dot: 'bg-emerald-600' },
  { name: 'Rose', bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-500', dot: 'bg-rose-600' },
  { name: 'Amber', bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-400', dot: 'bg-amber-500' },
  { name: 'Cyan', bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-400', dot: 'bg-cyan-500' },
];

const GRADIENT_PRESETS = [
  { name: 'Indigo -> Purple', class: 'bg-gradient-to-r from-indigo-600 to-purple-600' },
  { name: 'Cyan -> Blue', class: 'bg-gradient-to-r from-cyan-500 to-blue-600' },
  { name: 'Emerald -> Teal', class: 'bg-gradient-to-r from-emerald-500 to-teal-700' },
  { name: 'Rose -> Amber', class: 'bg-gradient-to-r from-rose-500 to-amber-500' },
  { name: 'Midnight', class: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900' },
];

export const StyleControls: React.FC<StyleControlsProps> = ({
  nodeId,
  componentType,
  isContainer,
  styles,
  onChange,
}) => {
  const isLight = useBuilderStore((s) => s.studioTheme) === 'light';
  const applyFullThemePreset = useBuilderStore((s) => s.applyFullThemePreset);
  const copyStyles = useBuilderStore((s) => s.copyStyles);
  const pasteStyles = useBuilderStore((s) => s.pasteStyles);
  const copiedStyles = useBuilderStore((s) => s.copiedStyles);
  const updateNodeProps = useBuilderStore((s) => s.updateNodeProps);
  const simulatedHoverNodeId = useBuilderStore((s) => s.simulatedHoverNodeId);
  const setSimulatedHoverNodeId = useBuilderStore((s) => s.setSimulatedHoverNodeId);
  const targetBreakpoint = useBuilderStore((s) => s.targetBreakpoint);
  const setTargetBreakpoint = useBuilderStore((s) => s.setTargetBreakpoint);

  const handleStyleChange = (newStyles: Partial<NodeStyles>) => {
    if (targetBreakpoint === 'all') {
      onChange(newStyles);
      return;
    }

    const currentCustom = styles.customClasses || '';
    const prefix = targetBreakpoint === 'mobile' ? 'max-md:' : 'md:';
    
    const classesToAdd: string[] = [];
    Object.entries(newStyles).forEach(([_, value]) => {
      if (!value || typeof value !== 'string') return;
      const splitClasses = value.split(' ').map((cls) => {
        const cleanCls = cls.replace(/^(max-md:|md:|sm:|lg:)/, '');
        return `${prefix}${cleanCls}`;
      });
      classesToAdd.push(...splitClasses);
    });

    const updatedCustomClasses = [currentCustom, ...classesToAdd].filter(Boolean).join(' ');

    onChange({
      ...newStyles,
      customClasses: updatedCustomClasses,
    });
  };

  const [showAllAdvanced, setShowAllAdvanced] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  // Custom User Saved Hover Presets State (stored in localStorage)
  const [customHoverPresets, setCustomHoverPresets] = useState<Array<{ id: string; name: string; styles: Partial<NodeStyles> }>>(() => {
    try {
      const stored = localStorage.getItem('hippoui_custom_hover_presets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleSaveCustomHoverPreset = () => {
    const presetName = prompt('Enter a name for your custom hover preset:', 'My Glow FX');
    if (!presetName) return;

    const newPreset = {
      id: `hover_preset_${Date.now()}`,
      name: presetName,
      styles: {
        hoverEffect: styles.hoverEffect,
        hoverBg: styles.hoverBg,
        hoverTextColor: styles.hoverTextColor,
        hoverShadow: styles.hoverShadow,
        pseudoHover: styles.pseudoHover,
        pseudoHoverColor: styles.pseudoHoverColor,
        transitionDuration: styles.transitionDuration,
        transitionTiming: styles.transitionTiming,
      },
    };

    const updated = [...customHoverPresets, newPreset];
    setCustomHoverPresets(updated);
    try {
      localStorage.setItem('hippoui_custom_hover_presets', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCustomHoverPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customHoverPresets.filter((p) => p.id !== id);
    setCustomHoverPresets(updated);
    try {
      localStorage.setItem('hippoui_custom_hover_presets', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Determine element nature
  const isTextElement = ['heading', 'text', 'link'].includes(componentType || '');
  const isButton = componentType === 'button';
  const isBadge = componentType === 'badge';
  const isButtonOrBadge = isButton || isBadge;
  const isLayoutElement = isContainer || ['container', 'section', 'grid', 'card', 'hero', 'pricingCard'].includes(componentType || '');
  const isImageElement = componentType === 'image';
  const isDividerElement = componentType === 'divider';

  // Get active preset list for this specific element
  let activePresets = CONTAINER_PRESETS;
  if (isButton) activePresets = BUTTON_PRESETS;
  else if (isTextElement) activePresets = TEXT_PRESETS;
  else if (isBadge) activePresets = BADGE_PRESETS;

  const cardBgClass = isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80';
  const labelClass = isLight ? 'text-slate-600 font-medium' : 'text-slate-400';
  const headerLabelClass = isLight ? 'text-slate-500 font-bold' : 'text-slate-400 font-bold';
  const selectClass = isLight
    ? 'bg-white border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 text-xs font-medium'
    : 'bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 text-xs font-medium';
  const btnGroupBg = isLight ? 'bg-slate-200/70 border border-slate-300' : 'bg-slate-900 border border-slate-800';

  const handleCopy = () => {
    if (nodeId) {
      copyStyles(nodeId);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    }
  };

  const handlePaste = () => {
    if (nodeId && copiedStyles) {
      pasteStyles(nodeId);
    }
  };

  return (
    <div className={`flex flex-col space-y-4 text-xs select-none ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
      
      {/* 0. COPY / PASTE STYLES BAR */}
      <div className={`flex items-center justify-between p-2 rounded-xl border ${cardBgClass}`}>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shadow-sm ${
              justCopied
                ? 'bg-emerald-600 text-white'
                : isLight
                ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                : 'bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800'
            }`}
            title="Copy all styles from selected element"
          >
            {justCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
            {justCopied ? 'Styles Copied!' : 'Copy Style'}
          </button>

          <button
            onClick={handlePaste}
            disabled={!copiedStyles}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              copiedStyles
                ? isLight
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-sm'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer shadow-sm'
                : 'opacity-40 cursor-not-allowed bg-slate-300 dark:bg-slate-800 text-slate-500'
            }`}
            title={copiedStyles ? 'Paste copied styles to selected element' : 'No style copied yet'}
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

      {/* 0.5. TARGET BREAKPOINT SELECTOR */}
      <div className={`p-2.5 rounded-xl border space-y-2 ${cardBgClass}`}>
        <div className="flex items-center justify-between">
          <span className={`uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${headerLabelClass}`}>
            <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
            Target Breakpoint
          </span>
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
            targetBreakpoint === 'mobile'
              ? 'bg-amber-500/20 text-amber-500'
              : targetBreakpoint === 'desktop'
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'bg-emerald-500/20 text-emerald-500'
          }`}>
            {targetBreakpoint === 'mobile' ? 'Mobile (max-md)' : targetBreakpoint === 'desktop' ? 'Desktop (md:)' : 'All (Base)'}
          </span>
        </div>

        <div className={`grid grid-cols-3 gap-1 p-1 rounded-lg border ${btnGroupBg}`}>
          <button
            onClick={() => setTargetBreakpoint('all')}
            className={`py-1 px-2 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
              targetBreakpoint === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Apply styles globally across all screen sizes"
          >
            <Globe className="w-3 h-3" />
            All (Base)
          </button>
          <button
            onClick={() => setTargetBreakpoint('mobile')}
            className={`py-1 px-2 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
              targetBreakpoint === 'mobile'
                ? 'bg-amber-600 text-white shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Apply styles specifically for Mobile screens (<768px)"
          >
            <Smartphone className="w-3 h-3" />
            Mobile
          </button>
          <button
            onClick={() => setTargetBreakpoint('desktop')}
            className={`py-1 px-2 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-all ${
              targetBreakpoint === 'desktop'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Apply styles specifically for Desktop screens (>=768px)"
          >
            <Monitor className="w-3 h-3" />
            Desktop
          </button>
        </div>
      </div>

      {/* 1. ONE-CLICK COMPLETE STYLE PRESETS */}
      <div className={`space-y-2.5 p-3 rounded-xl border ${cardBgClass}`}>
        <div className="flex items-center justify-between">
          <span className={`uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${headerLabelClass}`}>
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
                  onChange(preset.styles);
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

      {/* 1. CONTEXTUAL SMART QUICK PALETTE */}
      <div className={`space-y-3 p-3 rounded-xl border ${cardBgClass}`}>
        <div className="flex items-center justify-between">
          <span className={`uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${headerLabelClass}`}>
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            {isTextElement && 'Typography & Colors'}
            {isLayoutElement && 'Container Style Presets'}
            {isButtonOrBadge && 'Button & Badge Styles'}
            {isImageElement && 'Image Fit & Framing'}
            {isDividerElement && 'Line Styling'}
            {!isTextElement && !isLayoutElement && !isButtonOrBadge && !isImageElement && !isDividerElement && 'Quick Swatches'}
          </span>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono font-medium">
            {componentType || 'Element'}
          </span>
        </div>

        {/* --- TEXT SPECIFIC QUICK CONTROLS --- */}
        {(isTextElement || isButtonOrBadge) && (
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={`text-[11px] ${labelClass}`}>Text Color Swatches</label>
                <span className="text-[9px] font-mono text-slate-400">{styles.textColor || 'default'}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_SWATCHES.map((swatch) => {
                  const isSelected = styles.textColor === swatch.text;
                  return (
                    <button
                      key={`text-${swatch.name}`}
                      onClick={() => onChange({ textColor: swatch.text })}
                      className={`w-6 h-6 rounded-full ${swatch.dot} transition-all transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-sm relative ${
                        isSelected ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-900' : ''
                      }`}
                      title={`Text Color: ${swatch.name}`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-indigo-400 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Family Selector */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <label className={`text-[11px] flex items-center gap-1 mb-1.5 ${labelClass}`}>
                <Type className="w-3.5 h-3.5 text-indigo-500" /> Font Family / عائلة الخط
              </label>
              <select
                value={styles.fontFamily || 'font-inter'}
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
              <label className={`text-[11px] flex items-center gap-1 mb-1.5 ${labelClass}`}>
                <Sparkles className="w-3 h-3 text-amber-500" /> Gradient Text Effect
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {GRADIENT_PRESETS.map((grad) => (
                  <button
                    key={`text-grad-${grad.name}`}
                    onClick={() =>
                      onChange({
                        bgGradient: `${grad.class} bg-clip-text`,
                        textColor: 'text-transparent',
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

        {/* --- IMAGE SPECIFIC UNSPLASH PRESETS --- */}
        {isImageElement && (
          <div className="space-y-2 pt-2">
            <label className={`text-[11px] flex items-center gap-1.5 ${labelClass}`}>
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" /> 1-Click Unsplash Gallery
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {UNSPLASH_PRESETS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => nodeId && updateNodeProps(nodeId, { src: item.url })}
                  className="relative aspect-square rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 hover:scale-105 transition-transform group cursor-pointer shadow-sm"
                  title={`Set image to ${item.name}`}
                >
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-0.5 text-[8px] font-bold text-white text-center">
                    {item.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- VISUAL SPACING PRESETS --- */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className={`text-[11px] flex items-center gap-1 ${labelClass}`}>
              <BoxSelect className="w-3.5 h-3.5 text-emerald-500" /> Visual Spacing (Padding)
            </label>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {SPACING_PRESETS.map((sp) => (
              <button
                key={sp.name}
                onClick={() => onChange({ padding: sp.padding })}
                className={`py-1 px-1.5 rounded text-[10px] font-medium border text-center transition-all cursor-pointer ${
                  styles.padding === sp.padding
                    ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {sp.name}
              </button>
            ))}
          </div>
        </div>

        {/* --- INTERACTIVE HOVER EFFECTS & STYLING --- */}
        {(() => {
          const cleanStr = (s?: string) =>
            s ? s.replace(/transition-all|duration-\d+/g, '').trim() : '';

          // Detect active hover classes in customClasses or styles fields
          const customHoverClasses = (styles.customClasses || '')
            .split(' ')
            .filter((c) => c.startsWith('hover:'));

          const activeHoverList = [
            styles.hoverEffect && `Motion: ${cleanStr(styles.hoverEffect)}`,
            styles.hoverBg && `Bg: ${cleanStr(styles.hoverBg)}`,
            styles.hoverTextColor && `Text: ${cleanStr(styles.hoverTextColor)}`,
            styles.hoverShadow && `Shadow: ${cleanStr(styles.hoverShadow)}`,
            styles.pseudoHover && `Pseudo: ${styles.pseudoHover}`,
            ...customHoverClasses.map((c) => `Custom: ${c}`),
          ].filter(Boolean) as string[];

          const hasHoverStyles = activeHoverList.length > 0;

          const handleClearHover = () => {
            let cleanedCustom = (styles.customClasses || '')
              .split(' ')
              .filter((c) => !c.startsWith('hover:'))
              .join(' ')
              .trim();

            onChange({
              hoverEffect: '',
              hoverBg: '',
              hoverTextColor: '',
              hoverShadow: '',
              pseudoHover: '',
              pseudoHoverColor: '',
              customClasses: cleanedCustom,
            });
          };

          return (
            <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className={`uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${headerLabelClass}`}>
                  <MousePointerClick className="w-3.5 h-3.5 text-indigo-500" />
                  Hover Effects & Animation
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Simulate Hover Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setSimulatedHoverNodeId(simulatedHoverNodeId === nodeId ? null : nodeId || null)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-xs border ${
                      simulatedHoverNodeId === nodeId
                        ? 'bg-amber-500 text-white border-amber-400 animate-pulse'
                        : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                    title="Force simulate hover state on canvas"
                  >
                    {simulatedHoverNodeId === nodeId ? 'Stop Hover FX' : 'Simulate Hover'}
                  </button>

                  {hasHoverStyles && (
                    <button
                      type="button"
                      onClick={handleClearHover}
                      className="flex items-center gap-1 text-[10px] bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded-lg font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                      title="Clear all active hover effects from this layout"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Transition Speed & Easing Curve Controls */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className={`text-[10px] block mb-1 ${labelClass}`}>Speed (Duration)</label>
                  <select
                    value={styles.transitionDuration || 'duration-300'}
                    onChange={(e) => onChange({ transitionDuration: e.target.value })}
                    className={`w-full ${selectClass}`}
                  >
                    <option value="duration-150">Fast (150ms)</option>
                    <option value="duration-300">Normal (300ms)</option>
                    <option value="duration-500">Smooth (500ms)</option>
                    <option value="duration-700">Slow (700ms)</option>
                  </select>
                </div>
                <div>
                  <label className={`text-[10px] block mb-1 ${labelClass}`}>Easing Curve</label>
                  <select
                    value={styles.transitionTiming || 'ease-out'}
                    onChange={(e) => onChange({ transitionTiming: e.target.value })}
                    className={`w-full ${selectClass}`}
                  >
                    <option value="ease-out">Ease Out (Standard)</option>
                    <option value="ease-in-out">Ease In Out</option>
                    <option value="ease-bounce">Bounce Effect</option>
                    <option value="ease-linear">Linear</option>
                  </select>
                </div>
              </div>

              {/* Save My Hover Preset Bar */}
              <div className="pt-1 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className={`text-[10px] font-bold ${labelClass}`}>My Custom Hover Presets</label>
                  <button
                    type="button"
                    onClick={handleSaveCustomHoverPreset}
                    className="text-[10px] px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer shadow-xs"
                  >
                    + Save Hover Preset
                  </button>
                </div>
                {customHoverPresets.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {customHoverPresets.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => onChange(preset.styles)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer border transition-all shadow-xs ${
                          isLight
                            ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                            : 'bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border-indigo-800'
                        }`}
                        title="Click to apply saved hover preset"
                      >
                        <span>{preset.name}</span>
                        <button
                          onClick={(e) => handleDeleteCustomHoverPreset(preset.id, e)}
                          className="hover:text-rose-500 font-bold ml-1 text-[11px]"
                          title="Delete preset"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Hover Banner for Preset Layouts */}
              {hasHoverStyles && (
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 dark:bg-amber-950/40 dark:border-amber-700/50 space-y-1.5 animate-in fade-in duration-150 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-amber-950 dark:text-amber-200 flex items-center gap-1">
                      تأثيرات هوفر مفعّلة مسبقاً ({activeHoverList.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {activeHoverList.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-amber-200 border border-amber-400/60 dark:border-amber-600/60 shadow-xs font-semibold"
                        title={item}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

          <div className="grid grid-cols-2 gap-2">
            {/* Hover Motion / Scale */}
            <div>
              <label className={`text-[10px] block mb-1 ${labelClass}`}>Motion & Scale</label>
              <select
                value={styles.hoverEffect || ''}
                onChange={(e) => onChange({ hoverEffect: e.target.value })}
                className={`w-full ${selectClass}`}
              >
                {HOVER_MOTION_PRESETS.map((h) => (
                  <option key={`motion-${h.name}`} value={h.value}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hover Background Color */}
            <div>
              <label className={`text-[10px] block mb-1 ${labelClass}`}>Hover Background</label>
              <select
                value={
                  styles.hoverBg?.startsWith('hover:bg-[#')
                    ? 'custom'
                    : styles.hoverBg || ''
                }
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    onChange({ hoverBg: 'hover:bg-[#6366f1]' });
                  } else {
                    onChange({ hoverBg: e.target.value });
                  }
                }}
                className={`w-full ${selectClass}`}
              >
                {HOVER_BG_PRESETS.map((h) => (
                  <option key={`hbg-${h.name}`} value={h.value}>
                    {h.name}
                  </option>
                ))}
              </select>

              {/* Custom Color Picker */}
              {(styles.hoverBg?.startsWith('hover:bg-[#') || styles.hoverBg === 'custom') && (
                <div className="mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                  <input
                    type="color"
                    value={styles.hoverBg?.match(/#([0-9a-fA-F]{6})/)?.[0] || '#6366f1'}
                    onChange={(e) => onChange({ hoverBg: `hover:bg-[${e.target.value}]` })}
                    className="w-6 h-6 rounded cursor-pointer border border-slate-300 dark:border-slate-700 p-0 bg-transparent shrink-0"
                    title="Pick custom hover background color"
                  />
                  <input
                    type="text"
                    value={styles.hoverBg?.match(/#([0-9a-fA-F]{6})/)?.[0] || '#6366f1'}
                    onChange={(e) => {
                      const hex = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                      onChange({ hoverBg: `hover:bg-[${hex}]` });
                    }}
                    className={`w-full text-[10px] font-mono py-0.5 px-1.5 rounded ${selectClass}`}
                    placeholder="#HEX"
                  />
                </div>
              )}
            </div>

            {/* Hover Text Color & Decoration */}
            <div>
              <label className={`text-[10px] block mb-1 ${labelClass}`}>Hover Text Style</label>
              <select
                value={
                  styles.hoverTextColor?.startsWith('hover:text-[#')
                    ? 'custom'
                    : styles.hoverTextColor || ''
                }
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    onChange({ hoverTextColor: 'hover:text-[#38bdf8]' });
                  } else {
                    onChange({ hoverTextColor: e.target.value });
                  }
                }}
                className={`w-full ${selectClass}`}
              >
                {HOVER_TEXT_PRESETS.map((h) => (
                  <option key={`htxt-${h.name}`} value={h.value}>
                    {h.name}
                  </option>
                ))}
              </select>

              {/* Custom Text Color Picker */}
              {(styles.hoverTextColor?.startsWith('hover:text-[#') || styles.hoverTextColor === 'custom') && (
                <div className="mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
                  <input
                    type="color"
                    value={styles.hoverTextColor?.match(/#([0-9a-fA-F]{6})/)?.[0] || '#38bdf8'}
                    onChange={(e) => onChange({ hoverTextColor: `hover:text-[${e.target.value}]` })}
                    className="w-6 h-6 rounded cursor-pointer border border-slate-300 dark:border-slate-700 p-0 bg-transparent shrink-0"
                    title="Pick custom hover text color"
                  />
                  <input
                    type="text"
                    value={styles.hoverTextColor?.match(/#([0-9a-fA-F]{6})/)?.[0] || '#38bdf8'}
                    onChange={(e) => {
                      const hex = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                      onChange({ hoverTextColor: `hover:text-[${hex}]` });
                    }}
                    className={`w-full text-[10px] font-mono py-0.5 px-1.5 rounded ${selectClass}`}
                    placeholder="#HEX"
                  />
                </div>
              )}
            </div>

            {/* Hover Shadow & Glow */}
            <div>
              <label className={`text-[10px] block mb-1 ${labelClass}`}>Hover Glow / Shadow</label>
              <select
                value={styles.hoverShadow || ''}
                onChange={(e) => onChange({ hoverShadow: e.target.value })}
                className={`w-full ${selectClass}`}
              >
                {HOVER_GLOW_PRESETS.map((h) => (
                  <option key={`hglow-${h.name}`} value={h.value}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced ::before & ::after Pseudo Hover Animations */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
            <label className={`text-[10px] flex items-center justify-between mb-1 ${labelClass}`}>
              <span>Pseudo FX (Before / After Animations)</span>
              <span className="text-[9px] text-indigo-500 font-mono">::before / ::after</span>
            </label>
            <select
              value={styles.pseudoHover || ''}
              onChange={(e) => onChange({ pseudoHover: e.target.value })}
              className={`w-full ${selectClass}`}
            >
              {PSEUDO_HOVER_PRESETS.map((p) => (
                <option key={`pseudo-${p.name}`} value={p.value}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Pseudo Element Color Swatches */}
            {styles.pseudoHover && (
              <div className="pt-1 animate-in fade-in duration-150">
                <label className={`text-[10px] block mb-1.5 ${labelClass}`}>
                  FX Accent Color (لون تأثير الـ Line / Indicator)
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PSEUDO_COLOR_PRESETS.map((c) => {
                    const isSelectedColor = (styles.pseudoHoverColor || 'pseudo-indigo') === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => onChange({ pseudoHoverColor: c.value })}
                        title={c.name}
                        className={`w-5 h-5 rounded-full transition-all flex items-center justify-between border cursor-pointer ${
                          isSelectedColor
                            ? 'scale-110 ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900 border-white'
                            : 'opacity-70 hover:opacity-100 hover:scale-105 border-slate-300 dark:border-slate-700'
                        }`}
                        style={{ backgroundColor: c.color }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    })()}

        {/* --- LAYOUT & BUTTON SPECIFIC CONTAINER THEMES --- */}
        {(isLayoutElement || isButtonOrBadge) && (
          <div className="space-y-2.5">
            <div>
              <label className={`text-[11px] block mb-1.5 ${labelClass}`}>One-Click Theme Cards</label>
              <div className="grid grid-cols-3 gap-1.5">
                {CONTAINER_PRESETS.map((preset: PresetItem) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      if (preset.themeKey && nodeId) {
                        applyFullThemePreset(nodeId, preset.themeKey);
                      } else {
                        onChange(preset.styles);
                      }
                    }}
                    className={`p-2 rounded-lg text-[10px] font-semibold text-center truncate transition-all transform hover:scale-[1.03] cursor-pointer shadow-sm ${preset.badgeClass}`}
                    title={`Apply ${preset.name}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color Swatches */}
            <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex justify-between items-center mb-1">
                <label className={`text-[11px] ${labelClass}`}>Background Color Swatches</label>
                <span className="text-[9px] font-mono text-slate-400">{styles.backgroundColor || 'transparent'}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => onChange({ backgroundColor: 'bg-transparent' })}
                  className={`w-6 h-6 rounded-full border border-dashed border-slate-400 transition-all transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                    styles.backgroundColor === 'bg-transparent' || !styles.backgroundColor
                      ? 'ring-2 ring-indigo-500'
                      : ''
                  }`}
                  title="Transparent"
                >
                  <span className="text-[9px] text-slate-400 font-mono">N/A</span>
                </button>
                {COLOR_SWATCHES.map((swatch) => {
                  const isSelected = styles.backgroundColor === swatch.bg;
                  return (
                    <button
                      key={`bg-${swatch.name}`}
                      onClick={() => onChange({ backgroundColor: swatch.bg })}
                      className={`w-6 h-6 rounded-full ${swatch.dot} transition-all transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-sm ${
                        isSelected ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-900' : ''
                      }`}
                      title={`Bg: ${swatch.name}`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-indigo-400 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- IMAGE SPECIFIC CONTROLS --- */}
        {isImageElement && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Object Fit</label>
              <div className={`flex p-0.5 rounded-lg ${btnGroupBg}`}>
                {['object-cover', 'object-contain', 'object-fill'].map((fit) => (
                  <button
                    key={fit}
                    onClick={() => onChange({ objectFit: fit })}
                    className={`px-2 py-1 rounded-md text-[10px] capitalize transition-colors ${
                      styles.objectFit === fit || (!styles.objectFit && fit === 'object-cover')
                        ? 'bg-indigo-600 text-white font-semibold'
                        : isLight ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {fit.replace('object-', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. LAYOUT & DISPLAY (Shown ONLY for Containers or when Advanced enabled) */}
      {(isLayoutElement || showAllAdvanced) && (
        <div className={`space-y-2.5 p-3 rounded-xl border ${cardBgClass}`}>
          <span className={`uppercase tracking-wider text-[10px] block ${headerLabelClass}`}>
            Layout & Display
          </span>

          <div className="flex items-center justify-between">
            <label className={labelClass}>Display</label>
            <select
              value={styles.display || 'flex'}
              onChange={(e) => handleStyleChange({ display: e.target.value })}
              className={selectClass}
            >
              <option value="flex">Flexbox</option>
              <option value="grid">Grid</option>
              <option value="block">Block</option>
              <option value="inline-block">Inline Block</option>
              <option value="hidden">Hidden (Hide on screen)</option>
            </select>
          </div>

          {(styles.display === 'flex' || !styles.display) && (
            <div className="flex items-center justify-between">
              <label className={labelClass}>Direction</label>
              <div className={`flex p-0.5 rounded-lg ${btnGroupBg}`}>
                <button
                  onClick={() => handleStyleChange({ flexDirection: 'flex-row' })}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    styles.flexDirection === 'flex-row' || !styles.flexDirection
                      ? 'bg-indigo-600 text-white font-semibold'
                      : isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Row
                </button>
                <button
                  onClick={() => handleStyleChange({ flexDirection: 'flex-col' })}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    styles.flexDirection === 'flex-col'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Column
                </button>
              </div>
            </div>
          )}

          {styles.display === 'grid' && (
            <div className="flex items-center justify-between">
              <label className={labelClass}>Grid Columns</label>
              <select
                value={styles.gridCols || 'grid-cols-2'}
                onChange={(e) => handleStyleChange({ gridCols: e.target.value })}
                className={selectClass}
              >
                <option value="grid-cols-1">1 Col</option>
                <option value="grid-cols-2">2 Cols</option>
                <option value="grid-cols-3">3 Cols</option>
                <option value="grid-cols-4">4 Cols</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className={labelClass}>Align Items</label>
            <select
              value={styles.alignItems || 'items-stretch'}
              onChange={(e) => handleStyleChange({ alignItems: e.target.value })}
              className={selectClass}
            >
              <option value="items-start">Start</option>
              <option value="items-center">Center</option>
              <option value="items-end">End</option>
              <option value="items-stretch">Stretch</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className={labelClass}>Justify Content</label>
            <select
              value={styles.justifyContent || 'justify-start'}
              onChange={(e) => handleStyleChange({ justifyContent: e.target.value })}
              className={selectClass}
            >
              <option value="justify-start">Start</option>
              <option value="justify-center">Center</option>
              <option value="justify-between">Space Between</option>
              <option value="justify-end">End</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className={labelClass}>Gap</label>
            <select
              value={styles.gap || 'gap-4'}
              onChange={(e) => handleStyleChange({ gap: e.target.value })}
              className={selectClass}
            >
              <option value="gap-0">0 (None)</option>
              <option value="gap-2">8px (gap-2)</option>
              <option value="gap-4">16px (gap-4)</option>
              <option value="gap-6">24px (gap-6)</option>
              <option value="gap-8">32px (gap-8)</option>
            </select>
          </div>
        </div>
      )}

      {/* 3. TYPOGRAPHY (Shown ONLY for Text/Button/Badge/Input elements or when Advanced enabled) */}
      {(isTextElement || isButtonOrBadge || componentType === 'input' || showAllAdvanced) && (
        <div className={`space-y-2.5 p-3 rounded-xl border ${cardBgClass}`}>
          <span className={`uppercase tracking-wider text-[10px] block ${headerLabelClass}`}>
            Typography & Text
          </span>

          <div className="flex items-center justify-between">
            <label className={labelClass}>Text Align</label>
            <div className={`flex p-0.5 rounded-lg ${btnGroupBg}`}>
              <button
                onClick={() => handleStyleChange({ textAlign: 'text-left' })}
                className={`p-1.5 rounded-md ${
                  styles.textAlign === 'text-left' || !styles.textAlign
                    ? 'bg-indigo-600 text-white'
                    : isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleStyleChange({ textAlign: 'text-center' })}
                className={`p-1.5 rounded-md ${
                  styles.textAlign === 'text-center'
                    ? 'bg-indigo-600 text-white'
                    : isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleStyleChange({ textAlign: 'text-right' })}
                className={`p-1.5 rounded-md ${
                  styles.textAlign === 'text-right'
                    ? 'bg-indigo-600 text-white'
                    : isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className={labelClass}>Font Size</label>
            <select
              value={styles.fontSize || 'text-base'}
              onChange={(e) => handleStyleChange({ fontSize: e.target.value })}
              className={selectClass}
            >
              <option value="text-xs">Extra Small (text-xs)</option>
              <option value="text-sm">Small (text-sm)</option>
              <option value="text-base">Regular (text-base)</option>
              <option value="text-lg">Large (text-lg)</option>
              <option value="text-xl">XL (text-xl)</option>
              <option value="text-2xl">2XL (text-2xl)</option>
              <option value="text-4xl">4XL (text-4xl)</option>
              <option value="text-5xl">5XL Display</option>
              <option value="text-6xl">6XL Display</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className={labelClass}>Font Weight</label>
            <select
              value={styles.fontWeight || 'font-normal'}
              onChange={(e) => handleStyleChange({ fontWeight: e.target.value })}
              className={selectClass}
            >
              <option value="font-light">Light</option>
              <option value="font-normal">Normal</option>
              <option value="font-medium">Medium</option>
              <option value="font-semibold">Semibold</option>
              <option value="font-bold">Bold</option>
              <option value="font-black">Black</option>
            </select>
          </div>
        </div>
      )}

      {/* 4. SPACING & SIZING (Universal) */}
      <div className={`space-y-2.5 p-3 rounded-xl border ${cardBgClass}`}>
        <span className={`uppercase tracking-wider text-[10px] block ${headerLabelClass}`}>
          Spacing & Sizing
        </span>

        <div className="flex items-center justify-between">
          <label className={labelClass}>Padding</label>
          <select
            value={styles.padding || 'p-4'}
            onChange={(e) => handleStyleChange({ padding: e.target.value })}
            className={selectClass}
          >
            <option value="p-0">None (p-0)</option>
            <option value="p-2">Compact (p-2)</option>
            <option value="p-4">Medium (p-4)</option>
            <option value="p-6">Large (p-6)</option>
            <option value="p-8">Extra Large (p-8)</option>
            <option value="p-12">Hero Box (p-12)</option>
            <option value="px-6 py-3">Button Padding (px-6 py-3)</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className={labelClass}>Margin</label>
          <select
            value={styles.margin || ''}
            onChange={(e) => handleStyleChange({ margin: e.target.value })}
            className={selectClass}
          >
            <option value="">None</option>
            <option value="m-2">m-2</option>
            <option value="m-4">m-4</option>
            <option value="mx-auto">Center Horizontally (mx-auto)</option>
            <option value="my-4">Vertical Gap (my-4)</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className={labelClass}>Width</label>
          <select
            value={styles.width || 'w-full'}
            onChange={(e) => handleStyleChange({ width: e.target.value })}
            className={selectClass}
          >
            <option value="w-full">Full (w-full)</option>
            <option value="w-auto">Auto (w-auto)</option>
            <option value="w-1/2">Half (w-1/2)</option>
            <option value="max-w-2xl">Max 2XL (max-w-2xl)</option>
            <option value="max-w-4xl">Max 4XL (max-w-4xl)</option>
          </select>
        </div>
      </div>

      {/* 5. BORDERS, CORNERS & SHADOWS */}
      <div className={`space-y-2.5 p-3 rounded-xl border ${cardBgClass}`}>
        <span className={`uppercase tracking-wider text-[10px] block ${headerLabelClass}`}>
          Borders & Corners
        </span>

        <div className="flex items-center justify-between">
          <label className={labelClass}>Corners</label>
          <select
            value={styles.borderRadius || 'rounded-none'}
            onChange={(e) => handleStyleChange({ borderRadius: e.target.value })}
            className={selectClass}
          >
            <option value="rounded-none">Square (rounded-none)</option>
            <option value="rounded-md">Medium (rounded-md)</option>
            <option value="rounded-xl">Large (rounded-xl)</option>
            <option value="rounded-2xl">2XL (rounded-2xl)</option>
            <option value="rounded-3xl">3XL (rounded-3xl)</option>
            <option value="rounded-full">Pill / Full Circle</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className={labelClass}>Shadow</label>
          <select
            value={styles.boxShadow || 'shadow-none'}
            onChange={(e) => handleStyleChange({ boxShadow: e.target.value })}
            className={selectClass}
          >
            <option value="shadow-none">None</option>
            <option value="shadow-sm">Small</option>
            <option value="shadow-md">Medium</option>
            <option value="shadow-lg">Large</option>
            <option value="shadow-xl">Extra Large</option>
            <option value="shadow-xl shadow-indigo-500/20">Indigo Glow</option>
          </select>
        </div>
      </div>

      {/* TOGGLE ALL ADVANCED CONTROLS */}
      <button
        onClick={() => setShowAllAdvanced(!showAllAdvanced)}
        className={`w-full py-2 px-3 rounded-xl border text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
          isLight
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>{showAllAdvanced ? 'Hide Unrelated Controls' : 'Show All Advanced Controls'}</span>
        {showAllAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

    </div>
  );
};
