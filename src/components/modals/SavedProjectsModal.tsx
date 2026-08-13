/**
 * SavedProjectsModal.tsx
 * ─────────────────────────────────────────────────────────────
 * Project Manager Modal:
 *   • Auto-saves current design locally
 *   • Allows saving named snapshots to LocalStorage
 *   • Allows downloading design as .json file
 *   • Allows uploading/importing .json file
 *   • Integrates with Supabase for Cloud saving & Auth
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Save,
  Download,
  Upload,
  Trash2,
  X,
  Cloud,
  Clock,
  Check,
  UserCheck,
  LogIn,
} from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { supabase } from '../../lib/supabase';

interface SavedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedProjectsModal: React.FC<SavedProjectsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { rootNode, studioTheme, setAuthModalOpen, addToast } = useBuilderStore();
  const isLight = studioTheme === 'light';

  const [projectName, setProjectName] = useState('');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Supabase Auth State
  const [user, setUser] = useState<any>(null);
  const [cloudProjects, setCloudProjects] = useState<any[]>([]);

  // Load cloud projects on open & handle exit animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      checkSupabaseUser();
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCloseModal = () => {
    onClose();
  };

  const handleSaveCurrent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveErrorMsg('');
    const trimmedName = projectName.trim();

    // Required Field Validation
    if (!trimmedName) {
      setSaveErrorMsg('Project name is required before saving!');
      return;
    }

    // Require Auth Check — opens AuthModal if not logged in
    if (!user) {
      setSaveErrorMsg('Please log in first to save your project!');
      onClose();
      setAuthModalOpen(true);
      return;
    }

    // Save directly to Supabase Cloud
    try {
      const projId = `proj_${Date.now()}`;
      const { error } = await supabase.from('projects').upsert({
        id: projId,
        user_id: user.id,
        name: trimmedName,
        data: rootNode,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        setSaveErrorMsg(`❌ Cloud Save Error: ${error.message}`);
      } else {
        setProjectName('');
        setSaveErrorMsg('');
        setSavedSuccessMsg(`Project "${trimmedName}" saved to Supabase Cloud!`);
        setTimeout(() => setSavedSuccessMsg(''), 3500);
        fetchCloudProjects();
      }
    } catch (err: any) {
      setSaveErrorMsg(`❌ Save failed: ${err.message}`);
    }
  };

  const handleLoadCloudProject = (proj: any) => {
    useBuilderStore.setState({
      rootNode: proj.data,
      selectedNodeId: proj.data.id,
      selectedNodeIds: [proj.data.id],
    });
    handleCloseModal();
  };

  const handleDeleteCloudProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (!error) {
        setCloudProjects((prev) => prev.filter((p) => p.id !== id));
        addToast('Project deleted from cloud.', 'info');
      } else {
        addToast(`Failed to delete project: ${error.message}`, 'error');
      }
    } catch (err) {
      console.error('Delete cloud project error:', err);
    }
  };

  const handleExportJson = () => {
    const jsonString = JSON.stringify(rootNode, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `velox-ui-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Design exported as JSON file.', 'success');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData && importedData.id && importedData.type) {
          useBuilderStore.setState({
            rootNode: importedData,
            selectedNodeId: importedData.id,
            selectedNodeIds: [importedData.id],
          });
          setSavedSuccessMsg('Imported design successfully!');
          addToast('Imported design successfully!', 'success');
          setTimeout(() => setSavedSuccessMsg(''), 3000);
          handleCloseModal();
        } else {
          addToast('Invalid Velox JSON design file format.', 'error');
        }
      } catch (err) {
        addToast('Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // ── Supabase Cloud Persistence ─────────────────────────────────────────

  const checkSupabaseUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        fetchCloudProjects();
      }
    } catch (err) {
      console.warn('Supabase not configured or offline');
    }
  };

  const fetchCloudProjects = async () => {
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });
      if (data) setCloudProjects(data);
    } catch (e) {
      console.warn('Cloud fetch error');
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      onClick={handleCloseModal}
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'animate-modal-backdrop'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'animate-modal-pop'
        } ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-500">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Project Manager & Cloud Sync</h3>
              <p className="text-[11px] text-slate-500">Save, import, export, or sync your UI designs</p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-200 border-slate-300' : 'hover:bg-slate-800 border-slate-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-5">
          {savedSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              {savedSuccessMsg}
            </div>
          )}

          {/* Quick Actions Bar */}
          <form onSubmit={handleSaveCurrent} className={`p-3 rounded-xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <label className="text-xs font-bold block">Save Current Design</label>
            
            {saveErrorMsg && (
              <p className="text-[11px] text-red-500 font-semibold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg animate-shake">
                {saveErrorMsg}
              </p>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  if (saveErrorMsg) setSaveErrorMsg('');
                }}
                placeholder="Project Name (Required: e.g. Portfolio Landing Page)"
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-indigo-500 transition-colors ${
                  saveErrorMsg
                    ? 'border-red-500 bg-red-500/5 focus:border-red-500'
                    : isLight
                      ? 'bg-white border-slate-300'
                      : 'bg-slate-900 border-slate-700'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </div>

            {/* Import / Export JSON */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleExportJson}
                className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  isLight ? 'bg-white border-slate-300 hover:bg-slate-100' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-indigo-500" /> Export JSON File
              </button>

              <label
                className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                  isLight ? 'bg-white border-slate-300 hover:bg-slate-100' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-emerald-500" /> Import JSON File
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
            </div>
          </form>

          {/* Cloud Saved Projects List (Requires Supabase Auth) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Cloud Saved Projects ({user ? cloudProjects.length : 0})</span>
              <span className="text-[10px] font-mono text-indigo-500">Supabase Cloud Storage</span>
            </h4>

            {!user ? (
              <div className={`p-4 text-center rounded-xl border text-xs text-slate-500 ${
                isLight ? 'bg-amber-50/50 border-amber-200 text-amber-800' : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
              }`}>
                Sign in or register below to view and save your projects directly to Supabase Cloud!
              </div>
            ) : cloudProjects.length === 0 ? (
              <div className={`p-6 text-center rounded-xl border text-xs text-slate-500 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                No cloud projects found for {user.email}. Enter a project name above and click Save!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cloudProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => handleLoadCloudProject(proj)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 hover:scale-[1.01] ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-300'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 hover:border-indigo-500/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs truncate">{proj.name}</span>
                        <button
                          onClick={(e) => handleDeleteCloudProject(proj.id, e)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete Cloud Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" /> {new Date(proj.updated_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-500 font-bold">Cloud Sync</span>
                      </div>
                    </div>

                    <button className="w-full py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-500 transition-colors">
                      Load Design
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supabase Cloud Projects / Auth Banner */}
          <div
            id="supabase-auth-section"
            className={`p-4 rounded-xl border space-y-2.5 ${
              isLight ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-900/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Cloud className="w-4 h-4" /> Cloud Account & Backup
              </span>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-500 px-2 py-0.5 rounded-full font-bold">
                {user ? `Logged in: ${user.email}` : 'Sign In Required'}
              </span>
            </div>

            {!user ? (
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Log in to sync your UI designs across devices automatically.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1 shrink-0 ml-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Log In / Sign Up
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  <UserCheck className="w-4 h-4" /> Account connected & ready for Cloud Backup!
                </span>
                <button
                  onClick={() => {
                    onClose();
                    setAuthModalOpen(true);
                  }}
                  className="text-[11px] text-indigo-500 font-semibold hover:underline"
                >
                  Manage Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
