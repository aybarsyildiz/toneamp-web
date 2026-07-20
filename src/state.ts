/* Shared reactive state — the single source for "how hard is the gain". */

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(pointer: fine)').matches;

export const state = {
  /** Scroll progress 0..1 across the whole page. */
  progress: 0,
  /** Eased gain 0..1 — drives waveform distortion, colour, and audio. */
  gain: 0,
  /** Pointer in normalized device coords (-1..1). */
  pointer: { x: 0, y: 0 },
  /** Viewport. */
  w: window.innerWidth,
  h: window.innerHeight,
  /** Seconds since boot. */
  time: 0,
};

window.addEventListener('resize', () => {
  state.w = window.innerWidth;
  state.h = window.innerHeight;
});

window.addEventListener('pointermove', (e) => {
  state.pointer.x = (e.clientX / state.w) * 2 - 1;
  state.pointer.y = -((e.clientY / state.h) * 2 - 1);
});

/** Signal-chain colour ramp: clean teal → valve amber → hot fuzz. */
export const CLEAN = [0.22, 0.84, 0.77];
export const AMBER = [1.0, 0.7, 0.29];
export const HOT = [1.0, 0.23, 0.18];

export function mixRamp(g: number): [number, number, number] {
  const a = g < 0.5 ? CLEAN : AMBER;
  const b = g < 0.5 ? AMBER : HOT;
  const t = g < 0.5 ? g / 0.5 : (g - 0.5) / 0.5;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
