#!/bin/bash

# Comprehensive Emoji to Icon Replacement Script
# This script replaces ALL UI emoji icons with Lucide icons
# Preserves habit-specific emojis

SCREENS_DIR="/Users/shashankm/Documents/react/freelancer-app/habit-tracker-mobile/src/screens"

echo "Starting comprehensive emoji replacement..."

# Common replacements across all files
# Navigation
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/Text style.*>←<\/Text>/ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} \/>/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/Text style.*>→<\/Text>/ArrowRight size={20} color={theme.colors.text} strokeWidth={2} \/>/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/fontSize: 24.*>←<\/Text>/ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} \/>/g' {} \;

# Check marks
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/✓/Check/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/✕/X/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/×/X/g' {} \;

# Settings & UI
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/⚙️/Settings/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/🔍/Search/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/🔔/Bell/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/🔒/Lock/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/ℹ️/Info/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/💡/Lightbulb/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/🎨/Palette/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/📱/Smartphone/g' {} \;

# Data & Charts
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/📊/BarChart3/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/📤/Upload/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/📋/Clipboard/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/📝/FileText/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/📄/File/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/📈/TrendingUp/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/📅/Calendar/g' {} \;

# Status & Achievement
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/✨/Sparkles/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/🎉/PartyPopper/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/🏆/Trophy/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/⭐/Star/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/🔥/Flame/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/🎯/Target/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/👑/Crown/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/🏅/Medal/g' {} \;

# Premium & Money
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/☁️/Cloud/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/💳/CreditCard/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/💰/DollarSign/g' {} \;

# Communication
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/💬/MessageCircle/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/📧/Mail/g' {} \;
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/👥/Users/g' {} \;

# Time
find "$SCREENS_DIR" -name "*.tsx" -type f -exec sed -i '' 's/🕐/Clock/g' {} \;

echo "Emoji replacement complete!"
echo "Note: This is a text replacement. You'll need to:"
echo "1. Add icon imports to each file"
echo "2. Replace <Text> components with icon components"
echo "3. Adjust sizing and colors"
echo "4. Test each screen"
