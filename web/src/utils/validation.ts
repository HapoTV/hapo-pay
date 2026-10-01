/**
 * Validation Utilities
 * Common validation functions for forms and user input
 */

/**
 * Validate amount input
 * @param value - Amount value to validate
 * @param minAmount - Minimum allowed amount (default: 0)
 * @param maxAmount - Maximum allowed amount (default: Infinity)
 * @returns Error message or empty string if valid
 */
export const validateAmount = (
  value: string | number,
  minAmount: number = 0,
  maxAmount: number = Infinity
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (!value || isNaN(numValue)) {
    return 'Please enter a valid amount';
  }

  if (numValue < minAmount) {
    return `Amount must be at least ${minAmount}`;
  }

  if (numValue > maxAmount) {
    return `Amount cannot exceed ${maxAmount}`;
  }

  if (numValue <= 0) {
    return 'Amount must be greater than 0';
  }

  return '';
};

/**
 * Validate email format
 * @param email - Email to validate
 * @returns Error message or empty string if valid
 */
export const validateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email is required';
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
};

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns Error message or empty string if valid
 */
export const validatePhoneNumber = (phone: string): string => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
  if (!phone) {
    return 'Phone number is required';
  }
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number';
  }
  return '';
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 8)
 * @returns Error message or empty string if valid
 */
export const validatePassword = (password: string, minLength: number = 8): string => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return '';
};

/**
 * Validate required field
 * @param value - Value to validate
 * @param fieldName - Name of field for error message
 * @returns Error message or empty string if valid
 */
export const validateRequired = (value: string | null | undefined, fieldName: string = 'This field'): string => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return '';
};

/**
 * Validate that two values match
 * @param value1 - First value
 * @param value2 - Second value
 * @param fieldName - Name of field for error message
 * @returns Error message or empty string if valid
 */
export const validateMatch = (value1: string, value2: string, fieldName: string = 'Values'): string => {
  if (value1 !== value2) {
    return `${fieldName} do not match`;
  }
  return '';
};

/**
 * Validate username format
 * @param username - Username to validate
 * @returns Error message or empty string if valid
 */
export const validateUsername = (username: string): string => {
  if (!username) {
    return 'Username is required';
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters long';
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens';
  }
  return '';
};
