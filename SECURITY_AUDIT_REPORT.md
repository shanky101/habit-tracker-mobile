# Security Audit Report: Habit Tracker Mobile App

**Date:** November 23, 2025
**Auditor:** Claude Code
**App Version:** 1.0.0
**Framework:** React Native 0.81.5 / Expo ~54.0.0

---

## Executive Summary

This security audit examined the Habit Tracker mobile application for common security vulnerabilities. The application is currently in a **development/prototype stage** with mock API implementations. While no critical active vulnerabilities were found, several **security improvements are recommended** before production deployment.

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 3 |
| Medium | 6 |
| Low | 5 |
| Informational | 4 |

---

## Findings

### HIGH SEVERITY

#### 1. Insecure Data Storage - Sensitive Data in AsyncStorage
**Location:** Multiple files
**Files Affected:**
- `src/context/SubscriptionContext.tsx:43-89`
- `src/screens/ProfileScreen.tsx:51-52`
- `src/screens/AccountSettingsScreen.tsx:44`

**Issue:** Sensitive data including subscription status, user email, and user name are stored in AsyncStorage without encryption. AsyncStorage is unencrypted and can be accessed on rooted/jailbroken devices.

**Stored Keys:**
- `@habit_tracker_subscription` - Subscription state (premium status, plan, expiry)
- `@habit_tracker_user_email` - User email
- `@habit_tracker_user_name` - User name

**Risk:** An attacker with physical access or malware on a rooted device could:
- Extract user PII (email, name)
- Modify subscription status to bypass premium features
- Access habit data and personal notes

**Recommendation:**
```typescript
// Use expo-secure-store for sensitive data
import * as SecureStore from 'expo-secure-store';

// Store sensitive data securely
await SecureStore.setItemAsync('subscription', JSON.stringify(data));
```

---

#### 2. Client-Side Premium Feature Bypass
**Location:** `src/context/SubscriptionContext.tsx:62-97`

**Issue:** Subscription status is stored locally and validated client-side only. Premium features can be bypassed by modifying AsyncStorage.

```typescript
// Current implementation - easily bypassed
const stored = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
if (stored) {
  const parsed = JSON.parse(stored) as SubscriptionState;
  setSubscription(parsed);
}
```

**Risk:** Users can:
- Grant themselves unlimited premium access
- Bypass habit limits (5 habits for free users)
- Access premium features without payment

**Recommendation:**
- Implement server-side subscription validation
- Use receipt validation with App Store/Play Store
- Implement RevenueCat or similar IAP service with server-side verification

---

#### 3. Missing Authentication Implementation
**Location:**
- `src/screens/LoginScreen.tsx:77-84`
- `src/screens/SignUpScreen.tsx:112-127`

**Issue:** Authentication is mocked with `setTimeout()`. No actual session management, token handling, or secure authentication flow exists.

```typescript
// Current mock implementation
await new Promise((resolve) => setTimeout(resolve, 1500));
navigation.navigate('MainApp'); // No actual auth check
```

**Risk:** When real authentication is implemented, without proper guidance:
- Tokens may be stored insecurely
- No session expiry handling
- Missing refresh token flow
- No logout/session invalidation

**Recommendation:**
- Implement secure token storage using SecureStore
- Use short-lived access tokens with refresh tokens
- Implement proper session invalidation on logout
- Add biometric authentication option

---

### MEDIUM SEVERITY

#### 4. Weak Password Policy
**Location:** `src/screens/SignUpScreen.tsx:58-61`

**Issue:** Password validation only requires 8 characters minimum. No complexity requirements enforced at signup.

```typescript
const validatePassword = (password: string): boolean => {
  return password.length >= 8; // Only length check
};
```

**Note:** `ChangePasswordScreen.tsx` has stronger validation (uppercase, lowercase, number), but signup does not.

**Recommendation:**
- Enforce consistent password policy across all screens
- Require: 8+ chars, uppercase, lowercase, number, special character
- Add password strength meter to signup

---

