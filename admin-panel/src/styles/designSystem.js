// Design System Constants for Ogaden Admin Panel
// Use these throughout the application for consistency

export const colors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  
  // Status Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  
  info: {
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
  },
  
  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

export const gradients = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  green: 'from-green-500 to-green-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600',
  orange: 'from-orange-500 to-orange-600',
  indigo: 'from-indigo-500 to-indigo-600',
  pink: 'from-pink-500 to-pink-600',
};

export const statusColors = {
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200'
  },
  accepted: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700 border border-blue-200'
  },
  preparing: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700 border border-purple-200'
  },
  ready: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700 border border-indigo-200'
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700 border border-green-200'
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700 border border-red-200'
  },
  delivering: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    badge: 'bg-cyan-100 text-cyan-700 border border-cyan-200'
  }
};

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  none: 'shadow-none',
};

export const borderRadius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
};

export const spacing = {
  card: 'p-6',
  cardSm: 'p-4',
  cardLg: 'p-8',
  section: 'space-y-6',
  grid: 'gap-4',
  gridLg: 'gap-6',
};

// Reusable Component Classes
export const components = {
  // Cards
  card: 'bg-white rounded-xl shadow-sm border border-gray-100',
  cardHover: 'bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow',
  
  // Buttons
  btnPrimary: 'inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium',
  btnSecondary: 'inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium',
  btnSuccess: 'inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium',
  btnDanger: 'inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium',
  btnOutline: 'inline-flex items-center px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium',
  
  // Inputs
  input: 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
  inputError: 'w-full px-4 py-2.5 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors',
  
  // Tables
  table: 'w-full',
  tableHeader: 'bg-gray-50 border-b border-gray-100',
  tableHeaderCell: 'px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
  tableRow: 'hover:bg-gray-50 transition-colors',
  tableCell: 'px-6 py-4 whitespace-nowrap',
  
  // Badges
  badge: 'px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5',
  badgeLg: 'px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2',
  
  // Page Layout
  pageHeader: 'flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6',
  pageTitle: 'text-3xl font-bold text-gray-900',
  pageSubtitle: 'mt-1 text-sm text-gray-600',
  
  // Stats Cards
  statCard: 'relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow',
  statCardGradient: 'p-3 rounded-xl shadow-lg',
  
  // Search & Filter
  searchBar: 'relative flex-1',
  searchIcon: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none',
  searchInput: 'block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
};

// Helper Functions
export const getStatusBadge = (status) => {
  const statusConfig = statusColors[status] || statusColors.pending;
  return `${components.badge} ${statusConfig.badge}`;
};

export const getGradient = (color) => {
  return gradients[color] || gradients.blue;
};

export default {
  colors,
  gradients,
  statusColors,
  shadows,
  borderRadius,
  spacing,
  components,
  getStatusBadge,
  getGradient,
};
