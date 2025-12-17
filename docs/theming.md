# Theming Guide

Puzzle Kit uses a semantic token system that makes theming simple and consistent. The default theme is grayscale, allowing the UI to work as a wireframe, but colors can be easily customized through the admin dashboard.

## Token System

The app uses 12 semantic color tokens defined in `src/app/globals.css`:

### Background Tokens

| Token | Usage | Default |
|-------|-------|---------|
| `--color-bg-page` | Page background | `#F9FAFB` (gray-50) |
| `--color-bg-card` | Card backgrounds | `#FFFFFF` (white) |
| `--color-bg-muted` | Muted backgrounds | `#F3F4F6` (gray-100) |
| `--color-bg-inverse` | Dark backgrounds | `#374151` (gray-700) |

### Text Tokens

| Token | Usage | Default |
|-------|-------|---------|
| `--color-text-primary` | Main text | `#111827` (gray-900) |
| `--color-text-secondary` | Secondary text | `#4B5563` (gray-600) |
| `--color-text-muted` | Muted text | `#9CA3AF` (gray-400) |
| `--color-text-inverse` | Text on dark bg | `#FFFFFF` (white) |

### Brand Tokens

| Token | Usage | Default |
|-------|-------|---------|
| `--color-brand-primary` | Primary accent | `#374151` (gray-700) |
| `--color-brand-hover` | Hover state | `#1F2937` (gray-800) |
| `--color-brand-muted` | Muted accent | `#E5E7EB` (gray-200) |

### Status Tokens

| Token | Usage | Default |
|-------|-------|---------|
| `--color-status-success` | Success states | `#10B981` (green) |
| `--color-status-warning` | Warning states | `#F59E0B` (amber) |
| `--color-status-error` | Error states | `#EF4444` (red) |

### Special Tokens

| Token | Usage | Default |
|-------|-------|---------|
| `--color-gold` | Gold/premium | `#F59E0B` (amber) |
| `--color-border` | Card borders | `#E5E7EB` (gray-200) |

## Using Tokens in Components

Tokens are available as Tailwind CSS classes:

```tsx
// Backgrounds
<div className="bg-bg-page">...</div>
<div className="bg-bg-card">...</div>
<div className="bg-bg-muted">...</div>
<div className="bg-bg-inverse">...</div>

// Text
<p className="text-text-primary">Main text</p>
<p className="text-text-secondary">Secondary text</p>
<p className="text-text-muted">Muted text</p>
<p className="text-text-inverse">Text on dark</p>

// Brand
<button className="bg-brand-primary hover:bg-brand-hover">...</button>
<div className="bg-brand-muted">...</div>

// Status
<div className="text-status-success">Success</div>
<div className="text-status-warning">Warning</div>
<div className="text-status-error">Error</div>

// Borders
<div className="border border-border">...</div>
```

## Theme Presets

The app comes with pre-defined theme presets in `src/config/themePresets.ts`:

| Preset | Brand Color | Description |
|--------|-------------|-------------|
| `grayscale` | Gray (#374151) | Default wireframe style |
| `purple` | Purple (#6366F1) | Royal purple accent |
| `blue` | Blue (#3B82F6) | Ocean blue accent |
| `green` | Green (#059669) | Forest green accent |
| `orange` | Orange (#EA580C) | Sunset orange accent |
| `pink` | Pink (#EC4899) | Rose pink accent |
| `teal` | Teal (#14B8A6) | Teal accent |

## Customizing via Admin Dashboard

1. Open the Admin Panel (gear icon in the app)
2. Navigate to the "Theme" section
3. Select a preset from the dropdown, or
4. Expand "Advanced Customization" to set individual colors

Changes are applied in real-time and persisted to localStorage.

## Programmatic Theme Changes

You can change themes programmatically using the AdminContext:

```tsx
import { useAdmin } from '@/store/AdminContext';

function MyComponent() {
  const { setThemePreset, currentPreset } = useAdmin();

  const handleThemeChange = (presetId: string) => {
    setThemePreset(presetId);
  };

  return (
    <select value={currentPreset?.id} onChange={(e) => handleThemeChange(e.target.value)}>
      <option value="grayscale">Grayscale</option>
      <option value="purple">Purple</option>
      <option value="blue">Blue</option>
    </select>
  );
}
```

## Adding Custom Presets

To add a new theme preset:

1. Edit `src/config/themePresets.ts`
2. Add your preset to the `themePresets` object:

```typescript
export const themePresets: Record<string, ThemePreset> = {
  // ... existing presets

  custom: {
    id: 'custom',
    name: 'My Custom Theme',
    brandPrimary: '#your-color',
    brandHover: '#your-hover-color',
    brandMuted: '#your-muted-color',
    bgInverse: '#your-dark-color',
  },
};
```

## Best Practices

1. **Always use semantic tokens** - Don't hardcode colors like `bg-purple-500`. Use `bg-brand-primary` instead.

2. **Keep it simple** - The 12-token system is designed to be minimal. Avoid creating new tokens unless absolutely necessary.

3. **Test in grayscale** - The grayscale default ensures your UI works without color. This is great for accessibility testing.

4. **Use status colors sparingly** - Reserve success/warning/error for actual status communication, not decoration.

5. **Maintain contrast** - When customizing, ensure text remains readable on all backgrounds.

## Token Files

For TypeScript projects, tokens are also exported from:

- `src/tokens/colors.ts` - Color token definitions
- `src/tokens/spacing.ts` - Spacing scale
- `src/tokens/typography.ts` - Typography scale

```typescript
import { bgColors, textColors, brandColors } from '@/tokens/colors';

// Use in dynamic styles
const myStyle = {
  background: bgColors.card, // 'bg-bg-card'
};
```
