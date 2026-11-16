// Fabrique le recto ou le verso d'une carte (styles dans cartes.css).

export const CLASSES = {
  'Commune': 'r-commune', 'Peu commune': 'r-peu-commune', 'Rare': 'r-rare',
  'Épique': 'r-epique', 'Légendaire': 'r-legendaire', 'Unique': 'r-unique',
};
export const COULEURS = {
  'Commune': '#d99a5e', 'Peu commune': '#dfe3e8', 'Rare': '#ffd23f',
  'Épique': '#7fd8ff', 'Légendaire': '#ff7ad9', 'Unique': '#ffffff',
};
const ICONES = {
  Personnage: '👤', Moment: '⚡', Référence: '💬', Commande: '❗', Jeu: '🎮',
  Programme: '📺', Lieu: '📍', Objet: '🎁', Plateforme: '📱',
};

function el(tag, classe, texte) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texte != null) e.textContent = texte;
  return e;
}

const LOGO = 'logo-anthologie.png'; // dans illustrations/, sur fond noir (pied du I remonté au niveau du G)

const NACRE =['#ffffff', '#ffffff', '#e4d4ff', '#c9f1ff', '#ffe3f1'];
const PAILLETTES_OR = ['#ffffff', '#fff6c8', '#ffe27a'];
const ECLATS_DIAMANT = ['#ffffff', '#ffffff', '#d8f7ff', '#a8ecff'];
const ECLATS_NEON = ['#ffffff', '#ff2bd6', '#00e5ff', '#c6ff3d', '#ffffff', '#ffb800'];

