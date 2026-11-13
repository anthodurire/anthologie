// Loupe : clic sur une carte → elle s'agrandit au centre de l'écran (redessinée en grand, pas étirée) ;
// clic n'importe où ou Échap → elle retourne à sa place. Utilisée par la galerie et l'overlay (OBS : clic droit sur la source → Interagir).
import { recto } from './carte.js';

let ouverte = null; // { fond, carte, depuis }

// Animation de la carte agrandie depuis (ou vers) la carte cliquée
function trajet(carte, depuis) {
  const a = depuis.getBoundingClientRect(), b = carte.getBoundingClientRect();
  if (!a.width || !b.width) return 'scale(.5)';
  return `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width})`;
}

/** Agrandit la carte. depuis = élément cliqué (point de départ de l'animation) ; total = nombre de cartes de la saison ;
 *  quandFerme = appelée quand elle se referme (pas quand une autre carte la remplace). */
export function agrandir(donnees, depuis, { total = null, quandFerme = null } = {}) {
  if (ouverte) { ouverte.fond.remove(); ouverte = null; }
  // 90 % de la hauteur de l'écran, sans dépasser la largeur (carte 5:7)
  const largeur = Math.round(Math.min(innerHeight * .9 * 5 / 7, innerWidth - 32));
  const fond = document.createElement('div'); fond.className = 'loupe';
  const carte = recto(donnees, { largeur, total });
  fond.appendChild(carte);
  document.body.appendChild(fond);
  fond.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: 'both' });
  carte.animate([{ transform: trajet(carte, depuis), opacity: .6 }, { transform: 'none', opacity: 1 }],
    { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1.1)' });
  fond.onclick = () => fermer();
  ouverte = { fond, carte, depuis, quandFerme };
}

/** Referme la carte agrandie (tout de suite si immediat, sinon elle retourne à sa place). */
export function fermer(immediat = false) {
  if (!ouverte) return;
  const { fond, carte, depuis, quandFerme } = ouverte;
  ouverte = null;
  quandFerme?.();
  if (immediat || !depuis.isConnected) { fond.remove(); return; }
  carte.animate([{ transform: 'none', opacity: 1 }, { transform: trajet(carte, depuis), opacity: .6 }],
    { duration: 280, easing: 'ease-in', fill: 'forwards' });
  fond.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: 'forwards' }).finished.then(() => fond.remove());
}

addEventListener('keydown', e => { if (e.key === 'Escape') fermer(); });
