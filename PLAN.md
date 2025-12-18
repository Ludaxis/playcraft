# Multi-Language Implementation Plan

## Overview

This plan outlines the complete implementation of internationalization (i18n) for Puzzle Kit, supporting 10+ languages including RTL languages (Arabic, Persian) and CJK scripts (Chinese, Japanese, Korean).

---

## Supported Languages

| Code | Language | Script | Direction | Priority |
|------|----------|--------|-----------|----------|
| `en` | English | Latin | LTR | Tier 1 |
| `ar` | Arabic | Arabic | RTL | Tier 1 |
| `fa` | Persian (Farsi) | Arabic | RTL | Tier 1 |
| `de` | German | Latin | LTR | Tier 1 |
| `fr` | French | Latin | LTR | Tier 1 |
| `es` | Spanish | Latin | LTR | Tier 1 |
| `zh-CN` | Chinese (Simplified) | CJK | LTR | Tier 1 |
| `zh-TW` | Chinese (Traditional) | CJK | LTR | Tier 1 |
| `ja` | Japanese | CJK | LTR | Tier 1 |
| `ko` | Korean | Hangul | LTR | Tier 1 |

---

## Phase 1: Foundation Setup

### 1.1 Install Dependencies
- [ ] Install `next-intl` for i18n
- [ ] Install `tailwindcss-rtl` for RTL utilities (optional)

### 1.2 Create i18n Configuration
- [ ] Create `src/i18n/config.ts` - locale definitions, RTL detection
- [ ] Create `src/i18n/request.ts` - server-side locale handling
- [ ] Create `src/i18n/routing.ts` - internationalized routing
- [ ] Create `src/i18n/navigation.ts` - localized navigation helpers

### 1.3 Setup Middleware
- [ ] Create `src/middleware.ts` - locale detection and routing

### 1.4 Update Next.js Config
- [ ] Update `next.config.ts` with i18n plugin

---

## Phase 2: Translation Files Structure

### 2.1 Create Message Files
- [ ] Create `src/messages/en.json` - English (source)
- [ ] Create `src/messages/ar.json` - Arabic
- [ ] Create `src/messages/fa.json` - Persian
- [ ] Create `src/messages/de.json` - German
- [ ] Create `src/messages/fr.json` - French
- [ ] Create `src/messages/es.json` - Spanish
- [ ] Create `src/messages/zh-CN.json` - Simplified Chinese
- [ ] Create `src/messages/zh-TW.json` - Traditional Chinese
- [ ] Create `src/messages/ja.json` - Japanese
- [ ] Create `src/messages/ko.json` - Korean

### 2.2 Translation File Structure
```json
{
  "metadata": {
    "title": "Puzzle Kit",
    "description": "High-fidelity interactive prototype for puzzle game UI/UX"
  },
  "common": {
    "back": "Back",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "close": "Close",
    "save": "Save",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "navigation": {
    "home": "Home",
    "shop": "Shop",
    "team": "Team",
    "areas": "Areas",
    "collection": "Collection",
    "leaderboard": "Leaderboard",
    "settings": "Settings",
    "profile": "Profile"
  },
  "game": {
    "level": "Level {level}",
    "moves": "{count, plural, one {# Move} other {# Moves}}",
    "goals": "Goals",
    "coins": "{amount, number}",
    "lives": "{count, plural, one {# Life} other {# Lives}}",
    "stars": "{count, plural, one {# Star} other {# Stars}}"
  },
  "difficulty": {
    "easy": "Easy",
    "normal": "Normal",
    "hard": "Hard",
    "superHard": "Super Hard"
  },
  "shop": {
    "title": "Shop",
    "specialOffer": "Special Offer",
    "bestValue": "Best Value",
    "popular": "Popular",
    "buyNow": "Buy Now"
  },
  "events": {
    "royalPass": "Royal Pass",
    "skyRace": "Sky Race",
    "kingsCup": "King's Cup",
    "teamBattle": "Team Battle",
    "lightTheWay": "Light the Way",
    "bonusLevel": "Bonus Level",
    "propHunt": "Prop Hunt",
    "puzzleSafari": "Puzzle Safari",
    "treasureHunt": "Treasure Hunt",
    "sweetVictory": "Sweet Victory",
    "bubbleShooter": "Bubble Shooter"
  },
  "team": {
    "title": "Team",
    "members": "Members",
    "chat": "Chat",
    "requests": "Requests",
    "info": "Info",
    "join": "Join",
    "leave": "Leave",
    "donate": "Donate"
  },
  "modals": {
    "levelStart": {
      "title": "Level {level}",
      "play": "Play",
      "boosters": "Boosters"
    },
    "profile": {
      "title": "Profile",
      "playingSince": "Playing since {date}",
      "achievements": "Achievements",
      "statistics": "Statistics"
    },
    "settings": {
      "title": "Settings",
      "sound": "Sound",
      "music": "Music",
      "notifications": "Notifications",
      "language": "Language"
    }
  },
  "admin": {
    "title": "Admin Panel",
    "theme": "Theme",
    "events": "Events",
    "features": "Features"
  }
}
```

