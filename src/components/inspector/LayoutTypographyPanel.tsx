/**
 * LayoutTypographyPanel.tsx
 * ─────────────────────────────────────────────────────────────
 * Handles structural and typographic style controls:
 *
 *   Section 1 — Layout & Display  (flex/grid direction, alignment, gap)
 *   Section 2 — Typography & Text (size, weight, alignment)
 *   Section 3 — Spacing & Sizing  (padding, margin, width)
 *   Section 4 — Borders & Corners (radius, shadow)
 *
 * These four sections are always shown together because they are closely
 * related and none of them is large enough to deserve its own file.
 *
 * Visibility rules:
 *   - Layout section: shown only for containers OR when "Show All" is active
 *   - Typography section: shown for text/button/badge/input OR "Show All"
 *   - Spacing & Borders: always shown (universal)
 * ─────────────────────────────────────────────────────────────
 */

import React from 'react';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { NodeStyles, ComponentType } from '../../types/builder';

interface LayoutTypographyPanelProps {
  styles: NodeStyles;
  componentType?: ComponentType;
  isContainer?: boolean;
  showAllAdvanced: boolean;
  /** Calls onChange with responsive-prefixed classes when a breakpoint target is active */
  onChange: (newStyles: Partial<NodeStyles>) => void;
  isLight: boolean;
  labelClass: string;
  headerLabelClass: string;
  selectClass: string;
  cardBgClass: string;
  btnGroupBg: string;
}

