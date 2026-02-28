import { test, expect } from '@playwright/test';

test.describe('Cloud Visualization Screenshots', () => {
  test('capture volumetric clouds at close range', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#cesiumContainer canvas', { timeout: 10000 });

    // Wait for Cesium to fully initialize
    await page.waitForTimeout(3000);

    // Zoom to 50km altitude (volumetric mode)
    await page.evaluate(() => {
      const viewer = (window as any).viewer;
      viewer.camera.setView({
        destination: { x: -2703808, y: -4261222, z: 3885232 }, // ~50km altitude over SF
        orientation: {
          heading: 0,
          pitch: -0.5,
          roll: 0
        }
      });
    });

    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'tests/screenshots/volumetric-clouds-close.png',
      fullPage: false
    });

    // Verify volumetric mode is active
    const mode = await page.locator('#mode').textContent();
    expect(mode).toContain('Volumetric');
  });

  test('capture flat clouds at far range', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#cesiumContainer canvas', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // Zoom to 5000km altitude (flat texture mode)
    await page.evaluate(() => {
      const viewer = (window as any).viewer;
      viewer.camera.setView({
        destination: { x: -13519039, y: -21306111, z: 19426160 }, // ~5000km altitude
        orientation: {
          heading: 0,
          pitch: -1.0,
          roll: 0
        }
      });
    });

    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'tests/screenshots/flat-clouds-far.png',
      fullPage: false
    });

    const mode = await page.locator('#mode').textContent();
    expect(mode).toContain('Flat');
  });

  test('capture transition zone at 100km', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#cesiumContainer canvas', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // Zoom to exactly 100km altitude (transition point)
    await page.evaluate(() => {
      const viewer = (window as any).viewer;
      viewer.camera.setView({
        destination: { x: -5407616, y: -8522444, z: 7770464 }, // ~100km altitude
        orientation: {
          heading: 0,
          pitch: -0.7,
          roll: 0
        }
      });
    });

    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'tests/screenshots/clouds-transition-100km.png',
      fullPage: false
    });
  });

  test('capture global view for README hero', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#cesiumContainer canvas', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // Global view
    await page.evaluate(() => {
      const viewer = (window as any).viewer;
      viewer.camera.setView({
        destination: { x: -27038077, y: -42612221, z: 38852320 }, // ~10000km altitude
        orientation: {
          heading: 0,
          pitch: -1.2,
          roll: 0
        }
      });
    });

    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'tests/screenshots/global-weather-view.png',
      fullPage: false
    });
  });
});
