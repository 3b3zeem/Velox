export type ComponentType =
  | 'container'
  | 'section'
  | 'grid'
  | 'card'
  | 'heading'
  | 'text'
  | 'button'
  | 'image'
  | 'badge'
  | 'input'
  | 'divider'
  | 'icon'
  | 'link'
  | 'hero'
  | 'pricingCard';

export interface NodeStyles {
  // Spacing
  padding?: string;
  margin?: string;

  // Typography
  fontSize?: string;
  fontWeight?: string;
  textColor?: string;
  textAlign?: string;
  fontFamily?: string;

  // Layout
  display?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
  gridCols?: string;
  flexWrap?: string;

  // Background
  backgroundColor?: string;
  bgGradient?: string;
  opacity?: string;

  // Borders & Rounded
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
  borderRadius?: string;

  // Shadows & Hover Effects
  boxShadow?: string;
  hoverEffect?: string;
  hoverBg?: string;
  hoverTextColor?: string;
  hoverShadow?: string;
  pseudoHover?: string;
  pseudoHoverColor?: string;
  transitionDuration?: string;
  transitionTiming?: string;

  // Sizing & Image Fit
  width?: string;
  height?: string;
  objectFit?: string;
  aspectRatio?: string;

  // Custom Tailwind & raw classes
  customClasses?: string;
}

export interface CanvasNode {
  id: string;
  type: ComponentType;
  name: string;
  children?: CanvasNode[];
  styles: NodeStyles;
  content?: string; // Text content, button label, etc.
  src?: string; // Image URL
  alt?: string; // Image alt text
  href?: string; // Link href
  placeholder?: string; // Input placeholder
  iconName?: string; // Icon identifier
  isContainer?: boolean; // Can accept child elements
  hidden?: boolean;
  locked?: boolean;
  mobileCtaMode?: 'in_menu' | 'top_compact' | 'top_icon' | 'hide';
  mobileMenuBg?: string;
  mobileCtaAlign?: 'full' | 'center' | 'left' | 'right';
  mobileMenuBtnBg?: string;
  mobileMenuBtnStyle?: 'rounded' | 'circle' | 'square' | 'ghost';
  mobileMenuBtnIcon?: 'hamburger' | 'dots' | 'grid';
  mobileHoverEffect?: 'subtle' | 'indigo' | 'emerald' | 'pill' | 'lift';

  // FAQ Accordion Toggle Customization
  faqCollapsedIcon?: string;  // Icon name when collapsed (e.g., 'Plus', 'ChevronDown', 'ArrowDown')
  faqExpandedIcon?: string;   // Icon name when expanded (e.g., 'Minus', 'ChevronUp', 'X')
  faqToggleBg?: string;       // Background color when collapsed (Tailwind class)
  faqToggleActiveBg?: string; // Background color when expanded (Tailwind class)
  faqToggleRadius?: string;   // Border radius (Tailwind class)
  faqToggleSize?: string;     // Size: 'sm' | 'md' | 'lg'
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile' | 'split' | 'preview';

export interface DragItemData {
  type: ComponentType;
  templateNode?: CanvasNode;
  sourceId?: string; // If dragging existing node
}