---

## Phase 3: App Router Migration

### 3.1 Create Locale-based Layout
- [ ] Move `src/app/page.tsx` → `src/app/[locale]/page.tsx`
- [ ] Create `src/app/[locale]/layout.tsx` with RTL support
- [ ] Update root layout to handle locale routing

### 3.2 Create i18n Provider
- [ ] Create `src/components/providers/I18nProvider.tsx`
- [ ] Wrap app with NextIntlClientProvider

---

## Phase 4: RTL Support

### 4.1 Update Tailwind Config
- [ ] Add RTL plugin configuration
- [ ] Configure logical property utilities

### 4.2 Migrate CSS Classes (Logical Properties)

#### Padding & Margin
| Physical | Logical |
|----------|---------|
| `pl-*` | `ps-*` |
| `pr-*` | `pe-*` |
| `ml-*` | `ms-*` |
| `mr-*` | `me-*` |

#### Positioning
| Physical | Logical |
|----------|---------|
| `left-*` | `start-*` |
| `right-*` | `end-*` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |

#### Borders & Rounded Corners
| Physical | Logical |
|----------|---------|
| `rounded-l-*` | `rounded-s-*` |
| `rounded-r-*` | `rounded-e-*` |
| `border-l-*` | `border-s-*` |
| `border-r-*` | `border-e-*` |

### 4.3 Components to Update for RTL
- [ ] `src/components/layout/Header.tsx`
- [ ] `src/components/layout/PageLayout.tsx`
- [ ] `src/components/shared/BottomNavigation.tsx`
- [ ] `src/components/base/Button.tsx`
- [ ] `src/components/base/Badge.tsx`
- [ ] `src/components/base/Card.tsx`
- [ ] `src/components/base/Modal.tsx`
- [ ] `src/components/composed/AnimatedModal.tsx`
- [ ] `src/components/composed/PageHeader.tsx`
- [ ] All menu components
- [ ] All modal components

### 4.4 RTL-specific Styles
- [ ] Add `globals.css` RTL overrides
- [ ] Handle directional icons (arrows, chevrons)
- [ ] Handle swipe gesture direction

---

## Phase 5: Font Configuration

### 5.1 Install Fonts
- [ ] Add Noto Sans Arabic for Arabic/Persian
- [ ] Add Noto Sans CJK for Chinese/Japanese/Korean
- [ ] Configure font loading in layout

### 5.2 Font CSS Variables
```css
:root {
  --font-latin: 'Inter', system-ui, sans-serif;
  --font-arabic: 'Noto Sans Arabic', 'Tahoma', sans-serif;
  --font-cjk: 'Noto Sans SC', 'Noto Sans JP', 'Noto Sans KR', sans-serif;
}
```

### 5.3 Language-specific Typography
- [ ] Update `globals.css` with language-specific font rules
- [ ] Adjust line heights for CJK (1.7 vs 1.5)
- [ ] Adjust font sizes if needed for Arabic script

---

## Phase 6: String Extraction

### 6.1 Config Files
- [ ] `src/config/registry.ts` - Page/modal/event names
- [ ] `src/config/adminDefaults.ts` - Tab labels
- [ ] `src/config/mockData.ts` - Shop offers, items
- [ ] `src/config/themePresets.ts` - Theme names

### 6.2 Base Components
- [ ] `src/components/base/Button.tsx`
- [ ] `src/components/base/Badge.tsx`
- [ ] `src/components/base/Select.tsx`
- [ ] `src/components/shared/FeatureDisabled.tsx`

### 6.3 Layout Components
- [ ] `src/components/layout/Header.tsx`
- [ ] `src/components/layout/PageLayout.tsx`
- [ ] `src/components/shared/BottomNavigation.tsx`

### 6.4 Menu/Page Components
- [ ] `src/components/menus/MainMenu.tsx`
- [ ] `src/components/menus/ShopPage.tsx`
- [ ] `src/components/menus/TeamPage.tsx`
- [ ] `src/components/menus/SettingsPage.tsx`
- [ ] `src/components/menus/ProfilePage.tsx`
- [ ] `src/components/menus/AreasPage.tsx`
- [ ] `src/components/menus/CollectionPage.tsx`
- [ ] `src/components/menus/LeaderboardPage.tsx`
- [ ] `src/components/menus/InboxPage.tsx`
- [ ] `src/components/menus/DailyRewardsPage.tsx`

### 6.5 LiveOps Event Pages
- [ ] `src/components/liveops/RoyalPassPage.tsx`
- [ ] `src/components/liveops/SkyRacePage.tsx`
- [ ] `src/components/liveops/KingsCupPage.tsx`
- [ ] `src/components/liveops/TeamBattlePage.tsx`
- [ ] `src/components/liveops/LightTheWayPage.tsx`
- [ ] `src/components/liveops/BonusLevelPage.tsx`
- [ ] `src/components/liveops/PropHuntPage.tsx`
- [ ] `src/components/liveops/PuzzleSafariPage.tsx`
- [ ] `src/components/liveops/TreasureHuntPage.tsx`
- [ ] `src/components/liveops/SweetVictoryPage.tsx`
- [ ] `src/components/liveops/BubbleShooterPage.tsx`

