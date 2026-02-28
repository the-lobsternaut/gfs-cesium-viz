# GFS Weather Visualization for CesiumJS

![Hero Image](https://via.placeholder.com/1200x600/1e3a5f/ffffff?text=GFS+Weather+Visualization+for+CesiumJS)

> 3D weather visualization plugin for CesiumJS using GFS (Global Forecast System) data with **volumetric cloud rendering**.

## ✨ Features

- 🌍 **Real-time & Historical Weather Data** - Direct access to NOAA GFS forecasts via AWS S3
- ☁️ **Volumetric Cloud Rendering** - SDF-based raymarching with Perlin-Worley noise (Shadertoy-inspired)
- 🎨 **Adaptive LOD System** - Volumetric clouds <100km, flat textures >100km for performance
- 💨 **3D Wind Visualization** - GPU-accelerated particle flows and vector fields
- 🌡️ **Atmospheric Layers** - Temperature, humidity, pressure at multiple altitudes
- 🌐 **Global Coverage** - 0.25° resolution GFS data
- ⚡ **CesiumJS Integration** - Native Cesium primitives with custom GLSL shaders

## 📸 Screenshots

### Volumetric Clouds (Close Range <100km)
![Volumetric Clouds](https://via.placeholder.com/800x450/2c3e50/ecf0f1?text=Volumetric+SDF+Clouds+-+Raymarching)
*SDF-based volumetric rendering with Beer's law lighting*

### Flat Cloud Texture (Far Range >100km)
![Flat Clouds](https://via.placeholder.com/800x450/34495e/ecf0f1?text=Flat+Cloud+Texture+-+Performance+Mode)
*Optimized flat texture rendering from GFS cloud cover data*

### Transition Zone (100km)
![Transition](https://via.placeholder.com/800x450/7f8c8d/ecf0f1?text=LOD+Transition+-+100km+Altitude)
*Seamless LOD transition between volumetric and flat modes*

## Installation

```bash
npm install gfs-cesium-viz
```

## Usage

```javascript
import Cesium from 'cesium';
import { GFSWeatherLayer } from 'gfs-cesium-viz';

const viewer = new Cesium.Viewer('cesiumContainer');
const weather = new GFSWeatherLayer(viewer, {
  dataSource: 'aws',
  forecastHour: 0,
  variables: ['wind', 'temp', 'humidity']
});

await weather.load();
weather.show();
```

## 🛠️ Technical Details

### Cloud Rendering Pipeline

**Volumetric Mode (<100km altitude):**
- Perlin-Worley hybrid noise for realistic cloud formations
- Density field sampling (not pure SDF) with height gradients (2-5km)
- 64-step adaptive raymarching
- Beer's law transmittance for lighting
- Erosion detail with high-frequency noise

**Flat Texture Mode (>100km altitude):**
- Billboard-style cloud textures from GFS cloud cover data
- UV projection to lat/lon
- Optimized for global views

### Shader Highlights

```glsl
// Density field for volumetric clouds
float cloudDensity(vec3 p) {
    float altitude = length(p) - 6371.0;
    float heightGradient = smoothstep(2.0, 3.0, altitude) *
                          (1.0 - smoothstep(4.0, 5.0, altitude));

    float cloudShape = fbm(p * 0.08 + vec3(u_time * 0.005));
    float erosion = fbm(p * 0.3) * 0.3;

    return max(0.0, (cloudShape - 0.4) * heightGradient - erosion);
}
```

See [clouds.glsl](src/shaders/clouds.glsl) for full implementation.

## 🧪 Testing

Playwright tests capture screenshots at different camera distances:

```bash
npm install
npm test
```

Tests verify:
- ✅ Volumetric rendering at close range
- ✅ Flat texture rendering at far range
- ✅ LOD transition at 100km threshold

## 🎨 Inspiration

Shader techniques inspired by:
- [Volumetric Raymarching - GM Shaders](https://mini.gmshaders.com/p/volumetric)
- [Real-time Cloudscapes - Maxime Heckel](https://blog.maximeheckel.com/posts/real-time-cloudscapes-with-volumetric-raymarching/)
- [60FPS Volumetric Clouds - Shadertoy](https://www.shadertoy.com/view/DtBGR1)
- [Clouds by Inigo Quilez - Shadertoy](https://www.shadertoy.com/view/XslGRr)

## 📚 References

- [Cesium GPU Wind Visualization](https://cesium.com/blog/2019/04/29/gpu-powered-wind/)
- [The Weather Company + Cesium](https://cesium.com/blog/2025/03/31/the-weather-company-brings-forecasts-to-military-planning-with-cesium/)
- [NOAA GFS on AWS](https://registry.opendata.aws/noaa-gfs-bdp-pds/)

## 📝 License

MIT © the-lobsternaut
