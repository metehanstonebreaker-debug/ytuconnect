/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const themeColors: Record<string, Record<string, string>> = {
  yellow: {
    '--brand-50': '#fffbeb',
    '--brand-100': '#fef3c7',
    '--brand-200': '#fde68a',
    '--brand-500': '#f59e0b',
    '--brand-600': '#d97706',
    '--brand-700': '#b45309',
    '--brand-800': '#92400e',
  },
  red: {
    '--brand-50': '#fef2f2',
    '--brand-100': '#fee2e2',
    '--brand-200': '#fecaca',
    '--brand-500': '#ef4444',
    '--brand-600': '#dc2626',
    '--brand-700': '#b91c1c',
    '--brand-800': '#991b1b',
  },
  blue: {
    '--brand-50': '#eff6ff',
    '--brand-100': '#dbeafe',
    '--brand-200': '#bfdbfe',
    '--brand-500': '#3b82f6',
    '--brand-600': '#2563eb',
    '--brand-700': '#1d4ed8',
    '--brand-800': '#1e40af',
  },
  green: {
    '--brand-50': '#ecfdf5',
    '--brand-100': '#d1fae5',
    '--brand-200': '#a7f3d0',
    '--brand-500': '#10b981',
    '--brand-600': '#059669',
    '--brand-700': '#047857',
    '--brand-800': '#065f46',
  },
  purple: {
    '--brand-50': '#faf5ff',
    '--brand-100': '#f3e8ff',
    '--brand-200': '#e9d5ff',
    '--brand-500': '#a855f7',
    '--brand-600': '#9333ea',
    '--brand-700': '#7e22ce',
    '--brand-800': '#6b21a8',
  }
};

export const applyThemeColor = (color: string) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const selected = themeColors[color] || themeColors.yellow;
  Object.entries(selected).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
};
