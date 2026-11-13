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
const TITRE_MAX = 1.25, TITRE_MIN = .8;
const observateur = typeof ResizeObserver === 'undefined' ? null
  : new ResizeObserver(entrees => entrees.forEach(e => (e.target.classList.contains('desc') ? calerDescription : calerTitre)(e.target)));
function calerTitre(nom) {
  if (!nom.clientWidth) return;
  nom.classList.remove('deux-lignes');
  nom.style.fontSize = TITRE_MAX + 'em';
  if (nom.scrollWidth <= nom.clientWidth) return;
  let t = Math.max(TITRE_MIN, Math.floor(TITRE_MAX * nom.clientWidth / nom.scrollWidth * 100) / 100);
  nom.style.fontSize = t + 'em';
  while (nom.scrollWidth > nom.clientWidth && t > TITRE_MIN) { t = Math.round((t - .01) * 100) / 100; nom.style.fontSize = t + 'em'; }
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

/** Recto. total = nombre de cartes de la saison (pour « 12/32 »). */
export function recto(carte, { largeur = 300, total = null } = {}) {
  const unique = carte.rarete === 'Unique';
  const secrete = !!carte.secrete;
  const c = el('div', `carte ${secrete ? 'r-secrete' : `${CLASSES[carte.rarete] || 'r-commune'}${unique ? '' : ' metal'}`}`);
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
  if (carte.famille) {
    img.appendChild(el('div', 'famille', `${carte.familleEmoji || '✦'} ${carte.famille} · ${carte.secrete ? 'secrète' : `${carte.familleRang}/${carte.familleTotal}`}`));
  }
  inn.appendChild(img);

  if (carte.description) {
    const desc = el('div', 'desc panneau', carte.description);
    inn.appendChild(desc);
    observateur?.observe(desc);
    document.fonts?.ready.then(() => calerDescription(desc), () => {});
  } else inn.appendChild(el('div', 'vide'));

  const bas = el('div', 'bas');
  bas.append(el('span', 'categorie', carte.categorie), el('span', 'pastille', secrete ? 'Secrète' : carte.rarete),
             el('span', null, carte.rarete === 'Unique' ? 'Exemplaire unique' : carte.secrete ? 'Secrète' : `${carte.numero}${total ? '/' + total : ''}`));
  inn.appendChild(bas);

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

// Bord cranté (coupe des soudures) : n dents en haut ou en bas, encoches de déchirure en option
function dents(n, cote) {
  const pts = [];
  for (let i = 0; i <= 2 * n; i++) {
    const x = (i * 50 / n).toFixed(3) + '%';
    pts.push(cote === 'haut' ? `${x} ${i % 2 ? '.45em' : '0'}` : `${x} ${i % 2 ? 'calc(100% - .45em)' : '100%'}`);
  }
  return cote === 'haut' ? pts : pts.reverse();
}

/** Booster : sachet alu soudé en haut et en bas, aux couleurs du verso. La languette se détache à l'ouverture. */
export function booster({ largeur = 300, nomJeu = 'Cartes de la commu', nbCartes = 5 } = {}) {
  const p = el('div', 'paquet');
  p.style.setProperty('--w', largeur + 'px');

  const lang = el('div', 'languette');
  lang.style.clipPath = `polygon(${[...dents(22, 'haut'), '100% 100%', '0 100%'].join(',')})`;
  lang.append(el('div', 'sertissage'), el('div', 'lustre'));

  const corps = el('div', 'corps');
  // Encoches de déchirure sur les côtés, juste sous la languette
  corps.style.clipPath = `polygon(0 0,100% 0,100% .15em,calc(100% - .45em) .6em,100% 1.05em,${dents(22, 'bas').join(',')},0 1.05em,.45em .6em,0 .15em)`;
  const logo = el('img', 'logo');
  logo.src = 'illustrations/' + encodeURIComponent(LOGO);
  logo.alt = nomJeu;
  const gemmes = el('div', 'gemmes');
  for (const r of Object.keys(COULEURS)) {
    const g = el('i', r === 'Légendaire' ? 'arcenciel' : null); // arc-en-ciel comme la carte
    g.style.setProperty('--c', COULEURS[r]); g.title = r; gemmes.appendChild(g);
  }
  const cartouche = el('div', 'cartouche');
  cartouche.append(el('b', null, String(nbCartes)), el('span', null, nbCartes > 1 ? 'cartes' : 'carte'));
  // Trois zones : « Booster » centré dans le vide du haut, le logo, les losanges et « 5 cartes » centrés dans le vide du bas
  const centre = el('div', 'centre');
  centre.append(el('div', 'halo'), logo, el('div', 'signature', '@anthodurire'));
  const pied = el('div', 'pied');
  pied.append(gemmes, cartouche);
  corps.append(el('div', 'cadre'), el('div', 'etiquette', 'Booster'), centre, pied, el('div', 'sertissage bas'), el('div', 'lustre'));

  p.append(corps, lang);
  return p;
}
