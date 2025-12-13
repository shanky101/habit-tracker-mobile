# Data Persistence Architecture Audit

**Priority:** P0  
**Date:** 2025-12-09  
**Objective:** Ensure all user data persists across backup/restore with SQLite as source of truth

---

## Executive Summary

**CRITICAL FINDING:** Several recently added features store data in `AsyncStorage` which is **NOT included** in backup/restore operations. This means users will lose this data when restoring from backup.

### Current Backup/Restore Coverage
- ✅ **Habits** - SQLite (covered)
- ✅ **Completions** - SQLite (covered)  
- ✅ **Entries** - SQLite (covered)
- ✅ **Mascot Customization** - SQLite (covered)
- ❌ **User Templates** - AsyncStorage (**NOT backed up**)
- ❌ **Vacation Mode** - AsyncStorage (**NOT backed up**)
- ❌ **Subscription Status** - AsyncStorage (**NOT backed up**)
- ❌ **Theme Selection** - AsyncStorage (**NOT backed up**)
- ❌ **User Profile** (name/email) - AsyncStorage (**NOT backed up**)

---

## Detailed Findings

### 1. **User Templates** ❌ CRITICAL
**Location:** `src/contexts/TemplateContext.tsx`  
**Storage:** AsyncStorage (`@habit_tracker_templates`)  
**Impact:** HIGH - Users lose custom templates on restore  

**Current Implementation:**
```typescript
// L39: Loading from AsyncStorage
const stored = await AsyncStorage.getItem(TEMPLATES_STORAGE_KEY);

// L60: Saving to AsyncStorage
await AsyncStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(userTemplates));
```

**Risk:** Users can spend significant time creating custom templates. Loss is permanent.

---

### 2. **Vacation Mode Data** ❌ CRITICAL
**Location:** `src/context/UserContext.tsx`  
**Storage:** AsyncStorage (`@habit_tracker_vacation_mode`, `@habit_tracker_vacation_history`)  
**Impact:** MEDIUM - Users lose vacation history affecting streak calculations

**Current Implementation:**
```typescript
// L33-34: Loading from AsyncStorage
const mode = await AsyncStorage.getItem(VACATION_MODE_KEY);
const history = await AsyncStorage.getItem(VACATION_HISTORY_KEY);

// L74-75: Saving to AsyncStorage
await AsyncStorage.setItem(VACATION_MODE_KEY, JSON.stringify(newMode));
await AsyncStorage.setItem(VACATION_HISTORY_KEY, JSON.stringify(newHistory));
```

**Risk:** Vacation history affects streak calculations in `HabitDetailScreen`. Loss means incorrect streaks.

---

### 3. **Subscription Status** ❌ MEDIUM
**Location:** `src/context/SubscriptionContext.tsx`  
**Storage:** AsyncStorage (`@habit_tracker_subscription`)  
**Impact:** MEDIUM - Users lose premium status on restore

**Current Implementation:**
```typescript
// L43: Loading from AsyncStorage
const stored = await AsyncStorage.getItem(SUBSCRIPTION_KEY);

// L89, L112: Saving to AsyncStorage  
await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(newSubscription));
```

**Risk:** Premium users appear as free users after restore, losing access to features.

---

### 4. **Mascot Settings** ⚠️ LOW
**Location:** `src/context/MascotContext.tsx`  
**Storage:** Mixed - **Customization in SQLite**, but **display mode in AsyncStorage**  
**Impact:** LOW - User preference (standard vs compact)

**Current Implementation:**
```typescript
// L236-237: Loading from AsyncStorage
AsyncStorage.getItem(MASCOT_STORAGE_KEY),
AsyncStorage.getItem(MASCOT_SETTINGS_KEY),

// L267, L279: Saving to AsyncStorage
await AsyncStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify({...}));
await AsyncStorage.setItem(MASCOT_SETTINGS_KEY, JSON.stringify(newSettings));
```

**Note:** Customization (mood, energy) is in SQLite (`mascot_customization` table). Display mode is in AsyncStorage.

---

### 5. **Theme Selection** ⚠️ LOW
**Location:** `src/theme/ThemeContext.tsx`  
**Storage:** AsyncStorage (`@habit_tracker_theme`, `@habit_tracker_auto_theme`)  
**Impact:** LOW - UI preference only

**Current Implementation:**
```typescript
// L41-42: Loading from AsyncStorage
AsyncStorage.getItem(THEME_STORAGE_KEY),
AsyncStorage.getItem(AUTO_THEME_KEY),

// L66-70: Saving to AsyncStorage
await AsyncStorage.setItem(AUTO_THEME_KEY, 'true');
await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
```

