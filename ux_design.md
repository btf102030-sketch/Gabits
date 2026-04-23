# UX Design — "gabits"

<screens>

## 1. Login Screen (`app/auth/login.tsx`)
- **Purpose**: Email/password login
- **Layout**: Dark gradient background (#0A0A0A → #1A1A1A). App logo/name "gabits" in display font centered top. Below: floating-label email input, floating-label password input, gradient-fill login button [#7C3AED → #EC4899]. "Don't have an account? Sign Up" link at bottom.
- **Actions**: Submit login → navigate to Dashboard. Link to Sign Up screen.
- **States**: Loading (button spinner), error (shake input + red message below).

## 2. Sign Up Screen (`app/auth/signup.tsx`)
- **Purpose**: Create new account
- **Layout**: Same dark gradient background. "gabits" title. Name input, email input, password input (with show/hide toggle), gradient sign-up button. "Already have an account? Log In" link.
- **Actions**: Submit signup → auto-login → navigate to Dashboard.
- **States**: Loading, validation errors per field.

## 3. Dashboard Screen (`app/(tabs)/index.tsx`)
- **Purpose**: Overview of all goals with circular progress
- **Layout**: 
  - Top: collapsing header with greeting "Hey, {name}" + subtitle showing total goals count and overall completion %.
  - Filter chips row: "All" | by category | by priority. It should be horizontally scrollable.
  - Goals grid (2 columns on phone, responsive): Each goal card is a glass-effect card (rounded 16px) containing:
    - **Custom circular progress ring** (stroke width 6px, track color #2A2A2A, fill gradient #7C3AED→#EC4899). Center shows percentage number in bold.
    - Goal title below ring (heading font, 16px)
    - Category pill badge (small, colored by category)
    - Priority indicator: colored left border stripe (foundational=#10B981, priority=#F97316, important=#6366F1, would-be-nice=#64748B)
    - Progress text: "X/Y micro-goals"
  - FAB (floating action button) bottom-right: "+" gradient button to create new goal.
- **Actions**: 
  - Pull-to-refresh
  - Filter by category/priority
  - Press card → Goal Detail
  - Press FAB → Create Goal
- **Empty state**: illustration placeholder + "No goals yet. Start by creating your first goal!" + CTA button.

## 4. Goal Detail Screen (`app/goal/[id].tsx`)
- **Purpose**: View goal details and manage micro-goals
- **Layout**:
  - Top: back arrow + edit icon (top-right) + delete icon
  - Large circular progress ring (120px diameter, animated on mount) centered
  - Goal title (display font, 24px), description below (body, muted color)
  - Row: category badge + priority badge
  - Section header: "micro-goals" with count
  - List of micro-goals: each row has a custom animated checkbox (circle → filled with check + confetti-like scale animation), title text (strikethrough when completed), drag handle for reorder. Press-and-hold to reorder.
  - "+ Add micro-goal" row at bottom of list (inline text input that appears on tap)
  - Bottom area: timestamps (created, last updated) in caption text
- **Actions**:
  - Toggle micro-goal completion (checkbox tap → animate ring progress)
  - Add micro-goal inline
  - Edit micro-goal (tap title to edit inline)
  - Delete micro-goal (swipe left → red delete)
  - Edit goal (top-right icon → Edit Goal screen)
  - Delete goal (top-right trash icon → confirmation bottom sheet)

## 5. Create/Edit Goal Screen (`app/goal/create.tsx`, reused for edit via query param `?id=`)
- **Purpose**: Create or edit a goal
- **Layout**:
  - Header: "New Goal" or "Edit Goal" with back arrow and save button
  - Form fields:
    - Title: floating label input (required)
    - Description: multiline floating label textarea (optional)
    - Category: horizontal scrollable chip selector showing all categories. Last chip is "+ Custom" which opens a small bottom sheet to type a new category name.
    - Priority Level: 4 selectable cards in a row, each with label and color indicator:
      - foundational (green #10B981)
      - priority (orange #F97316)
      - important (indigo #6366F1)
      - would be nice (slate #64748B)
    - Section: "micro-goals" — ordered list with add/remove. Each row: text input + remove "×" button. "+ Add micro-goal" button below.
  - Bottom: gradient save button (full width)
- **Actions**: Save → navigate back to Dashboard (or Goal Detail if editing). Cancel → back.
- **States**: validation (title required, at least 1 micro-goal recommended but not required).

## 6. Categories Management Screen (`app/(tabs)/categories.tsx`)
- **Purpose**: View and manage categories
- **Layout**:
  - Header: "Categories"
  - Section: "Default" — list of predefined categories (Health, Career, Personal Development, Financial, relationships) with goal count badge. Non-deletable (no delete icon).
  - Section: "Custom" — list of user-created categories with goal count badge + swipe-to-delete.
  - Bottom: "+ Add Category" button → inline input or bottom sheet.
- **Actions**: Add custom category, delete custom category (with confirmation if goals exist under it), tap category to filter dashboard.

</screens>

<navigation>

**Auth flow (unauthenticated):**
- Stack navigator: Login → Sign Up (and back)
- No access to any other screens

**Main flow (authenticated):**
- Bottom tab navigator with 2 tabs:
  1. **Dashboard** (home icon) — `app/(tabs)/index.tsx`
  2. **Categories** (grid/tag icon) — `app/(tabs)/categories.tsx`
- Stack screens (pushed on top of tabs):
  - Goal Detail: `app/goal/[id].tsx`
  - Create/Edit Goal: `app/goal/create.tsx`

**Auth guard**: Root layout checks auth token. If absent → auth stack. If present → GET /api/auth/me to validate → tabs. Token stored in SecureStore (mobile) / AsyncStorage (web).

**Tab bar**: frosted glass effect, dark translucent background, active tab uses primary color #7C3AED with label.

</navigation>

<design_direction>

- **Theme**: Dark mode. Background: #0A0A0A base, cards #1A1A1A, elevated surfaces #222222.
- **Primary palette**: "violet dusk" — Primary #7C3AED, accent #EC4899.
- **Priority colors**: foundational=#10B981, priority=#F97316, important=#6366F1, would-be-nice=#64748B.
- **Category badge colors**: Health=#10B981, Career=#F97316, Personal Development=#8B5CF6, Financial=#EAB308, relationships=#EC4899. Custom categories get a hash-based color from a preset palette.
- **Typography**: Display/heading: "Space grotesk" (Google Font). Body: "Plus Jakarta Sans" (Google Font). Scale: Display 32px → H1 24px → H2 20px → Body 16px → Caption 13px.
- **Background**: subtle radial gradient overlay from #7C3AED at 5% opacity top-center, fading to transparent.
- **Cards**: glass-effect with border 1px rgba(255,255,255,0.06), background rgba(255,255,255,0.04).
- **Progress rings**: SVG-based circular progress with animated stroke-dashoffset. Track: #2A2A2A. Fill: linear gradient #7C3AED → #EC4899.

</design_direction>

<animation_and_motion>

- **Screen transitions**: fade+slide-right for push, fade+slide-left for pop.
- **Progress ring**: animated from 0 to target value on mount (800ms ease-out). Re-animates on micro-goal toggle.
- **Button press**: scale(0.97) spring + light haptic.
- **Goal cards**: staggered fade-in on dashboard load (50ms delay per card).
- **micro-goal checkbox**: scale bounce (1.0 → 1.2 → 1.0) + color fill animation on toggle. Strike-through text animates width.
- **FAB**: scale-in on mount, press scale(0.9) + haptic.
- **Pull-to-refresh**: custom with gradient spinner.
- **Loading**: skeleton shimmer on dashboard cards and goal detail.
- **Delete swipe**: row slides left revealing red background + trash icon.
- **Bottom sheets**: spring animation with backdrop blur.
- **micro-goal add**: new row slides in from bottom with fade.
- **respect reduced motion**: check `AccessibilityInfo` and disable animations.

</animation_and_motion>

<component_standards>

- **8pt grid** spacing throughout.
- **Border radius**: cards 16px, buttons 12px, inputs 12px, badges 20px (pill), progress ring container 16px.
- **Touch targets**: minimum 44pt.
- **Glass cards**: `expo-blur` or semi-transparent background with border.
- **Lists**: FlashList for goal lists if >20 items.
- **Empty states**: centered icon + message + CTA button.
- **Error states**: inline error messages, retry buttons on network failure.
- **accessibility**: all interactive elements have accessibilityLabel, contrast ratio 4.5:1+, progress rings announce percentage to screen readers.

</component_standards>