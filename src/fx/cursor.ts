import { finePointer } from '../state';

/** Difference-blended ring that lags the pointer and swells over links. */
export function initCursor() {
  if (!finePointer) return;
  document.documentElement.classList.add('has-cursor');
  const el = document.querySelector('.cursor') as HTMLElement;
  if (!el) return;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let tx = x;
  let ty = y;

  window.addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
  });

  const hoverSel = 'a, button, [data-hover]';
  document.addEventListener('pointerover', (e) => {
    if ((e.target as HTMLElement).closest(hoverSel)) el.classList.add('hover');
  });
  document.addEventListener('pointerout', (e) => {
    if ((e.target as HTMLElement).closest(hoverSel)) el.classList.remove('hover');
  });

  const loop = () => {
    x += (tx - x) * 0.2;
    y += (ty - y) * 0.2;
    el.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(loop);
  };
  loop();
}
