import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { state, mixRamp, reducedMotion } from '../state';

/**
 * The signal-chain oscilloscope. A fat glowing waveform spans the viewport;
 * its shape waveshapes from a clean sine into a clipped, fuzzed square as the
 * page's gain climbs, and its colour ramps clean-teal → valve-amber → hot.
 * A warm ember field breathes behind it. Everything procedural — no assets.
 */
export class Scene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.OrthographicCamera;
  private core: Line2;
  private glow: Line2;
  private coreMat: LineMaterial;
  private glowMat: LineMaterial;
  private embers: THREE.Points;
  private emberMat: THREE.PointsMaterial;
  private readonly N = 280;
  private positions: number[] = [];
  private clock = new THREE.Clock();
  private aspect = 1;
  private raf = 0;

  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.aspect = state.w / state.h;
    this.camera = new THREE.OrthographicCamera(-this.aspect, this.aspect, 1, -1, 0.1, 10);
    this.camera.position.z = 2;

    // Build the two waveform lines (glow behind, crisp core in front).
    for (let i = 0; i < this.N; i++) this.positions.push(0, 0, 0);

    const coreGeo = new LineGeometry();
    coreGeo.setPositions(this.positions.slice());
    this.coreMat = new LineMaterial({
      color: 0xffffff,
      linewidth: 1.3,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      worldUnits: false,
    });
    this.core = new Line2(coreGeo, this.coreMat);
    this.core.computeLineDistances();
    this.scene.add(this.core);

    const glowGeo = new LineGeometry();
    glowGeo.setPositions(this.positions.slice());
    this.glowMat = new LineMaterial({
      color: 0xff6a1a,
      linewidth: 11,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      worldUnits: false,
    });
    this.glow = new Line2(glowGeo, this.glowMat);
    this.glow.computeLineDistances();
    this.glow.position.z = -0.01;
    this.scene.add(this.glow);

    this.embers = this.buildEmbers();
    this.emberMat = this.embers.material as THREE.PointsMaterial;
    this.scene.add(this.embers);

    this.resize();
    window.addEventListener('resize', this.resize);
    this.clock.start();
  }

  private buildEmbers(): THREE.Points {
    const count = 240;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() * 2 - 1) * 2.2;
      pos[i * 3 + 1] = Math.random() * 2 - 1;
      pos[i * 3 + 2] = -0.2;
      seed[i] = Math.random();
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.PointsMaterial({
      color: 0xff8a2a,
      size: 3,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthTest: false,
    });
    return new THREE.Points(geo, mat);
  }

  /** The waveform at normalized x (-1..1). Gain drives the waveshaping. */
  private wave(x: number, t: number, g: number): number {
    const freq = 5.5 + g * 3;
    let raw =
      Math.sin(x * freq + t * 1.4) * 0.62 +
      Math.sin(x * freq * 2.17 + t * 2.0) * 0.24 * (0.3 + g) +
      Math.sin(x * freq * 4.3 - t * 1.1) * 0.12 * g;
    // A little grit that only wakes up under gain (fuzz character).
    raw += (Math.sin(x * 90.0 + t * 9) * 0.06 + Math.sin(x * 210 - t * 6) * 0.03) * g * g;
    const drive = 1 + g * 9;
    // Soft-clip via tanh, then push toward a square as gain maxes (fuzz).
    let shaped = Math.tanh(raw * drive) / Math.tanh(drive * 0.5 + 0.5);
    const squared = Math.sign(shaped) * Math.pow(Math.abs(shaped), 1 - g * 0.7);
    shaped = shaped * (1 - g * 0.6) + squared * (g * 0.6);
    // Edge taper so the trace frames nicely.
    const taper = Math.pow(Math.cos((x * Math.PI) / 2.2), 0.6);
    return shaped * 0.34 * taper;
  }

  private update() {
    state.time = this.clock.getElapsedTime();
    const t = reducedMotion ? 0 : state.time;
    const g = state.gain;

    const px = reducedMotion ? 0 : state.pointer.x * 0.04;
    const py = reducedMotion ? 0 : state.pointer.y * 0.05;

    for (let i = 0; i < this.N; i++) {
      const nx = (i / (this.N - 1)) * 2 - 1; // -1..1
      const x = nx * this.aspect * 1.02 + px;
      const y = this.wave(nx, t, g) + py;
      this.positions[i * 3] = x;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = 0;
    }
    this.core.geometry.setPositions(this.positions);
    this.glow.geometry.setPositions(this.positions);

    // Colour ramp with the gain.
    const [r, gg, b] = mixRamp(g);
    this.coreMat.color.setRGB(0.7 + r * 0.3, 0.7 + gg * 0.3, 0.7 + b * 0.3);
    this.glowMat.color.setRGB(r, gg, b);
    this.glowMat.opacity = 0.06 + g * 0.1;
    this.glowMat.linewidth = 6 + g * 6;
    this.coreMat.linewidth = 1.2 + g * 0.9;

    // Embers warm up with gain.
    if (!reducedMotion) {
      const posAttr = this.embers.geometry.getAttribute('position') as THREE.BufferAttribute;
      const seed = this.embers.geometry.getAttribute('seed') as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) + 0.0007 + seed.getX(i) * 0.0009 * (0.4 + g);
        if (y > 1.05) y = -1.05;
        posAttr.setY(i, y);
        posAttr.setX(i, posAttr.getX(i) + Math.sin(t * 0.6 + seed.getX(i) * 20) * 0.0004);
      }
      posAttr.needsUpdate = true;
    }
    this.emberMat.opacity = 0.03 + g * 0.18;
    this.emberMat.color.setRGB(mixRamp(g)[0], mixRamp(g)[1] * 0.7, mixRamp(g)[2] * 0.4);

    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.update);
  }

  private resize = () => {
    this.aspect = state.w / state.h;
    this.renderer.setSize(state.w, state.h, false);
    this.camera.left = -this.aspect;
    this.camera.right = this.aspect;
    this.camera.updateProjectionMatrix();
    const res = new THREE.Vector2(state.w, state.h);
    this.coreMat.resolution.copy(res);
    this.glowMat.resolution.copy(res);
  };

  start() {
    this.update = this.update.bind(this);
    this.raf = requestAnimationFrame(this.update);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.renderer.dispose();
  }
}
