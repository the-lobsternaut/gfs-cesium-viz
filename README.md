# GFS Weather Visualization for CesiumJS

3D weather visualization plugin for CesiumJS using GFS (Global Forecast System) data.

## Features

- **Real-time & Historical Weather Data** - Direct access to NOAA GFS forecasts
- **3D Wind Visualization** - Particle flows, vector fields, wind barbs  
- **Atmospheric Layers** - Temperature, humidity, pressure at multiple altitudes
- **Global Coverage** - 0.25° resolution GFS data
- **CesiumJS Integration** - Native Cesium primitives and entities

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

## License

MIT
