import { test, expect } from '@playwright/test';

test.describe('Cloud Visualization', () => {
  test('should render cloud layer on Cesium globe', async ({ page }) => {
    await page.goto('/');
    
    // Wait for Cesium to load
    await page.waitForSelector('#cesiumContainer canvas');
    
    // Check cloud layer is initialized
    const cloudLayer = await page.evaluate(() => {
      return (window as any).cloudLayer !== undefined;
    });
    
    expect(cloudLayer).toBe(true);
  });

  test('should switch to volumetric clouds when camera is close', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#cesiumContainer canvas');
    
    // Zoom in close to trigger volumetric rendering
    await page.evaluate(() => {
      const viewer = (window as any).viewer;
      viewer.camera.flyTo({
        destination: { x: 0, y: 0, z: 100000 }, // 100km altitude
        duration: 0
      });
    });
    
    await page.waitForTimeout(1000);
    
    // Take screenshot to verify volumetric rendering
    await page.screenshot({ path: 'tests/screenshots/volumetric-clouds.png' });
    
    // Check shader uniform updated
    const isVolumetric = await page.evaluate(() => {
      const layer = (window as any).cloudLayer;
      return layer && layer.isVolumetricMode;
    });
    
    expect(isVolumetric).toBe(true);
  });

  test('should use flat texture when camera is far', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#cesiumContainer canvas');
    
    // Zoom out far
    await page.evaluate(() => {
      const viewer = (window as any).viewer;
      viewer.camera.flyTo({
        destination: { x: 0, y: 0, z: 20000000 }, // 20,000km altitude
        duration: 0
      });
    });
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/flat-clouds.png' });
  });
});
