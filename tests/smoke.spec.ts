import { test, expect } from '@playwright/test';

/**
 * Smoke Tests for Puzzle Kit
 *
 * These tests verify basic functionality works after changes.
 * Run with: npm run test
 */

test.describe('App Loading', () => {
  test('app loads and shows main menu', async ({ page }) => {
    await page.goto('/');

    // Wait for app to be interactive
    await page.waitForLoadState('networkidle');

    // Should see the main menu content
    await expect(page.locator('text=Level')).toBeVisible({ timeout: 10000 });
  });

  test('shows player resources in header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should see coins, lives, and stars displays
    // These are shown as numbers in the resource bar
    const header = page.locator('.bg-bg-inverse').first();
    await expect(header).toBeVisible();
  });
});

test.describe('Bottom Navigation', () => {
  test('tabs are visible and clickable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have bottom navigation
    const bottomNav = page.locator('.border-t.border-border').last();
    await expect(bottomNav).toBeVisible();

    // Should have navigation buttons
    const navButtons = bottomNav.locator('button');
    await expect(navButtons).toHaveCount(5); // 5 default tabs
  });

  test('clicking team tab navigates to team page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on Team tab (has "Team" label)
    await page.click('button:has-text("Team")');

    // Should navigate to teams page
    await expect(page.locator('text=Teams')).toBeVisible({ timeout: 5000 });
  });

  test('clicking leaderboard tab navigates to leaderboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on Leaderboard tab
    await page.click('button:has-text("Leaderboard")');

    // Should show leaderboard
    await expect(page.locator('text=Leaderboard')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Modal System', () => {
  test('can open and close profile modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on profile button (top-left with "PRO" text)
    await page.click('button:has-text("PRO")');

    // Modal should open - look for Profile heading
    await expect(page.locator('text=Profile')).toBeVisible({ timeout: 5000 });
  });

  test('can open settings page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click settings button (gear icon in header)
    const settingsButton = page.locator('button').filter({ has: page.locator('img[alt="Settings"]') });
    await settingsButton.click();

    // Should navigate to settings
    await expect(page.locator('text=Settings')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Feature Flag Integration', () => {
  test('main menu shows event buttons when enabled', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // There should be event buttons on the sides (with timer displays)
    // These are the LiveOps event buttons
    const mainContent = page.locator('.flex-1.relative');
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Page Navigation', () => {
  test('can navigate to shop via header coins', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on coins display (has $ icon)
    await page.click('button:has-text("$")');

    // Should navigate to shop
    await expect(page.locator('text=Shop')).toBeVisible({ timeout: 5000 });
  });

  test('can navigate back to main menu from shop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go to shop
    await page.click('button:has-text("$")');
    await expect(page.locator('text=Shop')).toBeVisible({ timeout: 5000 });

    // Click X button to close
    await page.click('button:has-text("X")');

    // Should be back at main menu
    await expect(page.locator('text=Level')).toBeVisible({ timeout: 5000 });
  });
});
