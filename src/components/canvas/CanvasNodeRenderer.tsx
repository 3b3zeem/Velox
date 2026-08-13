import React, { memo, useState, useRef } from 'react';
import {
  CornerUpLeft,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
  GripVertical,
  Menu,
  X,
  Send,
  MoreVertical,
  Grid,
  SlidersHorizontal,
} from 'lucide-react';
import type { CanvasNode } from '../../types/builder';
import { getNodeClassNames } from '../../compiler/astCompiler';
import { useBuilderStore } from '../../store/useBuilderStore';

interface CanvasNodeRendererProps {
  node: CanvasNode;
  isRoot?: boolean;
  isMobileView?: boolean;
}

export const CanvasNodeRenderer: React.FC<CanvasNodeRendererProps> = memo(({ node, isRoot = false, isMobileView = false }) => {
  const {
    selectedNodeId,
    hoveredNodeId,
    setSelectedNodeId,
    setHoveredNodeId,
    deleteNode,
    duplicateNode,
    selectParentNode,
    moveNode,
    moveNodeOrder,
    addNode,
    updateNodeProps,
    viewMode,
    simulatedHoverNodeId,
    boxInspectorEnabled,
  } = useBuilderStore();

  const [isEditingInline, setIsEditingInline] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);

  // Draggable Floating Toolbar State & Handlers
  const [toolbarOffset, setToolbarOffset] = useState<{ x: number; y: number }>({ x: 0, y: -38 });
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const handleToolbarMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: toolbarOffset.x,
      initialY: toolbarOffset.y,
    };

    const handleMouseMove = (moveEv: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = moveEv.clientX - dragStartRef.current.startX;
      const deltaY = moveEv.clientY - dragStartRef.current.startY;
      setToolbarOffset({
        x: dragStartRef.current.initialX + deltaX,
        y: dragStartRef.current.initialY + deltaY,
      });
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const isPreview = viewMode === 'preview';

  if (node.hidden) return null;

  let classNameStr = getNodeClassNames(node.styles);

  // Simulated Hover Mode logic: Strip hover: prefix and apply directly
  if (simulatedHoverNodeId === node.id) {
    const activeHoverClasses = [
      node.styles.hoverEffect,
      node.styles.hoverBg,
      node.styles.hoverTextColor,
      node.styles.hoverShadow,
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/hover:/g, '');
    classNameStr += ` ${activeHoverClasses}`;
  }

  // Responsive class overrides when Mobile mode or Mobile Frame in Split View is active
  const isMobileFrame = viewMode === 'mobile' || isMobileView;

  if (isMobileFrame) {
    // Process max-md: overrides first so user responsive edits apply directly inside mobile frames
    const maxMdMatches = classNameStr.match(/\bmax-md:([^\s]+)/g);
    if (maxMdMatches) {
      maxMdMatches.forEach((fullMatch) => {
        const targetCls = fullMatch.replace('max-md:', '');
        if (targetCls.startsWith('text-')) {
          if (['text-left', 'text-center', 'text-right', 'text-justify'].includes(targetCls)) {
            classNameStr = classNameStr.replace(/\btext-(left|center|right|justify)\b/g, '');
          } else if (/^text-(xs|sm|base|lg|xl|[2-9]xl)$/.test(targetCls)) {
            classNameStr = classNameStr.replace(/\btext-(xs|sm|base|lg|xl|[2-9]xl)\b/g, '');
          }
        } else if (targetCls.startsWith('flex-')) {
          classNameStr = classNameStr.replace(/\bflex-(row|col)\b/g, '');
        } else if (targetCls.startsWith('grid-cols-')) {
          classNameStr = classNameStr.replace(/\bgrid-cols-\d+\b/g, '');
        } else if (targetCls.startsWith('p-') || targetCls.startsWith('px-') || targetCls.startsWith('py-')) {
          const prefix = targetCls.startsWith('px-') ? 'px-' : targetCls.startsWith('py-') ? 'py-' : 'p-';
          classNameStr = classNameStr.replace(new RegExp(`\\b${prefix}\\d+\\b`, 'g'), '');
        } else if (targetCls === 'hidden') {
          classNameStr = classNameStr.replace(/\b(flex|block|grid|inline-block)\b/g, '');
        }
        classNameStr += ` ${targetCls}`;
      });
      classNameStr = classNameStr.replace(/\bmax-md:[^\s]+/g, '');
    }

    if (node.type === 'grid') {
      classNameStr = classNameStr.replace(/grid-cols-\d+|md:grid-cols-\d+|sm:grid-cols-\d+/g, 'grid-cols-1');
    }
    if (node.type === 'heading') {
      classNameStr = classNameStr.replace(/md:text-6xl|md:text-5xl|text-6xl|text-5xl|text-4xl/g, 'text-2xl font-bold');
    }
    if (node.type === 'section' || node.type === 'container' || node.type === 'card') {
      classNameStr += ' max-w-full overflow-hidden';
    }
  } else if (viewMode === 'tablet') {
    if (node.type === 'grid') {
      classNameStr = classNameStr.replace(/grid-cols-3|md:grid-cols-3/g, 'grid-cols-2');
    }
  }

  // Selection & Drop Outline classes
  let outlineStyle = '';
  if (!isPreview) {
    if (boxInspectorEnabled && (isSelected || isHovered)) {
      outlineStyle = 'relative ring-2 ring-emerald-500 ring-offset-2 bg-emerald-500/5 shadow-lg z-10';
    } else if (isSelected) {
      outlineStyle = 'relative outline outline-2 outline-indigo-500 outline-offset-2 shadow-lg z-10';
    } else if (isHovered) {
      outlineStyle = 'relative outline outline-1 outline-indigo-400/60 outline-offset-1 z-0';
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isPreview) return;
    e.stopPropagation();
    setSelectedNodeId(node.id);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isPreview) return;
    e.stopPropagation();
    setHoveredNodeId(node.id);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isPreview) return;
    e.stopPropagation();
    setHoveredNodeId(null);
  };

  // Drag & drop handlers for containers / elements
  const handleDragOver = (e: React.DragEvent) => {
    if (isPreview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isPreview) return;
    e.preventDefault();
    e.stopPropagation();

    // Check if dragging palette new node JSON or tree node ID
    const paletteNodeJson = e.dataTransfer.getData('application/json');
    if (paletteNodeJson) {
      try {
        const newNodePayload = JSON.parse(paletteNodeJson);
        addNode(node.isContainer ? node.id : 'root_container', newNodePayload);
      } catch (err) {
        console.error('Failed to parse drag node:', err);
      }
      return;
    }

    const treeNodeId = e.dataTransfer.getData('text/plain');
    if (treeNodeId && treeNodeId !== node.id) {
      moveNode(treeNodeId, node.id, node.isContainer ? 'inside' : 'after');
    }
  };

  // Render children recursively
  const childrenContent =
    node.children && node.children.length > 0 ? (
      node.children.map((child) => (
        <CanvasNodeRenderer key={child.id} node={child} isMobileView={isMobileView} />
      ))
    ) : node.isContainer && !isPreview ? (
      <div className="border-2 border-dashed border-slate-700/60 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 text-xs font-mono select-none my-2 bg-slate-950/20 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors">
        <span>+ Drop components into {node.name}</span>
      </div>
    ) : null;

  // Render element DOM node based on type
  const renderInnerComponent = () => {
    switch (node.type) {
      case 'container':
      case 'card':
      case 'section': {
        const nameLower = node.name.toLowerCase();
        const isNavGroup = nameLower.includes('group') || nameLower.includes('links') || nameLower.includes('items');
        const isNavbar = (nameLower.includes('navbar') || nameLower.includes('navigation') || nameLower.includes('header') || nameLower === 'nav') && !isNavGroup;

        if (isNavbar && isMobileFrame) {
          const mobileCtaMode = node.mobileCtaMode || 'in_menu';
          const childrenNodes = node.children || [];

          // Recursive search for CTA button inside direct children or child containers (like Actions Group)
          const findAllButtons = (nodes: CanvasNode[]): CanvasNode[] => {
            let btns: CanvasNode[] = [];
            for (const n of nodes) {
              if (n.type === 'button') {
                btns.push(n);
              } else if (n.children && n.children.length > 0) {
                btns = btns.concat(findAllButtons(n.children));
              }
            }
            return btns;
          };

          const allButtons = findAllButtons(childrenNodes);
          const ctaButton = allButtons.find((c) => c.name.toLowerCase().includes('cta') || c.name.toLowerCase().includes('action') || c.name.toLowerCase().includes('talk') || c.name.toLowerCase().includes('contact') || c.name.toLowerCase().includes('start') || c.name.toLowerCase().includes('get')) || allButtons[0];
          
          // Brand / Logo element resolution
          const logoChild = childrenNodes.find((c) => !c.isContainer && (c.type === 'heading' || c.type === 'text' || c.name.toLowerCase().includes('logo') || c.name.toLowerCase().includes('brand'))) || childrenNodes.find((c) => !c.isContainer) || childrenNodes[0];
          
          // Nav links container or direct links
          const navGroupChild = childrenNodes.find((c) => c.isContainer && c !== logoChild && (c.name.toLowerCase().includes('link') || c.name.toLowerCase().includes('nav')));
          const directLinks = childrenNodes.filter((c) => c !== logoChild && c.type !== 'button' && c !== navGroupChild);
          const navItemsToRender = navGroupChild && navGroupChild.children && navGroupChild.children.length > 0 ? navGroupChild.children : directLinks;

          const activeBg = node.mobileMenuBg || node.styles.backgroundColor;
          const isHexOrRgb = activeBg && (activeBg.startsWith('#') || activeBg.startsWith('rgb'));

          const containerBgStyle = isHexOrRgb ? { backgroundColor: activeBg } : undefined;
          const containerBgClass = !isHexOrRgb && activeBg ? activeBg : (activeBg ? '' : 'bg-slate-900 dark:bg-slate-950');

          const mobileCtaAlign = node.mobileCtaAlign || 'full';
          const ctaAlignClass =
            mobileCtaAlign === 'center' ? 'w-auto max-w-[240px] mx-auto text-center' :
            mobileCtaAlign === 'left' ? 'w-auto max-w-[240px] mr-auto' :
            mobileCtaAlign === 'right' ? 'w-auto max-w-[240px] ml-auto' :
            'w-full';

          return (
            <div
              style={containerBgStyle}
              className={`w-full relative z-30 rounded-2xl border border-slate-700/50 ${containerBgClass} backdrop-blur-md shadow-lg transition-all overflow-hidden my-1`}
            >
              {/* TOP HEADER BAR (BRAND LEFT, ACTIONS RIGHT) */}
              <div className="w-full flex items-center justify-between px-4 py-3 min-h-[56px] border-b border-white/10">
                {/* BRAND / LOGO - FORCED LEFT ALIGNMENT SINGLE LINE */}
                <div className="flex items-center text-left min-w-0 flex-1 pr-2 whitespace-nowrap overflow-hidden">
                  {logoChild ? (
                    <div className="text-left text-base font-bold truncate tracking-tight text-white whitespace-nowrap">
                      <CanvasNodeRenderer node={logoChild} isMobileView={isMobileView} />
                    </div>
                  ) : (
                    <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">Brand Logo</span>
                  )}
                </div>

                {/* RIGHT SIDE ACTIONS: CTA BUTTON + HAMBURGER */}
                <div className="flex items-center gap-2 shrink-0">
                  {ctaButton && mobileCtaMode === 'top_compact' && (
                    <div className="shrink-0 max-w-[120px] whitespace-nowrap overflow-hidden">
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-500/25 transition-all truncate cursor-pointer active:scale-95"
                      >
                        {ctaButton.content || 'Action'}
                      </button>
                    </div>
                  )}

                  {ctaButton && mobileCtaMode === 'top_icon' && (
                    <button
                      type="button"
                      className="w-8.5 h-8.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                      title={ctaButton.content || 'Action'}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}

                  {/* Customized Animated Morphing Hamburger Button */}
                  {(() => {
                    const btnStyle = node.mobileMenuBtnStyle || 'rounded';
                    const btnIcon = node.mobileMenuBtnIcon || 'hamburger';
                    const customBtnBg = node.mobileMenuBtnBg;

                    const shapeClass =
                      btnStyle === 'circle' ? 'rounded-full' :
                      btnStyle === 'square' ? 'rounded-none' :
                      btnStyle === 'ghost' ? 'rounded-xl border-none shadow-none' :
                      'rounded-xl';

                    const isBtnHexOrRgb = customBtnBg && (customBtnBg.startsWith('#') || customBtnBg.startsWith('rgb'));
                    const btnStyleAttr = isBtnHexOrRgb ? { backgroundColor: customBtnBg } : undefined;
                    const btnClassAttr = !isBtnHexOrRgb && customBtnBg
                      ? customBtnBg
                      : (isMobileMenuOpen
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/25'
                          : 'bg-white/10 hover:bg-white/20 text-slate-100 border-white/20');

                    return (
                      <button
                        type="button"
                        style={btnStyleAttr}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMobileMenuOpen(!isMobileMenuOpen);
                        }}
                        className={`p-2.5 ${shapeClass} border transition-all duration-300 cursor-pointer shadow-xs active:scale-90 flex items-center justify-center ${btnClassAttr}`}
                        title={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                      >
                        <div className={`transition-transform duration-300 transform-gpu ${isMobileMenuOpen ? 'rotate-90 scale-110 text-white' : 'rotate-0 scale-100'}`}>
                          {isMobileMenuOpen ? (
                            <X className="w-4.5 h-4.5" />
                          ) : btnIcon === 'dots' ? (
                            <MoreVertical className="w-4.5 h-4.5" />
                          ) : btnIcon === 'grid' ? (
                            <Grid className="w-4.5 h-4.5" />
                          ) : (
                            <Menu className="w-4.5 h-4.5" />
                          )}
                        </div>
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* DROPDOWN MENU WITH SMOOTH OPEN/CLOSE ENTER & EXIT TRANSITIONS & CUSTOM HOVER */}
              {(() => {
                const hoverEffect = node.mobileHoverEffect || 'subtle';
                const hoverClass =
                  hoverEffect === 'indigo'
                    ? 'hover:bg-indigo-600/30 hover:text-indigo-300 hover:scale-[1.02] hover:shadow-md hover:shadow-indigo-500/20'
                    : hoverEffect === 'emerald'
                    ? 'hover:bg-emerald-600/30 hover:text-emerald-300 hover:scale-[1.02] hover:shadow-md hover:shadow-emerald-500/20'
                    : hoverEffect === 'pill'
                    ? 'hover:bg-white hover:text-slate-900 hover:font-bold hover:scale-[1.02] hover:shadow-lg'
                    : hoverEffect === 'lift'
                    ? 'hover:-translate-y-0.5 hover:shadow-lg hover:bg-white/20 hover:text-white'
                    : 'hover:bg-white/10 hover:text-white';

                return (
                  <div
                    style={isHexOrRgb ? { backgroundColor: activeBg } : undefined}
                    className={`w-full px-4 border-t border-white/10 backdrop-blur-md transition-all duration-300 ease-in-out origin-top overflow-hidden ${
                      isMobileMenuOpen
                        ? 'max-h-[600px] opacity-100 pt-3 pb-4 translate-y-0 scale-y-100'
                        : 'max-h-0 opacity-0 pt-0 pb-0 -translate-y-2 scale-y-95 pointer-events-none'
                    } ${!isHexOrRgb && activeBg ? activeBg : 'bg-black/10'}`}
                  >
                    {/* SLEEK DIVIDER BORDER ABOVE LINKS */}
                    <div className="w-full border-t border-white/10 dark:border-white/10 my-0.5" />

                    <div className="flex flex-col space-y-1.5 w-full">
                      {navItemsToRender.map((childNode) => (
                        <div key={childNode.id} className={`w-full text-center py-2.5 px-3 rounded-xl text-slate-100 font-medium transition-all duration-200 text-xs ${hoverClass}`}>
                          <CanvasNodeRenderer node={childNode} isMobileView={isMobileView} />
                        </div>
                      ))}
                    </div>

                    {ctaButton && (mobileCtaMode === 'in_menu' || !mobileCtaMode) && (
                      <div className="pt-3 border-t border-white/10 w-full">
                        <div className={`${ctaAlignClass} transition-all`}>
                          <CanvasNodeRenderer node={ctaButton} isMobileView={isMobileView} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        }
        if (node.type === 'section') {
          return <section className={classNameStr}>{childrenContent}</section>;
        }
        return <div className={classNameStr}>{childrenContent}</div>;
      }

      case 'section':
        return <section className={classNameStr}>{childrenContent}</section>;

      case 'grid':
        return <div className={classNameStr}>{childrenContent}</div>;

      case 'heading':
        return isEditingInline ? (
          <input
            type="text"
            autoFocus
            value={node.content || ''}
            onChange={(e) => updateNodeProps(node.id, { content: e.target.value })}
            onBlur={() => setIsEditingInline(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingInline(false)}
            className="w-full bg-slate-900 text-white font-bold text-3xl border border-indigo-500 rounded px-2 py-1 outline-none"
          />
        ) : (
          <h2
            onDoubleClick={() => !isPreview && setIsEditingInline(true)}
            className={classNameStr}
          >
            {node.content || 'Heading Text'}
          </h2>
        );

      case 'text':
        return isEditingInline ? (
          <textarea
            autoFocus
            rows={2}
            value={node.content || ''}
            onChange={(e) => updateNodeProps(node.id, { content: e.target.value })}
            onBlur={() => setIsEditingInline(false)}
            className="w-full bg-slate-900 text-slate-100 border border-indigo-500 rounded p-2 outline-none text-base"
          />
        ) : (
          <p
            onDoubleClick={() => !isPreview && setIsEditingInline(true)}
            className={classNameStr}
          >
            {node.content || 'Paragraph text content goes here...'}
          </p>
        );

      case 'badge':
        return <span className={classNameStr}>{node.content || 'Badge Tag'}</span>;

      case 'button':
        return (
          <button type="button" className={classNameStr}>
            {node.content || 'Button'}
          </button>
        );

      case 'input':
        return (
          <input
            type="text"
            readOnly={!isPreview}
            placeholder={node.placeholder || 'Type here...'}
            className={classNameStr}
          />
        );

      case 'image':
        const objectFitClass = node.styles.objectFit || 'object-cover';
        return (
          <div className={`relative group/img overflow-hidden ${classNameStr}`}>
            {node.src ? (
              <img
                src={node.src}
                alt={node.name}
                className={`w-full h-full ${objectFitClass} pointer-events-none transition-all block`}
              />
            ) : (
              <div className="w-full h-full min-h-[160px] border-2 border-dashed border-slate-700/80 bg-slate-900/60 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs space-y-2 p-6">
                <Upload className="w-6 h-6 text-indigo-400" />
                <span className="font-semibold text-slate-300">Empty Image Frame</span>
                <span className="text-[10px] text-slate-500">Click to Upload Image File</span>
              </div>
            )}
            {!isPreview && isSelected && (
              <label className="absolute inset-0 bg-indigo-950/60 backdrop-blur-xs opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-xs font-semibold rounded cursor-pointer transition-opacity z-10">
                <span className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                  <Upload className="w-4 h-4" /> Change / Upload Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          updateNodeProps(node.id, { src: event.target.result as string });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
          </div>
        );

      case 'link':
        return (
          <a href={node.href || '#'} onClick={(e) => e.preventDefault()} className={classNameStr}>
            {node.content || 'Hyperlink'}
          </a>
        );

      default:
        return <div className={classNameStr}>{node.content || childrenContent}</div>;
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`group/node ${outlineStyle}`}
    >
      {/* Box Model Inspector Pill Overlay */}
      {boxInspectorEnabled && (isSelected || isHovered) && !isPreview && (
        <div className="absolute -top-6 left-0 px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-mono font-bold rounded-md shadow-lg z-40 pointer-events-none flex items-center gap-1.5 border border-emerald-400/60 animate-in fade-in duration-100">
          <span className="text-emerald-200">&lt;{node.type}&gt;</span>
          <span className="truncate max-w-[120px]">{node.name}</span>
          {node.styles.padding && (
            <span className="text-[8px] bg-emerald-800/80 px-1 rounded font-normal">p: {node.styles.padding}</span>
          )}
          {node.styles.margin && (
            <span className="text-[8px] bg-amber-700/80 px-1 rounded font-normal">m: {node.styles.margin}</span>
          )}
        </div>
      )}

      {/* Floating Selection Toolbar (Draggable & Non-Overlapping) */}
      {isSelected && !isPreview && !isRoot && (
        <div
          style={{ transform: `translate(${toolbarOffset.x}px, ${toolbarOffset.y}px)` }}
          className="absolute top-0 left-0 z-50 flex items-center space-x-1 px-2.5 py-1 bg-indigo-600/95 backdrop-blur-md text-white rounded-xl shadow-2xl text-xs font-sans font-semibold select-none border border-indigo-400/50 animate-in fade-in zoom-in-95 duration-100 shrink-0"
        >
          {/* Drag Handle & Node Name */}
          <div
            onMouseDown={handleToolbarMouseDown}
            className="flex items-center gap-1 cursor-grab active:cursor-grabbing pr-1.5 border-r border-indigo-400/50 hover:text-indigo-200 transition-colors"
            title="Click & Drag to reposition toolbar anywhere"
          >
            <GripVertical className="w-3.5 h-3.5 text-indigo-200" />
            <span className="text-[11px] font-mono font-bold tracking-tight">
              {node.name}
            </span>
          </div>

          {/* Up / Down Order */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveNodeOrder(node.id, 'up');
            }}
            className="p-1 hover:bg-indigo-500 rounded transition-colors cursor-pointer"
            title="Move Up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveNodeOrder(node.id, 'down');
            }}
            className="p-1 hover:bg-indigo-500 rounded transition-colors cursor-pointer"
            title="Move Down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Parent Select */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              selectParentNode(node.id);
            }}
            className="p-1 hover:bg-indigo-500 rounded transition-colors cursor-pointer"
            title="Select parent container"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateNode(node.id);
            }}
            className="p-1 hover:bg-indigo-500 rounded transition-colors cursor-pointer"
            title="Duplicate node"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(node.id);
            }}
            className="p-1 hover:bg-red-500 rounded transition-colors text-rose-200 cursor-pointer"
            title="Delete node"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {renderInnerComponent()}
    </div>
  );
});

CanvasNodeRenderer.displayName = 'CanvasNodeRenderer';
