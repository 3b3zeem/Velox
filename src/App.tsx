import { useEffect } from 'react';
import { Header } from './components/header/Header';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { Canvas } from './components/canvas/Canvas';
import { RightSidebar } from './components/inspector/RightSidebar';
import { CodeExportModal } from './components/modals/CodeExportModal';
import { SavedProjectsModal } from './components/modals/SavedProjectsModal';
import { AuthModal } from './components/modals/AuthModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { useBuilderStore } from './store/useBuilderStore';
import { supabase } from './lib/supabase';
import { Plus, SlidersHorizontal, Eye } from 'lucide-react';

export function App() {
  const {
    undo,
    redo,
    viewMode,
    mobilePanel,
    setMobilePanel,
    studioTheme,
    setLeftSidebarOpen,
    setRightSidebarOpen,
    isProjectsModalOpen,
    setProjectsModalOpen,
    isAuthModalOpen,
    setAuthModalOpen,
  } = useBuilderStore();

  const isLight = studioTheme === 'light';

  // Restore user's live draft from Supabase on launch & refresh
  useEffect(() => {
    const restoreCloudDraft = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const userId = data?.user?.id;
        const draftId = userId ? `live_draft_${userId}` : 'live_draft_anonymous';

        const { data: proj } = await supabase
          .from('projects')
          .select('*')
          .eq('id', draftId)
          .maybeSingle();

        if (proj && proj.data) {
          useBuilderStore.setState({
            rootNode: proj.data,
            selectedNodeId: proj.data.id,
            selectedNodeIds: [proj.data.id],
          });
        }
      } catch (err) {
        console.warn('Supabase initial cloud restore offline/error', err);
      }
    };

    restoreCloudDraft();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        restoreCloudDraft();
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Global keyboard shortcuts listener for Undo (Ctrl+Z), Redo (Ctrl+Y / Ctrl+Shift+Z), & Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut triggers when actively editing text fields
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      // Ctrl+Z / Cmd+Z (e.code === 'KeyZ' works on English, Arabic, and all keyboard layouts)
      if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyZ' || e.key.toLowerCase() === 'z')) {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
      // Ctrl+Y / Cmd+Y
      else if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyY' || e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
      }
      // Delete / Backspace key to remove currently selected node
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedNodeId, deleteNode } = useBuilderStore.getState();
        if (selectedNodeId && !selectedNodeId.startsWith('root_')) {
          e.preventDefault();
          deleteNode(selectedNodeId);
        }
      }
      // Escape → clear multi-selection (keeps last selected node active)
      else if (e.key === 'Escape') {
        const { selectedNodeIds, selectedNodeId, setSelectedNodeId } = useBuilderStore.getState();
        if (selectedNodeIds.length > 1) {
          e.preventDefault();
          // Collapse to just the anchor node
          setSelectedNodeId(selectedNodeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const isPreview = viewMode === 'preview';

  return (
    <div className={`w-screen h-dvh flex flex-col overflow-hidden font-sans select-none transition-colors duration-200 ${
      isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      <Header />

      {/* Main Studio Area — pb-14 reserves space for fixed mobile bottom dock */}
      <div className={`flex-1 flex overflow-hidden relative ${!isPreview ? 'pb-14 lg:pb-0' : ''}`}>
        {/* Mobile Backdrop Mask (< lg screens) */}
        {!isPreview && mobilePanel !== 'canvas' && (
          <div
            onClick={() => setMobilePanel('canvas')}
            className="fixed inset-0 top-14 bg-slate-950/60 backdrop-blur-sm z-25 lg:hidden animate-fade-in"
          />
        )}

        {/* Desktop Left Sidebar / Mobile Slide Drawer */}
        {!isPreview && (
          <div
            className={`lg:static z-30 transition-all ${
              mobilePanel === 'left'
                ? `fixed inset-y-14 left-0 w-80 shadow-2xl block border-r ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`
                : 'hidden lg:block'
            }`}
          >
            <LeftSidebar />
          </div>
        )}

        {/* Central Canvas Container */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Canvas />
        </div>

        {/* Desktop Right Sidebar / Mobile Slide Drawer */}
        {!isPreview && (
          <div
            className={`lg:static z-30 transition-all ${
              mobilePanel === 'right'
                ? `fixed inset-y-14 right-0 w-80 shadow-2xl block border-l ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`
                : 'hidden lg:block'
            }`}
          >
            <RightSidebar />
          </div>
        )}
      </div>

      {/* Mobile Bottom Dock Switcher (< lg screens) — fixed so it stays visible on mobile browsers */}
      {!isPreview && (
        <div className={`mobile-bottom-dock lg:hidden fixed bottom-0 inset-x-0 z-40 shadow-xl border-t backdrop-blur-md ${
          isLight ? 'bg-white/95 border-slate-200 text-slate-600' : 'bg-slate-900/95 border-slate-800 text-slate-400'
        }`}>
          <div className="h-14 flex items-center justify-around px-2 text-xs font-medium">
          <button
            onClick={() => {
              setLeftSidebarOpen(true);
              setMobilePanel(mobilePanel === 'left' ? 'canvas' : 'left');
            }}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              mobilePanel === 'left'
                ? 'bg-indigo-600 text-white font-semibold shadow-md'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Palette / Tree</span>
          </button>
          <button
            onClick={() => setMobilePanel('canvas')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              mobilePanel === 'canvas'
                ? 'bg-indigo-600 text-white font-semibold shadow-md'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Canvas</span>
          </button>
          <button
            onClick={() => {
              setRightSidebarOpen(true);
              setMobilePanel(mobilePanel === 'right' ? 'canvas' : 'right');
            }}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              mobilePanel === 'right'
                ? 'bg-indigo-600 text-white font-semibold shadow-md'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Inspector</span>
          </button>
          </div>
        </div>
      )}

      <CodeExportModal />
      <SavedProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setProjectsModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
}

export default App;
