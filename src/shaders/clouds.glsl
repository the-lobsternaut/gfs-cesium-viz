// Cloud cover shader - Shadertoy-inspired SDF volumetric clouds
// Adapts raymarching techniques for Cesium

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec3 u_cameraPosition;
uniform sampler2D u_cloudData; // GFS cloud cover data texture

varying vec3 v_positionEC;

// Hash function for better noise quality (Shadertoy-inspired)
float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// Improved 3D noise
float noise3d(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
        f.z
    );
}

// Worley noise for cloud details
float worley(vec3 p) {
    vec3 id = floor(p);
    vec3 fd = fract(p);

    float minDist = 1.0;
    for(int x = -1; x <= 1; x++) {
        for(int y = -1; y <= 1; y++) {
            for(int z = -1; z <= 1; z++) {
                vec3 coord = vec3(float(x), float(y), float(z));
                vec3 pointPos = vec3(hash(id + coord));
                pointPos = 0.5 + 0.5 * sin(u_time * 0.01 + 6.2831 * pointPos);

                float dist = length(coord + pointPos - fd);
                minDist = min(minDist, dist);
            }
        }
    }
    return minDist;
}

// FBM with Perlin-Worley hybrid
float fbm(vec3 p) {
    float perlin = 0.0;
    float worleyNoise = worley(p * 0.5);
    float amplitude = 0.5;

    for(int i = 0; i < 5; i++) {
        perlin += amplitude * noise3d(p);
        p *= 2.0;
        amplitude *= 0.5;
    }

    // Combine Perlin and Worley (technique from Inigo Quilez)
    return perlin - worleyNoise * 0.3;
}

// Density field for volumetric clouds (not pure SDF, more like density sampling)
float cloudDensity(vec3 p) {
    // Base cloud layer at altitude (2-5km)
    float altitude = length(p) - 6371.0;
    float heightGradient = smoothstep(2.0, 3.0, altitude) * (1.0 - smoothstep(4.0, 5.0, altitude));

    if(heightGradient < 0.01) return 0.0;

    // Cloud shape from FBM
    float cloudShape = fbm(p * 0.08 + vec3(u_time * 0.005, 0.0, u_time * 0.003));

    // Erode edges with higher frequency noise
    float erosion = fbm(p * 0.3) * 0.3;

    return max(0.0, (cloudShape - 0.4) * heightGradient - erosion);
}

void main() {
    vec3 rayOrigin = u_cameraPosition;
    vec3 rayDir = normalize(v_positionEC - u_cameraPosition);
    
    float distToCamera = length(v_positionEC - u_cameraPosition);
    
    // LOD: volumetric rendering when close (<100km), flat texture when far
    if(distToCamera < 100000.0) {
        // Volumetric raymarching with adaptive step size
        float t = 0.0;
        float transmittance = 1.0;
        vec3 lightAccum = vec3(0.0);
        vec3 sunDir = normalize(vec3(0.5, 0.5, 0.3));

        int maxSteps = 64;
        float stepSize = distToCamera / float(maxSteps);

        for(int i = 0; i < maxSteps; i++) {
            vec3 p = rayOrigin + rayDir * t;
            float density = cloudDensity(p);

            if(density > 0.01) {
                // Beer's law light attenuation
                float lightDensity = density * stepSize;
                transmittance *= exp(-lightDensity * 0.8);

                // Simple lighting (sun direction)
                float lighting = max(dot(sunDir, rayDir), 0.3);
                lightAccum += density * transmittance * lighting * vec3(1.0, 1.0, 0.95) * stepSize;

                if(transmittance < 0.01) break;
            }

            t += stepSize;
            if(t > distToCamera) break;
        }

        float alpha = 1.0 - transmittance;
        gl_FragColor = vec4(lightAccum, clamp(alpha, 0.0, 0.9));
    } else {
        // Flat cloud texture from GFS data (billboard style)
        vec2 uv = vec2(0.5); // TODO: project to lat/lon
        float cloudCover = texture2D(u_cloudData, uv).r;
        gl_FragColor = vec4(1.0, 1.0, 1.0, cloudCover * 0.6);
    }
}
