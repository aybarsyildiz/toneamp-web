import Lenis from 'lenis';
import gsap from 'gsap';
import { state, reducedMotion } from '../state';

/**
 * Smooth scroll + the gain loop. Page progress drives an eased `state.gain`
 * (0..1) that the WebGL scene and HUD meter read. Also counts up the hero
 * stats and rotates the amp knobs when they enter view.
 */
export function initScroll() {
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !reducedMotion,
  });

  const gainNum = document.getElementById('gain-num');
  const gainFill = document.getElementById('gain-fill');

  let targetGain = 0;
  lenis.on('scroll', ({ scroll, limit }: { scroll: number; limit: number }) => {
    const p = limit > 0 ? Math.min(1, Math.max(0, scroll / limit)) : 0;
    state.progress = p;
    // Ease-in curve so the low-gain "clean" zone lingers, then climbs hard.
    targetGain = Math.pow(p, 1.35);
  });

  const raf = (time: number) => {
    lenis.raf(time);
    // Critically-damped approach to the target gain.
    state.gain += (targetGain - state.gain) * (reducedMotion ? 1 : 0.08);
    if (gainNum) gainNum.textContent = (state.gain * 10).toFixed(1);
    if (gainFill) gainFill.style.width = `${state.gain * 100}%`;
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  initCounters();
  initKnobs();
}

/** Count [data-count] targets up when they scroll into view. */
function initCounters() {
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        const target = parseInt(el.dataset.count || '0', 10);
        io.unobserve(el);
        if (reducedMotion) {
          el.textContent = target.toLocaleString('en-US');
          continue;
        }
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.floor(obj.v).toLocaleString('en-US');
          },
        });
      }
    },
    { threshold: 0.6 }
  );
  els.forEach((el) => io.observe(el));
}

/** Rotate amp knobs to their [data-knob] value (0..10 → -140°..140°). */
function initKnobs() {
  const knobs = document.querySelectorAll<HTMLElement>('[data-knob]');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        const val = parseFloat(el.dataset.knob || '0');
        const deg = -140 + (val / 10) * 280;
        if (reducedMotion) {
          el.style.setProperty('--deg', `${deg}deg`);
          continue;
        }
        const obj = { d: -140 };
        gsap.to(obj, {
          d: deg,
          duration: 1.2,
          ease: 'back.out(1.4)',
          onUpdate: () => el.style.setProperty('--deg', `${obj.d}deg`),
        });
      }
    },
    { threshold: 0.5 }
  );
  knobs.forEach((el) => io.observe(el));
}
