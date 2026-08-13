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
} from 'lucide-react';
import { useBuilderStore, getSelectedNode } from '../../store/useBuilderStore';
import { StyleControls } from './StyleControls';
import { ContentControls } from './ContentControls';

export const RightSidebar: React.FC = () => {
  const {
    rootNode,
    selectedNodeId,
    activeTabRight,
    setActiveTabRight,
    updateNodeStyles,
    updateNodeProps,
    deleteNode,
    duplicateNode,
    selectParentNode,
    studioTheme,
    isRightSidebarOpen,
    toggleRightSidebar,
  } = useBuilderStore();

  const isLight = studioTheme === 'light';
  const selectedNode = getSelectedNode(rootNode, selectedNodeId);

  return (
    <aside className={`h-[calc(100vh-3.5rem)] flex flex-col select-none z-20 transition-all duration-300 ease-in-out overflow-hidden ${
      isRightSidebarOpen
        ? 'w-80 opacity-100 border-l shadow-xl'
        : 'w-0 opacity-0 border-none shadow-none pointer-events-none'
    } ${
      isLight ? 'bg-white border-slate-200/80 shadow-slate-300/40 text-slate-800' : 'bg-slate-900 border-slate-800 shadow-black/50 text-slate-200'
    }`}>
      <div className="w-80 h-full flex flex-col shrink-0">
        {!selectedNode ? (
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
              Click any component on the central canvas or tree to inspect and adjust properties in real-time.
            </p>
          </div>
        ) : (
          <>
      {/* Selected Node Header & Quick Actions */}
      <div className={`p-3 border-b flex items-center justify-between ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
      }`}>
        <div className="flex flex-col overflow-hidden">
          <span className={`text-xs font-bold truncate flex items-center gap-1.5 ${
            isLight ? 'text-slate-900' : 'text-slate-100'
          }`}>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            {selectedNode.name}
          </span>
          <span className="text-[10px] text-indigo-500 font-mono">
            {selectedNode.type} • #{selectedNode.id}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
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

      {/* Tab Switcher: Styles | Content | Classes */}
      <div className={`grid grid-cols-3 p-1 border-b text-xs font-medium ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
      }`}>
        <button
          onClick={() => setActiveTabRight('styles')}
          className={`flex items-center justify-center space-x-1 py-1.5 rounded-lg transition-colors ${
            activeTabRight === 'styles'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Styles</span>
        </button>
        <button
          onClick={() => setActiveTabRight('content')}
          className={`flex items-center justify-center space-x-1 py-1.5 rounded-lg transition-colors ${
            activeTabRight === 'content'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
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
              : isLight
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Classes</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5">
        {activeTabRight === 'styles' && (
          <StyleControls
            nodeId={selectedNode.id}
            componentType={selectedNode.type}
            isContainer={selectedNode.isContainer}
            styles={selectedNode.styles}
            onChange={(newStyles) => updateNodeStyles(selectedNode.id, newStyles)}
          />
        )}

        {activeTabRight === 'content' && (
          <ContentControls
            node={selectedNode}
            onUpdateProps={(props) => updateNodeProps(selectedNode.id, props)}
          />
        )}

        {activeTabRight === 'classes' && (
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
                onChange={(e) =>
                  updateNodeStyles(selectedNode.id, { customClasses: e.target.value })
                }
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
