import {
  AmbientLight, BoxGeometry, BufferGeometry, Color, DirectionalLight,
  Float32BufferAttribute, Fog, Group, LineBasicMaterial, LineSegments,
  MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera,
  Scene, WebGLRenderer, ACESFilmicToneMapping,
} from 'three';

// A small, independent renderer: no product data, raycasting, textures, shadows
// or post-processing. All architectural pieces share one box geometry.
export function createAmbientScene(host, { compact, focused }) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', { antialias: !compact, alpha: false, powerPreference: 'low-power' });
  if (!context) throw new Error('WebGL2 unavailable');
  const renderer = new WebGLRenderer({ canvas, context, antialias: !compact });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.86;
  const scene = new Scene();
  scene.background = new Color('#1d2522');
  scene.fog = new Fog('#1d2522', 22, 73);
  const camera = new PerspectiveCamera(47, 1, 0.1, 110);
  const architecture = new Group();
  scene.add(architecture);
  const geometry = new BoxGeometry(1, 1, 1);
  const materials = {
    stone: new MeshStandardMaterial({ color: '#465249', roughness: 0.94 }),
    shelf: new MeshStandardMaterial({ color: '#596259', roughness: 0.82, metalness: 0.12 }),
    dark: new MeshStandardMaterial({ color: '#2c3832', roughness: 1 }),
    floor: new MeshStandardMaterial({ color: '#38433d', roughness: 1 }),
    edge: new MeshBasicMaterial({ color: '#b5c2aa', transparent: true, opacity: 0.12, depthWrite: false }),
  };
  const box = (parent, size, position, material = materials.stone) => {
    const mesh = new Mesh(geometry, material);
    mesh.scale.set(...size);
    mesh.position.set(...position);
    parent.add(mesh);
    return mesh;
  };

  // The floor and side walls establish a continuous room and a vanishing point.
  box(architecture, [70, 0.3, 90], [0, -4.65, -20], materials.floor);
  box(architecture, [0.4, 19, 60], [-14, 4.7, -21]);
  box(architecture, [0.4, 19, 60], [15, 4.7, -21], materials.dark);
  box(architecture, [29, 19, 0.5], [0.5, 4.7, -45], materials.dark);

  const distant = new Group();
  architecture.add(distant);
  box(distant, [11, 12, 0.5], [-3.5, 1.5, -32]);
  box(distant, [8.7, 9.8, 0.1], [-3.5, 1.5, -31.7], materials.dark);
  box(distant, [11.8, 0.24, 5], [-3.5, -3.3, -29.7], materials.shelf);
  box(distant, [4.5, 15, 0.65], [8.6, 2.6, -39]);
  box(distant, [29, 0.45, 2.5], [0.5, 10, -22]);

  // Open storage bays sit at three depths, leaving the central product area quiet.
  const depths = compact ? [-8, -26] : [1, -12, -27];
  depths.forEach((z, index) => {
    [-1, 1].forEach(side => {
      const bay = new Group();
      bay.position.set(side * (index === 0 ? 10.9 : 10), 0, z);
      architecture.add(bay);
      [-2.6, 2.6].forEach(x => {
        box(bay, [0.15, 10.5, 0.2], [x, 0.65, 2.4], materials.shelf);
        box(bay, [0.15, 10.5, 0.2], [x, 0.65, -2.4]);
      });
      [-3.9, 0.65, 5.8].forEach(y => {
        box(bay, [5.6, 0.2, 5.1], [0, y, 0], materials.shelf);
        box(bay, [5.5, 0.016, 0.025], [0, y + 0.11, 2.56], materials.edge);
      });
      box(bay, [5.5, 9.5, 0.12], [0, 0.8, -2.55], materials.dark);
    });
  });

  if (!compact) {
    // Near cropped beams provide parallax in the margins, always behind the DOM.
    box(architecture, [0.3, 18, 0.5], [-12.3, 2.8, 9.5], materials.dark);
    box(architecture, [10, 0.28, 3.8], [-10, -3.4, 7.6], materials.shelf);
    box(architecture, [0.32, 18, 0.4], [16.8, 2.8, 5], materials.dark);
  }

  const seams = [];
  [-10, -5, 0, 5, 10].forEach(x => seams.push(x, -4.49, 12, x, -4.49, -42));
  [-4, -15, -26, -37].forEach(z => seams.push(-14, -4.49, z, 15, -4.49, z));
  const seamGeometry = new BufferGeometry();
  seamGeometry.setAttribute('position', new Float32BufferAttribute(seams, 3));
  const seamMaterial = new LineBasicMaterial({ color: '#879985', transparent: true, opacity: 0.13, depthWrite: false });
  architecture.add(new LineSegments(seamGeometry, seamMaterial));
  const scanMaterial = new MeshBasicMaterial({ color: '#b9c5ab', transparent: true, opacity: 0, depthWrite: false });
  const scan = box(architecture, [24, 0.008, 0.06], [0, -4.47, -30], scanMaterial);

  const ambient = new AmbientLight('#b7c2b4', 0.8);
  const key = new DirectionalLight('#d1dac3', 1.65);
  key.position.set(-8, 13, 8);
  key.target.position.set(0, -3, -16);
  const fill = new DirectionalLight('#9eafb0', 0.55);
  fill.position.set(12, 5, -20);
  fill.target.position.set(0, 0, -6);
  scene.add(ambient, key, key.target, fill, fill.target);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let disposed = false;
  let lost = false;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let scrollTarget = 0;
  let scrollDepth = 0;
  const pointer = { x: 0, y: 0, smoothX: 0, smoothY: 0 };
  const focus = { value: Number(focused), from: Number(focused), target: Number(focused), start: 0, duration: 0.56 };

  const update = (dt) => {
    const motion = !reduced.matches;
    const blend = 1 - Math.exp(-dt * 2.5);
    pointer.smoothX += (pointer.x - pointer.smoothX) * blend;
    pointer.smoothY += (pointer.y - pointer.smoothY) * blend;
    scrollDepth += (scrollTarget - scrollDepth) * blend;
    const progress = motion ? Math.min(1, (elapsed - focus.start) / focus.duration) : 1;
    const ease = progress * progress * (3 - 2 * progress);
    focus.value = focus.from + (focus.target - focus.from) * ease;
    const focusMotion = motion ? focus.value : 0;
    const idleX = motion ? Math.sin(elapsed * 0.11) * 0.12 : 0;
    const idleY = motion ? Math.sin(elapsed * 0.09) * 0.07 : 0;
    const travel = motion ? scrollDepth : 0;
    const cursorX = motion ? pointer.smoothX * (compact ? 0.14 : 0.46) : 0;
    const cursorY = motion ? pointer.smoothY * (compact ? 0.08 : 0.22) : 0;
    camera.position.set(6.8 + idleX + cursorX, 4.4 + idleY - cursorY, 18 - travel - focusMotion * 0.85);
    camera.lookAt(-0.8 + cursorX * 0.2, -0.3 - cursorY * 0.15, -16 - travel * 0.35);
    architecture.position.z = -focusMotion * 2.1;
    distant.position.y = motion ? Math.sin(elapsed * 0.07) * 0.028 : 0;
    key.position.x = (-8 + (motion ? Math.sin(elapsed * 0.075) * 1.2 : 0)) * (1 - focus.value * 0.45);
    key.target.position.x = -2 * (1 - focus.value);
    key.intensity = 1.65 + (motion ? Math.sin(elapsed * 0.13) * 0.055 : 0) + focus.value * 0.18;
    fill.position.z = -20 + (motion ? Math.sin(elapsed * 0.065) * 1.5 : 0);
    fill.target.position.x = 4 * (1 - focus.value);
    // One quiet floor pass every 34 seconds, with long completely inactive gaps.
    const scanPhase = (elapsed + 18) % 34;
    scan.visible = motion && !compact && focus.value < 0.1 && scanPhase < 2.8;
    if (scan.visible) {
      scan.position.z = -35 + scanPhase / 2.8 * 40;
      scanMaterial.opacity = Math.sin(scanPhase / 2.8 * Math.PI) * 0.075;
    }
  };

  // One RAF for the entire world. Tablet renders at 30fps; reduced motion draws
  // only on resize/focus changes, and hidden documents schedule no frames.
  const render = (now) => {
    frame = 0;
    if (disposed || lost || document.hidden) return;
    const interval = compact ? 1000 / 30 : 1000 / 60;
    const delta = lastTime ? now - lastTime : interval;
    if (!reduced.matches && delta < interval - 1) { frame = requestAnimationFrame(render); return; }
    const dt = Math.min(delta / 1000, 0.06);
    lastTime = now;
    if (!reduced.matches) elapsed += dt;
    update(dt);
    renderer.render(scene, camera);
    if (host.dataset.ready !== 'true') host.dataset.ready = 'true';
    if (!reduced.matches) frame = requestAnimationFrame(render);
  };
  const requestRender = () => {
    if (!frame && !disposed && !lost && !document.hidden) frame = requestAnimationFrame(render);
  };
  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1 : 1.5));
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  };
  const onPointer = (event) => {
    if (reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
    pointer.x = MathUtils.clamp(event.clientX / width * 2 - 1, -1, 1);
    pointer.y = MathUtils.clamp(event.clientY / height * 2 - 1, -1, 1);
  };
  const resetPointer = () => { pointer.x = 0; pointer.y = 0; };
  const onScroll = () => { scrollTarget = (1 - Math.exp(-Math.max(0, window.scrollY) / 3400)) * 3.2; };
  const onVisibility = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    resetPointer();
    requestRender();
  };
  const onPreference = () => { resetPointer(); lastTime = 0; requestRender(); };
  const onContextLost = (event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    host.dataset.ready = 'false';
  };
  const onContextRestored = () => { lost = false; lastTime = 0; requestRender(); };
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('blur', resetPointer);
  document.documentElement.addEventListener('pointerleave', resetPointer);
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  reduced.addEventListener('change', onPreference);
  finePointer.addEventListener('change', resetPointer);
  host.appendChild(canvas);
  onScroll();
  resize();

  return {
    setFocus(value) {
      focus.from = focus.value;
      focus.target = Number(value);
      focus.start = elapsed;
      focus.duration = value ? 0.56 : 0.42;
      requestRender();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('blur', resetPointer);
      document.documentElement.removeEventListener('pointerleave', resetPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', onPreference);
      finePointer.removeEventListener('change', resetPointer);
      geometry.dispose();
      seamGeometry.dispose();
      Object.values(materials).forEach(material => material.dispose());
      seamMaterial.dispose();
      scanMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      host.dataset.ready = 'false';
    },
  };
}