### 6.6 Modal Components
- [ ] `src/components/modals/LevelStartModal.tsx`
- [ ] `src/components/modals/ProfileModal.tsx`
- [ ] `src/components/modals/SettingsModal.tsx`
- [ ] `src/components/modals/TeamInfoModal.tsx`
- [ ] `src/components/modals/ShopOfferModal.tsx`
- [ ] All other modals

### 6.7 Admin Components
- [ ] `src/components/admin/AdminPanel.tsx`
- [ ] `src/components/admin/AdminTabs.tsx`
- [ ] All admin sub-components

---

## Phase 7: Language Switcher UI

### 7.1 Create Language Selector Component
- [ ] Create `src/components/shared/LocaleSwitcher.tsx`
- [ ] Add to Settings page/modal
- [ ] Add to Admin panel

### 7.2 Language Display
- [ ] Show native language names (العربية, 日本語, etc.)
- [ ] Optional: Show language flags
- [ ] Persist language preference to localStorage

---

## Phase 8: Number & Date Formatting

### 8.1 Create Formatting Utilities
- [ ] Create `src/utils/formatters.ts`
- [ ] `formatNumber(value, locale)` - locale-aware number formatting
- [ ] `formatCurrency(value, locale)` - currency formatting
- [ ] `formatDate(date, locale)` - date formatting
- [ ] `formatRelativeTime(date, locale)` - relative time ("2 days ago")

### 8.2 Update Components
- [ ] Replace `.toLocaleString()` with formatted values
- [ ] Update coin/resource displays
- [ ] Update date displays (e.g., "Playing since...")

---

## Phase 9: Testing

### 9.1 Visual Testing
- [ ] Test all pages in Arabic (RTL)
- [ ] Test all pages in Persian (RTL)
- [ ] Test all pages in Chinese
- [ ] Test all pages in Japanese
- [ ] Test all pages in Korean
- [ ] Test all pages in German (text expansion)

### 9.2 Functional Testing
- [ ] Language switching works correctly
- [ ] Locale persists across sessions
- [ ] Number formatting correct per locale
- [ ] Date formatting correct per locale
- [ ] Pluralization works correctly

### 9.3 Layout Testing
- [ ] No text overflow in any language
- [ ] RTL layout mirrors correctly
- [ ] Icons flip appropriately
- [ ] Swipe gestures work in RTL

### 9.4 Performance Testing
- [ ] Font loading performance
- [ ] Bundle size impact
- [ ] Translation file loading

---

## Phase 10: Storybook Integration

### 10.1 Update Storybook Config
- [ ] Add locale decorator
- [ ] Add locale switcher to toolbar

### 10.2 Story Updates
- [ ] Update all stories to support locales
- [ ] Add RTL stories for key components

---

## File Changes Summary

### New Files
```
src/
├── i18n/
│   ├── config.ts
│   ├── request.ts
│   ├── routing.ts
│   └── navigation.ts
├── messages/
│   ├── en.json
│   ├── ar.json
│   ├── fa.json
│   ├── de.json
│   ├── fr.json
│   ├── es.json
│   ├── zh-CN.json
│   ├── zh-TW.json
│   ├── ja.json
│   └── ko.json
├── middleware.ts
├── app/
│   └── [locale]/
│       ├── layout.tsx
│       └── page.tsx
├── components/
│   ├── providers/
│   │   └── I18nProvider.tsx
│   └── shared/
│       └── LocaleSwitcher.tsx
└── utils/
    └── formatters.ts
```

### Modified Files
- `next.config.ts` - Add i18n plugin
- `tailwind.config.ts` - Add RTL utilities
- `src/app/globals.css` - Add font rules, RTL overrides
- `src/app/layout.tsx` - Update for locale routing
- All component files with hardcoded strings

---

## Implementation Order

1. **Phase 1**: Foundation Setup (i18n config, middleware)
2. **Phase 2**: Create English translation file with all strings
3. **Phase 3**: App Router migration for locale routing
4. **Phase 4**: RTL CSS migration (logical properties)
5. **Phase 5**: Font configuration
6. **Phase 6**: Extract strings from all components
7. **Phase 7**: Language switcher UI
8. **Phase 8**: Number/date formatting
9. **Phase 9**: Create translation files for all languages
10. **Phase 10**: Testing & refinement

---

## Notes

### Text Expansion Guidelines
- German: +35% expansion
- French: +20% expansion
- Spanish: +20% expansion
- Arabic: +25% expansion
- Allow flexible layouts to accommodate

### RTL Considerations
- Arrow icons should flip
- Progress bars should reverse
- Swipe direction should reverse
- Text alignment should use logical values

### CJK Considerations
- No word spacing (natural in CJK)
- Line height 1.7 for readability
- Font fallback chain important
- Consider font subsetting for performance

### Performance Budget
- Translation files: < 50KB per locale
- Fonts: Use system fonts where possible
- Lazy load non-active locales
