import { Skia } from '@shopify/react-native-skia';
import { BadgeTier } from '../../types/badges';

// Color palettes for each tier
export const TIER_COLORS: Record<BadgeTier, string[]> = {
    bronze: ['#8B4513', '#CD7F32', '#D2691E', '#8B4513'], // Rustic, copper
    silver: ['#C0C0C0', '#FFFFFF', '#E0E0E0', '#A9A9A9'], // Chrome, bright
    gold: ['#FFD700', '#FFF8DC', '#DAA520', '#B8860B'], // Deep gold, sparkles
    platinum: ['#E0FFFF', '#FFFFFF', '#00CED1', '#4682B4'], // Cyan tint, holographic
    diamond: ['#F0F8FF', '#FFFFFF', '#B0E0E6', '#4169E1'], // Blue tint, crystal
    cosmic: ['#4B0082', '#8A2BE2', '#0000FF', '#000000'], // Deep purple/blue
};

// Shadow colors
export const TIER_SHADOWS: Record<BadgeTier, string> = {
    bronze: '#5A2D0C',
    silver: '#808080',
    gold: '#8B6508',
    platinum: '#2F4F4F',
    diamond: '#191970',
    cosmic: '#4B0082',
};

// Perlin noise shader for Cosmic tier (simplified for now, can be enhanced)
export const COSMIC_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;
  
  float random (in float2 st) {
      return fract(sin(dot(st.xy, float2(12.9898,78.233))) * 43758.5453123);
  }

  float noise (in float2 st) {
      float2 i = floor(st);
      float2 f = fract(st);

      float a = random(i);
      float b = random(i + float2(1.0, 0.0));
      float c = random(i + float2(0.0, 1.0));
      float d = random(i + float2(1.0, 1.0));

      float2 u = f*f*(3.0-2.0*f);

      return mix(a, b, u.x) +
              (c - a)* u.y * (1.0 - u.x) +
              (d - b) * u.x * u.y;
  }

  vec4 main(vec2 pos) {
      vec2 st = pos/resolution.xy;
      float n = noise(st * 3.0 + time * 0.5);
      
      vec3 color = mix(vec3(0.2, 0.0, 0.5), vec3(0.0, 0.0, 1.0), n);
      color += vec3(noise(st * 10.0 - time)) * 0.3; // Stars
      
      return vec4(color, 1.0);
  }
`)!;

// Holographic shader for Platinum tier
export const HOLOGRAPHIC_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;
  
  vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  vec4 main(vec2 pos) {
      vec2 st = pos/resolution.xy;
      
      // Iridescent effect
      float angle = atan(st.y - 0.5, st.x - 0.5);
      float dist = distance(st, vec2(0.5));
      
      float hue = fract(angle * 0.5 + dist * 2.0 - time * 0.2);
      vec3 color = hsv2rgb(vec3(hue, 0.2, 0.95)); // Low saturation, high value for silver/white base
      
      // Specular highlight
      float highlight = smoothstep(0.4, 0.45, abs(sin(st.x * 10.0 + st.y * 5.0 + time)));
      color += vec3(highlight * 0.3);

      return vec4(color, 1.0);
  }
`)!;

// Diamond shader for Diamond tier
export const DIAMOND_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;

  vec4 main(vec2 pos) {
      vec2 st = pos/resolution.xy;
      
      // Faceted look (using smoothstep instead of fwidth)
      vec2 uv = st * 4.0;
      vec2 grid = abs(fract(uv - 0.5) - 0.5);
      float line = smoothstep(0.05, 0.0, min(grid.x, grid.y));
      
      // Blue-ish crystal base
      vec3 color = mix(vec3(0.8, 0.9, 1.0), vec3(0.2, 0.4, 0.9), st.y);
      
      // Add grid lines
      color += vec3(line * 0.3);
      
      // Sparkles
      float sparkle = step(0.98, fract(sin(dot(st + time * 0.1, vec2(12.9898, 78.233))) * 43758.5453));
      
      // Refraction simulation (simple)
      float refraction = sin(st.x * 20.0 + time) * sin(st.y * 20.0 + time) * 0.1;
      color += vec3(refraction);
      color += vec3(sparkle);
      
      return vec4(color, 1.0);
  }
`)!;