export const LayoutTypographyPanel: React.FC<LayoutTypographyPanelProps> = ({
  styles,
  componentType,
  isContainer,
  showAllAdvanced,
  onChange,
  isLight,
  labelClass,
  headerLabelClass,
  selectClass,
  cardBgClass,
  btnGroupBg,
}) => {
  // ── Derived element-type flags ─────────────────────────────────────────
  const isTextElement = ['heading', 'text', 'link'].includes(componentType || '');
  const isButtonOrBadge = ['button', 'badge'].includes(componentType || '');
  const isLayoutElement =
    isContainer ||
    ['container', 'section', 'grid', 'card', 'hero', 'pricingCard'].includes(componentType || '');

  const showLayout = isLayoutElement || showAllAdvanced;
  const showTypography =
    isTextElement || isButtonOrBadge || componentType === 'input' || showAllAdvanced;

  return (
    <>
      {/* ════════════════════════════════════════════
          SECTION 1 — Layout & Display
          (containers only, or when Show All is on)
      ════════════════════════════════════════════ */}
      {showLayout && (
        <div className={`space-y-2.5 p-3 rounded-xl border ${cardBgClass}`}>
          <span className={`uppercase tracking-wider text-[10px] block ${headerLabelClass}`}>
            Layout & Display
          </span>

          {/* Display mode */}
          <div className="flex items-center justify-between">
            <label className={labelClass}>Display</label>
            <select
              value={styles.display || 'flex'}
              onChange={(e) => onChange({ display: e.target.value })}
              className={selectClass}
            >
              <option value="flex">Flexbox</option>
              <option value="grid">Grid</option>
              <option value="block">Block</option>
              <option value="inline-block">Inline Block</option>
              <option value="hidden">Hidden (Hide on screen)</option>
            </select>
          </div>

          {/* Flex direction — only visible when display is flex */}
          {(styles.display === 'flex' || !styles.display) && (
            <div className="flex items-center justify-between">
              <label className={labelClass}>Direction</label>
              <div className={`flex p-0.5 rounded-lg ${btnGroupBg}`}>
                <button
                  onClick={() => onChange({ flexDirection: 'flex-row' })}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    styles.flexDirection === 'flex-row' || !styles.flexDirection
                      ? 'bg-indigo-600 text-white font-semibold'
                      : isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Row
                </button>
                <button
                  onClick={() => onChange({ flexDirection: 'flex-col' })}
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

          {/* Grid columns — only visible when display is grid */}
          {styles.display === 'grid' && (
            <div className="flex items-center justify-between">
              <label className={labelClass}>Grid Columns</label>
              <select
                value={styles.gridCols || 'grid-cols-2'}
                onChange={(e) => onChange({ gridCols: e.target.value })}
                className={selectClass}
              >
                <option value="grid-cols-1">1 Col</option>
                <option value="grid-cols-2">2 Cols</option>
                <option value="grid-cols-3">3 Cols</option>
                <option value="grid-cols-4">4 Cols</option>
              </select>
            </div>
          )}

          {/* Align Items */}
          <div className="flex items-center justify-between">
            <label className={labelClass}>Align Items</label>
            <select
              value={styles.alignItems || 'items-stretch'}
              onChange={(e) => onChange({ alignItems: e.target.value })}
              className={selectClass}
            >
              <option value="items-start">Start</option>
              <option value="items-center">Center</option>
              <option value="items-end">End</option>
              <option value="items-stretch">Stretch</option>
            </select>
          </div>

          {/* Justify Content */}
          <div className="flex items-center justify-between">
            <label className={labelClass}>Justify Content</label>
            <select
              value={styles.justifyContent || 'justify-start'}
              onChange={(e) => onChange({ justifyContent: e.target.value })}
              className={selectClass}
            >
              <option value="justify-start">Start</option>
              <option value="justify-center">Center</option>
              <option value="justify-between">Space Between</option>
              <option value="justify-end">End</option>
            </select>
          </div>

          {/* Gap */}
          <div className="flex items-center justify-between">
            <label className={labelClass}>Gap</label>
            <select
              value={styles.gap || 'gap-4'}
              onChange={(e) => onChange({ gap: e.target.value })}
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

      {/* ════════════════════════════════════════════
          SECTION 2 — Typography & Text
          (text / button / badge / input elements, or Show All)
      ════════════════════════════════════════════ */}
      {showTypography && (
        <div className={`space-y-2.5 p-3 rounded-xl border ${cardBgClass}`}>
          <span className={`uppercase tracking-wider text-[10px] block ${headerLabelClass}`}>
            Typography & Text
          </span>

          {/* Text Align */}
          <div className="flex items-center justify-between">
            <label className={labelClass}>Text Align</label>
            <div className={`flex p-0.5 rounded-lg ${btnGroupBg}`}>
              <button
                onClick={() => onChange({ textAlign: 'text-left' })}
                className={`p-1.5 rounded-md ${
                  styles.textAlign === 'text-left' || !styles.textAlign
                    ? 'bg-indigo-600 text-white'
                    : isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChange({ textAlign: 'text-center' })}
                className={`p-1.5 rounded-md ${
                  styles.textAlign === 'text-center'
                    ? 'bg-indigo-600 text-white'
                    : isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChange({ textAlign: 'text-right' })}
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

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <label className={labelClass}>Font Size</label>
            <select
              value={styles.fontSize || 'text-base'}
              onChange={(e) => onChange({ fontSize: e.target.value })}
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

          {/* Font Weight */}
          <div className="flex items-center justify-between">
            <label className={labelClass}>Font Weight</label>
            <select
              value={styles.fontWeight || 'font-normal'}
              onChange={(e) => onChange({ fontWeight: e.target.value })}
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

      {/* ════════════════════════════════════════════
          SECTION 3 — Spacing & Sizing  (universal)
      ════════════════════════════════════════════ */}
      <div className={`space-y-2.5 p-3 rounded-xl border ${cardBgClass}`}>
        <span className={`uppercase tracking-wider text-[10px] block ${headerLabelClass}`}>
          Spacing & Sizing
        </span>

        <div className="flex items-center justify-between">
          <label className={labelClass}>Padding</label>
          <select
            value={styles.padding || 'p-4'}
            onChange={(e) => onChange({ padding: e.target.value })}
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
            onChange={(e) => onChange({ margin: e.target.value })}
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
            onChange={(e) => onChange({ width: e.target.value })}
            className={selectClass}
          >
            <option value="w-full">Full Width 100% (w-full)</option>
            <option value="max-w-7xl mx-auto w-full">Max 7XL Centered (max-w-7xl)</option>
            <option value="max-w-6xl mx-auto w-full">Max 6XL Centered (max-w-6xl)</option>
            <option value="max-w-5xl mx-auto w-full">Max 5XL Centered (max-w-5xl)</option>
            <option value="max-w-4xl mx-auto w-full">Max 4XL Centered (max-w-4xl)</option>
            <option value="max-w-2xl mx-auto w-full">Max 2XL Centered (max-w-2xl)</option>
            <option value="w-1/2">Half Width 50% (w-1/2)</option>
            <option value="w-1/3">One Third 33% (w-1/3)</option>
            <option value="w-2/3">Two Thirds 66% (w-2/3)</option>
            <option value="w-auto">Auto Width (w-auto)</option>
          </select>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          SECTION 4 — Borders & Corners  (universal)
      ════════════════════════════════════════════ */}
      <div className={`space-y-2.5 p-3 rounded-xl border ${cardBgClass}`}>
        <span className={`uppercase tracking-wider text-[10px] block ${headerLabelClass}`}>
          Borders & Corners
        </span>

        {/* Border Width */}
        <div className="flex items-center justify-between">
          <label className={labelClass}>Border Width</label>
          <select
            value={styles.borderWidth || 'border-0'}
            onChange={(e) => onChange({ borderWidth: e.target.value })}
            className={selectClass}
          >
            <option value="border-0">None (border-0)</option>
            <option value="border">Thin 1px (border)</option>
            <option value="border-2">Medium 2px (border-2)</option>
            <option value="border-4">Thick 4px (border-4)</option>
            <option value="border-8">Heavy 8px (border-8)</option>
          </select>
        </div>

        {/* Border Style — shown if borderWidth is enabled */}
        {styles.borderWidth && styles.borderWidth !== 'border-0' && (
          <div className="flex items-center justify-between">
            <label className={labelClass}>Border Line Style</label>
            <select
              value={styles.borderStyle || 'border-solid'}
              onChange={(e) => onChange({ borderStyle: e.target.value })}
              className={selectClass}
            >
              <option value="border-solid">Solid (border-solid)</option>
              <option value="border-dashed">Dashed (border-dashed)</option>
              <option value="border-dotted">Dotted (border-dotted)</option>
              <option value="border-double">Double (border-double)</option>
            </select>
          </div>
        )}

        {/* Border Color — shown if borderWidth is enabled */}
        {styles.borderWidth && styles.borderWidth !== 'border-0' && (
          <div className="space-y-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Border Color</label>
              <span className="text-[10px] font-mono text-indigo-500">{styles.borderColor || 'border-slate-300'}</span>
            </div>

            {/* Custom Color Input & Selector */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  styles.borderColor?.startsWith('border-[#')
                    ? styles.borderColor.replace('border-[#', '#').replace(']', '')
                    : '#6366f1'
                }
                onChange={(e) => onChange({ borderColor: `border-[${e.target.value}]` })}
                className="w-7 h-7 rounded-lg cursor-pointer border border-slate-700 bg-transparent p-0.5 shrink-0"
                title="Choose Custom Border Color"
              />
              <select
                value={styles.borderColor || 'border-slate-300'}
                onChange={(e) => onChange({ borderColor: e.target.value })}
                className={`${selectClass} flex-1`}
              >
                <option value="border-slate-200">Light Slate 200</option>
                <option value="border-slate-300">Slate 300</option>
                <option value="border-slate-700">Dark Slate 700</option>
                <option value="border-slate-800">Slate 800</option>
                <option value="border-indigo-500">Indigo (border-indigo-500)</option>
                <option value="border-indigo-400">Indigo Light</option>
                <option value="border-purple-500">Purple</option>
                <option value="border-emerald-500">Emerald Green</option>
                <option value="border-amber-500">Amber Yellow</option>
                <option value="border-rose-500">Rose Red</option>
                <option value="border-cyan-500">Cyan Blue</option>
                <option value="border-white">Pure White</option>
                <option value="border-transparent">Transparent</option>
              </select>
            </div>

            {/* Quick Color Swatches */}
            <div className="grid grid-cols-8 gap-1 pt-1">
              {[
                { name: 'slate-300', class: 'border-slate-300', bg: '#cbd5e1' },
                { name: 'slate-800', class: 'border-slate-800', bg: '#1e293b' },
                { name: 'indigo', class: 'border-indigo-500', bg: '#6366f1' },
                { name: 'purple', class: 'border-purple-500', bg: '#a855f7' },
                { name: 'emerald', class: 'border-emerald-500', bg: '#10b981' },
                { name: 'amber', class: 'border-amber-500', bg: '#f59e0b' },
                { name: 'rose', class: 'border-rose-500', bg: '#f43f5e' },
                { name: 'cyan', class: 'border-cyan-500', bg: '#06b6d4' },
              ].map((swatch) => (
                <button
                  key={swatch.class}
                  type="button"
                  onClick={() => onChange({ borderColor: swatch.class })}
                  className={`h-5 rounded-md border border-slate-700/60 transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                    styles.borderColor === swatch.class ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor: swatch.bg }}
                  title={swatch.name}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className={labelClass}>Corners</label>
          <select
            value={styles.borderRadius || 'rounded-none'}
            onChange={(e) => onChange({ borderRadius: e.target.value })}
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
            onChange={(e) => onChange({ boxShadow: e.target.value })}
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
    </>
  );
};
