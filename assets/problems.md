## Potential problems

### App wide
1. There is blank vertical space between the bottom menu/tab area bar and the content whatever is there on top. When I scroll the content goes inside an invisible void without even touching or coming near the bottom tab bar navigation
2. Need hapics addition for few actions like - 
    1. Create habit
    2. Delete habit
    3. Finish habit

#### Onboarding
1. Onboarding screens not swipeable. Users have to click buttons to move front or back.
2. Enable notifications does not actually enable notifications. As of now its juts a dummy button. Enable real notifications at system level

#### Sign in / Sign up screens
1. Signup with email needs API wiring
2. Signin/Login needs API wiring
3. Terms and conditions and Privacy policy should be added as single page views with content in the app

#### Home screen
1. Tapping dates on top horizontal scroll does not actually change the habits added by entries. Assumption of a user is that, only habits which need to be done on a certain/specific day needs to be shown below under habits. 
2. If today is selected then, the section title should be Today's habits else the day and date should be shown
Like - 29 Nov - Monday entries
3. Habi to take up less space. Maybe shrink by 40#. Lot of whitespace around
4. The circular progress indicator under X/Y Done is not showing accurate completion via the circle animation/fill

<Stopped here>

    ##### Habits [Home screen]
    1. When a user swipers the habit card, change the options revelaed to Add note, Edit, Delete
    2. Link the right screens when a user presses the actual option when the under the surface UI is shown
    3. Cannot swipe from left to right to mark the habit as Done. User sees the button but the card swipes back and does not all the user to actually press the green done button
    4. Selecting a habit by pressing the circular icon - [Done action], takes me to that particular habit's detail screen. This is wrong. When a user taps the circular icon, he should just complete the habit for the day. The navigation should not occur here
    5. If I complete a habit, a popup comes up which asks "How I feel" with an emoji reaction picker with an optional note. If I do add a note there or select an emoji, where does that go? I cannot see this entry under habit details. This needs to be fixed. I can imagine this as maybe 30 days later, I should see 10 days back I did complete a habit but was annoyed when i completed but other days I was happy to complete the habit. Mood tracking essentially. I as a user need to see the log or whatever entry I have done in the habit detail page. 
    6. Under the Today's habit section, add two small chips - Single and Multiple as chips which when clicked will show habits which are to be done only once per day - Say walking 5000 steps vs Multiple - Say reading morning and evening
    (Refer to the chips used for categorisation of the templates under template selection screen). Same chips can be used for this purpose.

## [TODO] 

## Latest log TBD - 3/12
✅ Completed Fixes (1-7, 9):
✅ View button text fixed - Removed emojis, added stopPropagation to prevent card tap conflict
✅ Compact buttons - Reduced padding (10px) and size (14px font), removed emojis
✅ Circular FAB - Create Template button is now a 60px circle in bottom right, above tab bar
✅ Scroll content fixed - Added paddingBottom: 120 to ScrollView content to prevent overlap
✅ SafeAreaView added - Template detail header now respects notch area
✅ Share button added - Replaced copy icon with Share button using native share sheet
✅ Text labels - Top right buttons now show "Share", "Delete", "Edit"/"Copy" as text
⚠️ Remaining Complex Issues (6, 8, 10):
Issue #6: 25 Habit Limit - This requires updating the CreateTemplateScreen and adding habit add/remove UI. Issue #8: Habit Management in Templates - This is a MAJOR feature requiring:
A new screen or modal to add/remove habits from templates
UI to edit habit configurations
Template notes field (500 char limit)
Integration with edit flow
Issue #10: Template Unification - Need to find where HabitTemplatesScreen is showing templates and ensure it uses the same DEFAULT_TEMPLATES from HabitTemplate.ts These are substantial changes. Would you like me to: A) Continue implementing issues #6, #8, and #10 (will require significant new code)? B) First test what's working now and then tackle the remaining issues? The app should reload automatically and most of your issues (1-7, 9) are now fixed!



