/**
 * RightSidebar.tsx
 * ─────────────────────────────────────────────────────────────
 * The inspector panel — shown on the right when an element is selected.
 *
 * Tabs:
 *   Styles  → StyleControls  (visual style editor)
 *   Props   → ContentControls (text, image src, link href, etc.)
 *   Classes → Raw Tailwind class textarea
 *
 * Multi-select mode:
 *   When selectedNodeIds.length > 1 (Ctrl+Click), a banner appears at the
 *   top listing all selected elements. Style changes from the Styles tab
 *   are then broadcast to ALL selected nodes via updateMultipleNodesStyles().
 *   The Props and Classes tabs are hidden in multi-select mode because they
 *   are node-specific.
 * ─────────────────────────────────────────────────────────────
 */

import React from 'react';
import {
  Sliders,
  Type,
  Code2,
  Copy,
  Trash2,
  CornerUpLeft,
  SlidersHorizontal,
  PanelRightClose,
  Layers,
  X,
} from 'lucide-react';
import { useBuilderStore, getSelectedNode } from '../../store/useBuilderStore';
import { StyleControls } from './StyleControls';
import { ContentControls } from './ContentControls';

export const RightSidebar: React.FC = () => {
  const {
    rootNode,
    selectedNodeId,
    selectedNodeIds,
    activeTabRight,
    setActiveTabRight,
    updateNodeStyles,
    updateMultipleNodesStyles,
    updateNodeProps,
    deleteNode,
    duplicateNode,
    selectParentNode,
    clearMultiSelection,
    studioTheme,
    isRightSidebarOpen,
    toggleRightSidebar,
  } = useBuilderStore();

  const isLight = studioTheme === 'light';
  const selectedNode = getSelectedNode(rootNode, selectedNodeId);

  // ── Multi-select state ────────────────────────────────────────────────
  const isMultiSelect = selectedNodeIds.length > 1;

  // Resolve names for the multi-select banner
  const multiSelectNodes = selectedNodeIds.map((id) => {
    const n = id === rootNode.id
      ? rootNode
      : (() => {
          const find = (node: typeof rootNode): typeof rootNode | null => {
            if (node.id === id) return node;
            for (const child of node.children || []) {
              const r = find(child);
              if (r) return r;
            }
            return null;
          };
          return find(rootNode);
        })();
    return n ? { id: n.id, name: n.name, type: n.type } : null;
  }).filter(Boolean) as { id: string; name: string; type: string }[];

  /**
   * Style onChange handler — routes to single or multi-node update.
   * In multi-select, every selected node gets the same patch.
   */
  const handleStyleChange = (newStyles: Parameters<typeof updateNodeStyles>[1]) => {
    if (isMultiSelect) {
      updateMultipleNodesStyles(selectedNodeIds, newStyles);
    } else if (selectedNodeId) {
      updateNodeStyles(selectedNodeId, newStyles);
    }
  };

  return (
    <aside className={`h-[calc(100vh-3.5rem)] flex flex-col select-none z-20 transition-all duration-300 ease-in-out overflow-hidden ${
      isRightSidebarOpen
        ? 'w-80 opacity-100 border-l shadow-xl'
        : 'w-0 opacity-0 border-none shadow-none pointer-events-none'
    } ${
      isLight ? 'bg-white border-slate-200/80 shadow-slate-300/40 text-slate-800' : 'bg-slate-900 border-slate-800 shadow-black/50 text-slate-200'
    }`}>
      <div className="w-80 h-full flex flex-col shrink-0">
        {/* ── Empty state (nothing selected) ─────────────────────────── */}
        {!selectedNode && !isMultiSelect ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-full flex justify-end mb-4">
              <button
                onClick={toggleRightSidebar}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Collapse Inspector"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3 ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-600'
            }`}>
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <span className={`text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>No Element Selected</span>
            <p className={`text-[11px] leading-relaxed max-w-[200px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              Click any component on the canvas to inspect it, or hold <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded text-[10px]">Ctrl</kbd> to select multiple.
            </p>
          </div>
        ) : (
          <>
            {/* ── Header: node info + quick actions ───────────────────── */}
            <div className={`p-3 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex flex-col overflow-hidden">
                {isMultiSelect ? (
                  /* Multi-select: show count badge */
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    <Layers className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-violet-500">{selectedNodeIds.length}</span> Elements Selected
                  </span>
                ) : (
                  /* Single select: show name + type */
                  <span className={`text-xs font-bold truncate flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    {selectedNode?.name}
                  </span>
                )}
                <span className="text-[10px] text-indigo-500 font-mono">
                  {isMultiSelect ? 'Multi-Select Mode (Ctrl+Click to toggle)' : `${selectedNode?.type} • #${selectedNode?.id}`}
                </span>
              </div>

              {/* Action icons */}
              <div className="flex items-center space-x-1">
                {!isMultiSelect && selectedNode && (
                  <>
                    <button
                      onClick={() => selectParentNode(selectedNode.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-300'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                      title="Select parent node"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5" />
                    </button>
                    {selectedNode.id !== 'root_container' && (
                      <>
                        <button
                          onClick={() => duplicateNode(selectedNode.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isLight
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-300'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                          }`}
                          title="Duplicate element"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteNode(selectedNode.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isLight
                              ? 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-300'
                              : 'bg-slate-900 hover:bg-red-950/50 text-slate-400 hover:text-red-400 border-slate-800'
                          }`}
                          title="Delete element"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </>
                )}

                {/* Clear multi-select */}
                {isMultiSelect && (
                  <button
                    onClick={clearMultiSelection}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isLight
                        ? 'bg-violet-50 hover:bg-violet-100 text-violet-600 border-violet-200'
                        : 'bg-violet-950/40 hover:bg-violet-900/60 text-violet-400 border-violet-800'
                    }`}
                    title="Clear multi-selection (press Escape)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className={`h-4 w-px mx-0.5 ${isLight ? 'bg-slate-300' : 'bg-slate-800'}`} />
                <button
                  onClick={toggleRightSidebar}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border-slate-300'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                  title="Collapse Inspector"
                >
                  <PanelRightClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Multi-select: selected nodes pill list ───────────────── */}
            {isMultiSelect && (
              <div className={`px-3 py-2 border-b ${isLight ? 'bg-violet-50/50 border-slate-200' : 'bg-violet-950/20 border-slate-800'}`}>
                <p className={`text-[10px] font-semibold mb-1.5 flex items-center gap-1 ${isLight ? 'text-violet-700' : 'text-violet-400'}`}>
                  <Layers className="w-3 h-3" />
                  Selected Elements — styles will apply to all:
                </p>
                <div className="flex flex-wrap gap-1">
                  {multiSelectNodes.map((n) => (
                    <span
                      key={n.id}
                      className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        n.id === selectedNodeId
                          ? 'bg-indigo-600 text-white border-indigo-500'  // anchor
                          : isLight
                          ? 'bg-violet-100 text-violet-700 border-violet-300'
                          : 'bg-violet-950/60 text-violet-300 border-violet-700'
                      }`}
                    >
                      {n.id === selectedNodeId && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      {n.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Tab Switcher: Styles | Props | Classes ───────────────── */}
            <div className={`grid p-1 border-b text-xs font-medium ${
              isMultiSelect ? 'grid-cols-1' : 'grid-cols-3'
            } ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <button
                onClick={() => setActiveTabRight('styles')}
                className={`flex items-center justify-center space-x-1 py-1.5 rounded-lg transition-colors ${
                  activeTabRight === 'styles'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isMultiSelect ? `Styles (applying to ${selectedNodeIds.length} elements)` : 'Styles'}</span>
              </button>

              {/* These tabs are hidden in multi-select mode */}
              {!isMultiSelect && (
                <>
                  <button
                    onClick={() => setActiveTabRight('content')}
                    className={`flex items-center justify-center space-x-1 py-1.5 rounded-lg transition-colors ${
                      activeTabRight === 'content'
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>Props</span>
                  </button>
                  <button
                    onClick={() => setActiveTabRight('classes')}
                    className={`flex items-center justify-center space-x-1 py-1.5 rounded-lg transition-colors ${
                      activeTabRight === 'classes'
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Classes</span>
                  </button>
                </>
              )}
            </div>

            {/* ── Tab Content Body ─────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-3.5">
              {activeTabRight === 'styles' && selectedNode && (
                <StyleControls
                  nodeId={selectedNode.id}
                  componentType={isMultiSelect ? undefined : selectedNode.type}
                  isContainer={isMultiSelect ? undefined : selectedNode.isContainer}
                  styles={selectedNode.styles}
                  onChange={handleStyleChange}
                />
              )}

              {activeTabRight === 'content' && !isMultiSelect && selectedNode && (
                <ContentControls
                  node={selectedNode}
                  onUpdateProps={(props) => updateNodeProps(selectedNode.id, props)}
                />
              )}

              {activeTabRight === 'classes' && !isMultiSelect && selectedNode && (
                <div className="flex flex-col space-y-3 text-xs select-none">
                  <div className="space-y-1.5">
                    <label className={`font-medium block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Custom Tailwind Utility Classes
                    </label>
                    <p className={`text-[11px] leading-normal mb-2 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      Inject custom Tailwind CSS classes directly (e.g. <code className="text-indigo-500 font-mono">backdrop-blur-md transition-all duration-300 hover:scale-105</code>)
                    </p>
                    <textarea
                      rows={6}
                      value={selectedNode.styles.customClasses || ''}
                      onChange={(e) => updateNodeStyles(selectedNode.id, { customClasses: e.target.value })}
                      placeholder="e.g. backdrop-blur-lg hover:shadow-indigo-500/50"
                      className={`w-full border rounded-xl p-3 font-mono text-xs focus:outline-none focus:border-indigo-500 leading-relaxed ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white'
                          : 'bg-slate-950 border-slate-700 text-slate-100'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
