import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';

import { Scene } from './gl/Scene';
import { initCursor } from './fx/cursor';
import { initReveals } from './fx/reveals';
import { initScroll } from './fx/scroll';
import { runPreloader } from './fx/preloader';

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

async function boot() {
  // WebGL stage (degrade gracefully if unsupported).
  let scene: Scene | null = null;
  try {
    const stage = document.getElementById('stage');
    if (stage) {
      scene = new Scene(stage);
      scene.start();
    }
  } catch (err) {
    console.warn('[toneamp] WebGL unavailable — running DOM-only.', err);
  }

  initCursor();
  initReveals();
  initScroll();

  await runPreloader();

  // Kick the hero reveal immediately after the curtain lifts.
  document.querySelectorAll('#hero .reveal, #hero .fade').forEach((el) => el.classList.add('in'));
}

boot();
