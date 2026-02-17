// Studio Hub Elite - Internationalization Setup
// Supports Italian (default) with English fallback

import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import it from './locales/it';
import en from './locales/en';

const i18n = new I18n({
  it,
  en,
});

// Set default locale to Italian
i18n.defaultLocale = 'it';
i18n.locale = 'it'; // Force Italian as per requirements
i18n.enableFallback = true;

// Helper function to get translated string
export const t = (key: string, options?: Record<string, any>): string => {
  return i18n.t(key, options);
};

// Format number with Italian locale
export const formatNumber = (value: number, decimals: number = 0): string => {
  return value.toLocaleString('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Format date with Italian locale
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'long':
      return d.toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return d.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    case 'short':
    default:
      return d.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
  }
};

// Format date and time together
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d, 'short')} ${formatDate(d, 'time')}`;
};

// Format relative time
export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return t('time.justNow');
  if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
  if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
  if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
  
  return formatDate(d, 'short');
};

// Format currency
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('it-IT', {
    style: 'currency',
    currency: 'EUR',
  });
};

export default i18n;
