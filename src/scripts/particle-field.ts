import * as THREE from 'three';

const webglSupported = (() => {
  try {
    const probe = document.createElement('canvas');
    return !!(
      probe.getContext('webgl2') ||
      probe.getContext('webgl') ||
      probe.getContext('experimental-webgl')
    );
  } catch (err) {
    console.warn('[ParticleField] WebGL check failed', err);
    return false;
  }
})();

const initParticles = () => {
  const canvas = document.getElementById('gl-canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    console.warn('[ParticleField] canvas element not found');
    return;
  }

  if (!webglSupported) {
    console.info('[ParticleField] WebGL unavailable – keeping CSS fallback.');
    return;
  }

  const palette = Array.isArray((window as any)?.wnkExposed?.defaultParticlesColors)
    ? (window as any).wnkExposed.defaultParticlesColors as string[]
    : ['#303aff', '#c14fff', '#9e9065'];
  const colors = palette.slice(0, 3).map((c) => new THREE.Color(c));

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  let particles: THREE.Points | undefined;
  let uniforms:
    | { uTime: { value: number }; uColors: { value: THREE.Color[] } }
    | undefined;
  let rafId = 0;

  const pointer = new THREE.Vector2();
  const easedPointer = new THREE.Vector2();
  const fallback = canvas.parentElement?.querySelector<HTMLElement>('.particle-fallback');

  const hideFallback = () => {
    if (!fallback) return;
    fallback.style.transition = 'opacity 0.6s ease';
    fallback.style.opacity = '0';
    fallback.style.pointerEvents = 'none';
  };

  const rebuild = () => {
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(width, height, false);

    if (particles) {
      scene.remove(particles);
      particles.geometry.dispose();
      (particles.material as THREE.ShaderMaterial).dispose();
    }

    const count = Math.min(3000, Math.max(400, Math.floor(Math.sqrt(width * height) * 1.5)));
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const colorStops = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = THREE.MathUtils.randFloat(1.6, 4.8);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);

      positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      scales[i] = THREE.MathUtils.randFloat(0.6, 1.6);
      colorStops[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aColorStop', new THREE.BufferAttribute(colorStops, 1));

    uniforms = {
      uTime: { value: 0 },
      uColors: { value: colors },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aScale;
        attribute float aColorStop;
        varying float vScale;
        varying float vColorStop;
        uniform float uTime;

        vec3 mod289(vec3 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
        vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
        vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        float snoise(vec3 v){
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
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
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1),
                                  dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vScale = aScale;
          vColorStop = aColorStop;
          vec3 p = position;
          float n = snoise(vec3(p * 0.45 + uTime * 0.05));
          p += normalize(p) * n * 0.32;
          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = vScale * 26.0 * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColors[3];
        varying float vColorStop;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float fade = smoothstep(0.5, 0.0, d);
          vec3 c = mix(uColors[0], uColors[1], smoothstep(0.0, 0.5, vColorStop));
          c = mix(c, uColors[2], smoothstep(0.5, 1.0, vColorStop));
          gl_FragColor = vec4(c, fade * 0.9);
        }
      `,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
    hideFallback();
  };

  const onPointerMove = (event: MouseEvent | Touch) => {
    const clientX = 'clientX' in event ? event.clientX : 0;
    const clientY = 'clientY' in event ? event.clientY : 0;
    const x = (clientX / window.innerWidth) * 2 - 1;
    const y = -(clientY / window.innerHeight) * 2 + 1;
    pointer.set(x, y);
  };

  const animate = (time: number) => {
    rafId = requestAnimationFrame(animate);
    if (!particles || !uniforms) return;

    uniforms.uTime.value = time * 0.001;
    easedPointer.lerp(pointer, 0.05);

    camera.position.x = easedPointer.x * 0.6;
    camera.position.y = easedPointer.y * 0.4;
    camera.lookAt(scene.position);

    particles.rotation.y += 0.0008;
    particles.rotation.x = THREE.MathUtils.lerp(particles.rotation.x, easedPointer.y * 0.2, 0.02);

    renderer.render(scene, camera);
  };

  rebuild();
  animate(0);

  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', (event) => {
    if (!event.touches?.length) return;
    onPointerMove(event.touches[0]);
  }, { passive: true });
  window.addEventListener('resize', rebuild);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      animate(performance.now());
    }
  });

  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
    renderer.dispose();
    if (particles) {
      particles.geometry.dispose();
      (particles.material as THREE.ShaderMaterial).dispose();
    }
  }, { once: true });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initParticles, { once: true });
} else {
  initParticles();
}

export {};
