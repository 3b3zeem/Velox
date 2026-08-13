import React from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  RotateCcw,
  RotateCw,
  Code,
  Download,
  Trash2,
  LayoutTemplate,
  Sun,
  Moon,
  PanelLeft,
  PanelRight,
  PanelLeftClose,
  PanelRightClose,
  Columns,
  Palette,
  Scan,
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { exportProjectAsZip } from '../../compiler/zipExporter';
import { PRESET_TEMPLATES } from '../../data/componentLibrary';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    undo,
    redo,
    canUndo,
    canRedo,
    resetCanvas,
    loadTemplate,
    setCodeExportModalOpen,
    rootNode,
    studioTheme,
    toggleStudioTheme,
    isLeftSidebarOpen,
    isRightSidebarOpen,
    toggleLeftSidebar,
    toggleRightSidebar,
    boxInspectorEnabled,
    toggleBoxInspector,
    applyGlobalThemePreset,
  } = useBuilderStore();

  const handleDownloadZip = async () => {
    await exportProjectAsZip(rootNode);
  };

  const isLight = studioTheme === 'light';

  return (
    <header
      className={`h-14 px-3 flex items-center justify-between select-none z-30 relative transition-colors duration-200 gap-2 overflow-x-auto scrollbar-none ${
        isLight
          ? 'bg-white border-b border-slate-200 text-slate-800'
          : 'bg-slate-900 border-b border-slate-800 text-slate-200'
      }`}
    >
      {/* LEFT SECTION: Brand & Quick Templates */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Toggle Left Sidebar */}
        <button
          onClick={toggleLeftSidebar}
          className={`flex p-1.5 rounded-xl border transition-all cursor-pointer ${
            isLeftSidebarOpen
              ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
              : isLight
              ? 'bg-slate-100 border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title={isLeftSidebarOpen ? 'Collapse Component Library' : 'Expand Component Library'}
        >
          {isLeftSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>

        {/* Velox Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Velox Logo"
            className="w-7 h-7 rounded-lg object-cover shrink-0"
            draggable="false"
          />
          <div className="flex flex-col leading-tight">
            <span className={`font-black text-sm tracking-tight leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Velox
            </span>
          </div>
        </div>

        {/* Quick Template Selector Dropdown */}
        <div className={`hidden sm:flex items-center ml-1 pl-2 border-l space-x-1.5 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="relative flex items-center">
            <LayoutTemplate className="w-3.5 h-3.5 text-indigo-500 absolute left-2 pointer-events-none" />
            <select
              onChange={(e) => {
                if (e.target.value) {
                  loadTemplate(e.target.value);
                }
              }}
              defaultValue=""
              className={`text-xs rounded-xl pl-6 pr-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium border max-w-[130px] truncate ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
              title="Load Starter Layout Template"
            >
              <option value="" disabled>Templates...</option>
              {PRESET_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Undo / Redo */}
        <div className={`flex items-center p-0.5 rounded-xl border ${
          isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            onClick={undo}
            disabled={!canUndo()}
            className={`p-1.5 rounded-lg transition-colors ${
              canUndo()
                ? isLight
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 opacity-40 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className={`p-1.5 rounded-lg transition-colors ${
              canRedo()
                ? isLight
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 opacity-40 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CENTER SECTION: Compact Viewport Mode Switcher Rail */}
      <div className={`flex items-center p-1 rounded-xl border shadow-inner shrink-0 ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800/80'
      }`}>
        <button
          onClick={() => setViewMode('desktop')}
          className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'desktop'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Desktop View (Full Canvas)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden 2xl:inline text-[11px]">Desktop</span>
        </button>

        <button
          onClick={() => setViewMode('tablet')}
          className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'tablet'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Tablet View (768px)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span className="hidden 2xl:inline text-[11px]">Tablet</span>
        </button>

        <button
          onClick={() => setViewMode('mobile')}
          className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'mobile'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Mobile View (375px)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden 2xl:inline text-[11px]">Mobile</span>
        </button>

        <button
          onClick={() => setViewMode('split')}
          className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'split'
              ? 'bg-indigo-600 text-white shadow-sm font-bold'
              : isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Dual Split View (Desktop + Mobile Side-by-Side)"
        >
          <Columns className="w-3.5 h-3.5" />
          <span className="hidden 2xl:inline text-[11px]">Dual Split</span>
        </button>

        <div className={`h-4 w-px mx-1 ${isLight ? 'bg-slate-300' : 'bg-slate-800'}`} />

        <button
          onClick={() => setViewMode(viewMode === 'preview' ? 'desktop' : 'preview')}
          className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
            viewMode === 'preview'
              ? 'bg-emerald-600 text-white shadow-sm font-bold'
              : isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Toggle Clean Preview Mode"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden 2xl:inline text-[11px]">{viewMode === 'preview' ? 'Exit' : 'Preview'}</span>
        </button>
      </div>

      {/* RIGHT SECTION: Tools, Actions & Sidebar Toggles */}
      <div className="flex items-center space-x-1.5 shrink-0">
        {/* Box Model Inspector Toggle */}
        <button
          onClick={toggleBoxInspector}
          className={`flex items-center space-x-1 p-1.5 sm:px-2 sm:py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
            boxInspectorEnabled
              ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
              : isLight
              ? 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title={boxInspectorEnabled ? 'Box Model Inspector Active' : 'Toggle Visual Box Model & Spacing Inspector'}
        >
          <Scan className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[11px]">Box Model</span>
        </button>

        {/* Global Canvas Theme Selector Dropdown */}
        <div className="relative flex items-center">
          <Palette className="w-3.5 h-3.5 text-indigo-500 absolute left-2 pointer-events-none" />
          <select
            onChange={(e) => {
              if (e.target.value) {
                applyGlobalThemePreset(e.target.value as any);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className={`text-xs rounded-xl pl-6 pr-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium border max-w-[120px] truncate ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
            }`}
            title="Apply One-Click Theme to Entire Canvas"
          >
            <option value="" disabled>Global Theme...</option>
            <option value="darkLuxe">SaaS Dark Luxe</option>
            <option value="clean">Clean Light Minimal</option>
            <option value="indigo">Indigo Accent</option>
            <option value="mint">Emerald Mint</option>
            <option value="rose">Sunset Rose</option>
            <option value="glass">Glassmorphism</option>
          </select>
        </div>

        {/* Reset Canvas */}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset the canvas to root?')) {
              resetCanvas();
            }
          }}
          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
            isLight
              ? 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border-slate-300'
              : 'bg-slate-950 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border-slate-800'
          }`}
          title="Reset Canvas"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Export Code Modal Trigger */}
        <button
          onClick={() => setCodeExportModalOpen(true)}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          title="Export Code to React / HTML / CodePen"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Download ZIP */}
        <button
          onClick={handleDownloadZip}
          className={`flex items-center space-x-1 px-2 py-1 rounded-xl font-semibold text-xs border transition-all cursor-pointer ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
          }`}
          title="Download complete Vite project ZIP"
        >
          <Download className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline">ZIP</span>
        </button>

        {/* Studio Theme Toggle Button */}
        <button
          onClick={toggleStudioTheme}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            isLight
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/80 hover:bg-indigo-900/80'
          }`}
          title={isLight ? 'Switch to Dark Studio' : 'Switch to Light Studio'}
        >
          {isLight ? (
            <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
          )}
        </button>

        {/* Toggle Right Sidebar */}
        <button
          onClick={toggleRightSidebar}
          className={`flex p-1.5 rounded-xl border transition-all cursor-pointer ${
            isRightSidebarOpen
              ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
              : isLight
              ? 'bg-slate-100 border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title={isRightSidebarOpen ? 'Collapse Style Inspector' : 'Expand Style Inspector'}
        >
          {isRightSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
