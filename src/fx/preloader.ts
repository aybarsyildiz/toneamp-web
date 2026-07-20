/** Oscilloscope-style preloader; resolves when the sweep completes. */
export function runPreloader(): Promise<void> {
  return new Promise((resolve) => {
    const root = document.getElementById('preloader');
    const bar = document.getElementById('pre-bar');
    const pct = document.getElementById('pre-pct');
    if (!root || !bar || !pct) return resolve();

    let p = 0;
    const tick = () => {
      p += (100 - p) * 0.08 + 0.6;
      if (p > 99.4) p = 100;
      bar.style.width = `${p}%`;
      pct.textContent = String(Math.floor(p));
      if (p >= 100) {
        setTimeout(() => {
          root.style.transition = 'opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out)';
          root.style.opacity = '0';
          root.style.transform = 'scale(1.04)';
          root.classList.add('done');
          setTimeout(() => {
            root.style.display = 'none';
            resolve();
          }, 700);
        }, 260);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
