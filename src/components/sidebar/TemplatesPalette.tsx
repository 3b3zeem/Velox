import React from 'react';
import { Layout, Sparkles, Check } from 'lucide-react';
import { PRESET_TEMPLATES } from '../../data/componentLibrary';
import { useBuilderStore } from '../../store/useBuilderStore';

export const TemplatesPalette: React.FC = () => {
  const { loadTemplate, rootNode, studioTheme, addToast } = useBuilderStore();
  const isLight = studioTheme === 'light';

  return (
    <div className={`flex flex-col h-full p-3 select-none overflow-y-auto space-y-3 transition-colors duration-200 ${
      isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-200'
    }`}>
      <div className={`text-[11px] font-bold uppercase tracking-wider px-1 flex items-center justify-between ${
        isLight ? 'text-slate-500' : 'text-slate-400'
      }`}>
        <span>Pre-designed Templates</span>
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
      </div>

      <div className="space-y-3">
        {PRESET_TEMPLATES.map((tmpl) => {
          const isActive = rootNode.name === tmpl.node.name || (rootNode.id === tmpl.node.id);

          return (
            <div
              key={tmpl.id}
              onClick={() => {
                loadTemplate(tmpl.id);
                addToast(`Loaded template "${tmpl.title}"`, 'success');
              }}
              className={`group p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? isLight
                    ? 'bg-indigo-50 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-indigo-950/60 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : isLight
                  ? 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-slate-100'
                  : 'bg-slate-950 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Layout className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${
                    isLight ? 'text-slate-800 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'
                  }`}>
                    {tmpl.title}
                  </span>
                </div>
                {isActive && <Check className="w-4 h-4 text-emerald-500" />}
              </div>
              <p className={`text-[11px] line-clamp-2 leading-relaxed ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {tmpl.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