#### 5. Console Logging in Production Code
**Location:** Multiple files (23 occurrences found)

**Files with console.log statements:**
- `src/theme/ThemeContext.tsx:50,72` - Error logging
- `src/context/SubscriptionContext.tsx:56,93,115,139` - Error logging
- `src/screens/WelcomeScreen.tsx:41,46` - Navigation logging
- `src/screens/HomeScreen.tsx:108,212,219,737` - Various logging
- `src/screens/AddHabitStep3Screen.tsx:94` - Habit data logging
- And more...

**Issue:** Console logs can leak sensitive information and affect performance.

**Recommendation:**
```typescript
// Use environment-based logging
if (__DEV__) {
  console.log('Debug info');
}

// Or use a logging library with levels
import { logger } from './utils/logger';
logger.debug('Debug info'); // Disabled in production
```

---

#### 6. Missing Rate Limiting Preparation
**Location:** All authentication screens

**Issue:** No rate limiting or brute force protection visible in the client code. When real API is implemented, this needs consideration.

**Recommendation:**
- Implement exponential backoff on failed attempts
- Add CAPTCHA after multiple failures
- Server-side rate limiting is essential

---

#### 7. No Certificate Pinning Configuration
**Location:** `app.json`

**Issue:** No SSL certificate pinning configured. App is vulnerable to MITM attacks when connected to malicious networks.

**Recommendation:**
```json
// app.json - Add certificate pinning
{
  "expo": {
    "plugins": [
      ["expo-network-security", {
        "certificatePinning": {
          "enabled": true,
          "pins": ["sha256/XXXX..."]
        }
      }]
    ]
  }
}
```

---

#### 8. Deep Linking Not Configured (Future Risk)
**Location:** `src/navigation/OnboardingNavigator.tsx`

**Issue:** No deep linking configuration present. When implemented, improper deep link handling can lead to:
- Open redirect vulnerabilities
- Authentication bypass
- Data exposure

**Recommendation:** When implementing deep links:
```typescript
// Validate deep link parameters
const linking = {
  prefixes: ['habittracker://', 'https://habittracker.app'],
  config: {
    screens: {
      // Only expose safe routes
    }
  },
  // Add custom validation
  getStateFromPath: (path, options) => {
    // Validate and sanitize path
  }
};
```

---

#### 9. Dependency Vulnerabilities
**Location:** `package.json`

**npm audit results:**
| Package | Severity | Issue |
|---------|----------|-------|
| `@babel/runtime` <7.26.10 | Moderate | Inefficient RegExp complexity |
| `glob` 10.2.0-10.4.5 | High | Command injection via CLI |

**Recommendation:**
```bash
npm audit fix
# Or manually update vulnerable packages
npm update @babel/runtime
npm update glob
```

---

### LOW SEVERITY

#### 10. Input Validation Inconsistencies
**Location:** Various screens

**Issue:** Email validation regex varies slightly across screens and is basic:
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

**Recommendation:** Use a centralized validation utility with more robust regex.

---

#### 11. Missing Input Length Limits
**Location:** All TextInput components

**Issue:** No `maxLength` props on text inputs, allowing extremely long inputs.

**Recommendation:**
```tsx
<TextInput
  maxLength={100} // For names
  maxLength={255} // For emails
/>
```

---

#### 12. Hardcoded URLs
**Location:** Multiple screens

**Files:**
- `src/screens/DataPrivacyScreen.tsx:96,104`
- `src/screens/AboutScreen.tsx:76,86,94-98`
- `src/screens/SubscriptionScreen.tsx:74,76,87,89`

**Issue:** URLs hardcoded throughout codebase:
- `https://habittracker.app/privacy`
- `https://habittracker.app/terms`
- `https://twitter.com/habittracker`

**Recommendation:** Centralize URLs in a config file:
```typescript
// src/config/urls.ts
export const URLS = {
  PRIVACY_POLICY: 'https://habittracker.app/privacy',
  TERMS: 'https://habittracker.app/terms',
  // ...
};
```