**Risk:** User loses theme preference, reverts to default.

---

### 6. **User Profile Data** ⚠️ MEDIUM
**Location:** Multiple screens (`ProfileScreen`, `SettingsScreen`, `HomeScreen`)  
**Storage:** AsyncStorage (`@habit_tracker_user_name`, `@habit_tracker_user_email`)  
**Impact:** MEDIUM - Personalization lost

**Current Implementation:**
```typescript
// Various screens reading user data
const name = await AsyncStorage.getItem(USER_NAME_KEY);
const email = await AsyncStorage.getItem(USER_EMAIL_KEY);
```

**Risk:** User sees generic greetings, has to re-enter profile info.

---

## Current Backup/Restore Implementation

### DataExporter.ts
**Only exports:**
- Habits (from `habits` table)
- Completions (from `completions` table)
- Entries (from `entries` table)
- Mascot Customization (from `mascot_customization` table)
- Settings/Metadata (from `app_metadata` table)

**Does NOT export:**
- AsyncStorage keys
- User templates
- Vacation mode data
- Subscription status
- Theme preferences
- User profile (name/email)

### Storage Architecture
```
┌─────────────────────────────┐
│   habitStore (Zustand)      │
│   - Uses sqliteStorage      │
│   - Persists to SQLite      │
│   ✅ BACKED UP              │
└─────────────────────────────┘

┌─────────────────────────────┐
│   AsyncStorage (7 contexts) │
│   - Templates               │
│   - Vacation Mode           │
│   - Subscription            │
│   - Mascot Settings         │
│   - Theme                   │
│   - User Profile            │
│   ❌ NOT BACKED UP          │          
└─────────────────────────────┘
```

---

## Recommended Fix Strategy

### Phase 1: Migrate Critical Data to SQLite (P0)
1. **Templates** → New `habit_templates` table
2. **Vacation Mode** → New `vacation_intervals` table  
3. **User Profile** → New `user_profile` table

### Phase 2: Update Backup/Restore (P0)
4. Update `DataExporter` to include new tables
5. Update `DataImporter` to restore new tables
6. Add migration logic for existing AsyncStorage data

### Phase 3: Migrate Preferences to SQLite (P1)
7. **Subscription** → `app_metadata` table
8. **Theme** → `app_metadata` table
9. **Mascot Display Mode** → Consolidate with existing `mascot_customization` table

---

## Implementation Checkpoints

### ✅ Checkpoint 1: Create SQLite Schema
- [ ] Add `habit_templates` table
- [ ] Add `vacation_intervals` table
- [ ] Add `user_profile` table
- [ ] Create migration script from AsyncStorage

### ✅ Checkpoint 2: Create Zustand Stores  
- [ ] Create `templateStore` with SQLite persist
- [ ] Create `userStore` with SQLite persist (vacation + profile)
- [ ] Update contexts to use new stores

### ✅ Checkpoint 3: Update Backup/Restore
- [ ] Update `DataExporter` to export new tables
- [ ] Update `DataImporter` to restore new tables
- [ ] Add validation for new data structures

### ✅ Checkpoint 4: Data Migration
- [ ] Create one-time migration script
- [ ] Migrate existing AsyncStorage data to SQLite
- [ ] Clean up old AsyncStorage keys after successful migration

### ✅ Checkpoint 5: Update UI Components
- [ ] Update `TemplateContext` → `templateStore`
- [ ] Update `UserContext` → `userStore`
- [ ] Remove AsyncStorage imports from screens

### ✅ Checkpoint 6: Testing & Validation
- [ ] Test backup with new data
- [ ] Test restore with new data
- [ ] Verify migration works for existing users
- [ ] Test edge cases (empty data, partial data)

---

## Risk Assessment

| Feature | Data Loss Risk | Business Impact | User Impact |
|---------|---------------|-----------------|-------------|
| Templates | **HIGH** | Users stop creating templates | Loss of trust, frustration |
| Vacation Mode | **MEDIUM** | Incorrect streaks | Confusion, data integrity issues |
| Subscription | **MEDIUM** | Feature access issues | Support burden, churn risk |
| Profile | **LOW** | Re-enter name/email | Minor annoyance |
| Theme | **LOW** | Default theme | Minor annoyance |

---

## Next Steps

1. **Immediate:** Alert stakeholders about backup gap
2. **Sprint 1:** Implement Checkpoints 1-3 (schema, stores, backup)
3. **Sprint 2:** Implement Checkpoints 4-5 (migration, UI updates)
4. **Sprint 3:** Implement Checkpoint 6 (testing)

**Estimated Effort:** 3-4 days full implementation
