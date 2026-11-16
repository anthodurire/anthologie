// Copier / enregistrer / partager une carte entière (cadre, titre, texte), pas seulement son illustration.
// Les images des cartes sont photographiées à l'avance par Chrome à chaque mise à jour de la galerie publique
// (galerie-publique.mjs) : carte.image (version de base) et carte.imageS (version S), en WebP.
// Le presse-papiers et le partage veulent du PNG : la conversion se fait dans la page au moment voulu.
import { peutEtreS } from './carte.js';

/** Adresse de l'image de la carte telle qu'affichée (version S si c'est elle qui est montrée), ou null. */
export const imageDe = carte => (carte.versionS && peutEtreS(carte) ? carte.imageS : carte.image) || null;

const nomFichier = carte => `${String(carte.nom || 'carte').replace(/[\\/:*?"<>|]+/g, '').trim()}${carte.versionS && peutEtreS(carte) ? ' S' : ''} - ANTHOLOGIE.png`;

// PNG de chaque image, gardés le temps de la visite (la loupe le prépare dès l'ouverture : le partage sur téléphone
// doit partir tout de suite après le toucher, sans attendre un téléchargement)
const cache = new Map();
export function png(carte) {
  const src = imageDe(carte);
  if (!src) return Promise.reject(new Error('Image de la carte indisponible'));
  if (!cache.has(src)) {
    const p = fetch(src).then(r => { if (!r.ok) throw new Error('Image introuvable'); return r.blob(); })
      .then(b => createImageBitmap(b))
      .then(bmp => new Promise((resolve, reject) => {
        const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
        c.getContext('2d').drawImage(bmp, 0, 0);
        c.toBlob(b => b ? resolve(b) : reject(new Error('Conversion impossible')), 'image/png');
      }));
    p.catch(() => cache.delete(src));
    cache.set(src, p);
  }
  return cache.get(src);
}

const peutCopier = () => !!(navigator.clipboard?.write && window.ClipboardItem && isSecureContext);
const tactile = () => matchMedia('(pointer: coarse)').matches;
const peutPartager = () => tactile() && !!navigator.canShare?.({ files: [new File([''], 'carte.png', { type: 'image/png' })] });

export async function copier(carte) {
  try {
    // Safari : le ClipboardItem doit être créé tout de suite (dans le clic), avec la promesse de l'image
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png(carte) })]);
    message(tactile() ? 'Carte copiée ✔' : 'Carte copiée ✔ (colle-la avec Ctrl+V)');
  } catch {
    message('Copie impossible ici : utilise « Enregistrer »', true);
  }
}

export async function enregistrer(carte) {
  try {
    const b = await png(carte);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = nomFichier(carte);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  } catch {
    message('Image de la carte indisponible', true);
  }
}

export async function partager(carte) {
  try {
    const b = await png(carte);
    await navigator.share({ files: [new File([b], nomFichier(carte), { type: 'image/png' })], title: carte.nom });
  } catch (e) {
    if (e?.name !== 'AbortError') message('Partage impossible : utilise « Enregistrer »', true);
  }
}

/** Boutons sous la carte agrandie : Partager (téléphone), Copier, Enregistrer. null si la carte n'a pas d'image. */
export function boutons(carte) {
  if (!imageDe(carte)) return null;
  png(carte).catch(() => {}); // préparé d'avance
  const b = document.createElement('div'); b.className = 'copie-boutons';
  const ajouter = (texte, action) => {
    const x = document.createElement('button'); x.type = 'button'; x.textContent = texte;
    x.onclick = e => { e.stopPropagation(); action(carte); };
    b.appendChild(x);
  };
  if (peutPartager()) ajouter('📤 Partager', partager);
  if (peutCopier()) ajouter('📋 Copier', copier);
  ajouter('💾 Enregistrer', enregistrer);
  b.addEventListener('click', e => e.stopPropagation()); // un clic entre les boutons ne referme pas la loupe
  return b;
}

// ---- Menu du clic droit ----
let menuOuvert = null;
function fermerMenu() { menuOuvert?.remove(); menuOuvert = null; }
addEventListener('pointerdown', e => { if (menuOuvert && !menuOuvert.contains(e.target)) fermerMenu(); }, true);
addEventListener('keydown', e => { if (e.key === 'Escape') fermerMenu(); });
addEventListener('scroll', fermerMenu, true);
addEventListener('blur', fermerMenu);

/** Clic droit sur la carte → menu « Copier la carte / Enregistrer l'image » (+ « Agrandir » si agrandir est donné). */
export function menuClicDroit(el, carte, { agrandir = null } = {}) {
  if (!imageDe(carte)) return;
  el.addEventListener('contextmenu', e => {
    e.preventDefault(); e.stopPropagation();
    fermerMenu();
    const m = document.createElement('div'); m.className = 'copie-menu';
    const ajouter = (texte, action) => {
      const x = document.createElement('button'); x.type = 'button'; x.textContent = texte;
      x.onclick = ev => { ev.stopPropagation(); fermerMenu(); action(); };
      m.appendChild(x);
    };
    if (peutCopier()) ajouter('📋 Copier la carte', () => copier(carte));
    ajouter('💾 Enregistrer l’image', () => enregistrer(carte));
    if (agrandir) ajouter('🔍 Agrandir', agrandir);
    m.addEventListener('click', ev => ev.stopPropagation());
    document.body.appendChild(m);
    const r = m.getBoundingClientRect();
    m.style.left = Math.min(e.clientX, innerWidth - r.width - 8) + 'px';
    m.style.top = Math.min(e.clientY, innerHeight - r.height - 8) + 'px';
    menuOuvert = m;
    png(carte).catch(() => {}); // prêt avant le clic sur « Copier »
  });
}

// ---- Petit message en bas de l'écran ----
let bulle = null, minuteur = 0;
function message(texte, erreur = false) {
  bulle ??= Object.assign(document.createElement('div'), { className: 'copie-message' });
  bulle.textContent = texte;
  bulle.classList.toggle('erreur', erreur);
  document.body.appendChild(bulle);
  bulle.classList.remove('visible'); void bulle.offsetWidth; bulle.classList.add('visible');
  clearTimeout(minuteur);
  minuteur = setTimeout(() => bulle.classList.remove('visible'), 2200);
}
