// Inclinaison 3D de la carte agrandie (loupe) : elle penche vers la souris ou le doigt, un reflet discret suit le pointeur.
// Glisser le doigt sur la carte la fait pencher ; un simple toucher la referme toujours.
// Overlay : l'inclinaison faite dans l'aperçu de la régie est envoyée aux autres overlays (OBS), qui la reproduisent (poser).
const ANGLE = 14; // inclinaison maximale, en degrés

/** Penche l'élément vers le point (x, y) de la carte, de 0 à 1 ; null = retour à plat. */
export function poser(el, x, y) {
  if (x == null || y == null) {
    el.classList.remove('inclinee');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    return;
  }
  el.classList.add('inclinee');
  el.style.setProperty('--rx', ((.5 - y) * 2 * ANGLE).toFixed(2) + 'deg');
  el.style.setProperty('--ry', ((x - .5) * 2 * ANGLE).toFixed(2) + 'deg');
  el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
  el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
}

/** Rend l'élément inclinable (souris et doigt). quandBouge(x, y) : appelée à chaque position (null, null = relâchée). */
export function incliner(el, { quandBouge = null } = {}) {
  if (el.dataset.inclinable) return el;
  el.dataset.inclinable = '1';
  el.classList.add('inclinable');
  const reflet = document.createElement('div'); reflet.className = 'reflet-3d';
  el.appendChild(reflet);
  let image = 0, glisse = false, depart = null;

  const suivre = e => {
    if (e.pointerType === 'touch' && depart && Math.hypot(e.clientX - depart.x, e.clientY - depart.y) > 8) glisse = true;
    if (e.pointerType === 'touch' && !depart) return;
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    // Position du pointeur sur la carte, de 0 à 1 (bornée : le doigt peut sortir de la carte)
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    cancelAnimationFrame(image);
    image = requestAnimationFrame(() => { poser(el, x, y); quandBouge?.(x, y); });
  };
  const relacher = () => {
    cancelAnimationFrame(image);
    poser(el, null);
    quandBouge?.(null, null);
    depart = null;
  };
  el.addEventListener('pointermove', suivre);
  el.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') relacher(); });
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
  return el;
}
