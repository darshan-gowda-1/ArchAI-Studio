/**
 * ArchAI Studio v3 - Playwright End-to-End Browser Test Suite
 */

import { test, expect } from '@playwright/test';

test.describe('ArchAI Studio v3 Architectural Workstation E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('loads cinematic 3-column architectural workstation layout', async ({ page }) => {
    // Top HUD verification
    await expect(page.locator('text=ARCHAI STUDIO')).toBeVisible();

    // Sidebar navigation
    await expect(page.locator('text=3D Workstation View')).toBeVisible();
    await expect(page.locator('text=Design Comparison (3D)')).toBeVisible();
    await expect(page.locator('text=Architectural Reports')).toBeVisible();

    // Telemetry Panel
    await expect(page.locator('text=Design Telemetry')).toBeVisible();
    await expect(page.locator('text=ArchAI Copilot')).toBeVisible();
  });

  test('navigates to Side-by-Side 3D Design Comparison', async ({ page }) => {
    await page.click('text=Design Comparison (3D)');
    await expect(page.locator('text=Side-by-Side Design Variants Analysis')).toBeVisible();
    await expect(page.locator('text=DESIGN A')).toBeVisible();
    await expect(page.locator('text=DESIGN B')).toBeVisible();
    await expect(page.locator('text=DESIGN C')).toBeVisible();
  });

  test('triggers full 20-stage workflow run', async ({ page }) => {
    await page.click('text=End-to-End Workflow');
    await expect(page.locator('text=Run Full Autopilot Workflow')).toBeVisible();
    await page.click('text=Run Full Autopilot Workflow');
  });

  test('generates architectural reports and exports', async ({ page }) => {
    await page.click('text=Architectural Reports');
    await expect(page.locator('text=Comprehensive Project Report')).toBeVisible();
    await expect(page.locator('text=Architectural Project Dossier')).toBeVisible();
    await expect(page.locator('text=BOQ & Schedules Workbook')).toBeVisible();
  });
});
