/**
 * Design Tokens Resmi SI-POTA RSA UGM (Mobile)
 * Diselaraskan 100% dengan palet Figma Frontend Web (frontend-web-rsa-ugm).
 */
export const COLORS = {
  // Brand & Primary
  primary: '#0a3f5c',       // Sidebar & Primary Navy (Web Figma)
  primaryDark: '#072e44',   // Hover / Pressed Navy
  primarySoft: '#0077b6',   // Accent / Link Blue
  heading: '#05004e',       // Page Heading Navy (Web Figma)
  accent: '#fecb28',        // RSA Yellow CTA / Badge
  accentBright: '#ffcc00',  // Active Sidebar Icon Yellow

  // Surfaces & Borders
  background: '#ecf4f9',    // Main Dashboard Surface (Web Figma)
  surface: '#ffffff',
  surfaceSubtle: '#f8fafc',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',

  // Typography
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  textOnPrimary: '#ffffff',

  // Semantic Status
  normal: '#16a34a',
  normalBg: '#dcfce7',
  normalText: '#15803d',

  warning: '#f59e0b',
  warningBg: '#fef3c7',
  warningText: '#b45309',

  critical: '#e4002b',      // Critical Red (Web Figma)
  criticalBg: '#fee2e2',
  criticalText: '#b91c1c',

  infoBg: '#e0f2fe',
  infoText: '#0369a1',
} as const;

export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;
