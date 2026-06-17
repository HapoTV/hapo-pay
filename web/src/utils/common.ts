/**
 * Common Utility Functions
 * Reusable utilities for date formatting, notifications, etc.
 */

/**
 * Format date in readable format
 * @param date - Date to format
 * @param format - Format style ('short' | 'long' | 'relative')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'long' | 'relative' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return dateObj.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
  }

  if (format === 'long') {
    return dateObj.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Relative format (Today, Yesterday, 2 days ago)
  const now = new Date();
  const diffTime = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return dateObj.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
};

/**
 * Truncate string to max length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix for truncated text (default: '...')
 * @returns Truncated string
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Generate initials from name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Get initials with fallback
 * @param name - Full name
 * @param fallback - Fallback value if name is empty
 * @returns Initials
 */
export const getInitialsWithFallback = (name: string | null | undefined, fallback: string = 'U'): string => {
  if (!name) return fallback;
  return getInitials(name);
};

/**
 * Delay execution for async operations
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param obj - Object to check
 * @returns True if object is empty
 */
export const isEmpty = (obj: Record<string, any> | null | undefined): boolean => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

/**
 * Merge objects
 * @param target - Target object
 * @param source - Source object
 * @returns Merged object
 */
export const mergeObjects = <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
  return { ...target, ...source };
};