---

#### 13. No Jailbreak/Root Detection
**Location:** App-wide

**Issue:** No detection for jailbroken iOS or rooted Android devices.

**Recommendation:** Implement device integrity checks, especially for premium features.

---

#### 14. Missing Secure Keyboard for Passwords
**Location:** Password input fields

**Issue:** Password fields use `secureTextEntry` but don't disable keyboard suggestions which could cache passwords.

**Recommendation:**
```tsx
<TextInput
  secureTextEntry
  autoCorrect={false}
  autoCapitalize="none"
  textContentType="oneTimeCode" // Prevents password autofill caching
  // Or for iOS:
  // textContentType="password" with proper keychain handling
/>
```

---

### INFORMATIONAL

#### 15. No Biometric Authentication
**Status:** Not implemented

**Recommendation:** Add optional biometric lock for app access using `expo-local-authentication`.

---

#### 16. No App Transport Security Exceptions
**Status:** Good - No ATS exceptions found in `app.json`

All network requests will use HTTPS by default.

---

#### 17. Habits Data Not Persisted
**Location:** `src/contexts/HabitsContext.tsx`

**Observation:** Habit data is only stored in React state, not persisted. On app restart, data resets to defaults.

```typescript
const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
// No AsyncStorage/persistence implementation
```

---

#### 18. Delete All Data Function
**Location:** `src/screens/DataPrivacyScreen.tsx:58-91`

**Status:** Good implementation with double confirmation

The data deletion flow properly:
- Shows warning dialogs
- Requires double confirmation
- Uses `AsyncStorage.clear()`

---

## Recommendations Summary

### Before Production Release (Priority Order):

1. **Implement Secure Storage**
   - Replace AsyncStorage with SecureStore for sensitive data
   - Encrypt subscription status and user PII

2. **Add Server-Side Validation**
   - Implement proper authentication backend
   - Add server-side subscription verification
   - Use receipt validation for IAP

3. **Fix Dependency Vulnerabilities**
   ```bash
   npm audit fix
   ```

4. **Remove Console Logs**
   - Implement environment-based logging
   - Remove all console.log from production builds

5. **Implement Certificate Pinning**
   - Add SSL pinning for API endpoints

6. **Strengthen Password Policy**
   - Enforce consistent complexity requirements
   - Add password strength indicator

### Security Best Practices to Implement:

- [ ] Implement biometric authentication
- [ ] Add jailbreak/root detection
- [ ] Configure deep linking securely
- [ ] Add rate limiting on authentication
- [ ] Implement secure session management
- [ ] Add input length validation
- [ ] Centralize URL configuration
- [ ] Set up security headers for any web views

---

## Positive Security Observations

1. **No XSS Vulnerabilities** - No use of `dangerouslySetInnerHTML` or `eval()`
2. **No Hardcoded Secrets** - No API keys or secrets found in codebase
3. **HTTPS Only** - No HTTP URLs found, ATS enabled by default
4. **Secure Text Entry** - Password fields use `secureTextEntry`
5. **Input Validation Present** - Basic email/password validation implemented
6. **Privacy Controls** - Good data export and deletion options provided
7. **.gitignore Configured** - `.env` files properly ignored

---

## Files Reviewed

- `package.json` / `package-lock.json`
- `app.json`
- `src/screens/LoginScreen.tsx`
- `src/screens/SignUpScreen.tsx`
- `src/screens/PasswordResetScreen.tsx`
- `src/screens/ChangePasswordScreen.tsx`
- `src/screens/DataPrivacyScreen.tsx`
- `src/screens/ExportDataScreen.tsx`
- `src/context/SubscriptionContext.tsx`
- `src/contexts/HabitsContext.tsx`
- `src/theme/ThemeContext.tsx`
- `src/navigation/OnboardingNavigator.tsx`
- All screen components in `src/screens/`

---

**Report Generated:** November 23, 2025
**Next Audit Recommended:** Before production release and after implementing authentication backend
