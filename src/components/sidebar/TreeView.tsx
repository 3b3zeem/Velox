/**
 * TreeView.tsx
 * ─────────────────────────────────────────────────────────────
 * The DOM hierarchy tree panel shown in the Left Sidebar → "Layers" tab.
 *
 * Renders the CanvasNode tree as a collapsible indented list where:
 *   • Each row represents one CanvasNode (shown as icon + name)
 *   • Click a row  → select that node (highlights it on the canvas)
 *   • Hover a row  → soft highlight on canvas
 *   • Eye icon     → toggle visibility (hides element from canvas without deleting)
 *   • Drag a row   → reorder within tree via drag-and-drop
 *
 * The tree re-renders reactively whenever rootNode changes in the store.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Box,
  Heading,
  Type,
  MousePointerClick,
  Image,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Square,
  Grid2x2,
  Tag,
  TextCursorInput,
  Link,
  GripVertical,
} from 'lucide-react';
import type { CanvasNode, ComponentType } from '../../types/builder';
import { useBuilderStore } from '../../store/useBuilderStore';

const getNodeIcon = (type: ComponentType) => {
  switch (type) {
    case 'container':
    case 'section':
      return Box;
    case 'grid':
      return Grid2x2;
    case 'card':
      return Square;
    case 'heading':
      return Heading;
    case 'text':
      return Type;
    case 'button':
      return MousePointerClick;
    case 'image':
      return Image;
    case 'badge':
      return Tag;
    case 'input':
      return TextCursorInput;
    case 'link':
      return Link;
    default:
      return Box;
  }
};

interface TreeNodeItemProps {
  node: CanvasNode;
  depth: number;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({ node, depth }) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const {
    selectedNodeId,
    selectedNodeIds,
    hoveredNodeId,
    setSelectedNodeId,
    toggleNodeSelection,
    setHoveredNodeId,
    deleteNode,
    duplicateNode,
    toggleNodeVisibility,
    moveNode,
  } = useBuilderStore();

  const isLight = useBuilderStore((s) => s.studioTheme) === 'light';

  const isSelected = selectedNodeId === node.id;
  const isMultiSelected = selectedNodeIds.includes(node.id) && selectedNodeIds.length > 1;
  const isHovered = hoveredNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const IconComp = getNodeIcon(node.type);

  return (
    <div className="flex flex-col select-none">
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (e.ctrlKey || e.metaKey) {
            toggleNodeSelection(node.id);
          } else {
            setSelectedNodeId(node.id);
          }
        }}
        onMouseEnter={() => setHoveredNodeId(node.id)}
        onMouseLeave={() => setHoveredNodeId(null)}
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData('text/plain', node.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const draggedId = e.dataTransfer.getData('text/plain');
          if (draggedId && draggedId !== node.id) {
            moveNode(draggedId, node.id, node.isContainer ? 'inside' : 'after');
          }
        }}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs font-medium transition-colors cursor-pointer my-0.5 ${
          isSelected
            ? 'bg-indigo-600 text-white shadow-sm font-semibold'
            : isMultiSelected
            ? 'bg-violet-600/80 text-white font-semibold'
            : isHovered
            ? isLight
              ? 'bg-slate-100 text-slate-900'
              : 'bg-slate-800 text-slate-100'
            : isLight
            ? 'text-slate-700 hover:bg-slate-100'
            : 'text-slate-300 hover:bg-slate-800'
        } ${node.hidden ? 'opacity-40' : ''}`}
      >
        <div className="flex items-center space-x-1.5 overflow-hidden">
          {/* Drag Handle */}
          <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
            <GripVertical className="w-3 h-3" />
          </span>

          {/* Expand Toggle */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className={`p-0.5 ${isSelected ? 'text-white' : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-3.5" />
          )}

          {/* Icon */}
          <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-200' : 'text-indigo-500'}`} />

          {/* Name */}
          <span className="truncate max-w-[120px]">{node.name}</span>
        </div>

        {/* Node Actions */}
        <div className={`flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleNodeVisibility(node.id);
            }}
            className={`p-1 ${isSelected ? 'text-white' : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
            title={node.hidden ? 'Show element' : 'Hide element'}
          >
            {node.hidden ? <EyeOff className="w-3 h-3 text-amber-500" /> : <Eye className="w-3 h-3" />}
          </button>
          {node.id !== 'root_container' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateNode(node.id);
                }}
                className={`p-1 ${isSelected ? 'text-white' : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
                title="Duplicate node"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
                className={`p-1 ${isSelected ? 'text-white' : 'text-slate-400 hover:text-red-500'}`}
                title="Delete node"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Render Children Recursively */}
      {hasChildren && expanded && (
        <div className={`flex flex-col border-l ml-3 ${isLight ? 'border-slate-200' : 'border-slate-800/60'}`}>
          {node.children!.map((child) => (
            <TreeNodeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeView: React.FC = () => {
  const { rootNode, studioTheme } = useBuilderStore();
  const isLight = studioTheme === 'light';

  return (
    <div className={`flex flex-col h-full p-3 select-none overflow-y-auto transition-colors duration-200 ${
      isLight ? 'bg-white text-slate-800' : 'bg-slate-900 text-slate-200'
    }`}>
      <div className={`text-[11px] font-bold uppercase tracking-wider mb-2 px-1 ${
        isLight ? 'text-slate-500' : 'text-slate-400'
      }`}>
        Canvas DOM Tree
      </div>
      <TreeNodeItem node={rootNode} depth={0} />
    </div>
  );
};
