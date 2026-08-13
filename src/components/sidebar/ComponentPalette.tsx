/**
 * ComponentPalette.tsx
 * ─────────────────────────────────────────────────────────────
 * The draggable component library panel (Left Sidebar → "Components" tab).
 *
 * Each item in the palette corresponds to a CanvasNode template defined in
 * componentLibrary.ts. Users can either:
 *   • Drag the item onto the canvas to drop it at a specific position
 *   • Click the "+" quick-add button to insert it at the selected node
 *
 * The category filter pills (All / Layout / Typography / etc.) filter the
 * visible list but never affect what gets added — they're purely presentational.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import {
  Box,
  LayoutTemplate,
  Grid2x2,
  Square,
  Heading,
  Type,
  Tag,
  MousePointerClick,
  TextCursorInput,
  Link,
  Image,
  Plus,
  GripVertical,
  PanelTop,
  PanelBottom,
  Sparkles,
  BarChart2,
  MessageSquare,
  Mail,
  Layers,
} from 'lucide-react';
import { COMPONENT_PALETTE } from '../../data/componentLibrary';
import type { ComponentPaletteItem } from '../../data/componentLibrary';
import { useBuilderStore } from '../../store/useBuilderStore';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Box,
  LayoutTemplate,
  Grid2x2,
  Square,
  Heading,
  Type,
  Tag,
  MousePointerClick,
  TextCursorInput,
  Link,
  Image,
  PanelTop,
  PanelBottom,
  Sparkles,
  BarChart2,
  MessageSquare,
  Mail,
  Layers,
};

export const ComponentPalette: React.FC = () => {
  const { addNode, selectedNodeId, rootNode, studioTheme } = useBuilderStore();
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const isLight = studioTheme === 'light';

  const categories = ['All', 'Layout', 'Typography', 'Actions', 'Media'];

  const filteredItems = COMPONENT_PALETTE.filter(
    (item) => filterCategory === 'All' || item.category === filterCategory
  );

  const handleQuickAdd = (item: ComponentPaletteItem) => {
    const targetParentId = selectedNodeId || rootNode.id;
    addNode(targetParentId, item.createNode());
  };

  return (
    <div className={`flex flex-col h-full select-none transition-colors duration-200 ${
      isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-200'
    }`}>
      {/* Category Pills */}
      <div className={`p-3 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
        isLight ? 'border-slate-200' : 'border-slate-800/80'
      }`}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-indigo-600 text-white'
                : isLight
                ? 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Palette Component List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredItems.map((item) => {
          const IconComp = ICON_MAP[item.icon] || Box;
          const nodePayload = item.createNode();

          return (
            <div
              key={item.name}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(nodePayload));
                e.dataTransfer.effectAllowed = 'copy';
              }}
              className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing shadow-sm ${
                isLight
                  ? 'bg-slate-50/80 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40'
                  : 'bg-slate-950/70 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isLight
                    ? 'bg-slate-200/70 text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-100'
                    : 'bg-slate-900 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-950/50'
                }`}>
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-semibold ${isLight ? 'text-slate-800 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                    {item.name}
                  </span>
                  <span className={`text-[10px] line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {item.description}
                  </span>
                </div>
              </div>

              {/* Quick Add Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAdd(item);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-opacity shadow-md"
                title="Add to canvas"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
