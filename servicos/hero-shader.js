import {
  ShaderMount,
  meshGradientFragmentShader,
  getShaderColorFromString,
  ShaderFitOptions,
  defaultObjectSizing,
} from './node_modules/@paper-design/shaders/dist/index.js';

function sizingUniforms(overrides = {}) {
  const s = { ...defaultObjectSizing, ...overrides };
  return {
    u_fit: ShaderFitOptions[s.fit],
    u_scale: s.scale,
    u_rotation: s.rotation,
    u_originX: s.originX,
    u_originY: s.originY,
    u_offsetX: s.offsetX,
    u_offsetY: s.offsetY,
    u_worldWidth: s.worldWidth,
    u_worldHeight: s.worldHeight,
  };
}

function initPlatformShaders() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const meshEl = document.getElementById('platform-mesh-shader');
  if (meshEl) {
    new ShaderMount(
      meshEl,
      meshGradientFragmentShader,
      {
        ...sizingUniforms({ fit: 'cover' }),
        u_colors: ['#000000', '#000000', '#1B2848', '#1B2848', '#003A58', '#005C8B', '#32AD78'].map(getShaderColorFromString),
        u_colorsCount: 7,
        u_distortion: 0.75,
        u_swirl: 0.08,
        u_grainMixer: 0,
        u_grainOverlay: 0,
      },
      {},
      0.22,
      0
    );
  }

  const wireEl = document.getElementById('platform-mesh-wire');
  if (wireEl) {
    new ShaderMount(
      wireEl,
      meshGradientFragmentShader,
      {
        ...sizingUniforms({ fit: 'cover' }),
        u_colors: ['#000000', '#1B2848', '#0A1528', '#003A58'].map(getShaderColorFromString),
        u_colorsCount: 4,
        u_distortion: 0.6,
        u_swirl: 0.15,
        u_grainMixer: 0.08,
        u_grainOverlay: 0.04,
      },
      {},
      0.15,
      0
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlatformShaders);
} else {
  initPlatformShaders();
}
