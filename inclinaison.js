// Inclinaison 3D : la carte penche vers la souris (ou le doigt, sur la carte agrandie) et un reflet suit le pointeur.
// Galerie : au survol de la souris (au doigt, la grille doit pouvoir défiler : pas d'inclinaison).
// Loupe : souris et doigt (glisser le doigt sur la carte la fait pencher ; un simple toucher la referme toujours).
const ANGLE = 14; // inclinaison maximale, en degrés

/** Rend l'élément (carte, verso ou booster) inclinable. tactile = suivre aussi le doigt. */
export function incliner(el, { tactile = false } = {}) {
  if (el.dataset.inclinable) return el;
  el.dataset.inclinable = '1';
  el.classList.add('inclinable');
  const reflet = document.createElement('div'); reflet.className = 'reflet-3d';
  el.appendChild(reflet);
  let image = 0, glisse = false, depart = null;

  const suivre = e => {
    if (e.pointerType === 'touch' && !tactile) return;
    if (e.pointerType === 'touch' && depart && Math.hypot(e.clientX - depart.x, e.clientY - depart.y) > 8) glisse = true;
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    // Position du pointeur sur la carte, de 0 à 1 (bornée : le doigt peut sortir de la carte)
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    cancelAnimationFrame(image);
    image = requestAnimationFrame(() => {
      el.classList.add('inclinee');
      el.style.setProperty('--rx', ((.5 - y) * 2 * ANGLE).toFixed(2) + 'deg');
      el.style.setProperty('--ry', ((x - .5) * 2 * ANGLE).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
  };
  const relacher = () => {
    cancelAnimationFrame(image);
    el.classList.remove('inclinee');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    depart = null;
  };
  el.addEventListener('pointermove', suivre);
  el.addEventListener('pointerleave', relacher);
  if (tactile) {
    el.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'touch') return;
      depart = { x: e.clientX, y: e.clientY }; glisse = false;
      try { el.setPointerCapture?.(e.pointerId); } catch {} // le doigt continue d'incliner la carte même s'il en sort
      suivre(e);
    });
    el.addEventListener('pointerup', e => { if (e.pointerType === 'touch') relacher(); });
    el.addEventListener('pointercancel', relacher);
    // Après un glissé, le « clic » qui suit ne doit pas refermer la loupe
    el.addEventListener('click', e => { if (glisse) { glisse = false; e.stopPropagation(); } }, true);
  }
  return el;
}
