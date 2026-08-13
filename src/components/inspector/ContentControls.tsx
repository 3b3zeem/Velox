import React from 'react';
import type { CanvasNode } from '../../types/builder';
import { AlignCenter, AlignLeft, AlignRight, Upload, X, Smartphone, Palette } from 'lucide-react';
import { useBuilderStore } from '../../store/useBuilderStore';

interface ContentControlsProps {
  node: CanvasNode;
  onUpdateProps: (props: Partial<CanvasNode>) => void;
}

export const ContentControls: React.FC<ContentControlsProps> = ({ node, onUpdateProps }) => {
  const isLight = useBuilderStore((s) => s.studioTheme) === 'light';

  const labelClass = isLight ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium';
  const inputClass = isLight
    ? 'w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 text-xs'
    : 'w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs';
  const presetBtnClass = isLight
    ? 'text-[10px] p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 truncate text-left cursor-pointer'
    : 'text-[10px] p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 truncate text-left cursor-pointer';

  const nameLower = node.name.toLowerCase();
  const isNavGroup = nameLower.includes('group') || nameLower.includes('link') || nameLower.includes('item');
  const isNavbarNode =
    (node.type === 'container' || node.type === 'section' || node.type === 'card' || node.isContainer) &&
    (nameLower.includes('navbar') || nameLower.includes('navigation') || nameLower.includes('header') || nameLower === 'nav') &&
    !isNavGroup;

  return (
    <div className={`flex flex-col space-y-4 text-xs select-none ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
      {/* Element Label Name */}
      <div className="space-y-1.5">
        <label className={labelClass}>Node Display Label</label>
        <input
          type="text"
          value={node.name}
          onChange={(e) => onUpdateProps({ name: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* Mobile Navbar Settings for Navbar Containers */}
      {isNavbarNode && (
        <div className={`p-3 rounded-xl border space-y-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Mobile Navbar Controls
            </span>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Mobile CTA Button Mode (وضع زرار الناف بار للموبايل)</label>
            <select
              value={node.mobileCtaMode || 'in_menu'}
              onChange={(e) => onUpdateProps({ mobileCtaMode: e.target.value as any })}
              className={inputClass}
            >
              <option value="in_menu">🍔 Fold inside Menu (ضم الزرار داخل المنيو)</option>
              <option value="top_compact">📌 Stay on Top Bar (إبقاء الزرار بحجم أصغر)</option>
              <option value="top_icon">⭐ Icon Only on Top Bar (استبدال بـ أيقونة)</option>
              <option value="hide">🙈 Hide on Mobile (إخفاء الزرار تماماً)</option>
            </select>
          </div>

          {(node.mobileCtaMode === 'in_menu' || !node.mobileCtaMode) && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className={labelClass}>Mobile CTA Button Alignment (حاذاة وعرض الزرار)</label>
              <select
                value={node.mobileCtaAlign || 'full'}
                onChange={(e) => onUpdateProps({ mobileCtaAlign: e.target.value as any })}
                className={inputClass}
              >
                <option value="full">↔️ Full Width (عرض القائمة بالكامل)</option>
                <option value="center">↔️ Center Aligned (في المنتصف)</option>
                <option value="left">⬅️ Left Aligned (محاذاة لليسار)</option>
                <option value="right">➡️ Right Aligned (محاذاة لليمين)</option>
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Mobile Menu Background (لون خلفية القائمة)</label>
              <Palette className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={node.mobileMenuBg || '#0f172a'}
                onChange={(e) => onUpdateProps({ mobileMenuBg: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-700 bg-transparent p-0.5"
                title="Choose Mobile Menu Custom Color"
              />
              <input
                type="text"
                value={node.mobileMenuBg || ''}
                placeholder="Auto (Same as Navbar)"
                onChange={(e) => onUpdateProps({ mobileMenuBg: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-6 gap-1 pt-1">
              {['#0f172a', '#1e1b4b', '#0284c7', '#059669', '#7c3aed', '#ec4899'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onUpdateProps({ mobileMenuBg: c })}
                  className="h-5 rounded-md border border-slate-700/60 transition-transform active:scale-95 cursor-pointer hover:scale-105"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* MENU BUTTON CONTROLS */}
          <div className="pt-2 border-t border-slate-700/40 space-y-2.5">
            <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-400 block">
              🎛️ Hamburger Button Settings (زرار القائمة نفسه)
            </span>

            <div className="space-y-1.5">
              <label className={labelClass}>Button Shape (شكل زرار المنيو)</label>
              <select
                value={node.mobileMenuBtnStyle || 'rounded'}
                onChange={(e) => onUpdateProps({ mobileMenuBtnStyle: e.target.value as any })}
                className={inputClass}
              >
                <option value="rounded">◽ Soft Rounded (مربع بدوائر ناعمة)</option>
                <option value="circle">⚪ Pill / Circle (دائري بالكامل)</option>
                <option value="square">🔲 Sharp Square (مربع حاد الزوايا)</option>
                <option value="ghost">👻 Minimal Ghost (بدون خلفية أو حدود)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Icon Style (أيقونة المنيو)</label>
              <select
                value={node.mobileMenuBtnIcon || 'hamburger'}
                onChange={(e) => onUpdateProps({ mobileMenuBtnIcon: e.target.value as any })}
                className={inputClass}
              >
                <option value="hamburger">☰ Classic Lines (ثلاثة خطوط)</option>
                <option value="dots">⋮ Three Dots (ثلاث نقاط)</option>
                <option value="grid">🔲 Grid Icon (أيقونة شبكية)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Button Color (لون خلفية زرار القائمة)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={node.mobileMenuBtnBg || '#6366f1'}
                  onChange={(e) => onUpdateProps({ mobileMenuBtnBg: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-700 bg-transparent p-0.5"
                  title="Choose Button Color"
                />
                <input
                  type="text"
                  value={node.mobileMenuBtnBg || ''}
                  placeholder="Auto (Indigo/Glass)"
                  onChange={(e) => onUpdateProps({ mobileMenuBtnBg: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-6 gap-1 pt-1">
                {['#6366f1', '#0284c7', '#ec4899', '#059669', '#ffffff', '#1e293b'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdateProps({ mobileMenuBtnBg: c })}
                    className="h-5 rounded-md border border-slate-700/60 transition-transform active:scale-95 cursor-pointer hover:scale-105"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className={labelClass}>Links Hover Effect (تأثير الهوفر للروابط)</label>
              <select
                value={node.mobileHoverEffect || 'subtle'}
                onChange={(e) => onUpdateProps({ mobileHoverEffect: e.target.value as any })}
                className={inputClass}
              >
                <option value="subtle">✨ Subtle Glass (تأثير شفاف ناعم)</option>
                <option value="indigo">💜 Indigo Glow (إضاءة بنفسجية ناعمة)</option>
                <option value="emerald">💚 Emerald Glow (إضاءة زمردية)</option>
                <option value="pill">💊 Solid White Pill (زرار مصمت عند الهوفر)</option>
                <option value="lift">🚀 Elevation Lift (ارتفاع خفيف مع ظل)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Text / Inner Content */}
      {(node.type === 'heading' ||
        node.type === 'text' ||
        node.type === 'button' ||
        node.type === 'badge' ||
        node.type === 'link') && (
        <div className="space-y-1.5">
          <label className={labelClass}>Text Content</label>
          {node.type === 'text' || node.type === 'heading' ? (
            <textarea
              rows={4}
              value={node.content || ''}
              onChange={(e) => onUpdateProps({ content: e.target.value })}
              className={`${inputClass} font-mono text-xs leading-relaxed`}
            />
          ) : (
            <input
              type="text"
              value={node.content || ''}
              onChange={(e) => onUpdateProps({ content: e.target.value })}
              className={inputClass}
            />
          )}
        </div>
      )}

      {/* Image Src URL & File Upload */}
      {node.type === 'image' && (
        <div className="space-y-3">
          <label className={`${labelClass} flex items-center justify-between`}>
            <span>Image Source</span>
            <span className="text-[10px] text-indigo-500 font-semibold">URL or File</span>
          </label>

          {/* Thumbnail Preview */}
          {node.src && (
            <div className={`relative group rounded-xl overflow-hidden border h-28 flex items-center justify-center ${
              isLight ? 'border-slate-300 bg-slate-100' : 'border-slate-800 bg-slate-950'
            }`}>
              <img src={node.src} alt={node.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onUpdateProps({ src: '' })}
                className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-slate-300 hover:text-red-400 hover:bg-slate-950 transition-colors cursor-pointer"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Upload File Input */}
          <div>
            <label className={`w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl border border-dashed font-medium cursor-pointer transition-colors text-xs ${
              isLight
                ? 'border-indigo-400 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700'
                : 'border-indigo-500/50 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300'
            }`}>
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>Upload Image File</span>
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
                        onUpdateProps({ src: event.target.result as string });
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Direct URL Input */}
          <div className="space-y-1">
            <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Or paste Image URL:</span>
            <input
              type="text"
              placeholder="https://..."
              value={node.src || ''}
              onChange={(e) => onUpdateProps({ src: e.target.value })}
              className={`${inputClass} font-mono text-[11px]`}
            />
          </div>

          {/* Preset Sample Images */}
          <div className="space-y-1.5 pt-1">
            <span className={labelClass}>Quick Preset Images:</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onUpdateProps({
                    src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                  })
                }
                className={presetBtnClass}
              >
                Dashboard UI
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateProps({
                    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
                  })
                }
                className={presetBtnClass}
              >
                Abstract Art
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateProps({
                    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                  })
                }
                className={presetBtnClass}
              >
                User Avatar
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateProps({
                    src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
                  })
                }
                className={presetBtnClass}
              >
                Technology
              </button>
            </div>
          </div>
          {/* Image Frame Fit & Aspect Ratio */}
          <div className={`pt-2 border-t space-y-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <label className={labelClass}>Image Frame & Alignment Settings</label>
            
            {/* Image Alignment */}
            <div className="space-y-1">
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Image Alignment</span>
              <div className={`flex items-center p-1 rounded-lg border space-x-1 ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateProps({
                      styles: { ...node.styles, margin: 'mr-auto my-2' },
                    })
                  }
                  className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-[11px] transition-all cursor-pointer ${
                    node.styles.margin === 'mr-auto my-2' || (!node.styles.margin?.includes('mx-auto') && !node.styles.margin?.includes('ml-auto'))
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Left</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateProps({
                      styles: { ...node.styles, margin: 'mx-auto my-2' },
                    })
                  }
                  className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-[11px] transition-all cursor-pointer ${
                    node.styles.margin === 'mx-auto my-2' || node.styles.margin === 'mx-auto'
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5 mr-1" />
                  <span>Center</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateProps({
                      styles: { ...node.styles, margin: 'ml-auto my-2' },
                    })
                  }
                  className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-[11px] transition-all cursor-pointer ${
                    node.styles.margin === 'ml-auto my-2' || node.styles.margin === 'ml-auto'
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5 mr-1" />
                  <span>Right</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Object Fit</span>
                <select
                  value={node.styles.objectFit || 'object-cover'}
                  onChange={(e) =>
                    onUpdateProps({
                      styles: { ...node.styles, objectFit: e.target.value },
                    })
                  }
                  className={`${inputClass} text-[11px] py-1.5 cursor-pointer`}
                >
                  <option value="object-cover">Cover (Crop to fill)</option>
                  <option value="object-contain">Contain (Fit inside)</option>
                  <option value="object-fill">Fill (Stretch)</option>
                  <option value="object-none">Original Size</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Aspect Ratio</span>
                <select
                  value={node.styles.aspectRatio || 'aspect-auto'}
                  onChange={(e) =>
                    onUpdateProps({
                      styles: { ...node.styles, aspectRatio: e.target.value },
                    })
                  }
                  className={`${inputClass} text-[11px] py-1.5 cursor-pointer`}
                >
                  <option value="aspect-auto">Auto Height</option>
                  <option value="aspect-video">16:9 Banner</option>
                  <option value="aspect-square">1:1 Square</option>
                  <option value="aspect-[4/3]">4:3 Frame</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Href */}
      {node.type === 'link' && (
        <div className="space-y-1.5">
          <label className={labelClass}>Link Destination (Href)</label>
          <input
            type="text"
            value={node.href || ''}
            onChange={(e) => onUpdateProps({ href: e.target.value })}
            className={`${inputClass} font-mono text-xs`}
          />
        </div>
      )}

      {/* Input Placeholder */}
      {node.type === 'input' && (
        <div className="space-y-1.5">
          <label className={labelClass}>Input Placeholder Text</label>
          <input
            type="text"
            value={node.placeholder || ''}
            onChange={(e) => onUpdateProps({ placeholder: e.target.value })}
            className={inputClass}
          />
        </div>
      )}
    </div>
  );
};
