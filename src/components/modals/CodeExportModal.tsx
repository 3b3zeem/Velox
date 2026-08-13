import React, { useState } from 'react';
import { X, Copy, Check, Download, Code, FileCode, ExternalLink } from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { compileToReactTSX, compileToHTML } from '../../compiler/astCompiler';
import { exportProjectAsZip } from '../../compiler/zipExporter';

export const CodeExportModal: React.FC = () => {
  const { codeExportModalOpen, setCodeExportModalOpen, rootNode, codeFormat, setCodeFormat, studioTheme } =
    useBuilderStore();
  const [copied, setCopied] = useState(false);
  const isLight = studioTheme === 'light';

  if (!codeExportModalOpen) return null;

  const getCode = () => {
    switch (codeFormat) {
      case 'html':
        return compileToHTML(rootNode);
      case 'jsx':
        return compileToReactTSX(rootNode).replace(/: React\.FC|: string|: number/g, '');
      case 'tsx':
      default:
        return compileToReactTSX(rootNode);
    }
  };

  const codeText = getCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    await exportProjectAsZip(rootNode);
  };

  const lines = codeText.split('\n');

  return (
    <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 select-none ${
      isLight ? 'bg-slate-900/40' : 'bg-slate-950/80'
    }`}>
      <div className={`w-full max-w-4xl h-[85vh] border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors duration-200 ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-500 border border-indigo-500/30">
              <Code className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Production AST Code Exporter</span>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Generated clean React component + Tailwind CSS markup
              </span>
            </div>
          </div>

          <button
            onClick={() => setCodeExportModalOpen(false)}
            className={`p-2 rounded-xl transition-colors ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Format Switcher Rail & Actions */}
        <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800/80'
        }`}>
          {/* Tabs */}
          <div className={`flex p-1 rounded-xl border text-xs font-medium ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => setCodeFormat('tsx')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                codeFormat === 'tsx'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>React TSX</span>
            </button>

            <button
              onClick={() => setCodeFormat('jsx')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                codeFormat === 'jsx'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>React JSX</span>
            </button>

            <button
              onClick={() => setCodeFormat('html')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                codeFormat === 'html'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>HTML5 + Tailwind CDN</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => {
                const htmlContent = compileToHTML(rootNode);
                const data = {
                  title: 'HippoUI Studio Layout',
                  description: 'Exported from HippoUI Studio Visual Builder',
                  html: htmlContent,
                  head: '<script src="https://cdn.tailwindcss.com"></script>',
                };
                const form = document.createElement('form');
                form.action = 'https://codepen.io/pen/define/';
                form.method = 'POST';
                form.target = '_blank';
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'data';
                input.value = JSON.stringify(data);
                form.appendChild(input);
                document.body.appendChild(form);
                form.submit();
                document.body.removeChild(form);
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-medium text-xs border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
              }`}
              title="Open directly in CodePen playground"
            >
              <ExternalLink className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Open in CodePen</span>
            </button>

            <button
              onClick={handleDownload}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-medium text-xs border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
              }`}
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Download ZIP</span>
            </button>
          </div>
        </div>

        {/* Code Syntax Highlighted Editor View */}
        <div className={`flex-1 overflow-auto font-mono text-xs p-4 leading-relaxed select-text ${
          isLight ? 'bg-slate-900 text-slate-100' : 'bg-slate-950 text-slate-200'
        }`}>
          <div className="table w-full border-collapse">
            {lines.map((line, idx) => (
              <div key={idx} className="table-row hover:bg-slate-800/60">
                <span className="table-cell select-none text-right pr-4 text-slate-500 font-mono text-[11px] w-10">
                  {idx + 1}
                </span>
                <span className="table-cell whitespace-pre text-slate-200 font-mono">
                  {line.includes('import') || line.includes('export') || line.includes('function') ? (
                    <span className="text-purple-400">{line}</span>
                  ) : line.includes('return') ? (
                    <span className="text-cyan-400">{line}</span>
                  ) : line.includes('<') && line.includes('>') ? (
                    <span className="text-indigo-300">{line}</span>
                  ) : (
                    line
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
