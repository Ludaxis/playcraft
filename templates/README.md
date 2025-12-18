# Templates

Ready-to-use templates for creating new pages and modals in Puzzle Kit.

## Quick Start

### Using the CLI Generator (Recommended)

```bash
# Generate a new page
npm run generate page my-page-name

# Generate a new modal
npm run generate modal my-modal-name

# Generate a new LiveOps event (creates page + event config)
npm run generate event my-event-name
```

### Manual Copy

1. Copy the appropriate template file
2. Rename it to match your feature
3. Update the TODO sections in the file
4. Register in `registry.ts`, `AppShell.tsx`, or `ModalManager.tsx`

---

## Page Templates

### `pages/BasicPage.template.tsx`

**Use for:** Simple content pages, settings, static information

**Features:**
- Header with back button
- Scrollable content area
- Bottom navigation
- Player data access via `usePlayer()`

**Example uses:**
- Settings page
- About page
- Simple feature page

---

### `pages/ListPage.template.tsx`

**Use for:** Pages with scrollable lists of items

**Features:**
- List with item rows
- Empty state handling
- Item click handling
- Header with action button

**Example uses:**
- Friends list
- Inbox
- Leaderboard
- Shop categories

---

### `pages/LiveOpsPage.template.tsx`

**Use for:** Time-limited events with progress tracking

**Features:**
- Event timer countdown
- Progress bar
- Milestone rewards
- Info modal
- Event availability check

**Example uses:**
- Battle pass
- Lightning rush
- Winning streak
- Any timed event

---

## Modal Templates

### `modals/ConfirmModal.template.tsx`

**Use for:** Yes/No confirmations, destructive actions

**Features:**
- Configurable title and message
- Confirm and Cancel buttons
- Support for destructive styling
- Callback on confirm

**Example uses:**
- "Are you sure?" dialogs
- Purchase confirmations
- Delete confirmations

---

### `modals/RewardModal.template.tsx`

**Use for:** Showing earned rewards, celebrations

**Features:**
- Animated reward display
- Multiple reward types (coins, lives, stars, boosters)
- Auto-apply rewards on claim
- Customizable title and subtitle

**Example uses:**
- Level complete rewards
- Daily reward claim
- Achievement unlocked
- Event milestone claim

---

### `modals/InfoModal.template.tsx`

**Use for:** Information display, help text, tutorials

**Features:**
- Icon/image header
- Scrollable content
- Section support with bullet lists
- Single dismiss button

**Example uses:**
- Feature explanations
- Help dialogs
- Event rules
- First-time tutorials

---

## Template Structure

Each template includes:

```tsx
/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                           TEMPLATE NAME                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Use this for: Description of use case                                     ║
 * ║                                                                            ║
 * ║  Features:                                                                 ║
 * ║  - Feature 1                                                               ║
 * ║  - Feature 2                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

// TODO sections marked clearly for customization
const PAGE_ID = 'your-page-id';  // TODO: Update this
const PAGE_TITLE = 'Your Title'; // TODO: Update this

export function YourComponentName() {
  // Implementation with TODO comments
}
```

---

## Customization Points

Look for these TODO markers in templates:

- `// TODO: Update these values` - Configuration that must be changed
- `// TODO: Replace with real data` - Mock data placeholders
- `// TODO: Handle` - Action handlers to implement
- `// TODO: Remove in production` - Debug code to remove

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page | `{Name}Page.tsx` | `ShopPage.tsx` |
| Modal | `{Name}Modal.tsx` | `RewardClaimModal.tsx` |
| LiveOps | `{Name}Page.tsx` | `LightningRushPage.tsx` |

---

## Registration Checklist

### For Pages:

1. ✅ Add to `PAGE_REGISTRY` in `src/config/registry.ts`
2. ✅ Add dynamic import in `src/components/layout/AppShell.tsx`
3. ✅ Add to `pageComponents` map in `AppShell.tsx`
4. ✅ Export from `src/components/menus/index.ts` (optional)

### For Modals:

1. ✅ Add to `MODAL_REGISTRY` in `src/config/registry.ts`
2. ✅ Add dynamic import in `src/components/modals/ModalManager.tsx`
3. ✅ Add to `modalComponents` map in `ModalManager.tsx`
4. ✅ Export from `src/components/modals/index.ts` (optional)

### For Events:

1. ✅ Add to `EVENT_REGISTRY` in `src/config/registry.ts`
2. ✅ Follow page registration steps above
3. ✅ Add event data in `src/config/initialData.ts`

---

## Tips

1. **Start simple** - Use BasicPage for your first page
2. **Copy, don't modify** - Always copy templates, never edit originals
3. **Use the hooks** - `usePlayer()`, `useEvent()`, `useModal()` simplify state access
4. **Check the registry** - IDs must be unique across all registries
5. **Test navigation** - Verify back button and modal close work correctly
