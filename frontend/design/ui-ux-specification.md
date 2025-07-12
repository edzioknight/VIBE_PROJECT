# VibesMatch UI/UX Design Specification

## Table of Contents
1. [Design Philosophy & Principles](#design-philosophy--principles)
2. [Visual Design System](#visual-design-system)
3. [Component Library](#component-library)
4. [Screen Layouts](#screen-layouts)
5. [Interaction Design](#interaction-design)
6. [Animation & Micro-interactions](#animation--micro-interactions)
7. [Accessibility & Inclusive Design](#accessibility--inclusive-design)
8. [Responsive Design](#responsive-design)
9. [Innovative Features](#innovative-features)

---

## Design Philosophy & Principles

### Core Vision
VibesMatch aims to revolutionize the dating app experience by creating meaningful connections through sophisticated design that prioritizes authenticity, safety, and genuine human connection. Our design philosophy centers on creating an environment where users feel confident, respected, and excited about finding their perfect match.

### Design Principles

#### 1. Authentic Connection
- **Human-Centered**: Every design decision prioritizes genuine human interaction over superficial engagement
- **Emotional Intelligence**: UI elements respond to user emotions and relationship-building stages
- **Trust Building**: Visual cues that establish credibility and safety throughout the experience

#### 2. Sophisticated Simplicity
- **Effortless Elegance**: Complex functionality presented through intuitive, beautiful interfaces
- **Progressive Disclosure**: Information revealed at the right time and context
- **Cognitive Ease**: Reducing mental load while maintaining feature richness

#### 3. Inclusive Beauty
- **Universal Appeal**: Designs that resonate across diverse demographics and cultures
- **Accessibility First**: Beautiful design that works for everyone, regardless of ability
- **Cultural Sensitivity**: Respectful representation and inclusive imagery

#### 4. Emotional Resonance
- **Joyful Interactions**: Delightful moments that create positive emotional associations
- **Empathetic Design**: Understanding and responding to user emotional states
- **Celebration of Connection**: Meaningful moments highlighted through thoughtful design

---

## Visual Design System

### Color Palette

#### Primary Colors
```
Primary Pink: #E91E63 (rgb(233, 30, 99))
- Primary 50: #FCE4EC
- Primary 100: #F8BBD9
- Primary 200: #F48FB1
- Primary 300: #F06292
- Primary 400: #EC407A
- Primary 500: #E91E63 (Main)
- Primary 600: #D81B60
- Primary 700: #C2185B
- Primary 800: #AD1457
- Primary 900: #880E4F

Secondary Purple: #9C27B0
- Secondary 50: #F3E5F5
- Secondary 100: #E1BEE7
- Secondary 200: #CE93D8
- Secondary 300: #BA68C8
- Secondary 400: #AB47BC
- Secondary 500: #9C27B0 (Main)
- Secondary 600: #8E24AA
- Secondary 700: #7B1FA2
- Secondary 800: #6A1B9A
- Secondary 900: #4A148C
```

#### Accent Colors
```
Success Green: #4CAF50
- Success 50: #E8F5E8
- Success 100: #C8E6C9
- Success 200: #A5D6A7
- Success 300: #81C784
- Success 400: #66BB6A
- Success 500: #4CAF50 (Main)
- Success 600: #43A047
- Success 700: #388E3C
- Success 800: #2E7D32
- Success 900: #1B5E20

Warning Orange: #FF9800
- Warning 50: #FFF3E0
- Warning 100: #FFE0B2
- Warning 200: #FFCC80
- Warning 300: #FFB74D
- Warning 400: #FFA726
- Warning 500: #FF9800 (Main)
- Warning 600: #FB8C00
- Warning 700: #F57C00
- Warning 800: #EF6C00
- Warning 900: #E65100

Error Red: #F44336
- Error 50: #FFEBEE
- Error 100: #FFCDD2
- Error 200: #EF9A9A
- Error 300: #E57373
- Error 400: #EF5350
- Error 500: #F44336 (Main)
- Error 600: #E53935
- Error 700: #D32F2F
- Error 800: #C62828
- Error 900: #B71C1C

Info Blue: #2196F3
- Info 50: #E3F2FD
- Info 100: #BBDEFB
- Info 200: #90CAF9
- Info 300: #64B5F6
- Info 400: #42A5F5
- Info 500: #2196F3 (Main)
- Info 600: #1E88E5
- Info 700: #1976D2
- Info 800: #1565C0
- Info 900: #0D47A1
```

#### Neutral Colors
```
Light Mode:
- White: #FFFFFF
- Gray 50: #FAFAFA
- Gray 100: #F5F5F5
- Gray 200: #EEEEEE
- Gray 300: #E0E0E0
- Gray 400: #BDBDBD
- Gray 500: #9E9E9E
- Gray 600: #757575
- Gray 700: #616161
- Gray 800: #424242
- Gray 900: #212121
- Black: #000000

Dark Mode:
- Surface 0: #121212
- Surface 1: #1E1E1E
- Surface 2: #232323
- Surface 3: #252525
- Surface 4: #272727
- Surface 6: #2C2C2C
- Surface 8: #2E2E2E
- Surface 12: #333333
- Surface 16: #363636
- Surface 24: #383838
```

#### Gradient Combinations
```
Primary Gradient: linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)
Success Gradient: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)
Warning Gradient: linear-gradient(135deg, #FF9800 0%, #FFC107 100%)
Sunset Gradient: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)
Ocean Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

### Typography

#### Font Family
```
Primary: 'Inter' (System fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)
Secondary: 'Poppins' (For headings and special emphasis)
Monospace: 'SF Mono', 'Monaco', 'Inconsolata', monospace
```

#### Type Scale
```
Display Large: 57px / 64px (3.5rem / 4rem)
Display Medium: 45px / 52px (2.8rem / 3.25rem)
Display Small: 36px / 44px (2.25rem / 2.75rem)

Headline Large: 32px / 40px (2rem / 2.5rem)
Headline Medium: 28px / 36px (1.75rem / 2.25rem)
Headline Small: 24px / 32px (1.5rem / 2rem)

Title Large: 22px / 28px (1.375rem / 1.75rem)
Title Medium: 16px / 24px (1rem / 1.5rem)
Title Small: 14px / 20px (0.875rem / 1.25rem)

Body Large: 16px / 24px (1rem / 1.5rem)
Body Medium: 14px / 20px (0.875rem / 1.25rem)
Body Small: 12px / 16px (0.75rem / 1rem)

Label Large: 14px / 20px (0.875rem / 1.25rem) - Medium weight
Label Medium: 12px / 16px (0.75rem / 1rem) - Medium weight
Label Small: 11px / 16px (0.6875rem / 1rem) - Medium weight
```

#### Font Weights
```
Light: 300
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
Extrabold: 800
```

### Spacing System

#### Base Unit: 4px
```
Space 1: 4px (0.25rem)
Space 2: 8px (0.5rem)
Space 3: 12px (0.75rem)
Space 4: 16px (1rem)
Space 5: 20px (1.25rem)
Space 6: 24px (1.5rem)
Space 8: 32px (2rem)
Space 10: 40px (2.5rem)
Space 12: 48px (3rem)
Space 16: 64px (4rem)
Space 20: 80px (5rem)
Space 24: 96px (6rem)
Space 32: 128px (8rem)
```

#### Component Spacing
```
Button Padding: 12px 24px (Space 3 Space 6)
Input Padding: 16px (Space 4)
Card Padding: 20px (Space 5)
Screen Padding: 20px (Space 5)
Section Margin: 32px (Space 8)
```

### Border Radius
```
None: 0px
Small: 4px
Medium: 8px
Large: 12px
XLarge: 16px
XXLarge: 20px
Round: 50%
Pill: 9999px
```

### Shadows & Elevation

#### Light Mode Shadows
```
Shadow 1: 0px 1px 2px rgba(0, 0, 0, 0.05)
Shadow 2: 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)
Shadow 3: 0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)
Shadow 4: 0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)
Shadow 5: 0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)
Shadow 6: 0px 25px 50px rgba(0, 0, 0, 0.25)
```

#### Dark Mode Shadows
```
Shadow 1: 0px 1px 2px rgba(0, 0, 0, 0.3)
Shadow 2: 0px 1px 3px rgba(0, 0, 0, 0.4), 0px 1px 2px rgba(0, 0, 0, 0.3)
Shadow 3: 0px 4px 6px rgba(0, 0, 0, 0.4), 0px 2px 4px rgba(0, 0, 0, 0.3)
Shadow 4: 0px 10px 15px rgba(0, 0, 0, 0.5), 0px 4px 6px rgba(0, 0, 0, 0.3)
Shadow 5: 0px 20px 25px rgba(0, 0, 0, 0.5), 0px 10px 10px rgba(0, 0, 0, 0.2)
Shadow 6: 0px 25px 50px rgba(0, 0, 0, 0.6)
```

---

## Component Library

### Buttons

#### Primary Button
**Light Mode:**
```
Background: Primary 500 (#E91E63)
Text: White (#FFFFFF)
Border: None
Border Radius: Large (12px)
Padding: 16px 24px
Font: Body Large, Semibold
Shadow: Shadow 2
Min Height: 48px
```

**States:**
- **Default**: Background Primary 500, Shadow 2
- **Hover**: Background Primary 400, Shadow 3, Scale 1.02
- **Pressed**: Background Primary 600, Shadow 1, Scale 0.98
- **Disabled**: Background Gray 300, Text Gray 500, No shadow
- **Loading**: Background Primary 500, Spinner (White), Text hidden

**Dark Mode:**
```
Background: Primary 400 (#EC407A)
Text: White (#FFFFFF)
States adjust accordingly with Primary 300/500 for hover/pressed
```

#### Secondary Button
**Light Mode:**
```
Background: Transparent
Text: Primary 500 (#E91E63)
Border: 2px solid Primary 500
Border Radius: Large (12px)
Padding: 14px 22px (accounting for border)
Font: Body Large, Semibold
Min Height: 48px
```

**States:**
- **Default**: Border Primary 500, Text Primary 500
- **Hover**: Background Primary 50, Border Primary 400, Scale 1.02
- **Pressed**: Background Primary 100, Border Primary 600, Scale 0.98
- **Disabled**: Border Gray 300, Text Gray 400
- **Loading**: Border Primary 500, Spinner (Primary 500), Text hidden

#### Tertiary Button
**Light Mode:**
```
Background: Transparent
Text: Primary 500 (#E91E63)
Border: None
Border Radius: Large (12px)
Padding: 16px 24px
Font: Body Large, Semibold
Min Height: 48px
```

**States:**
- **Default**: Text Primary 500
- **Hover**: Background Primary 50, Scale 1.02
- **Pressed**: Background Primary 100, Scale 0.98
- **Disabled**: Text Gray 400
- **Loading**: Spinner (Primary 500), Text hidden

#### Icon Button
**Light Mode:**
```
Background: White (#FFFFFF)
Border: 1px solid Gray 200
Border Radius: Round (50%)
Size: 48px x 48px
Icon Size: 24px
Icon Color: Gray 700
Shadow: Shadow 2
```

**States:**
- **Default**: Background White, Border Gray 200, Icon Gray 700
- **Hover**: Background Gray 50, Border Gray 300, Scale 1.05
- **Pressed**: Background Gray 100, Border Gray 400, Scale 0.95
- **Active**: Background Primary 500, Border Primary 500, Icon White
- **Disabled**: Background Gray 100, Border Gray 200, Icon Gray 400

#### Floating Action Button (FAB)
**Light Mode:**
```
Background: Primary Gradient
Size: 56px x 56px
Icon Size: 24px
Icon Color: White
Border Radius: Round (50%)
Shadow: Shadow 4
```

**States:**
- **Default**: Primary Gradient, Shadow 4
- **Hover**: Scale 1.1, Shadow 5
- **Pressed**: Scale 0.95, Shadow 3
- **Disabled**: Background Gray 300, Icon Gray 500, Shadow 1

### Input Fields

#### Text Input
**Light Mode:**
```
Background: White (#FFFFFF)
Border: 1px solid Gray 300
Border Radius: Large (12px)
Padding: 16px
Font: Body Large, Regular
Min Height: 48px
Placeholder Color: Gray 500
```

**States:**
- **Default**: Border Gray 300, Background White
- **Focus**: Border Primary 500, Shadow 0 0 0 3px Primary 100
- **Error**: Border Error 500, Shadow 0 0 0 3px Error 100
- **Success**: Border Success 500, Shadow 0 0 0 3px Success 100
- **Disabled**: Background Gray 100, Border Gray 200, Text Gray 400

**Dark Mode:**
```
Background: Surface 2 (#232323)
Border: 1px solid Gray 600
Text: White
Placeholder Color: Gray 400
```

#### Search Input
**Light Mode:**
```
Background: Gray 100 (#F5F5F5)
Border: None
Border Radius: Pill (9999px)
Padding: 12px 16px 12px 44px (space for search icon)
Font: Body Medium, Regular
Height: 40px
Search Icon: 20px, Gray 500, positioned left
```

**States:**
- **Default**: Background Gray 100
- **Focus**: Background White, Border 1px Primary 500, Shadow 2
- **With Content**: Clear button (X) appears on right

#### Textarea
**Light Mode:**
```
Background: White (#FFFFFF)
Border: 1px solid Gray 300
Border Radius: Large (12px)
Padding: 16px
Font: Body Large, Regular
Min Height: 120px
Resize: Vertical only
```

**Character Counter:**
```
Position: Bottom right, inside padding
Font: Label Small, Regular
Color: Gray 500
Format: "150/250"
Warning (>80%): Warning 500
Error (100%): Error 500
```

### Cards

#### Profile Card
**Light Mode:**
```
Background: White (#FFFFFF)
Border Radius: XXLarge (20px)
Shadow: Shadow 3
Overflow: Hidden
Aspect Ratio: 3:4
```

**Structure:**
```
Image Container:
- Position: Relative
- Height: 70% of card
- Background: Gray 200 (loading state)

Overlay Gradient:
- Position: Absolute bottom
- Background: linear-gradient(transparent, rgba(0,0,0,0.7))
- Height: 40% of image container

Content Container:
- Position: Absolute bottom
- Padding: 20px
- Color: White

Online Indicator:
- Position: Absolute top-right
- Size: 12px circle
- Color: Success 500
- Border: 2px White
- Margin: 12px
```

**States:**
- **Default**: Shadow 3
- **Hover**: Shadow 4, Scale 1.02
- **Pressed**: Shadow 2, Scale 0.98
- **Loading**: Shimmer animation on image area

#### Message Card
**Light Mode:**
```
Background: White (#FFFFFF)
Border Radius: Large (12px)
Padding: 16px
Border: 1px solid Gray 200
```

**Structure:**
```
Avatar: 48px circle, positioned left
Content Area: Flex 1, margin-left 12px
Name: Title Medium, Semibold
Message Preview: Body Medium, Regular, Gray 600
Timestamp: Label Small, Regular, Gray 500
Unread Badge: 20px circle, Primary 500, White text
```

**States:**
- **Default**: Background White, Border Gray 200
- **Unread**: Border Primary 200, Background Primary 50
- **Pressed**: Background Gray 50
- **Swipe Actions**: Reveal action buttons (Archive, Delete)

#### Analytics Card
**Light Mode:**
```
Background: White (#FFFFFF)
Border Radius: Large (12px)
Padding: 20px
Shadow: Shadow 2
```

**Structure:**
```
Header:
- Title: Title Medium, Semibold
- Subtitle: Body Small, Gray 600
- Icon: 24px, Primary 500

Metric Display:
- Value: Display Small, Bold
- Change: Body Small with trend arrow
- Positive: Success 500
- Negative: Error 500
- Neutral: Gray 600

Chart Area:
- Height: 120px
- Margin-top: 16px
```

### Modals

#### Standard Modal
**Light Mode:**
```
Backdrop: rgba(0, 0, 0, 0.5)
Container: White (#FFFFFF)
Border Radius: XXLarge (20px) top corners only
Shadow: Shadow 6
Max Height: 90% of screen
```

**Structure:**
```
Handle Bar:
- Width: 40px
- Height: 4px
- Background: Gray 300
- Border Radius: Pill
- Centered, margin-top: 12px

Header:
- Padding: 20px 20px 0px
- Title: Headline Small, Bold
- Close Button: 32px, top-right

Content:
- Padding: 20px
- Scrollable if needed

Footer (if present):
- Padding: 0px 20px 20px
- Button layout: Full width or side-by-side
```

**Animation:**
- **Enter**: Slide up from bottom, backdrop fade in
- **Exit**: Slide down to bottom, backdrop fade out
- **Duration**: 300ms ease-out

#### Action Sheet
**Light Mode:**
```
Backdrop: rgba(0, 0, 0, 0.3)
Container: White (#FFFFFF)
Border Radius: XXLarge (20px) top corners only
Position: Bottom of screen
```

**Structure:**
```
Action Items:
- Height: 56px each
- Padding: 16px 20px
- Font: Body Large, Regular
- Border-bottom: 1px Gray 200 (except last)

Destructive Actions:
- Text Color: Error 500
- Icon Color: Error 500

Cancel Button:
- Separate container
- Margin-top: 8px
- Background: Gray 100
- Text: Body Large, Semibold
```

### Navigation

#### Tab Bar
**Light Mode:**
```
Background: White (#FFFFFF)
Border-top: 1px solid Gray 200
Height: 80px (includes safe area)
Padding: 8px 0px
```

**Tab Item:**
```
Width: Equal distribution
Alignment: Center
Icon Size: 24px
Label: Label Small, Medium weight
Spacing: 4px between icon and label

Active State:
- Icon Color: Primary 500
- Label Color: Primary 500
- Background: Primary 50 (rounded pill behind icon)

Inactive State:
- Icon Color: Gray 500
- Label Color: Gray 500
```

**Badge (for notifications):**
```
Size: 18px circle
Background: Error 500
Text: White, Label Small, Bold
Position: Top-right of icon
Max Display: 99+
```

#### Top Tab Bar
**Light Mode:**
```
Background: White (#FFFFFF)
Height: 48px
Border-bottom: 1px solid Gray 200
```

**Tab Item:**
```
Padding: 12px 16px
Font: Body Medium, Semibold
Min Width: 80px

Active State:
- Text Color: Primary 500
- Border-bottom: 2px Primary 500

Inactive State:
- Text Color: Gray 600
- Border-bottom: None
```

**Indicator:**
```
Height: 2px
Background: Primary 500
Border Radius: Pill
Animated transition between tabs
```

### Feedback Components

#### Toast Notification
**Success Toast:**
```
Background: Success 500
Text Color: White
Icon: Check circle, White
Border Radius: Large (12px)
Padding: 16px
Shadow: Shadow 3
Position: Top of screen, margin 20px
```

**Error Toast:**
```
Background: Error 500
Text Color: White
Icon: X circle, White
```

**Info Toast:**
```
Background: Info 500
Text Color: White
Icon: Info circle, White
```

**Animation:**
- **Enter**: Slide down from top + fade in
- **Exit**: Slide up to top + fade out
- **Duration**: 250ms ease-out
- **Auto-dismiss**: 4 seconds

#### Loading States

#### Skeleton Loader
**Light Mode:**
```
Background: Gray 200
Shimmer: Linear gradient moving left to right
Colors: Gray 200 → Gray 100 → Gray 200
Animation Duration: 1.5s infinite
Border Radius: Matches target component
```

**Profile Card Skeleton:**
```
Image Area: Rectangle, aspect ratio 3:4
Name: Rectangle, width 60%, height 20px
Age: Rectangle, width 30%, height 16px
Location: Rectangle, width 80%, height 14px
```

#### Spinner
**Primary Spinner:**
```
Size: 24px default (16px small, 32px large)
Color: Primary 500
Stroke Width: 2px
Animation: 360° rotation, 1s linear infinite
```

**Button Spinner:**
```
Size: 20px
Color: Matches button text color
Replaces button text during loading
```

### Form Components

#### Checkbox
**Light Mode:**
```
Size: 20px x 20px
Border: 2px solid Gray 400
Border Radius: Small (4px)
Background: Transparent
```

**States:**
- **Unchecked**: Border Gray 400, Background Transparent
- **Checked**: Border Primary 500, Background Primary 500, White checkmark
- **Indeterminate**: Border Primary 500, Background Primary 500, White dash
- **Disabled**: Border Gray 300, Background Gray 100
- **Focus**: Border Primary 500, Shadow 0 0 0 3px Primary 100

#### Radio Button
**Light Mode:**
```
Size: 20px x 20px
Border: 2px solid Gray 400
Border Radius: Round (50%)
Background: Transparent
```

**States:**
- **Unselected**: Border Gray 400, Background Transparent
- **Selected**: Border Primary 500, Background White, Inner dot Primary 500 (8px)
- **Disabled**: Border Gray 300, Background Gray 100
- **Focus**: Border Primary 500, Shadow 0 0 0 3px Primary 100

#### Switch
**Light Mode:**
```
Track Width: 44px
Track Height: 24px
Track Border Radius: Pill (12px)
Thumb Size: 20px
Thumb Border Radius: Round (50%)
```

**States:**
- **Off**: Track Gray 300, Thumb White, positioned left
- **On**: Track Primary 500, Thumb White, positioned right
- **Disabled Off**: Track Gray 200, Thumb Gray 300
- **Disabled On**: Track Primary 300, Thumb Gray 100
- **Focus**: Shadow 0 0 0 3px Primary 100

#### Slider
**Light Mode:**
```
Track Height: 4px
Track Color: Gray 300
Active Track Color: Primary 500
Thumb Size: 20px
Thumb Color: Primary 500
Thumb Border: 2px White
Thumb Shadow: Shadow 2
```

**States:**
- **Default**: Thumb Primary 500, Track Gray 300
- **Dragging**: Thumb scale 1.2, Shadow 3
- **Disabled**: Thumb Gray 400, Track Gray 200
- **Focus**: Thumb Shadow 0 0 0 4px Primary 100

#### Dropdown/Select
**Light Mode:**
```
Background: White (#FFFFFF)
Border: 1px solid Gray 300
Border Radius: Large (12px)
Padding: 16px
Font: Body Large, Regular
Min Height: 48px
Arrow Icon: 20px, Gray 500, positioned right
```

**Dropdown Menu:**
```
Background: White
Border Radius: Large (12px)
Shadow: Shadow 4
Max Height: 200px
Scrollable: Yes
Border: 1px solid Gray 200
```

**Menu Item:**
```
Padding: 12px 16px
Font: Body Large, Regular
Border-bottom: 1px Gray 100 (except last)

States:
- Default: Background White, Text Gray 900
- Hover: Background Gray 50
- Selected: Background Primary 50, Text Primary 700
- Disabled: Text Gray 400
```

---

## Screen Layouts

### Authentication Screens

#### Landing Screen
**Layout Structure:**
```
Container: Full screen, Primary Gradient background
Safe Area: Respected on all sides

Logo Section (Top 40%):
- Logo: 120px x 120px, centered
- App Name: Display Medium, White, centered
- Tagline: Body Large, White opacity 0.9, centered
- Margin-top: 20px between elements

Illustration Section (Middle 30%):
- Hero illustration: Dating/connection themed
- Width: 80% of screen, max 300px
- Centered horizontally

Action Section (Bottom 30%):
- Sign In Button: Primary button, full width
- Sign Up Button: Secondary button, full width
- Margin: 16px between buttons
- Google Sign In: Tertiary button with Google icon
- Padding: 20px horizontal

Footer:
- Terms & Privacy links: Label Small, White opacity 0.7
- Centered, margin-bottom: 20px
```

**Animations:**
- **Logo**: Fade in + scale from 0.8 to 1.0 (800ms delay)
- **Tagline**: Fade in + slide up (1000ms delay)
- **Illustration**: Fade in + slide up (1200ms delay)
- **Buttons**: Fade in + slide up, staggered 100ms each (1400ms delay)

#### Sign In Screen
**Layout Structure:**
```
Container: White background (Light mode)
Header:
- Back button: Top-left, 44px touch target
- Title: "Sign In" - Headline Medium, centered
- Margin-top: 20px

Form Section:
- Email Input: Full width, margin-top 40px
- Input Label: "Email address" - Label Large, margin-bottom 8px
- Helper Text: Body Small, Gray 600, margin-top 4px
- Send OTP Button: Primary button, full width, margin-top 24px

Alternative Section:
- Divider: "or" text with lines, margin 32px vertical
- Google Sign In: Secondary button with Google icon, full width

Footer:
- "Don't have an account?" text + "Sign Up" link
- Body Medium, centered, margin-bottom 20px
```

**States:**
- **Loading**: Send OTP button shows spinner, disabled state
- **Error**: Input shows error state, error message below
- **Success**: Navigate to OTP verification

#### OTP Verification Screen
**Layout Structure:**
```
Container: White background
Header:
- Back button: Top-left
- Title: "Verify OTP" - Headline Medium, centered

Content Section:
- Instruction text: Body Large, Gray 700, centered
- Email display: Body Medium, Primary 500, centered
- OTP Input: 6 digit input, large font, centered
- Character spacing: 8px between digits
- Margin-top: 40px

Timer Section:
- "Time remaining: 4:32" - Body Medium, Gray 600, centered
- Margin-top: 20px

Action Section:
- Verify Button: Primary button, full width, margin-top 32px
- Resend OTP: Tertiary button, centered, margin-top 16px
- Resend disabled state with countdown

Footer:
- "Didn't receive code?" text
- Body Small, Gray 600, centered
```

**OTP Input Design:**
```
Container: Flexbox row, justify center
Input Fields: 6 separate inputs, 48px x 56px each
Border: 2px solid Gray 300
Border Radius: Large (12px)
Font: Display Small, Bold, centered
Focus State: Border Primary 500, Shadow Primary 100
Filled State: Background Primary 50
```

### Onboarding Screens

#### Basic Info Screen
**Layout Structure:**
```
Container: White background
Progress Bar:
- Height: 4px, Gray 200 background
- Progress: Primary 500, width based on step (1/6)
- Position: Top of screen

Header:
- Title: "Basic Information" - Headline Medium
- Subtitle: "Tell us about yourself" - Body Large, Gray 600
- Margin: 32px top, 16px between title/subtitle

Form Section:
- Full Name Input: Label + Input field
- Date of Birth: Label + Date picker button
- Gender Selection: Label + Radio button group
- Margin: 24px between form groups

Date Picker Button:
- Appearance: Input field style
- Placeholder: "Select your date of birth"
- Icon: Calendar icon, right side
- Tap: Opens native date picker

Gender Options:
- Layout: Vertical radio group
- Options: Male, Female, Non-binary
- Spacing: 16px between options

Footer:
- Continue Button: Primary button, full width
- Disabled until all fields completed
- Margin-bottom: 20px
```

#### Location Screen
**Layout Structure:**
```
Progress Bar: 2/6 completed

Header:
- Title: "Where are you located?"
- Subtitle: "Help us find matches near you"

Form Section:
- Country Dropdown: Required field
- State/Province Dropdown: Conditional on country
- City Input: Optional text input
- Location Permission: Optional button to use current location

Permission Section:
- Icon: Location pin, Primary 500
- Title: "Use current location"
- Description: "We'll automatically detect your location"
- Button: "Enable Location" - Secondary button
- Privacy note: Body Small, Gray 600

Footer:
- Continue Button: Enabled when country selected
- Skip Button: Tertiary button (if location permission denied)
```

#### Lifestyle Screen
**Layout Structure:**
```
Progress Bar: 3/6 completed

Header:
- Title: "Lifestyle & Preferences"
- Subtitle: "Tell us about your lifestyle"

Form Section (Scrollable):
- Exercise: Dropdown (Never, Rarely, Sometimes, Often, Daily)
- Education: Dropdown (High School, College, Bachelor's, Master's, PhD, Other)
- Job: Text input (optional)
- Drinking: Dropdown (Never, Rarely, Socially, Regularly)
- Smoking: Dropdown (Never, Rarely, Socially, Regularly)
- Kids: Dropdown (Don't want, Want someday, Have & want more, Have & don't want more)
- Ethnicity: Dropdown (optional)
- Religion: Dropdown (optional)

Dropdown Design:
- Consistent with input field styling
- Chevron down icon
- Placeholder text in Gray 500
- Selected value in Gray 900
```

#### Preferences Screen
**Layout Structure:**
```
Progress Bar: 4/6 completed

Header:
- Title: "Dating Preferences"
- Subtitle: "What are you looking for?"

Form Section:
- Relationship Type: Radio group (Casual, Serious, Marriage, Friendship)
- Current Status: Radio group (Single, Divorced, Widowed, It's complicated)
- Sexuality: Dropdown
- Looking For: Multi-select checkboxes
- Preferred Genders: Checkbox group (Male, Female, Non-binary)

Multi-select Design:
- Checkbox list with custom styling
- Selected items show Primary 500 background
- Allow multiple selections
- "Select all that apply" helper text

Age Range Slider:
- Dual thumb slider
- Range: 18-80
- Current values displayed above thumbs
- Format: "25 - 35 years old"
```

#### Personality Screen
**Layout Structure:**
```
Progress Bar: 5/6 completed

Header:
- Title: "Personality & Interests"
- Subtitle: "Help us understand you better"

MBTI Section:
- Title: "Personality Type (Optional)"
- Dropdown: 16 MBTI types
- Helper text: "Don't know? Take a quick test" (link)

Interests Section:
- Title: "Interests"
- Subtitle: "Select at least 3 interests"
- Tag Grid: Scrollable grid of interest tags
- Categories: Sports, Music, Travel, Food, Arts, Technology, etc.

Interest Tag Design:
- Pill shape, Border radius: Pill
- Default: Border Gray 300, Background White, Text Gray 700
- Selected: Background Primary 500, Text White
- Size: Auto width, 36px height
- Padding: 8px 16px
- Grid: 2-3 columns, 8px gap

Validation:
- Minimum 3 interests required
- Maximum 10 interests allowed
- Counter: "3/10 selected"
```

#### Photos Screen
**Layout Structure:**
```
Progress Bar: 6/6 completed

Header:
- Title: "Add Your Photos"
- Subtitle: "Upload at least 2 photos to continue"

Photo Grid:
- Layout: 2x3 grid
- Aspect Ratio: 3:4 for each slot
- Gap: 12px between photos
- First slot: Required (marked with *)
- Remaining slots: Optional

Photo Slot Design:
- Empty State: Dashed border, Plus icon, "Add Photo" text
- Filled State: Photo with overlay controls
- Controls: Delete (X) button, Reorder handle
- Primary Photo: "Main" badge overlay

Upload Options:
- Camera: Take new photo
- Gallery: Choose from library
- Action Sheet: Appears on slot tap

Validation Rules:
- Minimum 2 photos required
- Maximum 6 photos allowed
- File size limit: 10MB per photo
- Formats: JPG, PNG, HEIC

Footer:
- Complete Profile Button: Primary button
- Enabled when minimum photos uploaded
```

### Discovery Screens

#### Main Discovery Screen
**Layout Structure:**
```
Container: Full screen, Gray 50 background

Header:
- Logo: Small version, left side
- Filter Icon: Right side, with badge if filters active
- Height: 60px + safe area

Card Stack Area:
- Profile cards: Centered, 90% screen width
- Max width: 350px
- Aspect ratio: 3:4
- Stack depth: 3 cards visible
- Z-index layering for depth effect

Card Design:
- Border radius: XXLarge (20px)
- Shadow: Shadow 4
- Overflow: Hidden
- Background: White

Card Content:
- Image: Full card background
- Gradient overlay: Bottom 40%
- Content area: Absolute positioned bottom
- Padding: 20px

Profile Info Layout:
- Name + Age: Title Large, Bold, White
- Location: Body Medium, White opacity 0.9
- Distance: Body Small, White opacity 0.8
- Online indicator: Green dot, top-right

Interaction Buttons:
- Container: Bottom of screen, above safe area
- Background: White with top shadow
- Padding: 20px
- Layout: Horizontal row, centered

Button Layout:
- Dislike (X): 56px circle, Gray border
- Super Like (Star): 48px circle, Blue background
- Like (Heart): 56px circle, Pink background
- Message: 48px circle, Purple background
- Spacing: 20px between buttons

Usage Indicator:
- "5 likes remaining" text above buttons
- Body Small, Gray 600, centered
- Only shown for free users near limit
```

**Card Animations:**
- **Swipe**: Card follows finger with rotation
- **Like**: Card slides right + fade out, heart animation
- **Dislike**: Card slides left + fade out
- **Next Card**: Slides up from behind with scale animation
- **Super Like**: Card slides up + fade out, star burst effect

#### Profile Detail View (Expanded Card)
**Layout Structure:**
```
Trigger: Scroll up gesture on profile card
Animation: Card expands to full screen with spring physics

Header:
- Back gesture area: Top 20% of screen
- Photo gallery: Swipeable, page indicators
- Close affordance: Subtle down arrow

Content Sections (Scrollable):
1. Basic Info:
   - Name, Age, Location
   - Online status
   - Distance

2. About Section:
   - Bio text
   - "About [Name]" header

3. Interests:
   - Grid of interest tags
   - "Interests" header

4. Details Grid:
   - Exercise, Education, Job
   - Drinking, Smoking, Kids
   - MBTI, Religion, Ethnicity
   - 2-column layout on larger screens

5. More Photos:
   - Horizontal scroll gallery
   - Remaining photos beyond primary

Interaction Area:
- Fixed bottom area
- Same buttons as main discovery (except dislike)
- Background: White with top shadow
```

### Messaging Screens

#### Messages Tab Screen
**Layout Structure:**
```
Container: White background

Header:
- Title: "Messages" - Headline Medium
- Search icon: Right side
- Height: 60px + safe area

Tab Navigation:
- Material Top Tabs
- Tabs: "Chats", "Requests", "Viewed"
- Active indicator: Primary 500 underline
- Badge: Unread count on relevant tabs

Tab Content:
- Chats: Conversation list
- Requests: Message request list (Received/Sent sub-tabs)
- Viewed: Profile view tracking (I Viewed/Viewed Me)

Empty States:
- Illustration: Relevant to tab content
- Title: Encouraging message
- Subtitle: Helpful explanation
- Action button: If applicable
```

#### Conversation List (Chats Tab)
**Layout Structure:**
```
List Container: Full width, scrollable

Conversation Item:
- Height: 80px
- Padding: 16px 20px
- Border-bottom: 1px Gray 100

Layout:
- Avatar: 48px circle, left side
- Online indicator: 12px circle on avatar
- Content area: Flex 1, margin-left 12px
- Timestamp: Right side, top aligned
- Unread badge: Right side, bottom aligned

Content Layout:
- Name: Title Medium, Semibold
- Last message: Body Medium, Gray 600
- Truncate: Single line with ellipsis
- Unread styling: Name and message in Gray 900, bold

Unread Badge:
- Size: 20px circle minimum
- Background: Primary 500
- Text: White, Label Small, Bold
- Max display: "99+"

Swipe Actions:
- Swipe left: Archive, Delete options
- Swipe right: Mark as read/unread
- Action buttons: 80px width each
```

#### Chat Screen
**Layout Structure:**
```
Container: White background

Header:
- Back button: Left side
- User info: Center (name + online status)
- More options: Right side (3 dots)
- Height: 60px + safe area

User Info Display:
- Name: Title Medium, Semibold
- Online status: Body Small, Success 500
- Last seen: Body Small, Gray 600 (if offline)

Messages Area:
- Background: Gray 50
- Padding: 16px horizontal
- Scrollable: Reverse (newest at bottom)
- Auto-scroll: To bottom on new message

Message Bubble:
- Own messages: Right aligned, Primary 500 background
- Other messages: Left aligned, White background
- Max width: 80% of screen
- Border radius: 20px (with tail)
- Padding: 12px 16px
- Margin: 4px vertical

Message Content:
- Text: Body Large, appropriate color
- Timestamp: Label Small, below message
- Read receipt: Check marks for own messages
- Spacing: 8px between timestamp and message

Typing Indicator:
- Position: Bottom of messages area
- Design: Animated dots in message bubble style
- Text: "[Name] is typing..."

Input Area:
- Background: White
- Border-top: 1px Gray 200
- Padding: 12px 16px
- Safe area: Respected at bottom

Input Layout:
- Text input: Flex 1, multiline
- Send button: 40px circle, Primary 500
- Margin: 8px between input and button
- Max height: 120px (scrollable)

Send Button States:
- Disabled: Gray 300 (empty input)
- Enabled: Primary 500 (with content)
- Sending: Spinner animation
```

### Premium Screens

#### Premium Paywall
**Layout Structure:**
```
Container: White background

Header:
- Close button: Top-left (X)
- Crown icon: Large, centered, Gold color
- Title: "Upgrade to Premium" - Headline Large
- Subtitle: Context-aware message - Body Large, Gray 600

Features Section:
- List of premium features
- Each feature: Icon + Title + Description
- Layout: Vertical list, 16px spacing

Feature Item:
- Icon: 24px, Primary 500, in 48px circle background
- Title: Title Medium, Semibold
- Description: Body Medium, Gray 600
- Layout: Horizontal, icon left, content right

Plans Section:
- Plan cards: Side by side (if 2 plans)
- Recommended badge: On yearly plan
- Pricing: Display prominently
- Features: Bullet points

Plan Card:
- Border: 2px, Gray 300 (default) or Primary 500 (recommended)
- Border radius: Large (12px)
- Padding: 20px
- Background: White (default) or Primary 50 (recommended)

Footer:
- Continue button: Primary button, full width
- Terms link: Label Small, Gray 600, centered
- "Maybe Later": Tertiary button, centered
```

#### Subscription Plans
**Layout Structure:**
```
Header:
- Back button + Title: "Choose Your Plan"

Plan Comparison:
- Monthly plan: Left side
- Yearly plan: Right side (recommended)
- Discount badge: "Save 40%" on yearly

Plan Details:
- Price: Display Large, Bold
- Billing period: Body Medium, Gray 600
- Trial info: Body Small, Success 500
- Feature list: Checkmarks + text

Payment Section:
- Payment method selector
- Billing address (if required)
- Terms checkbox
- Subscribe button: Primary, full width

Trust Indicators:
- Secure payment badges
- Cancel anytime text
- Money back guarantee
```

#### Who Liked Me Screen
**Layout Structure:**
```
Header:
- Title: "Who Liked You"
- Filter/Sort options: Right side

Grid Layout:
- 2 columns on mobile, 3+ on tablet
- Aspect ratio: 3:4 for each card
- Gap: 12px between cards
- Padding: 16px container

Profile Card (Grid Item):
- Image: Full card background
- Gradient overlay: Bottom portion
- Super like badge: Top-right corner (if applicable)
- Name + Age: Bottom overlay
- Like back button: Bottom-right corner

Super Like Badge:
- Star icon: 16px, White
- Background: Info 500 circle
- Size: 28px
- Position: Top-right, 8px margin

Like Back Button:
- Heart icon: 16px, White
- Background: Primary 500 circle
- Size: 32px
- Shadow: Shadow 2

Empty State:
- Heart icon: 64px, Gray 400
- Title: "No likes yet"
- Subtitle: Encouraging message
- Centered in screen
```

### Analytics Screens

#### Profile Analytics Dashboard
**Layout Structure:**
```
Container: Gray 50 background

Header:
- Title: "Profile Analytics"
- Date range selector: Right side
- Height: 60px + safe area

Metrics Overview:
- 4 metric cards in 2x2 grid
- Cards: Profile views, Likes received, Matches, Messages
- Spacing: 12px gap

Metric Card:
- Background: White
- Border radius: Large (12px)
- Padding: 16px
- Shadow: Shadow 1

Card Content:
- Icon: 24px, colored
- Value: Display Medium, Bold
- Label: Body Small, Gray 600
- Change: Body Small with trend arrow and percentage

Charts Section:
- Performance chart: Line chart showing trends
- Conversion funnel: Visual funnel representation
- Photo performance: Grid with individual photo metrics

Chart Container:
- Background: White
- Border radius: Large (12px)
- Padding: 20px
- Height: 200px (charts)
- Margin: 16px vertical

Profile Strength:
- Score: Large circular progress indicator
- Percentage: Display Large in center
- Suggestions: List of improvement tips
- Action buttons: For each suggestion
```

#### Boost Analytics Screen
**Layout Structure:**
```
Header:
- Back button + Title: "Boost Performance"
- Boost status: Active/Inactive indicator

Active Boost Card (if applicable):
- Time remaining: Countdown timer
- Performance metrics: Views gained, Likes gained
- ROI indicator: Percentage increase
- Background: Success 50 gradient

Historical Performance:
- Chart: Hourly breakdown of boost performance
- Comparison: Normal vs boosted visibility
- Metrics: Detailed statistics

ROI Visualization:
- Before/After comparison
- Investment vs return
- Recommendation for future boosts

Schedule Section:
- Optimal time recommendations
- Calendar view for scheduling
- Time slot suggestions based on data
```

---

## Interaction Design

### Micro-interactions

#### Button Interactions
**Tap Feedback:**
```
Duration: 150ms
Scale: 0.95 (pressed state)
Haptic: Light impact
Visual: Slight shadow reduction
```

**Loading State:**
```
Spinner: Fade in over 200ms
Text: Fade out over 200ms
Button: Maintains size and position
Haptic: None during loading
```

**Success Feedback:**
```
Checkmark: Scale from 0 to 1.2 to 1.0 over 400ms
Color: Brief flash of Success 500
Haptic: Success impact (medium)
```

#### Input Field Interactions
**Focus Animation:**
```
Border: Color transition over 200ms
Shadow: Fade in over 200ms
Label: Float up and scale down (if floating label)
Cursor: Blink animation starts
```

**Error State:**
```
Shake: 3 quick horizontal movements (300ms total)
Color: Border and text transition to Error 500
Icon: Error icon fade in
Haptic: Error impact (heavy)
```

**Success State:**
```
Border: Transition to Success 500
Icon: Checkmark fade in with scale animation
Haptic: Light impact
```

#### Card Interactions
**Hover/Press (Discovery Cards):**
```
Scale: 1.02 on hover, 0.98 on press
Shadow: Increase elevation
Duration: 200ms ease-out
Haptic: Light impact on press
```

**Swipe Gestures:**
```
Follow: Card follows finger with rotation
Threshold: 30% of screen width for action
Snap Back: Spring animation if below threshold
Action: Slide out with fade if above threshold
```

### Screen Transitions

#### Navigation Animations
**Push (Forward Navigation):**
```
Incoming Screen: Slide in from right
Outgoing Screen: Slide out to left (partial)
Duration: 300ms
Easing: ease-out
Overlap: 50px
```

**Pop (Back Navigation):**
```
Incoming Screen: Slide in from left
Outgoing Screen: Slide out to right
Duration: 300ms
Easing: ease-out
```

**Modal Presentation:**
```
Modal: Slide up from bottom
Backdrop: Fade in
Duration: 300ms
Easing: ease-out
Spring: Slight bounce on final position
```

**Tab Switching:**
```
Content: Cross-fade between tabs
Duration: 200ms
Easing: ease-in-out
Indicator: Slide to new position
```

#### Onboarding Flow
**Step Progression:**
```
Progress Bar: Smooth fill animation (500ms)
Content: Slide out left, new content slide in right
Duration: 400ms
Easing: ease-in-out
Stagger: 100ms delay between out and in
```

**Form Validation:**
```
Error Appearance: Slide down from input
Success Appearance: Fade in with scale
Field Highlighting: Glow animation
Duration: 250ms
```

### Gesture Interactions

#### Discovery Screen Gestures
**Swipe to Like/Dislike:**
```
Threshold: 100px horizontal movement
Visual Feedback: Card rotation and color overlay
Like: Green overlay with heart icon
Dislike: Red overlay with X icon
Haptic: Medium impact at threshold
```

**Scroll for Details:**
```
Trigger: Vertical scroll up on card
Threshold: 50px movement
Animation: Card expands to full screen
Duration: 400ms with spring physics
Backdrop: Blur background content
```

**Pinch to Zoom (Photo View):**
```
Scale Range: 1.0 to 3.0
Center: Pinch focal point
Boundaries: Respect image bounds
Return: Spring back to fit on release
```

#### Chat Screen Gestures
**Pull to Refresh:**
```
Trigger: Pull down at top of message list
Threshold: 60px
Visual: Spinner appears and rotates
Haptic: Light impact at threshold
Animation: Smooth spring return
```

**Swipe to Reply:**
```
Trigger: Swipe right on message bubble
Threshold: 80px
Visual: Reply icon appears and follows
Action: Focus input with quoted message
Haptic: Light impact at threshold
```

**Long Press Menu:**
```
Trigger: 500ms press on message
Visual: Message highlights, menu appears
Options: Copy, Delete, Report
Animation: Scale up menu with fade in
Haptic: Medium impact on trigger
```

### Loading States

#### Progressive Loading
**Image Loading:**
```
1. Placeholder: Gray background with shimmer
2. Low Quality: Blurred version fades in
3. High Quality: Sharp version replaces blur
4. Transition: Cross-fade between qualities
```

**Content Loading:**
```
1. Skeleton: Animated placeholder shapes
2. Partial: Content appears in chunks
3. Complete: Final layout with animations
4. Polish: Micro-animations activate
```

**List Loading:**
```
1. Initial: First 10 items with skeletons
2. Scroll: Load more as user approaches end
3. Infinite: Seamless continuation
4. Error: Retry button if loading fails
```

#### Error Recovery
**Network Error:**
```
1. Detection: Monitor connection status
2. Notification: Toast with retry option
3. Retry: Automatic retry with exponential backoff
4. Manual: User-triggered retry button
```

**API Error:**
```
1. Graceful: Show cached content if available
2. Message: User-friendly error explanation
3. Action: Clear next steps for user
4. Recovery: Automatic retry for transient errors
```

---

## Animation & Micro-interactions

### Animation Principles

#### Timing Functions
```
Ease Out: cubic-bezier(0.25, 0.46, 0.45, 0.94) - Default for entrances
Ease In: cubic-bezier(0.55, 0.055, 0.675, 0.19) - For exits
Ease In Out: cubic-bezier(0.645, 0.045, 0.355, 1) - For transitions
Spring: Custom spring physics for natural movement
```

#### Duration Guidelines
```
Micro-interactions: 100-200ms
UI Transitions: 200-300ms
Screen Transitions: 300-500ms
Complex Animations: 500-800ms
Maximum Duration: 1000ms (except loading states)
```

#### Easing Curves
```
Sharp: Quick start, gradual end (UI feedback)
Standard: Balanced acceleration (most transitions)
Decelerated: Gradual start, quick end (entrances)
Accelerated: Quick start, gradual end (exits)
```

### Specific Animations

#### Discovery Card Animations
**Card Stack Effect:**
```
Card 1 (Top): Scale 1.0, Z-index 3, Shadow 4
Card 2 (Middle): Scale 0.95, Z-index 2, Shadow 2
Card 3 (Bottom): Scale 0.9, Z-index 1, Shadow 1
Transition: Smooth scale and shadow changes
```

**Swipe Animation:**
```
Follow Phase:
- Card follows finger with 1:1 ratio
- Rotation: 15° maximum based on horizontal distance
- Opacity: Reduces as card moves away
- Overlay: Color overlay intensity based on distance

Release Phase:
- Threshold Check: 30% of screen width
- Snap Back: Spring animation if below threshold
- Complete Action: Slide out with acceleration if above
- Next Card: Slides up from behind with scale animation
```

**Like/Dislike Feedback:**
```
Like Animation:
- Heart Icon: Scale from 0 to 1.5 to 1.0 over 600ms
- Particles: Small hearts float up and fade out
- Color: Green overlay with 0.3 opacity
- Haptic: Medium impact

Dislike Animation:
- X Icon: Scale from 0 to 1.5 to 1.0 over 600ms
- Shake: Brief horizontal shake before slide out
- Color: Red overlay with 0.3 opacity
- Haptic: Light impact
```

**Super Like Animation:**
```
Card Movement: Slide up and fade out
Star Burst: Multiple stars radiate from center
Star Animation: Scale and rotate with trail effect
Background: Blue overlay with sparkle particles
Haptic: Heavy impact
Duration: 800ms total
```

#### Match Celebration Animation
**Modal Entrance:**
```
Backdrop: Fade in over 300ms
Modal: Scale from 0.8 to 1.0 with spring bounce
Confetti: Particles fall from top of screen
Hearts: Floating hearts around profile photos
Duration: 1200ms total
```

**Profile Photos:**
```
Photos: Slide in from opposite sides
Scale: Pulse animation (1.0 to 1.05 to 1.0)
Glow: Soft glow effect around photos
Hearts: Small hearts float between photos
```

**Text Animation:**
```
"It's a Match!": Scale in with bounce
User Names: Fade in with slide up
Description: Fade in with delay
Buttons: Slide up from bottom with stagger
```

#### Message Animations
**Message Bubble Entrance:**
```
Own Messages:
- Slide in from right
- Scale from 0.8 to 1.0
- Opacity fade in
- Duration: 250ms

Other Messages:
- Slide in from left
- Scale from 0.8 to 1.0
- Opacity fade in
- Duration: 250ms
```

**Typing Indicator:**
```
Bubble Entrance: Slide in from left with fade
Dots Animation: Sequential scale animation
Dot 1: Scale 0.5 to 1.0 (0ms delay)
Dot 2: Scale 0.5 to 1.0 (150ms delay)
Dot 3: Scale 0.5 to 1.0 (300ms delay)
Loop: Continuous with 1200ms cycle
```

**Read Receipt Animation:**
```
Single Check: Fade in when message sent
Double Check: Second check slides in from right
Blue Color: Color transition when message read
Duration: 200ms for each state change
```

#### Premium Feature Animations
**Paywall Entrance:**
```
Backdrop: Fade in over 300ms
Content: Slide up from bottom
Crown Icon: Rotate and scale with sparkle effect
Features: Staggered fade in (100ms delays)
Buttons: Slide up from bottom
```

**Upgrade Success:**
```
Checkmark: Scale from 0 to 2.0 to 1.0 over 600ms
Confetti: Celebration particles
Badge: "Premium" badge slides in
Features: Unlock animations for each feature
```

**Who Liked Me Reveal:**
```
Grid Items: Staggered fade in and scale
Blur Removal: Gradual blur reduction
Profile Info: Slide up from bottom
Like Button: Pulse animation to draw attention
```

#### Loading Animations
**Skeleton Shimmer:**
```
Gradient: Linear gradient moving left to right
Colors: Gray 200 → Gray 100 → Gray 200
Speed: 1.5s per cycle
Direction: -45° angle for natural look
```

**Spinner Animation:**
```
Rotation: 360° continuous rotation
Speed: 1s per rotation
Easing: Linear (no acceleration)
Stroke: Animated stroke dash for progress indication
```

**Progress Bar:**
```
Fill: Smooth width transition
Duration: Matches actual progress timing
Easing: Ease-out for natural feel
Pulse: Subtle pulse during active loading
```

#### Onboarding Animations
**Step Progression:**
```
Progress Bar: Smooth fill animation
Current Step: Slide out to left
Next Step: Slide in from right
Overlap: 100ms overlap for smooth transition
```

**Form Validation:**
```
Success State:
- Checkmark: Scale in with bounce
- Field: Green border transition
- Text: Fade in success message

Error State:
- Shake: 3 quick horizontal movements
- Field: Red border transition
- Text: Slide down error message
```

**Photo Upload:**
```
Upload Progress: Circular progress indicator
Success: Checkmark with scale animation
Error: X mark with shake animation
Thumbnail: Fade in when upload complete
```

### Haptic Feedback

#### Feedback Types
```
Light Impact: Button taps, toggle switches
Medium Impact: Successful actions, confirmations
Heavy Impact: Errors, important notifications
Selection: Picker scrolling, slider adjustments
```

#### Usage Guidelines
```
Button Press: Light impact on press down
Successful Action: Medium impact on completion
Error State: Heavy impact when error occurs
Swipe Actions: Light impact at threshold
Match Found: Heavy impact for celebration
```

---

## Accessibility & Inclusive Design

### Screen Reader Support

#### Semantic Structure
```
Headings: Proper heading hierarchy (h1, h2, h3)
Landmarks: Navigation, main, complementary regions
Lists: Proper list markup for grouped content
Tables: Headers and captions for data tables
```

#### Accessibility Labels
```
Buttons: Clear action descriptions
Images: Meaningful alt text or decorative marking
Form Fields: Associated labels and descriptions
Icons: Text alternatives for icon-only buttons
Status: Live regions for dynamic content updates
```

#### Focus Management
```
Focus Order: Logical tab sequence
Focus Indicators: Visible focus states
Focus Trapping: Modal and dropdown focus containment
Focus Restoration: Return focus after modal close
Skip Links: Navigation bypass options
```

### Visual Accessibility

#### Color Contrast
```
Normal Text: 4.5:1 minimum contrast ratio
Large Text: 3:1 minimum contrast ratio
UI Components: 3:1 minimum contrast ratio
Focus Indicators: 3:1 minimum contrast ratio
```

#### Color Independence
```
Error States: Icons and text, not just red color
Success States: Checkmarks and text, not just green
Status Indicators: Shapes and text, not just color
Charts: Patterns and labels, not just color coding
```

#### Text Scaling
```
Support: 200% zoom without horizontal scrolling
Responsive: Text reflows at larger sizes
Minimum: 16px base font size for body text
Maximum: No text smaller than 12px
```

### Motor Accessibility

#### Touch Targets
```
Minimum Size: 44px x 44px for all interactive elements
Spacing: 8px minimum between adjacent targets
Gesture Alternatives: Tap alternatives for complex gestures
Voice Control: Voice command compatibility
```

#### Timing
```
No Time Limits: Or user-controlled extensions
Pause/Stop: For auto-playing content
Adjustable: User can modify timing preferences
```

### Cognitive Accessibility

#### Clear Communication
```
Simple Language: Clear, concise instructions
Error Messages: Specific, actionable guidance
Help Text: Context-sensitive assistance
Progress Indicators: Clear completion status
```

#### Consistent Interface
```
Navigation: Consistent placement and behavior
Terminology: Consistent language throughout
Patterns: Familiar interaction patterns
Predictability: Expected outcomes for actions
```

#### Error Prevention
```
Validation: Real-time form validation
Confirmation: For destructive actions
Undo: Ability to reverse actions
Auto-save: Prevent data loss
```

### Inclusive Design Principles

#### Universal Design
```
Flexibility: Multiple ways to accomplish tasks
Simplicity: Intuitive interface design
Perceptible: Information presented clearly
Tolerance: Forgiving of user errors
```

#### Cultural Sensitivity
```
Imagery: Diverse representation in photos
Language: Inclusive terminology
Assumptions: Avoid cultural assumptions
Localization: Support for different regions
```

#### Privacy & Safety
```
Control: User control over personal information
Transparency: Clear privacy explanations
Safety: Reporting and blocking features
Consent: Explicit consent for data usage
```

---

## Responsive Design

### Breakpoints

#### Device Categories
```
Mobile Small: 320px - 374px (iPhone SE, older Android)
Mobile Medium: 375px - 413px (iPhone 12, Pixel)
Mobile Large: 414px - 480px (iPhone 12 Pro Max, large Android)
Tablet Small: 481px - 768px (iPad Mini, small tablets)
Tablet Large: 769px - 1024px (iPad, large tablets)
Desktop: 1025px+ (Web version, if applicable)
```

#### Layout Adaptations
```
Mobile: Single column, full-width components
Tablet: Two-column layouts where appropriate
Desktop: Multi-column layouts, sidebar navigation
```

### Component Scaling

#### Typography Scaling
```
Mobile: Base scale (16px body text)
Tablet: 1.125x scale (18px body text)
Desktop: 1.25x scale (20px body text)
Headings: Scale proportionally with body text
```

#### Spacing Scaling
```
Mobile: Base spacing system (4px unit)
Tablet: 1.25x spacing (5px unit)
Desktop: 1.5x spacing (6px unit)
Maintain proportional relationships
```

#### Touch Target Scaling
```
Mobile: 44px minimum (finger touch)
Tablet: 48px minimum (larger screen, more precision)
Desktop: 32px minimum (mouse cursor precision)
```

### Layout Patterns

#### Discovery Screen
```
Mobile:
- Single card, centered
- Full-width interaction buttons
- Vertical button layout if needed

Tablet:
- Larger card with more detail visible
- Horizontal button layout
- Side panels for additional info

Desktop:
- Card on left, details panel on right
- Larger interaction buttons
- Keyboard navigation support
```

#### Messages Screen
```
Mobile:
- Full-screen conversation list
- Full-screen chat view
- Back navigation between views

Tablet:
- Split view: list on left, chat on right
- Persistent conversation list
- Larger message bubbles

Desktop:
- Three-column layout
- Conversation list, chat, profile panel
- Keyboard shortcuts for navigation
```

#### Profile Screens
```
Mobile:
- Vertical scrolling layout
- Full-width form fields
- Stacked photo grid (2 columns)

Tablet:
- Two-column form layout
- Larger photo grid (3 columns)
- Side-by-side content sections

Desktop:
- Multi-column layout
- Larger photo grid (4+ columns)
- Horizontal form layouts
```

### Orientation Support

#### Portrait Mode (Primary)
```
Mobile: Optimized for portrait use
Tablet: Portrait support with adapted layouts
Navigation: Bottom tab bar for easy thumb access
```

#### Landscape Mode
```
Mobile: Supported with layout adjustments
Tablet: Enhanced landscape experience
Navigation: Side navigation or adapted tab bar
Content: Horizontal layouts where beneficial
```

### Platform Adaptations

#### iOS Specific
```
Navigation: iOS navigation patterns
Gestures: iOS-specific gesture support
Typography: San Francisco font system
Spacing: iOS Human Interface Guidelines
```

#### Android Specific
```
Navigation: Material Design patterns
Gestures: Android gesture navigation
Typography: Roboto font system
Spacing: Material Design spacing
```

#### Cross-Platform Consistency
```
Branding: Consistent visual identity
Functionality: Identical feature set
User Experience: Familiar interaction patterns
Performance: Optimized for each platform
```

---

## Innovative Features

### AI-Powered Enhancements

#### Smart Photo Selection
**Feature Description:**
AI analyzes uploaded photos and suggests the best primary photo based on facial clarity, lighting, and engagement potential.

**UI Implementation:**
```
Photo Upload Screen:
- AI suggestion badge on recommended primary photo
- "AI Recommended" label with sparkle icon
- Confidence score: "92% match potential"
- One-tap to accept recommendation
- Explanation tooltip: "This photo shows your best features"
```

**Visual Design:**
```
Badge: Gradient background (AI theme)
Icon: Brain or sparkle icon
Animation: Gentle pulse to draw attention
Colors: Purple gradient for AI features
```

#### Conversation Starter AI
**Feature Description:**
AI generates personalized conversation starters based on mutual interests and profile information.

**UI Implementation:**
```
Chat Screen:
- "Conversation Ideas" button above input
- Expandable panel with 3-5 suggestions
- Tap to insert suggestion into input
- Refresh button for new suggestions
- "Powered by AI" subtle attribution
```

**Suggestion Card Design:**
```
Background: Light purple gradient
Border: Subtle purple border
Icon: Lightbulb or chat bubble
Text: Conversational, friendly tone
Action: Tap to use, swipe to dismiss
```

#### Compatibility Insights
**Feature Description:**
AI analyzes profiles and provides detailed compatibility breakdowns with explanations.

**UI Implementation:**
```
Profile Detail View:
- "Compatibility Insights" section
- Radar chart showing different compatibility factors
- Expandable explanations for each factor
- Overall compatibility percentage
- "Why you might connect" explanations
```

**Chart Design:**
```
Radar Chart: 6-8 compatibility factors
Colors: Gradient from red (low) to green (high)
Labels: Clear, understandable factor names
Animation: Smooth drawing animation
Interaction: Tap factor for detailed explanation
```

### Safety & Trust Features

#### Photo Verification System
**Feature Description:**
Real-time photo verification to ensure profile authenticity and reduce catfishing.

**UI Implementation:**
```
Verification Process:
- Camera interface with face outline guide
- Real-time face detection feedback
- "Match your profile photo" instruction
- Success animation with checkmark
- Verified badge on profile

Verified Badge:
- Blue checkmark icon
- "Verified" text label
- Prominent placement on profile cards
- Trust indicator in search results
```

#### Safety Check-In
**Feature Description:**
Optional safety feature for first dates with automatic check-in reminders.

**UI Implementation:**
```
Date Planning:
- "Safety Check-In" toggle in date planning
- Emergency contact selection
- Check-in time setting
- Location sharing options

Check-In Interface:
- Simple "I'm Safe" button
- Emergency button (red, prominent)
- Extend time option
- Automatic emergency contact notification
```

#### Mood-Based Matching
**Feature Description:**
Users can set their current mood/energy level to match with compatible emotional states.

**UI Implementation:**
```
Mood Selector:
- Emoji-based mood selection
- Slider for energy level
- "Looking for" mood preference
- Temporary status (expires in 24 hours)

Discovery Integration:
- Mood indicators on profile cards
- Mood compatibility in matching algorithm
- "Similar energy" badges
- Mood-based conversation starters
```

### Enhanced User Experience

#### Voice Message Integration
**Feature Description:**
Voice messages with visual waveform display and playback controls.

**UI Implementation:**
```
Recording Interface:
- Hold to record button
- Real-time waveform visualization
- Recording timer
- Slide to cancel gesture
- Voice level indicator

Playback Interface:
- Waveform with playback progress
- Play/pause button
- Playback speed control
- Transcript option (AI-generated)
- Download/save option
```

#### Augmented Reality Profile Preview
**Feature Description:**
AR feature to preview how you might look together in photos.

**UI Implementation:**
```
AR Interface:
- Camera view with face detection
- Profile photo overlay
- "Take Photo Together" button
- Sharing options
- Privacy controls

Controls:
- Switch between profile photos
- Adjust positioning and scale
- Apply fun filters
- Save to device option
```

#### Smart Notification Timing
**Feature Description:**
AI learns user behavior and sends notifications at optimal times for engagement.

**UI Implementation:**
```
Settings:
- "Smart Timing" toggle
- Learning indicator showing AI progress
- Manual override options
- Quiet hours respect
- Engagement feedback integration

Notification Design:
- Context-aware content
- Personalized timing
- Reduced notification fatigue
- Higher engagement rates
```

#### Relationship Goal Alignment
**Feature Description:**
Dynamic relationship goal tracking that evolves as users interact.

**UI Implementation:**
```
Goal Setting:
- Initial relationship goal selection
- Periodic goal check-ins
- Goal evolution tracking
- Compatibility based on goals

Goal Indicators:
- Subtle goal badges on profiles
- Goal alignment percentage
- "Similar goals" highlighting
- Goal-based conversation topics
```

### Gamification Elements

#### Connection Streaks
**Feature Description:**
Reward users for consistent daily engagement with streak counters and achievements.

**UI Implementation:**
```
Streak Display:
- Fire emoji with day counter
- Progress bar to next milestone
- Achievement badges
- Streak protection options
- Social sharing capabilities

Achievements:
- "7-Day Connector" badge
- "Conversation Starter" achievement
- "Profile Perfectionist" badge
- Progress tracking
- Celebration animations
```

#### Match Quality Score
**Feature Description:**
Gamified system showing match quality improvement over time.

**UI Implementation:**
```
Score Display:
- Circular progress indicator
- Current score out of 100
- Improvement suggestions
- Historical score tracking
- Comparison with similar users

Improvement Tips:
- Actionable suggestions
- Progress tracking
- Reward system for improvements
- Educational content
- Success celebrations
```

#### Daily Challenges
**Feature Description:**
Daily engagement challenges to encourage meaningful interactions.

**UI Implementation:**
```
Challenge Interface:
- Daily challenge card
- Progress tracking
- Reward preview
- Challenge variety
- Social elements

Challenge Types:
- "Send 3 thoughtful messages"
- "Complete your profile"
- "Try a new conversation starter"
- "Give 5 genuine likes"
- "Update your photos"
```

### Accessibility Innovations

#### Voice Navigation
**Feature Description:**
Complete voice control for hands-free app navigation.

**UI Implementation:**
```
Voice Commands:
- "Like this profile"
- "Send message"
- "Go to settings"
- "Read last message"
- "Show who liked me"

Visual Feedback:
- Voice command recognition display
- Action confirmation
- Error handling
- Learning suggestions
```

#### High Contrast Mode
**Feature Description:**
Enhanced high contrast mode beyond system settings.

**UI Implementation:**
```
Contrast Options:
- Ultra-high contrast toggle
- Custom color schemes
- Text size scaling
- Icon enhancement
- Background simplification

Visual Enhancements:
- Bold borders
- Simplified layouts
- Enhanced focus indicators
- Reduced visual noise
- Clear action buttons
```

#### Cognitive Assistance
**Feature Description:**
Features to assist users with cognitive disabilities.

**UI Implementation:**
```
Assistance Features:
- Simplified navigation mode
- Step-by-step guidance
- Progress saving
- Extended timeouts
- Clear instructions

Interface Adaptations:
- Larger touch targets
- Simplified layouts
- Clear visual hierarchy
- Consistent patterns
- Error prevention
```

---

## Implementation Guidelines

### Development Phases

#### Phase 1: Foundation
```
Components: Basic UI components (buttons, inputs, cards)
Screens: Authentication and onboarding screens
Features: Core navigation and basic interactions
Testing: Component library testing
```

#### Phase 2: Core Features
```
Components: Discovery and messaging components
Screens: Main app screens (discovery, messages)
Features: Swiping, matching, basic messaging
Testing: User flow testing
```

#### Phase 3: Enhanced Features
```
Components: Premium and analytics components
Screens: Premium features and analytics
Features: Subscriptions, advanced messaging
Testing: Integration testing
```

#### Phase 4: Polish & Innovation
```
Components: AI and accessibility components
Screens: Advanced features and settings
Features: AI enhancements, accessibility features
Testing: Accessibility and performance testing
```

### Quality Assurance

#### Design Review Process
```
1. Component Review: Individual component approval
2. Screen Review: Complete screen layout approval
3. Flow Review: User journey validation
4. Accessibility Review: Accessibility compliance check
5. Performance Review: Animation and performance validation
```

#### Testing Requirements
```
Visual Testing: Pixel-perfect implementation
Interaction Testing: All micro-interactions working
Accessibility Testing: Screen reader and keyboard testing
Performance Testing: 60fps animations, fast load times
Cross-Platform Testing: iOS and Android consistency
```

#### Success Metrics
```
User Engagement: Increased time in app
Conversion Rates: Higher premium conversion
Accessibility Score: 100% accessibility compliance
Performance Score: 90+ performance score
User Satisfaction: 4.5+ app store rating
```

This comprehensive UI/UX design specification provides the foundation for creating a revolutionary dating app that sets new standards in the industry. Every component, interaction, and screen has been carefully designed to create meaningful connections while maintaining the highest standards of usability, accessibility, and visual appeal.