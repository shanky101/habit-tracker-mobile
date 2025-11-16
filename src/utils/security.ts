/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitizes user input to prevent XSS and injection attacks
 * Removes potentially dangerous characters and patterns
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: and data: URLs
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Limit consecutive whitespace
    .replace(/\s+/g, ' ');
};

/**
 * Validates and sanitizes email input
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';

  return email
    .trim()
    .toLowerCase()
    // Remove any non-email characters (keep alphanumeric, @, ., -, _)
    .replace(/[^a-z0-9@._-]/g, '');
};

/**
 * Sanitizes habit names and notes
 * More permissive than general sanitization but still safe
 */
export const sanitizeHabitText = (text: string): string => {
  if (!text) return '';

  return text
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script-related content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: and data: URLs
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize whitespace but allow newlines
    .replace(/[ \t]+/g, ' ')
    // Limit to reasonable length (500 chars)
    .slice(0, 500);
};

/**
 * Validates password strength
 * Returns an object with validation results
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Optional: Check for special characters
  // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
  //   errors.push('Password must contain at least one special character');
  // }

  // Check for common weak passwords
  const commonPasswords = [
    'password',
    '12345678',
    'qwerty123',
    'admin123',
    'welcome123',
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates email format
 */
export const validateEmailFormat = (email: string): boolean => {
  if (!email) return false;

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Rate limiting helper (in-memory, for client-side basic protection)
 * In production, implement proper backend rate limiting
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * Check if action is allowed based on rate limit
   * @param key - Unique identifier (e.g., 'login', 'signup')
   * @param maxAttempts - Maximum attempts allowed
   * @param windowMs - Time window in milliseconds
   */
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Reset attempts for a key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Get remaining attempts
   */
  getRemaining(key: string, maxAttempts: number = 5): number {
    const record = this.attempts.get(key);
    if (!record || Date.now() > record.resetTime) {
      return maxAttempts;
    }
    return Math.max(0, maxAttempts - record.count);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Generate a secure random string (for tokens, IDs, etc.)
 * Uses Web Crypto API
 */
export const generateSecureId = (): string => {
  return crypto.randomUUID();
};

/**
 * Securely compare two strings to prevent timing attacks
 */
export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
};
