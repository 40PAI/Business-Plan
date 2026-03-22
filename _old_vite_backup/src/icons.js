// ============================================
// PlanAI — Icon Helper (Lucide Icons via CDN)
// Usage: icon('name') → '<i data-lucide="name" class="icon"></i>'
// Requires window.lucide.createIcons() after DOM updates
// ============================================

/**
 * Returns an inline Lucide icon HTML element.
 * @param {string} name   - Lucide icon name (e.g. 'rocket', 'file-text')
 * @param {number} size   - Icon size in px (default 18)
 * @param {string} extra  - Extra CSS classes
 */
export const icon = (name, size = 18, extra = '') =>
  `<i data-lucide="${name}" class="icon ${extra}" style="width:${size}px;height:${size}px;flex-shrink:0;"></i>`;

export const iconSm  = (name) => icon(name, 14);
export const iconMd  = (name) => icon(name, 18);
export const iconLg  = (name) => icon(name, 22);
export const iconXl  = (name) => icon(name, 28);
export const icon2xl = (name) => icon(name, 36);
export const icon3xl = (name) => icon(name, 48);

// Step option icons — business areas
export const AREA_ICONS = {
  tech:          'monitor',
  food:          'utensils',
  health:        'heart-pulse',
  education:     'book-open',
  retail:        'shopping-bag',
  realestate:    'building-2',
  logistics:     'truck',
  finance:       'landmark',
  tourism:       'plane',
  beauty:        'sparkles',
  agriculture:   'leaf',
  entertainment: 'film',
  construction:  'hard-hat',
  consulting:    'bar-chart-2',
};

// Phase icons
export const PHASE_ICONS = {
  'no-idea':  'brain',
  'idea-only':'lightbulb',
  'tested':   'flask-conical',
  'revenue':  'trending-up',
  'scale':    'rocket',
};

// Revenue model icons
export const REVENUE_ICONS = {
  subscription: 'calendar',
  'one-time':   'shopping-cart',
  commission:   'percent',
  ads:          'megaphone',
  freemium:     'gift',
  projects:     'clipboard-list',
  licensing:    'file-badge',
  marketplace:  'store',
  saas:         'cloud',
  courses:      'graduation-cap',
};

// Differentiator icons
export const DIFF_ICONS = {
  price:          'badge-dollar-sign',
  speed:          'zap',
  simplicity:     'target',
  local:          'map-pin',
  support:        'headphones',
  tech:           'cpu',
  customization:  'sliders',
  quality:        'award',
  sustainability: 'leaf',
  security:       'shield',
  mobile:         'smartphone',
  ai:             'bot',
};

// Logo style icons
export const LOGO_STYLE_ICONS = {
  modern:      'minimize-2',
  corporate:   'briefcase',
  creative:    'brush',
  tech:        'cpu',
  traditional: 'shield',
};

// Logo element type icons
export const LOGO_TYPE_ICONS = {
  wordmark:    'type',
  lettermark:  'a-large-small',
  brandmark:   'pentagon',
  combination: 'combine',
  emblem:      'shield',
  mascot:      'dog',
  abstract:    'circle',
};
