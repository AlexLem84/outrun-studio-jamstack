import * as THREE from 'three';

const DEFAULT_COLORS = ['#7146f2', '#ff6eff', '#40ffe6'] as const;

console.info('[kota-webgl] module loaded');

const canUseWebGL = (() => {
  if (typeof window === 'undefined') return false;
  try {
    const probe = document.createElement('canvas');
    return !!(
      probe.getContext('webgl2') ||
      probe.getContext('webgl') ||
      probe.getContext('experimental-webgl')
    );
  } catch (error) {
    console.warn('[kota-webgl] WebGL capability probe failed', error);
    return false;
  }
})();

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class KotaAuroraBackground {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private fallback: HTMLElement | null;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private mesh: THREE.Mesh | null = null;
  private uniforms: {
    uTime: { value: number };
    uPointer: { value: THREE.Vector2 };
    uResolution: { value: THREE.Vector2 };
    uColors: { value: THREE.Color[] };
  };
  private frameId = 0;
  private disposed = false;
  private pointer = new THREE.Vector2();
  private pointerTarget = new THREE.Vector2();

  constructor(container: HTMLElement) {
    console.log('[kota-webgl] Initializing KotaAuroraBackground');
    this.container = container;
    this.canvas = container.querySelector('canvas') as HTMLCanvasElement;
    this.fallback = container.querySelector('.kota-webgl__fallback') as HTMLElement;

    if (!this.canvas) {
      console.error('[kota-webgl] Canvas not found');
      return;
    }

    this.uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uColors: { value: this.parseColors() }
    };

    this.init();
  }

  private parseColors(): THREE.Color[] {
    const colorsAttr = this.container.getAttribute('data-colors');
    if (colorsAttr) {
      return colorsAttr.split(',').map(color => new THREE.Color(color.trim()));
    }
    return DEFAULT_COLORS.map(color => new THREE.Color(color));
  }

  private init() {
    console.log('[kota-webgl] Setting up WebGL renderer');
    
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Setup scene
    this.scene = new THREE.Scene();

    // Setup camera
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    this.camera.position.z = 1;

    // Create the particle surface
    this.createSurface();

    // Setup event listeners
    this.setupEventListeners();

    // Start animation
    this.animate();

    // Hide fallback
    this.hideFallback();

    console.log('[kota-webgl] Initialization complete');
  }

  private createSurface() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
      this.mesh = null;
    }

    // Create a grid of points for more dynamic particle-like behavior
    const segments = 64;
    const geometry = new THREE.PlaneGeometry(2, 2, segments, segments);

    // Add random positions and attributes for each vertex
    const positions = geometry.attributes.position.array;
    const scales = new Float32Array(positions.length / 3);
    const phases = new Float32Array(positions.length / 3);
    const velocities = new Float32Array(positions.length / 3 * 2); // vx, vy for each vertex

    for (let i = 0; i < positions.length / 3; i++) {
      scales[i] = Math.random() * 0.5 + 0.5;
      phases[i] = Math.random() * Math.PI * 2;
      velocities[i * 2] = (Math.random() - 0.5) * 0.02; // vx
      velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.02; // vy
    }

    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 2));

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      vertexShader: /* glsl */`
        uniform float uTime;
        uniform vec2 uPointer;
        attribute float aScale;
        attribute float aPhase;
        attribute vec2 aVelocity;
        varying float vAlpha;
        varying float vMix;
        varying vec2 vUv;

        void main() {
          vUv = uv;

          vec3 pos = position;
          float time = uTime * 0.5;

          // Create flowing movement with noise-like behavior
          float noise1 = sin(pos.x * 3.0 + time + aPhase) * 0.1;
          float noise2 = sin(pos.y * 2.0 + time * 0.7 + aPhase) * 0.1;
          float noise3 = sin((pos.x + pos.y) * 1.5 + time * 1.2 + aPhase) * 0.05;

          pos.x += noise1 + noise3;
          pos.y += noise2 + noise3;

          // Add velocity-based movement
          pos.x += aVelocity.x * sin(time + aPhase) * 2.0;
          pos.y += aVelocity.y * cos(time + aPhase) * 2.0;

          // Mouse interaction
          vec2 mouse = uPointer;
          float mouseDist = distance(uv, (mouse + 1.0) * 0.5);
          float mouseInfluence = 1.0 - smoothstep(0.0, 0.3, mouseDist);

          pos.x += mouseInfluence * (mouse.x - uv.x) * 0.3;
          pos.y += mouseInfluence * (mouse.y - uv.y) * 0.3;

          gl_Position = vec4(pos, 1.0);

          vAlpha = aScale * (0.3 + mouseInfluence * 0.7);
          vMix = smoothstep(0.0, 1.0, length(uv - 0.5));
        }
      `,
      fragmentShader: /* glsl */`
        precision highp float;
        uniform float uTime;
        uniform vec3 uColors[3];
        uniform vec2 uPointer;
        uniform vec2 uResolution;
        varying float vAlpha;
        varying float vMix;
        varying vec2 vUv;

        vec3 mod289(vec3 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
        vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
        vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 =   v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 x = x0.xyzz + vec4(C.xxx, 0.0);
          vec4 y = x0.yzzx + vec4(C.yyy, 0.0);
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1),
                                  dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }

        void main() {
          vec2 uv = vUv;
          float time = uTime * 0.5;

          // Create particle-like circular glow
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(uv, center);
          float particleGlow = exp(-dist * 8.0) * vAlpha;

          // Add mouse interaction glow
          vec2 mouse = (uPointer + 1.0) * 0.5;
          float mouseDist = distance(uv, mouse);
          float mouseGlow = exp(-mouseDist * 12.0) * 0.8;

          // Create flowing color mixing
          vec3 color1 = uColors[0];
          vec3 color2 = uColors[1];
          vec3 color3 = uColors[2];

          // Mix colors based on position and time
          float mix1 = sin(uv.x * 3.0 + time + vMix * 2.0) * 0.5 + 0.5;
          float mix2 = sin(uv.y * 2.0 + time * 0.7 + vMix * 1.5) * 0.5 + 0.5;

          vec3 baseColor = mix(color1, color2, mix1);
          baseColor = mix(baseColor, color3, mix2 * 0.6);

          // Add particle effects
          float particleIntensity = particleGlow + mouseGlow;
          vec3 finalColor = baseColor * particleIntensity;

          // Add subtle noise for texture
          float noise = snoise(vec3(uv * 8.0, time * 1.5)) * 0.1;
          finalColor += noise;

          // Add shimmer effect
          float shimmer = sin(uv.x * 10.0 + time * 2.0) * sin(uv.y * 8.0 + time * 1.5) * 0.1;
          finalColor += shimmer * particleIntensity;

          // Apply vignette
          float vignette = 1.0 - smoothstep(0.3, 1.0, dist);
          finalColor *= vignette;

          // Clamp and output
          finalColor = clamp(finalColor, 0.0, 1.0);
          gl_FragColor = vec4(finalColor, particleIntensity * 0.8);
        }
      `,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  private setupEventListeners() {
    const handleMouseMove = (event: MouseEvent) => {
      this.pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.pointerTarget.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Store references for cleanup
    this.container.addEventListener = this.container.addEventListener || (() => {});
  }

  private animate = (time: number) => {
    if (this.disposed) return;
    this.uniforms.uTime.value = time * 0.001;

    // Smooth pointer movement
    this.pointer.lerp(this.pointerTarget, 0.08);
    this.uniforms.uPointer.value.copy(this.pointer);

    // Add subtle rotation to the mesh for more dynamic movement
    if (this.mesh) {
      this.mesh.rotation.z = Math.sin(time * 0.0005) * 0.1;
      this.mesh.rotation.x = Math.cos(time * 0.0003) * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  };

  private hideFallback() {
    if (this.fallback) {
      this.fallback.setAttribute('data-hidden', 'true');
    }
    this.container.classList.add('is-ready');
  }

  public dispose() {
    this.disposed = true;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
    this.renderer.dispose();
  }
}

// Global interface extension
declare global {
  interface HTMLElement {
    __kotaInstance?: KotaAuroraBackground;
  }
}

type DecoratedHTMLElement = HTMLElement & {
  __kotaInstance?: KotaAuroraBackground;
};

const initialise = () => {
  console.log('[kota-webgl] Initializing...');
  console.log('[kota-webgl] WebGL support:', canUseWebGL);
  console.log('[kota-webgl] Reduced motion:', prefersReducedMotion());
  
  if (!canUseWebGL || prefersReducedMotion()) {
    console.log('[kota-webgl] Skipping initialization - WebGL not supported or reduced motion preferred');
    return;
  }

  const containers = document.querySelectorAll<DecoratedHTMLElement>('[data-kota-webgl]');
  console.log('[kota-webgl] Found containers:', containers.length);
  
  containers.forEach((container, index) => {
    if (container.__kotaInstance) {
      console.log(`[kota-webgl] Container ${index} already initialized`);
      return;
    }
    try {
      console.log(`[kota-webgl] Initializing container ${index}`);
      container.__kotaInstance = new KotaAuroraBackground(container);
      console.log(`[kota-webgl] Container ${index} initialized successfully`);
    } catch (error) {
      console.warn(`[kota-webgl] Failed to initialize container ${index}:`, error);
    }
  });
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialise);
} else {
  initialise();
}

// Re-initialize on navigation (for SPAs)
window.addEventListener('popstate', initialise);

export { KotaAuroraBackground };