# Comprehensive Icon Replacement Guide

## Emoji to Icon Mapping

### Common UI Icons
- `←` → `ArrowLeft`
- `→` → `ArrowRight`
- `✓` → `Check` or `CheckCircle`
- `✕` / `×` → `X` or `XCircle`
- `🔍` → `Search`
- `⚙️` → `Settings`
- `📊` → `BarChart3`
- `📤` → `Upload` or `Share2`
- `📋` → `Clipboard` or `FileText`
- `🔔` → `Bell`
- `🔒` → `Lock`
- `ℹ️` → `Info`
- `💡` → `Lightbulb`
- `🎨` → `Palette`
- `📱` → `Smartphone`

### Status & Achievement
- `✨` → `Sparkles`
- `🎉` → `PartyPopper`
- `🏆` → `Trophy`
- `⭐` → `Star`
- `🔥` → `Flame`
- `💪` → `Award` or `Dumbbell`
- `🎯` → `Target`
- `👑` → `Crown`
- `🏅` → `Medal`

### Premium & Money
- `☁️` → `Cloud`
- `💎` → `Zap` or `Crown`
- `💳` → `CreditCard`
- `💰` → `DollarSign`

### Data & Documents
- `📝` → `Edit3` or `FileText`
- `📄` → `File`
- `📈` → `TrendingUp`
- `📅` → `Calendar`
- `🕐` → `Clock`

### Communication
- `💬` → `MessageCircle`
- `📧` → `Mail`
- `👥` → `Users`

## Files Requiring Updates (29 total)

1. ✅ HomeScreen.tsx - Profile icon DONE
2. ✅ SettingsScreen.tsx - All setting icons DONE
3. ✅ MainTabNavigator.tsx - Tab icons DONE
4. ✅ TemplateDetailScreen.tsx - Action icons DONE
5. ✅ TemplatesScreen.tsx - Search, close DONE
6. ✅ HabitTemplatesScreen.tsx - Back, search DONE
7. ⚠️ ProfileScreen.tsx - Menu icons (⚙️, 🔔, 🔒, 📤, ℹ️, 📊)
8. ⚠️ AnalyticsDashboardScreen.tsx - Chart icons (📊, 📤, ✓, 📋)
9. ⚠️ PaywallScreen.tsx - Feature indicators (✕, ✓, ☁️, ✨, 📊, 📤, 💬)
10. ⚠️ OnboardingWelcomeScreen.tsx - Checkmarks and icons
11. ⚠️ OnboardingTrackScreen.tsx - Feature icons (✓)
12. ⚠️ OnboardingStreaksScreen.tsx - Motivational icons
13. ⚠️ AboutScreen.tsx - Back button, share (←, 📤)
14. ⚠️ AccountSettingsScreen.tsx - Back, export (←, 📤)
15. ⚠️ DataPrivacyScreen.tsx - Back, data icons (←, 📊, 📤, 📋)
16. ⚠️ ExportDataScreen.tsx - Back, checkmarks, formats (←, ✓, ✕, 📊, 📄)
17. ⚠️ NotificationsSettingsScreen.tsx - Back, arrows, settings (←, →, ⚙️, 📊)
18. ⚠️ SubscriptionScreen.tsx - Back, features (←, ✓, 📊, 📤)
19. ⚠️ HabitDeepDiveScreen.tsx - Back, export, stats (←, 📤, ✓)
20. ⚠️ CalendarViewScreen.tsx - Back, filters (←, ✓, ✕)
21. ⚠️ HabitDetailScreen.tsx - Back, action icons (←, ✓, ✕, 📤)
22. ⚠️ ThemePickerScreen.tsx - Back, checkmarks (←, ✓)
23. ⚠️ AIInsightsScreen.tsx - Back, send, icons (←, →, 📊, 🔍)
24. ⚠️ ChangePasswordScreen.tsx - Back, validation (←, ✓, ✕, ○)
25. ⚠️ PasswordResetScreen.tsx - Back, success (←, ✓)
26. ⚠️ AddHabitStep1Screen.tsx - Arrow (→)
27. ⚠️ AddHabitStep2Screen.tsx - Back, checkmarks (←, ✓)
28. ⚠️ AddHabitStep3Screen.tsx - Back (←)
29. ⚠️ EditHabitScreen.tsx - Checkmarks (✓)
30. ⚠️ CreateTemplateScreen.tsx - Close buttons (✕)
31. ⚠️ PermissionNotificationScreen.tsx - Various icons

## Priority Order

### CRITICAL (User sees immediately):
1. ProfileScreen - Menu icons
2. AnalyticsDashboardScreen - Stats icons
3. PaywallScreen - Premium features

### HIGH (Common flows):
4. All Onboarding screens
5. AboutScreen, AccountSettings, DataPrivacy
6. ExportDataScreen
7. NotificationsSettingsScreen
8. SubscriptionScreen

### MEDIUM (Less frequent):
9. HabitDeepDiveScreen
10. CalendarViewScreen
11. HabitDetailScreen
12. ThemePickerScreen
13. AIInsightsScreen

### LOW (Edge cases):
14. Password/Auth screens
15. AddHabit screens
16. EditHabit screens

## Implementation Notes

- Keep ALL habit-related emojis (habit cards, templates, categories)
- Replace ONLY UI/navigation/action emojis
- Use consistent sizing: 20-24px for most, 18px for small buttons
- Use strokeWidth of 2 for normal, 2.5 for emphasized
- Always use theme colors for proper light/dark mode support
