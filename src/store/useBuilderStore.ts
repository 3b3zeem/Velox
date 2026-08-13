import { create } from 'zustand';
import type { CanvasNode, NodeStyles, ViewportMode, ComponentType } from '../types/builder';
import { INITIAL_CANVAS_NODE, generateId, PRESET_TEMPLATES } from '../data/componentLibrary';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface BuilderState {
  // Tree state
  rootNode: CanvasNode;
  currentTemplateId: string | null;
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  hoveredNodeId: string | null;

  // Viewport & UI State
  viewMode: ViewportMode;
  targetBreakpoint: 'all' | 'mobile' | 'desktop';
  activeTabLeft: 'tree' | 'library' | 'templates';
  activeTabRight: 'styles' | 'content' | 'classes';
  codeExportModalOpen: boolean;
  isProjectsModalOpen: boolean;
  isAuthModalOpen: boolean;
  codeFormat: 'tsx' | 'jsx' | 'html';
  studioTheme: 'light' | 'dark';
  mobilePanel: 'canvas' | 'left' | 'right';
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  simulatedHoverNodeId: string | null;
  boxInspectorEnabled: boolean;

  // Toasts
  toasts: ToastNotification[];
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // History Stack (Undo / Redo)
  history: {
    past: CanvasNode[];
    future: CanvasNode[];
  };

  copiedStyles: Partial<NodeStyles> | null;

  // Actions
  setSelectedNodeId: (id: string | null) => void;
  toggleNodeSelection: (id: string) => void;
  clearMultiSelection: () => void;
  setHoveredNodeId: (id: string | null) => void;
  setSimulatedHoverNodeId: (id: string | null) => void;
  setBoxInspectorEnabled: (enabled: boolean) => void;
  toggleBoxInspector: () => void;
  setViewMode: (mode: ViewportMode) => void;
  setTargetBreakpoint: (bp: 'all' | 'mobile' | 'desktop') => void;
  setActiveTabLeft: (tab: 'tree' | 'library' | 'templates') => void;
  setActiveTabRight: (tab: 'styles' | 'content' | 'classes') => void;
  setCodeExportModalOpen: (open: boolean) => void;
  setProjectsModalOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setCodeFormat: (format: 'tsx' | 'jsx' | 'html') => void;
  setMobilePanel: (panel: 'canvas' | 'left' | 'right') => void;
  setStudioTheme: (theme: 'light' | 'dark') => void;
  toggleStudioTheme: () => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;

  // Style Copy / Paste & Breadcrumb Actions
  copyStyles: (id?: string) => void;
  pasteStyles: (id?: string) => void;
  getBreadcrumbs: () => { id: string; name: string; type: ComponentType }[];

  // Node Mutations
  updateNodeStyles: (id: string, styles: Partial<NodeStyles>) => void;
  updateMultipleNodesStyles: (ids: string[], styles: Partial<NodeStyles>) => void;
  updateNodeProps: (id: string, props: Partial<CanvasNode>) => void;
  applyFullThemePreset: (id: string, themeKey: 'indigo' | 'darkLuxe' | 'clean' | 'mint' | 'rose' | 'glass') => void;
  applyGlobalThemePreset: (themeKey: 'indigo' | 'darkLuxe' | 'clean' | 'mint' | 'rose' | 'glass') => void;
  addNode: (parentId: string, newNode: CanvasNode, targetIndex?: number) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  moveNode: (activeId: string, targetId: string, position?: 'before' | 'after' | 'inside', targetIndex?: number) => void;
  moveNodeOrder: (id: string, direction: 'up' | 'down') => void;
  toggleNodeVisibility: (id: string) => void;
  selectParentNode: (childId: string) => void;

  // Global Actions
  loadTemplate: (templateId: string) => void;
  resetCanvas: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// Tree helper functions
const findNode = (node: CanvasNode, id: string): CanvasNode | null => {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
};

const findParent = (node: CanvasNode, childId: string): CanvasNode | null => {
  if (!node.children) return null;
  for (const child of node.children) {
    if (child.id === childId) return node;
    const parent = findParent(child, childId);
    if (parent) return parent;
  }
  return null;
};

const findAncestors = (
  root: CanvasNode,
  targetId: string,
  path: { id: string; name: string; type: ComponentType }[] = []
): { id: string; name: string; type: ComponentType }[] | null => {
  const currentPath = [...path, { id: root.id, name: root.name, type: root.type }];
  if (root.id === targetId) return currentPath;
  if (root.children) {
    for (const child of root.children) {
      const res = findAncestors(child, targetId, currentPath);
      if (res) return res;
    }
  }
  return null;
};

const updateNodeInTree = (
  node: CanvasNode,
  id: string,
  updater: (target: CanvasNode) => CanvasNode
): CanvasNode => {
  if (node.id === id) {
    return updater(node);
  }
  if (node.children) {
    return {
      ...node,
      children: node.children.map((child) => updateNodeInTree(child, id, updater)),
    };
  }
  return node;
};

const removeNodeFromTree = (node: CanvasNode, id: string): CanvasNode => {
  if (node.children) {
    return {
      ...node,
      children: node.children
        .filter((child) => child.id !== id)
        .map((child) => removeNodeFromTree(child, id)),
    };
  }
  return node;
};

const deepCloneNodeWithNewIds = (node: CanvasNode): CanvasNode => {
  return {
    ...node,
    id: generateId(),
    name: `${node.name} (Copy)`,
    children: node.children ? node.children.map(deepCloneNodeWithNewIds) : undefined,
  };
};

const insertNodeInTree = (
  root: CanvasNode,
  parentId: string,
  newNode: CanvasNode,
  targetIndex?: number
): CanvasNode => {
  return updateNodeInTree(root, parentId, (parent) => {
    const children = parent.children ? [...parent.children] : [];
    if (targetIndex !== undefined && targetIndex >= 0 && targetIndex <= children.length) {
      children.splice(targetIndex, 0, newNode);
    } else {
      children.push(newNode);
    }
    return {
      ...parent,
      isContainer: true,
      children,
    };
  });
};

const moveNodeInTreeHelper = (
  root: CanvasNode,
  activeId: string,
  targetId: string,
  position: 'before' | 'after' | 'inside' = 'after',
  targetIndex?: number
): CanvasNode => {
  if (activeId === targetId || activeId === root.id) return root;

  // Extract node to move
  const nodeToMove = findNode(root, activeId);
  if (!nodeToMove) return root;

  const oldParent = findParent(root, activeId);

  // Remove from old position
  const treeWithoutActive = removeNodeFromTree(root, activeId);

  if (targetIndex !== undefined) {
    let adjustedIndex = targetIndex;
    if (oldParent && oldParent.id === targetId && targetIndex > 0) {
      const oldIdx = oldParent.children?.findIndex((c) => c.id === activeId) ?? -1;
      if (oldIdx !== -1 && oldIdx < targetIndex) {
        adjustedIndex = targetIndex - 1;
      }
    }
    return insertNodeInTree(treeWithoutActive, targetId, nodeToMove, adjustedIndex);
  }

  if (position === 'inside') {
    // Insert as child of target container
    const targetNode = findNode(treeWithoutActive, targetId);
    if (!targetNode) return root;

    // If target is not container, place after target
    if (!targetNode.isContainer) {
      const parent = findParent(treeWithoutActive, targetId);
      if (!parent || !parent.children) return root;
      const idx = parent.children.findIndex((c) => c.id === targetId);
      return insertNodeInTree(treeWithoutActive, parent.id, nodeToMove, idx + 1);
    }

    return insertNodeInTree(treeWithoutActive, targetId, nodeToMove);
  }

  // Insert before or after target node
  const targetParent = findParent(treeWithoutActive, targetId);
  if (!targetParent || !targetParent.children) return root;

  const targetIdx = targetParent.children.findIndex((c) => c.id === targetId);
  const insertIdx = position === 'before' ? targetIdx : targetIdx + 1;

  return insertNodeInTree(treeWithoutActive, targetParent.id, nodeToMove, insertIdx);
};

const recursiveThemeCascade = (
  node: CanvasNode,
  themeKey: 'indigo' | 'darkLuxe' | 'clean' | 'mint' | 'rose' | 'glass',
  isTargetRoot: boolean = false
): CanvasNode => {
  let updatedStyles: Partial<NodeStyles> = { ...node.styles };

  if (isTargetRoot) {
    // Apply container root styles
    switch (themeKey) {
      case 'indigo':
        updatedStyles = {
          ...updatedStyles,
          backgroundColor: 'bg-indigo-600',
          textColor: 'text-white',
          bgGradient: '',
          borderColor: 'border-indigo-500',
          borderRadius: updatedStyles.borderRadius || 'rounded-2xl',
          boxShadow: 'shadow-xl shadow-indigo-600/30',
        };
        break;
      case 'darkLuxe':
        updatedStyles = {
          ...updatedStyles,
          backgroundColor: 'bg-slate-950',
          textColor: 'text-slate-100',
          bgGradient: '',
          borderWidth: 'border',
          borderColor: 'border-slate-800',
          borderRadius: updatedStyles.borderRadius || 'rounded-2xl',
          boxShadow: 'shadow-2xl shadow-black/80',
        };
        break;
      case 'clean':
        updatedStyles = {
          ...updatedStyles,
          backgroundColor: 'bg-white',
          textColor: 'text-slate-900',
          bgGradient: '',
          borderWidth: 'border',
          borderColor: 'border-slate-200',
          borderRadius: updatedStyles.borderRadius || 'rounded-2xl',
          boxShadow: 'shadow-md shadow-slate-200/50',
        };
        break;
      case 'mint':
        updatedStyles = {
          ...updatedStyles,
          backgroundColor: 'bg-emerald-950',
          textColor: 'text-emerald-50',
          bgGradient: '',
          borderWidth: 'border',
          borderColor: 'border-emerald-800',
          borderRadius: updatedStyles.borderRadius || 'rounded-2xl',
          boxShadow: 'shadow-xl shadow-emerald-950/50',
        };
        break;
      case 'rose':
        updatedStyles = {
          ...updatedStyles,
          backgroundColor: 'bg-rose-950',
          textColor: 'text-rose-50',
          bgGradient: '',
          borderWidth: 'border',
          borderColor: 'border-rose-800',
          borderRadius: updatedStyles.borderRadius || 'rounded-2xl',
          boxShadow: 'shadow-xl shadow-rose-950/50',
        };
        break;
      case 'glass':
        updatedStyles = {
          ...updatedStyles,
          backgroundColor: 'bg-slate-100/90',
          textColor: 'text-slate-800',
          bgGradient: '',
          borderWidth: 'border',
          borderColor: 'border-slate-300/80',
          borderRadius: updatedStyles.borderRadius || 'rounded-2xl',
          boxShadow: 'shadow-lg',
        };
        break;
    }
  } else {
    // Apply cascade rules to children based on node type
    if (['heading', 'text', 'link'].includes(node.type)) {
      switch (themeKey) {
        case 'indigo':
          updatedStyles.textColor = node.type === 'heading' ? 'text-white' : 'text-indigo-100';
          updatedStyles.bgGradient = '';
          break;
        case 'darkLuxe':
          updatedStyles.textColor = node.type === 'heading' ? 'text-slate-100' : 'text-slate-400';
          updatedStyles.bgGradient = '';
          break;
        case 'clean':
          updatedStyles.textColor = node.type === 'heading' ? 'text-slate-900' : 'text-slate-600';
          updatedStyles.bgGradient = '';
          break;
        case 'mint':
          updatedStyles.textColor = node.type === 'heading' ? 'text-emerald-100' : 'text-emerald-300';
          updatedStyles.bgGradient = '';
          break;
        case 'rose':
          updatedStyles.textColor = node.type === 'heading' ? 'text-rose-100' : 'text-rose-300';
          updatedStyles.bgGradient = '';
          break;
        case 'glass':
          updatedStyles.textColor = node.type === 'heading' ? 'text-slate-900' : 'text-slate-600';
          updatedStyles.bgGradient = '';
          break;
      }
    } else if (node.type === 'button') {
      switch (themeKey) {
        case 'indigo':
          updatedStyles.backgroundColor = 'bg-white';
          updatedStyles.textColor = 'text-indigo-600';
          updatedStyles.fontWeight = 'font-bold';
          updatedStyles.boxShadow = 'shadow-md';
          break;
        case 'darkLuxe':
          updatedStyles.backgroundColor = 'bg-indigo-600';
          updatedStyles.textColor = 'text-white';
          updatedStyles.fontWeight = 'font-semibold';
          updatedStyles.boxShadow = 'shadow-lg shadow-indigo-600/30';
          break;
        case 'clean':
          updatedStyles.backgroundColor = 'bg-indigo-600';
          updatedStyles.textColor = 'text-white';
          updatedStyles.fontWeight = 'font-semibold';
          updatedStyles.boxShadow = 'shadow-sm';
          break;
        case 'mint':
          updatedStyles.backgroundColor = 'bg-emerald-500';
          updatedStyles.textColor = 'text-slate-950';
          updatedStyles.fontWeight = 'font-bold';
          updatedStyles.boxShadow = 'shadow-lg shadow-emerald-500/30';
          break;
        case 'rose':
          updatedStyles.backgroundColor = 'bg-rose-500';
          updatedStyles.textColor = 'text-white';
          updatedStyles.fontWeight = 'font-bold';
          updatedStyles.boxShadow = 'shadow-lg shadow-rose-500/30';
          break;
        case 'glass':
          updatedStyles.backgroundColor = 'bg-indigo-600';
          updatedStyles.textColor = 'text-white';
          updatedStyles.fontWeight = 'font-medium';
          break;
      }
    } else if (node.type === 'badge') {
      switch (themeKey) {
        case 'indigo':
          updatedStyles.backgroundColor = 'bg-white/20';
          updatedStyles.textColor = 'text-white';
          updatedStyles.borderColor = 'border-white/30';
          break;
        case 'darkLuxe':
          updatedStyles.backgroundColor = 'bg-indigo-500/20';
          updatedStyles.textColor = 'text-indigo-400';
          updatedStyles.borderColor = 'border-indigo-500/30';
          break;
        case 'clean':
          updatedStyles.backgroundColor = 'bg-indigo-50';
          updatedStyles.textColor = 'text-indigo-600';
          updatedStyles.borderColor = 'border-indigo-200';
          break;
        case 'mint':
          updatedStyles.backgroundColor = 'bg-emerald-500/20';
          updatedStyles.textColor = 'text-emerald-300';
          updatedStyles.borderColor = 'border-emerald-500/30';
          break;
        case 'rose':
          updatedStyles.backgroundColor = 'bg-rose-500/20';
          updatedStyles.textColor = 'text-rose-300';
          updatedStyles.borderColor = 'border-rose-500/30';
          break;
      }
    } else if (['card', 'container'].includes(node.type) && !isTargetRoot) {
      switch (themeKey) {
        case 'indigo':
          updatedStyles.backgroundColor = 'bg-indigo-700/60';
          updatedStyles.borderColor = 'border-indigo-500/50';
          break;
        case 'darkLuxe':
          updatedStyles.backgroundColor = 'bg-slate-900/90';
          updatedStyles.borderColor = 'border-slate-800';
          break;
        case 'clean':
          updatedStyles.backgroundColor = 'bg-slate-50';
          updatedStyles.borderColor = 'border-slate-200';
          break;
        case 'mint':
          updatedStyles.backgroundColor = 'bg-emerald-900/60';
          updatedStyles.borderColor = 'border-emerald-700/50';
          break;
        case 'rose':
          updatedStyles.backgroundColor = 'bg-rose-900/60';
          updatedStyles.borderColor = 'border-rose-700/50';
          break;
      }
    }
  }

  const updatedChildren = node.children
    ? node.children.map((child) => recursiveThemeCascade(child, themeKey, false))
    : undefined;

  return {
    ...node,
    styles: updatedStyles,
    children: updatedChildren,
  };
};

import { supabase } from '../lib/supabase';

let cloudAutosaveTimer: any = null;

export const autoSaveToSupabaseCloud = (templateId: string | null, node: CanvasNode) => {
  if (!templateId || !node) return;
  if (cloudAutosaveTimer) clearTimeout(cloudAutosaveTimer);
  cloudAutosaveTimer = setTimeout(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('projects').upsert({
        id: `tmpl_${user.id}_${templateId}`,
        user_id: user.id,
        name: templateId,
        data: node,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Supabase cloud autosave error:', err);
    }
  }, 1000);
};

const initialTemplate = PRESET_TEMPLATES.find((t) => t.id === 'portfolio') || PRESET_TEMPLATES[0];

export const useBuilderStore = create<BuilderState>((set, get) => ({
  rootNode: initialTemplate ? initialTemplate.node : INITIAL_CANVAS_NODE,
  currentTemplateId: 'portfolio',
  selectedNodeId: (initialTemplate ? initialTemplate.node : INITIAL_CANVAS_NODE).id,
  selectedNodeIds: [(initialTemplate ? initialTemplate.node : INITIAL_CANVAS_NODE).id],
  hoveredNodeId: null,

  viewMode: 'desktop',
  targetBreakpoint: 'all',
  activeTabLeft: 'library',
  activeTabRight: 'styles',
  codeExportModalOpen: false,
  isProjectsModalOpen: false,
  isAuthModalOpen: false,
  codeFormat: 'tsx',
  studioTheme: 'light',
  mobilePanel: 'canvas',
  isLeftSidebarOpen: true,
  isRightSidebarOpen: true,
  simulatedHoverNodeId: null,
  boxInspectorEnabled: false,

  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  history: {
    past: [],
    future: [],
  },

  copiedStyles: null,

  copyStyles: (id) => {
    const { rootNode, selectedNodeId } = get();
    const targetId = id || selectedNodeId;
    if (!targetId) return;
    const node = findNode(rootNode, targetId);
    if (node) {
      set({ copiedStyles: { ...node.styles } });
    }
  },

  pasteStyles: (id) => {
    const { rootNode, selectedNodeId, selectedNodeIds, copiedStyles, history } = get();
    const targetId = id || selectedNodeId;
    if (!targetId || !copiedStyles) return;

    const targets = selectedNodeIds.length > 1 && selectedNodeIds.includes(targetId)
      ? selectedNodeIds
      : [targetId];

    let updatedRoot = rootNode;
    targets.forEach((tId) => {
      updatedRoot = updateNodeInTree(updatedRoot, tId, (node) => ({
        ...node,
        styles: {
          ...node.styles,
          ...copiedStyles,
        },
      }));
    });

    set({
      rootNode: updatedRoot,
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  getBreadcrumbs: () => {
    const { rootNode, selectedNodeId } = get();
    if (!selectedNodeId) return [];
    return findAncestors(rootNode, selectedNodeId) || [];
  },

  setSelectedNodeId: (id) => {
    const { rootNode } = get();
    const node = id ? findNode(rootNode, id) : null;
    let nextTabRight = get().activeTabRight;
    if (node && ['image', 'heading', 'text', 'link', 'button', 'badge', 'input'].includes(node.type)) {
      nextTabRight = 'content';
    }
    set({
      selectedNodeId: id,
      selectedNodeIds: id ? [id] : [],
      activeTabRight: nextTabRight,
    });
  },

  toggleNodeSelection: (id) => {
    const { selectedNodeIds } = get();
    if (selectedNodeIds.includes(id)) {
      if (selectedNodeIds.length === 1) return;
      const next = selectedNodeIds.filter((i) => i !== id);
      set({ selectedNodeIds: next, selectedNodeId: next[next.length - 1] });
    } else {
      set({ selectedNodeIds: [...selectedNodeIds, id], selectedNodeId: id });
    }
  },

  clearMultiSelection: () => {
    const { selectedNodeId, rootNode } = get();
    const anchor = selectedNodeId || rootNode.id;
    set({ selectedNodeIds: [anchor], selectedNodeId: anchor });
  },

  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  setSimulatedHoverNodeId: (id) => set({ simulatedHoverNodeId: id }),
  setBoxInspectorEnabled: (enabled) => set({ boxInspectorEnabled: enabled }),
  toggleBoxInspector: () => set((state) => ({ boxInspectorEnabled: !state.boxInspectorEnabled })),
  setTargetBreakpoint: (bp) => set({ targetBreakpoint: bp }),
  setViewMode: (mode) => {
    const targetBp = mode === 'mobile' || mode === 'tablet' ? 'mobile' : 'all';
    set({ viewMode: mode, targetBreakpoint: targetBp });
  },
  setActiveTabLeft: (tab) => set({ activeTabLeft: tab }),
  setActiveTabRight: (tab) => set({ activeTabRight: tab }),
  setCodeExportModalOpen: (open) => set({ codeExportModalOpen: open }),
  setProjectsModalOpen: (open) => set({ isProjectsModalOpen: open }),
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setCodeFormat: (format) => set({ codeFormat: format }),
  setMobilePanel: (panel) => set({ mobilePanel: panel }),
  setStudioTheme: (theme) => set({ studioTheme: theme }),
  toggleStudioTheme: () => set((state) => ({ studioTheme: state.studioTheme === 'light' ? 'dark' : 'light' })),
  toggleLeftSidebar: () => set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),
  toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
  setLeftSidebarOpen: (open) => set({ isLeftSidebarOpen: open }),
  setRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),

  updateNodeStyles: (id, newStyles) => {
    const { rootNode, currentTemplateId, history } = get();
    const updatedRoot = updateNodeInTree(rootNode, id, (node) => ({
      ...node,
      styles: {
        ...node.styles,
        ...newStyles,
      },
    }));

    autoSaveToSupabaseCloud(currentTemplateId, updatedRoot);

    set({
      rootNode: updatedRoot,
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  updateMultipleNodesStyles: (ids, newStyles) => {
    const { rootNode, currentTemplateId, history } = get();
    let updatedRoot = rootNode;

    ids.forEach((id) => {
      updatedRoot = updateNodeInTree(updatedRoot, id, (node) => ({
        ...node,
        styles: {
          ...node.styles,
          ...newStyles,
        },
      }));
    });

    autoSaveToSupabaseCloud(currentTemplateId, updatedRoot);

    set({
      rootNode: updatedRoot,
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  updateNodeProps: (id, newProps) => {
    const { rootNode, currentTemplateId, history } = get();
    const updatedRoot = updateNodeInTree(rootNode, id, (node) => ({
      ...node,
      ...newProps,
    }));

    autoSaveToSupabaseCloud(currentTemplateId, updatedRoot);

    set({
      rootNode: updatedRoot,
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  applyFullThemePreset: (id, themeKey) => {
    const { rootNode, currentTemplateId, selectedNodeId, selectedNodeIds, history } = get();
    const targetId = id || selectedNodeId;
    if (!targetId) return;

    const targets = selectedNodeIds.length > 1 && selectedNodeIds.includes(targetId)
      ? selectedNodeIds
      : [targetId];

    let updatedRoot = rootNode;
    targets.forEach((tId) => {
      updatedRoot = updateNodeInTree(updatedRoot, tId, (targetNode) =>
        recursiveThemeCascade(targetNode, themeKey, true)
      );
    });

    autoSaveToSupabaseCloud(currentTemplateId, updatedRoot);

    set({
      rootNode: updatedRoot,
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  applyGlobalThemePreset: (themeKey) => {
    const { rootNode, currentTemplateId, history } = get();
    const updatedRoot = recursiveThemeCascade(rootNode, themeKey, true);

    autoSaveToSupabaseCloud(currentTemplateId, updatedRoot);

    set({
      rootNode: updatedRoot,
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  addNode: (parentId, newNode, targetIndex) => {
    const { rootNode, currentTemplateId, history } = get();

    // Verify parent exists or default to root
    const parentNode = findNode(rootNode, parentId);
    const validParentId = parentNode && parentNode.isContainer ? parentId : rootNode.id;

    const updatedRoot = insertNodeInTree(rootNode, validParentId, newNode, targetIndex);

    autoSaveToSupabaseCloud(currentTemplateId, updatedRoot);

    set({
      rootNode: updatedRoot,
      selectedNodeId: newNode.id,
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  deleteNode: (id) => {
    const { rootNode, currentTemplateId, selectedNodeId, history } = get();
    if (id === rootNode.id) return; // Cannot delete root

    const updatedRoot = removeNodeFromTree(rootNode, id);
    const nextSelected = selectedNodeId === id ? rootNode.id : selectedNodeId;

    autoSaveToSupabaseCloud(currentTemplateId, updatedRoot);

    set({
      rootNode: updatedRoot,
      selectedNodeId: nextSelected,
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  duplicateNode: (id) => {
    const { rootNode, history } = get();
    if (id === rootNode.id) return;

    const targetNode = findNode(rootNode, id);
    const parentNode = findParent(rootNode, id);
    if (!targetNode || !parentNode || !parentNode.children) return;

    const cloned = deepCloneNodeWithNewIds(targetNode);
    const currentIndex = parentNode.children.findIndex((c) => c.id === id);
    const updatedRoot = insertNodeInTree(rootNode, parentNode.id, cloned, currentIndex + 1);

    set({
      rootNode: updatedRoot,
      selectedNodeId: cloned.id,
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  moveNode: (activeId, targetId, position, targetIndex) => {
    const { rootNode, history } = get();
    const updatedRoot = moveNodeInTreeHelper(rootNode, activeId, targetId, position, targetIndex);

    set({
      rootNode: updatedRoot,
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  moveNodeOrder: (id, direction) => {
    const { rootNode, history } = get();
    const parent = findParent(rootNode, id);
    if (!parent || !parent.children) return;

    const index = parent.children.findIndex((c) => c.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= parent.children.length) return;

    const newChildren = [...parent.children];
    const [movedNode] = newChildren.splice(index, 1);
    newChildren.splice(targetIndex, 0, movedNode);

    const updatedRoot = updateNodeInTree(rootNode, parent.id, (node) => ({
      ...node,
      children: newChildren,
    }));

    set({
      rootNode: updatedRoot,
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  toggleNodeVisibility: (id) => {
    const { rootNode, history } = get();
    const updatedRoot = updateNodeInTree(rootNode, id, (node) => ({
      ...node,
      hidden: !node.hidden,
    }));

    set({
      rootNode: updatedRoot,
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  selectParentNode: (childId) => {
    const { rootNode } = get();
    const parent = findParent(rootNode, childId);
    if (parent) {
      set({ selectedNodeId: parent.id });
    }
  },

  loadTemplate: async (templateId) => {
    const { rootNode, currentTemplateId, history } = get();

    // 1. Save current active template state to Supabase Cloud if user is logged in
    if (currentTemplateId && rootNode) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('projects').upsert({
            id: `tmpl_${user.id}_${currentTemplateId}`,
            user_id: user.id,
            name: currentTemplateId,
            data: rootNode,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Cloud save error before template switch:', err);
      }
    }

    const template = PRESET_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    let targetNode = template.node;

    // 2. Fetch saved state for target template from Supabase Cloud
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('projects')
          .select('data')
          .eq('user_id', user.id)
          .eq('name', templateId)
          .single();

        if (!error && data?.data) {
          targetNode = data.data;
        }
      }
    } catch (err) {
      console.error('Cloud fetch error during template load:', err);
    }

    set({
      rootNode: targetNode,
      currentTemplateId: templateId,
      selectedNodeId: targetNode.id,
      selectedNodeIds: [targetNode.id],
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  resetCanvas: async () => {
    const { currentTemplateId, history, rootNode } = get();
    let template = PRESET_TEMPLATES.find((t) => t.id === currentTemplateId);
    const nextRoot = template ? template.node : INITIAL_CANVAS_NODE;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && currentTemplateId) {
        await supabase.from('projects').delete().eq('id', `tmpl_${user.id}_${currentTemplateId}`);
      }
    } catch (err) {
      console.error('Error deleting cloud template draft:', err);
    }

    set({
      rootNode: nextRoot,
      selectedNodeId: nextRoot.id,
      selectedNodeIds: [nextRoot.id],
      history: {
        past: [...history.past.slice(-30), rootNode],
        future: [],
      },
    });
  },

  undo: () => {
    const { rootNode, history } = get();
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);

    set({
      rootNode: previous,
      history: {
        past: newPast,
        future: [rootNode, ...history.future],
      },
    });
  },

  redo: () => {
    const { rootNode, history } = get();
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    set({
      rootNode: next,
      history: {
        past: [...history.past, rootNode],
        future: newFuture,
      },
    });
  },

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,
}));

// ─── Supabase Cloud Auto-Sync Subscription (No LocalStorage) ──────────────
let syncDebounceTimer: any = null;

useBuilderStore.subscribe((state) => {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      const draftId = userId ? `live_draft_${userId}` : 'live_draft_anonymous';

      await supabase.from('projects').upsert({
        id: draftId,
        user_id: userId || null,
        name: 'Active Live Canvas',
        data: state.rootNode,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase cloud auto-sync error:', e);
    }
  }, 500);
});

export const getSelectedNode = (root: CanvasNode, selectedId: string | null): CanvasNode | null => {
  if (!selectedId) return null;
  return findNode(root, selectedId);
};
