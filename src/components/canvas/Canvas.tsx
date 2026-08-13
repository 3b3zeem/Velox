import React from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { CanvasNodeRenderer } from './CanvasNodeRenderer';
import { ChevronRight, Layers, Box } from 'lucide-react';

export const Canvas: React.FC = () => {
  const { rootNode, viewMode, addNode, setSelectedNodeId, selectedNodeId, studioTheme, getBreadcrumbs } = useBuilderStore();
  const isLight = studioTheme === 'light';

  const breadcrumbs = getBreadcrumbs();

  const getViewportWidthClass = () => {
    const frameBorderColor = isLight ? 'border-slate-300/80 shadow-slate-400/25' : 'border-slate-800 shadow-black/60';
    switch (viewMode) {
      case 'mobile':
        return `w-[375px] max-w-[calc(100%-1rem)] min-h-[667px] shadow-2xl rounded-3xl overflow-hidden border-8 ${frameBorderColor} my-4 shrink-0 transition-all duration-300`;
      case 'tablet':
        return `w-[768px] max-w-[calc(100%-1rem)] min-h-[800px] shadow-2xl rounded-2xl overflow-hidden border-4 ${frameBorderColor} my-4 shrink-0 transition-all duration-300`;
      case 'preview':
        return 'w-full min-h-full border-none rounded-none my-0';
      case 'desktop':
      default:
        return `w-full max-w-[1240px] min-h-[800px] rounded-2xl overflow-hidden border ${frameBorderColor} shadow-2xl my-4 shrink-0 transition-all duration-300`;
    }
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const paletteNodeJson = e.dataTransfer.getData('application/json');
    if (paletteNodeJson) {
      try {
        const newNodePayload = JSON.parse(paletteNodeJson);
        addNode(rootNode.id, newNodePayload);
      } catch (err) {
        console.error('Failed to parse dropped palette item:', err);
      }
    }
  };

  return (
    <main
      onClick={() => setSelectedNodeId(rootNode.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleRootDrop}
      className={`flex-1 flex flex-col items-center p-3 sm:p-5 md:p-6 overflow-y-auto relative select-none scroll-smooth transition-colors duration-200 ${
        isLight ? 'bg-dot-pattern-light' : 'bg-dot-pattern-dark'
      }`}
    >
      {/* FLOATING INTERACTIVE BREADCRUMBS BAR */}
      {viewMode !== 'preview' && breadcrumbs.length > 0 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`flex items-center gap-1.5 px-3 py-5 rounded-full border shadow-lg backdrop-blur-md z-20 max-w-full overflow-x-auto scrollbar-none transition-all ${
            isLight
              ? 'bg-white/90 border-slate-300/80 text-slate-700 shadow-slate-200/50'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 shadow-black/40'
          }`}
        >
          <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 uppercase tracking-wider pl-1">
            <Layers className="w-3 h-3" /> Path:
          </span>

          {breadcrumbs.map((item, idx) => {
            const isSelected = item.id === selectedNodeId;

            return (
              <React.Fragment key={`crumb-${item.id}`}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
                <button
                  onClick={() => setSelectedNodeId(item.id)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer truncate max-w-[140px] ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm font-bold scale-105'
                      : isLight
                      ? 'hover:bg-slate-200/70 text-slate-600'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                  title={`Select ${item.name} (${item.type})`}
                >
                  <Box className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                  <span className="truncate">{item.name}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* CANVAS VIEWPORT CONTAINER */}
      {viewMode === 'split' ? (
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 my-4 z-10 overflow-x-auto pb-4">
          {/* DESKTOP FRAME */}
          <div className="flex flex-col items-center w-full lg:w-[800px] shrink-0">
            <span className={`text-[10px] font-bold font-mono tracking-wider mb-2 px-3 py-1 rounded-full border shadow-sm ${
              isLight ? 'bg-white text-slate-700 border-slate-300' : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}>
              DESKTOP VIEW (800px)
            </span>
            <div className={`w-full min-h-[750px] rounded-2xl overflow-hidden border shadow-2xl transition-all duration-300 ${
              isLight ? 'border-slate-300/80 shadow-slate-400/25 bg-white' : 'border-slate-800 shadow-black/60 bg-slate-950'
            }`}>
              <CanvasNodeRenderer node={rootNode} isRoot />
            </div>
          </div>

          {/* MOBILE FRAME */}
          <div className="flex flex-col items-center shrink-0">
            <span className={`text-[10px] font-bold font-mono tracking-wider mb-2 px-3 py-1 rounded-full border shadow-sm ${
              isLight ? 'bg-white text-slate-700 border-slate-300' : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}>
              MOBILE VIEW (375px)
            </span>
            <div className={`w-[375px] min-h-[667px] rounded-3xl overflow-hidden border-8 shadow-2xl transition-all duration-300 ${
              isLight ? 'border-slate-300/80 shadow-slate-400/25 bg-white' : 'border-slate-800 shadow-black/60 bg-slate-950'
            }`}>
              <CanvasNodeRenderer node={rootNode} isRoot isMobileView={true} />
            </div>
          </div>
        </div>
      ) : (
        <div className={`transition-all duration-300 flex flex-col ${getViewportWidthClass()}`}>
          <CanvasNodeRenderer node={rootNode} isRoot />
        </div>
      )}
    </main>
  );
};
