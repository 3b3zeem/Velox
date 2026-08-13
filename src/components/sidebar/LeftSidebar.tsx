import React from 'react';
import { Plus, Network, LayoutTemplate, PanelLeftClose } from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { ComponentPalette } from './ComponentPalette';
import { TreeView } from './TreeView';
import { TemplatesPalette } from './TemplatesPalette';

export const LeftSidebar: React.FC = () => {
  const { activeTabLeft, setActiveTabLeft, studioTheme, isLeftSidebarOpen, toggleLeftSidebar } = useBuilderStore();
  const isLight = studioTheme === 'light';

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] flex select-none z-20 transition-all duration-300 ease-in-out overflow-hidden ${
        isLeftSidebarOpen
          ? 'w-80 opacity-100 border-r shadow-xl'
          : 'w-0 opacity-0 border-none shadow-none pointer-events-none'
      } ${
        isLight ? 'bg-white border-slate-200/80 shadow-slate-300/40' : 'bg-slate-900 border-slate-800 shadow-black/50'
      }`}
    >
      <div className="w-80 h-full flex shrink-0">
      {/* Icon Navigation Rail */}
      <div
        className={`w-14 border-r flex flex-col items-center py-4 justify-between ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={() => setActiveTabLeft('library')}
            className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
              activeTabLeft === 'library'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Component Palette"
          >
            <Plus className="w-5 h-5" />
            {activeTabLeft === 'library' && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-400 rounded-r-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTabLeft('tree')}
            className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
              activeTabLeft === 'tree'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="DOM Hierarchy Tree"
          >
            <Network className="w-5 h-5" />
            {activeTabLeft === 'tree' && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-400 rounded-r-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTabLeft('templates')}
            className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
              activeTabLeft === 'templates'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Pre-designed Templates"
          >
            <LayoutTemplate className="w-5 h-5" />
            {activeTabLeft === 'templates' && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-400 rounded-r-full" />
            )}
          </button>
        </div>

        {/* Quick Collapse Button at bottom of Rail */}
        <button
          onClick={toggleLeftSidebar}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeTabLeft === 'library' && <ComponentPalette />}
        {activeTabLeft === 'tree' && <TreeView />}
        {activeTabLeft === 'templates' && <TemplatesPalette />}
      </div>
      </div>
    </aside>
  );
};
