/**
 * HoverEffectsPanel.tsx
 * ─────────────────────────────────────────────────────────────
 * Self-contained panel that handles ALL hover & animation styling:
 *
 *   • Motion / Scale presets  (hover:scale-*, hover:translate-*)
 *   • Hover background color  (preset + custom hex picker)
 *   • Hover text color        (preset + custom hex picker)
 *   • Hover glow / shadow     (preset shadows)
 *   • Pseudo-element FX       (::before / ::after CSS animations)
 *   • Transition speed & easing curve
 *   • User-saved hover presets
 *   • "Simulate Hover" live preview toggle
 *
 * Props mirror the StyleControls interface — just pass styles + onChange.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { MousePointerClick, RotateCcw } from 'lucide-react';
import type { NodeStyles } from '../../types/builder';
import { useBuilderStore } from '../../store/useBuilderStore';
import {
  HOVER_MOTION_PRESETS,
  HOVER_BG_PRESETS,
  HOVER_TEXT_PRESETS,
  HOVER_GLOW_PRESETS,
  PSEUDO_HOVER_PRESETS,
  PSEUDO_COLOR_PRESETS,
} from './stylePresets';

interface HoverEffectsPanelProps {
  nodeId?: string;
  styles: NodeStyles;
  onChange: (newStyles: Partial<NodeStyles>) => void;
  isLight: boolean;
  labelClass: string;
  headerLabelClass: string;
  selectClass: string;
  cardBgClass: string;
}

type CustomHoverPreset = { id: string; name: string; styles: Partial<NodeStyles> };

export const HoverEffectsPanel: React.FC<HoverEffectsPanelProps> = ({
  nodeId,
  styles,
  onChange,
  isLight,
  labelClass,
  headerLabelClass,
  selectClass,
  cardBgClass,
}) => {
  const simulatedHoverNodeId = useBuilderStore((s) => s.simulatedHoverNodeId);
  const setSimulatedHoverNodeId = useBuilderStore((s) => s.setSimulatedHoverNodeId);

  // ── Custom user-saved presets (in-memory state) ──────────────────────────
  const [customPresets, setCustomPresets] = useState<CustomHoverPreset[]>([]);

  const saveCustomPreset = () => {
    const name = prompt('اختار اسم للـ preset:', 'My Hover FX');
    if (!name) return;

    const newPreset: CustomHoverPreset = {
      id: `hover_preset_${Date.now()}`,
      name,
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

    setCustomPresets((prev) => [...prev, newPreset]);
  };

  const deleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPresets((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Build active hover summary list (shown in the amber "active effects" banner) ──
  const cleanStr = (s?: string) => s ? s.replace(/transition-all|duration-\d+/g, '').trim() : '';
  const customHoverClasses = (styles.customClasses || '').split(' ').filter((c) => c.startsWith('hover:'));

  const activeHoverList = [
    styles.hoverEffect && `Motion: ${cleanStr(styles.hoverEffect)}`,
    styles.hoverBg && `Bg: ${cleanStr(styles.hoverBg)}`,
    styles.hoverTextColor && `Text: ${cleanStr(styles.hoverTextColor)}`,
    styles.hoverShadow && `Shadow: ${cleanStr(styles.hoverShadow)}`,
    styles.pseudoHover && `Pseudo: ${styles.pseudoHover}`,
    ...customHoverClasses.map((c) => `Custom: ${c}`),
  ].filter(Boolean) as string[];

  const hasHoverStyles = activeHoverList.length > 0;

  const clearAllHover = () => {
    const cleanedCustom = (styles.customClasses || '')
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
    <div className={`space-y-2.5 p-3 rounded-xl border ${cardBgClass}`}>
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between">
        <span className={`uppercase tracking-wider text-[10px] flex items-center gap-1.5 ${headerLabelClass}`}>
          <MousePointerClick className="w-3.5 h-3.5 text-indigo-500" />
          Hover Effects & Animation
        </span>

        <div className="flex items-center gap-1.5">
          {/* Live "Simulate Hover" toggle — forces hover classes onto the canvas node in real time */}
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
              onClick={clearAllHover}
              className="flex items-center gap-1 text-[10px] bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded-lg font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Clear all active hover effects"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Transition Speed & Easing ── */}
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

      {/* ── User-Saved Custom Presets ── */}
      <div className="pt-1 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className={`text-[10px] font-bold ${labelClass}`}>My Saved Hover Presets</label>
          <button
            type="button"
            onClick={saveCustomPreset}
            className="text-[10px] px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer shadow-xs"
          >
            + Save Current
          </button>
        </div>
        {customPresets.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {customPresets.map((preset) => (
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
                  onClick={(e) => deleteCustomPreset(preset.id, e)}
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

      {/* ── Active Hover Effects Banner ── */}
      {hasHoverStyles && (
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 dark:bg-amber-950/40 dark:border-amber-700/50 space-y-1.5 animate-in fade-in duration-150 shadow-xs">
          <span className="text-[11px] font-extrabold text-amber-950 dark:text-amber-200 flex items-center gap-1">
            تأثيرات هوفر مفعّلة ({activeHoverList.length})
          </span>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {activeHoverList.map((item, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-amber-200 border border-amber-400/60 dark:border-amber-600/60 shadow-xs font-semibold"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 4-up Hover Controls Grid ── */}
      <div className="grid grid-cols-2 gap-2">
        {/* Motion & Scale */}
        <div>
          <label className={`text-[10px] block mb-1 ${labelClass}`}>Motion & Scale</label>
          <select
            value={styles.hoverEffect || ''}
            onChange={(e) => onChange({ hoverEffect: e.target.value })}
            className={`w-full ${selectClass}`}
          >
            {HOVER_MOTION_PRESETS.map((h) => (
              <option key={`motion-${h.name}`} value={h.value}>{h.name}</option>
            ))}
          </select>
        </div>

        {/* Hover Background */}
        <div>
          <label className={`text-[10px] block mb-1 ${labelClass}`}>Hover Background</label>
          <select
            value={styles.hoverBg?.startsWith('hover:bg-[#') ? 'custom' : styles.hoverBg || ''}
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
              <option key={`hbg-${h.name}`} value={h.value}>{h.name}</option>
            ))}
          </select>
          {(styles.hoverBg?.startsWith('hover:bg-[#') || styles.hoverBg === 'custom') && (
            <div className="mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
              <input
                type="color"
                value={styles.hoverBg?.match(/#([0-9a-fA-F]{6})/)?.[0] || '#6366f1'}
                onChange={(e) => onChange({ hoverBg: `hover:bg-[${e.target.value}]` })}
                className="w-6 h-6 rounded cursor-pointer border border-slate-300 dark:border-slate-700 p-0 bg-transparent shrink-0"
                title="Pick hover background color"
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

        {/* Hover Text Color */}
        <div>
          <label className={`text-[10px] block mb-1 ${labelClass}`}>Hover Text Style</label>
          <select
            value={styles.hoverTextColor?.startsWith('hover:text-[#') ? 'custom' : styles.hoverTextColor || ''}
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
              <option key={`htxt-${h.name}`} value={h.value}>{h.name}</option>
            ))}
          </select>
          {(styles.hoverTextColor?.startsWith('hover:text-[#') || styles.hoverTextColor === 'custom') && (
            <div className="mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-150">
              <input
                type="color"
                value={styles.hoverTextColor?.match(/#([0-9a-fA-F]{6})/)?.[0] || '#38bdf8'}
                onChange={(e) => onChange({ hoverTextColor: `hover:text-[${e.target.value}]` })}
                className="w-6 h-6 rounded cursor-pointer border border-slate-300 dark:border-slate-700 p-0 bg-transparent shrink-0"
                title="Pick hover text color"
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

        {/* Hover Glow / Shadow */}
        <div>
          <label className={`text-[10px] block mb-1 ${labelClass}`}>Hover Glow / Shadow</label>
          <select
            value={styles.hoverShadow || ''}
            onChange={(e) => onChange({ hoverShadow: e.target.value })}
            className={`w-full ${selectClass}`}
          >
            {HOVER_GLOW_PRESETS.map((h) => (
              <option key={`hglow-${h.name}`} value={h.value}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Pseudo-element FX (::before / ::after) ── */}
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
            <option key={`pseudo-${p.name}`} value={p.value}>{p.name}</option>
          ))}
        </select>

        {/* Color accent swatches for pseudo animation */}
        {styles.pseudoHover && (
          <div className="pt-1 animate-in fade-in duration-150">
            <label className={`text-[10px] block mb-1.5 ${labelClass}`}>
              FX Accent Color (لون تأثير الـ Line / Indicator)
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PSEUDO_COLOR_PRESETS.map((c) => {
                const isSelected = (styles.pseudoHoverColor || 'pseudo-indigo') === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => onChange({ pseudoHoverColor: c.value })}
                    title={c.name}
                    className={`w-5 h-5 rounded-full transition-all flex items-center justify-between border cursor-pointer ${
                      isSelected
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
};