// nb points dont `eclats` étoiles à 4 branches (taille max en em)
function ciel(nb, eclats, teintes = NACRE, tailleEclat = 1.4) {
  const zone = el('div', 'etoiles');
  for (let i = 0; i < nb; i++) {
    const grand = i < eclats;
    const s = el('i', grand ? 'eclat' : 'etoile');
    const taille = grand ? 0.5 + Math.random() * (tailleEclat - 0.5) : 0.05 + Math.random() * 0.14; // en em
    const teinte = teintes[i % teintes.length];
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${taille}em;height:${taille}em;` +
      `--d:${(grand ? 2.2 + Math.random() * 3 : 0.8 + Math.random() * 2.2).toFixed(2)}s;--c:${teinte};` +
      `animation-delay:${(-Math.random() * 5).toFixed(2)}s` + (grand ? `;filter:drop-shadow(0 0 .3em ${teinte})` : '');
    zone.appendChild(s);
  }
  return zone;
}

// Titre : la plus grande taille (1.25em au plus, .8em au moins) qui tient sur une ligne ; sinon deux lignes.
// Recalculé quand la carte est affichée ou change de taille, et une fois la police chargée.
// Version S : titre plus grand (il est écrit directement sur l'illustration).
const TITRE_MAX = 1.25, TITRE_MIN = .8, TITRE_MAX_S = 1.75, TITRE_MIN_S = 1.1;
const observateur = typeof ResizeObserver === 'undefined' ? null
  : new ResizeObserver(entrees => entrees.forEach(e => (e.target.classList.contains('desc') ? calerDescription : calerTitre)(e.target)));
function calerTitre(nom) {
  if (!nom.clientWidth) return;
  const s = !!nom.closest('.carte.s'), MAX = s ? TITRE_MAX_S : TITRE_MAX, MIN = s ? TITRE_MIN_S : TITRE_MIN;
  nom.classList.remove('deux-lignes');
  nom.style.fontSize = MAX + 'em';
  if (nom.scrollWidth <= nom.clientWidth) return;
  let t = Math.max(MIN, Math.floor(MAX * nom.clientWidth / nom.scrollWidth * 100) / 100);
  nom.style.fontSize = t + 'em';
  while (nom.scrollWidth > nom.clientWidth && t > MIN) { t = Math.round((t - .01) * 100) / 100; nom.style.fontSize = t + 'em'; }
  if (nom.scrollWidth > nom.clientWidth) nom.classList.add('deux-lignes');
}
function ajusterTitre(nom) {
  observateur?.observe(nom);
  document.fonts?.load('800 1em "Barlow Condensed"').then(() => calerTitre(nom), () => {});
}

// Description : la carte garde toujours sa taille ; un texte trop long pour son cadre est écrit plus petit
// (.72em normalement, .5em au moins). La classe « reduite » le signale (filtre de la galerie).
const DESC_MAX = .72, DESC_MIN = .5;
function calerDescription(desc) {
  if (!desc.clientHeight) return;
  desc.style.fontSize = DESC_MAX + 'em';
  let t = DESC_MAX;
  while (desc.scrollHeight > desc.clientHeight && t > DESC_MIN) { t = Math.round((t - .01) * 100) / 100; desc.style.fontSize = t + 'em'; }
  desc.classList.toggle('reduite', t < DESC_MAX);
}

/** Une carte peut-elle exister en version S ? (ni l'Unique, ni les secrètes) */
export const peutEtreS = carte => carte.rarete !== 'Unique' && !carte.secrete;

/** Recto. total = nombre de cartes de la saison (pour « 12/32 ») ; s = version S (évolution), aussi demandée par carte.versionS. */
export function recto(carte, { largeur = 300, total = null, s = carte.versionS } = {}) {
  const unique = carte.rarete === 'Unique';
  const secrete = !!carte.secrete;
  s = !!s && peutEtreS(carte);
  const c = el('div', `carte ${secrete ? 'r-secrete' : `${CLASSES[carte.rarete] || 'r-commune'}${unique ? '' : ' metal'}`}${s ? ' s' : ''}`);
  c.style.setProperty('--w', largeur + 'px');
  const inn = el('div', 'in');
  c.appendChild(inn);

  if (unique) {
    const f2 = el('i', 'filante f2');
    inn.append(el('div', 'rayons'), ciel(150, 20, NACRE, 1.8), el('i', 'filante'), f2);
  }
  if (carte.rarete === 'Rare') inn.appendChild(ciel(0, 7, PAILLETTES_OR, 1.2));
  if (carte.rarete === 'Épique') inn.append(el('div', 'prisme'), ciel(14, 16, ECLATS_DIAMANT, 1.6));
  if (carte.rarete === 'Légendaire') inn.append(el('div', 'holo-lignes'), ciel(0, 12, ECLATS_NEON, 1.4));
  if (secrete) inn.appendChild(ciel(0, 9, PAILLETTES_OR, 1.3));

  const haut = el('div', 'haut panneau');
  const nom = el('span', 'nom', carte.nom);
  haut.appendChild(nom);
  if (s) haut.appendChild(el('span', 's-logo', 'S'));
  inn.appendChild(haut);
  ajusterTitre(nom);

  const img = el('div', 'img');
  if (carte.illustration) {
    const i = el('img');
    i.src = 'illustrations/' + encodeURIComponent(carte.illustration);
    i.alt = carte.nom;
    // Cadrage facultatif d'un visuel pas carré : { "zoom": 1.4, "x": 50, "y": 5 } (point fixe en %)
    if (carte.cadrage) {
      const { zoom = 1, x = 50, y = 0 } = carte.cadrage;
      i.style.objectPosition = `${x}% ${y}%`;
      i.style.transformOrigin = `${x}% ${y}%`;
      i.style.transform = `scale(${zoom})`;
    }
    img.appendChild(i);
  } else {
    const a = el('div', 'attente');
    a.append(el('span', null, ICONES[carte.categorie] || '✦'), el('div', null, 'Visuel à venir'));
    img.appendChild(a);
  }
  const famille = !carte.famille ? null : el('div', 'famille', `${carte.familleEmoji || '✦'} ${carte.famille} · ${carte.secrete ? 'secrète' : `${carte.familleRang}/${carte.familleTotal}`}`);
  inn.appendChild(img);
  // Version S : l'illustration remplit la carte ; la famille quitte l'image pour se poser au-dessus de la description
  if (s) { inn.appendChild(el('div', 's-espace')); if (famille) inn.appendChild(famille); }
  else if (famille) img.appendChild(famille);

  if (carte.description) {
    const desc = el('div', 'desc panneau', carte.description);
    inn.appendChild(desc);
    observateur?.observe(desc);
    document.fonts?.ready.then(() => calerDescription(desc), () => {});
  } else inn.appendChild(el('div', 'vide'));

  const bas = el('div', 'bas');
  bas.append(el('span', 'categorie', carte.categorie), el('span', 'pastille', secrete ? 'Secrète' : carte.rarete),
             el('span', null, carte.rarete === 'Unique' ? 'Exemplaire unique' : carte.secrete ? 'Secrète' : `${s ? 'S ' : ''}${carte.numero}${total ? '/' + total : ''}`));
  inn.appendChild(bas);
  if (s) inn.appendChild(el('div', 's-grave'));

  // Comme dans MVP : reflet fixe sur le métal, balayage animé réservé aux cartes « brillantes »
  if (carte.rarete === 'Peu commune') inn.appendChild(el('div', 'reflet'));
  if (secrete || ['Rare', 'Épique', 'Légendaire', 'Unique'].includes(carte.rarete)) inn.appendChild(el('div', 'balayage'));
  // Sur le métal, le balayage en « overlay » ne laisse aucune trace sur le noir : on le double sur l'image en « screen »,
  if (['Rare', 'Épique', 'Légendaire'].includes(carte.rarete)) img.appendChild(el('div', 'balayage-img'));
  return c;
}

/** Verso commun à toutes les cartes. */
export function verso({ largeur = 300, nomJeu = 'Cartes de la commu' } = {}) {
  const c = el('div', 'carte verso');
  c.style.setProperty('--w', largeur + 'px');
  const inn = el('div', 'in');
  const logo = el('img', 'logo');
  logo.src = 'illustrations/' + encodeURIComponent(LOGO);
  logo.alt = nomJeu;
  inn.append(logo, el('div', 'signature', '@anthodurire'), el('div', 'balayage'));
  c.appendChild(inn);
  return c;
}

/** Booster : visuel du sachet (illustrations/booster-sachet.webp, « 5 cartes » écrit dans l'image).
 *  La languette (jusqu'aux pointillés) se détache à l'ouverture. nbCartes n'est plus affiché : refaire le visuel s'il change. */
export function booster({ largeur = 300, nomJeu = 'Cartes de la commu' } = {}) {
  const p = el('div', 'paquet');
  p.style.setProperty('--w', largeur + 'px');
  p.setAttribute('role', 'img');
  p.setAttribute('aria-label', `Booster ${nomJeu}`);
  const lang = el('div', 'languette');
  lang.appendChild(el('div', 'lustre'));
  const corps = el('div', 'corps');
  corps.appendChild(el('div', 'lustre'));
  p.append(corps, lang);
  return p;
}
