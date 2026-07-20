/**
 * Reveal choreography. Headlines with [data-split] get word-masked and rise
 * on enter; [class~="fade"] elements ease up. IntersectionObserver-driven so
 * it's cheap and works without the scroll library.
 */

function splitWords(el: HTMLElement) {
  const html = el.innerHTML;
  // Preserve <br> and inline tags like <span class="tint">.
  const frag = document.createElement('div');
  frag.innerHTML = html;
  el.innerHTML = '';

  const wrapText = (text: string, target: HTMLElement) => {
    const parts = text.split(/(\s+)/);
    for (const part of parts) {
      if (part.trim() === '') {
        target.appendChild(document.createTextNode(part));
        continue;
      }
      const word = document.createElement('span');
      word.className = 'word';
      const inner = document.createElement('span');
      inner.textContent = part;
      word.appendChild(inner);
      target.appendChild(word);
    }
  };

  const walk = (node: Node, target: HTMLElement) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        wrapText(child.textContent || '', target);
      } else if (child.nodeName === 'BR') {
        target.appendChild(document.createElement('br'));
      } else if (child instanceof HTMLElement) {
        const clone = child.cloneNode(false) as HTMLElement;
        target.appendChild(clone);
        walk(child, clone);
      }
    });
  };

  walk(frag, el);
}

export function initReveals() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    splitWords(el);
    // Stagger the inner spans.
    el.querySelectorAll<HTMLElement>('.word > span').forEach((span, i) => {
      span.style.transitionDelay = `${i * 0.045}s`;
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
  );

  document.querySelectorAll('.reveal, .fade').forEach((el) => io.observe(el));
}
