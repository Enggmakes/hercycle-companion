# Design System — HerCycle ❤️

<!-- impeccable:design-schema 1 -->

## Direction & Aesthetic World
**Warm Botanical & Intimate Editorial**
A tender, heirloom-quality visual language designed for partners to support and understand their loved one's menstrual cycle. The interface replaces cold medical charts and generic AI-template widgets with warm porcelain/linen canvas, dusky rose and terracotta accents, deep fig velvet dark mode, and human-first typography.

## Typography
- **Display / Headings**: [Fraunces](https://fonts.google.com/specimen/Fraunces) (`font-display`, serif with optical sizing). Evokes literary warmth, thoughtful care, and emotional intimacy.
- **Body & Controls**: [Quicksand](https://fonts.google.com/specimen/Quicksand) (`font-sans`, rounded geometric sans). Clean, legible, soft, and approachable for numbers, labels, and daily notes.

## Palette & Color Tokens (oklch)

### Canvas & Ground
- Light Canvas: `oklch(0.978 0.015 62)` (Warm porcelain / linen)
- Dark Canvas: `oklch(0.16 0.032 345)` (Deep velvet espresso fig)
- Light Surface / Card: `oklch(0.995 0.008 60 / 88%)`
- Dark Surface / Card: `oklch(0.22 0.038 340 / 78%)`

### Brand Accents
- Primary: `oklch(0.63 0.17 25)` (Dusky rose terracotta)
- Secondary: `oklch(0.94 0.032 45)` (Cashmere blush)
- Border Light: `oklch(0.89 0.025 55 / 75%)`
- Border Dark: `oklch(0.85 0.03 50 / 14%)`

### Cycle Phase Tokens
- **Period Phase**: `oklch(0.60 0.20 22)` (Deep crimson rose)
- **Fertile Window**: `oklch(0.65 0.14 148)` (Botanical sage green)
- **Ovulation Day**: `oklch(0.76 0.16 82)` (Golden honey nectar)
- **PMS Phase**: `oklch(0.68 0.15 48)` (Sunlit terracotta)
- **Safe Days**: `oklch(0.65 0.11 245)` (Dusky cornflower)

## Component Language & Principles

1. **Cycle Phase Journey Timeline**:
   - Replaced generic circular smartwatch rings with an informative, horizontal 28-day segmented timeline.
   - Shows phase bands (Period, Follicular, Fertile, Ovulation, Luteal, PMS) with an active day pin, phase title, and actionable partner care insight.

2. **Cycle Calendar Grid**:
   - Full-color day tiles with high-contrast text and recognizable phase hues.
   - Distinctive "Today" badge and Ovulation star badge.
   - Interactive day inspector providing date-specific guidance, cycle day status, and logged symptoms.

3. **Mood & Symptom Journal**:
   - Physical and emotional symptom categorization.
   - Flow intensity logging.
   - 30-day activity trend and frequency distribution via Recharts.

4. **Private Care Notes & Memories**:
   - Stationery-inspired notes with quick prompt starters and autosaving.
   - Categorized memory keepsakes (Birthdays, Anniversaries, Gift Ideas, Special Moments).

5. **Craft & Anti-Pattern Rules**:
   - No generic smartwatch radial gauges or decorative neon halos.
   - No gradient text (emphasis comes from weight and size).
   - High contrast ratios (body text ≥4.5:1, large text ≥3:1).
   - Browser surface theming (custom themed scrollbars, selection highlighting, and focus rings).
