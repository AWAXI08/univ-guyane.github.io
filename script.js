const champ = document.querySelector('#cle');
const statut = document.querySelector('#statut');
const recherche = document.querySelector('#recherche');
const zone = document.querySelector('main');
const espaces = Array.from(document.querySelectorAll('[data-dossier]'));
let version = 0;

function normaliser(texte) {
  return texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function filtrerEspaces() {
  const filtre = normaliser(recherche.value.trim());
  let total = 0;
  for (const espace of espaces) {
    const texte = normaliser(`${espace.textContent} ${espace.dataset.dossier}`);
    espace.parentElement.hidden = !texte.includes(filtre);
    if (!espace.parentElement.hidden) {
      total += 1;
    }
  }
  document.querySelector('#aucun-resultat').hidden = total !== 0;
}

function decoder(base64) {
  return Uint8Array.from(atob(base64), lettre => lettre.charCodeAt(0));
}

function masquer() {
  const titres = Array.from(document.querySelectorAll('[data-chiffre]'));
  for (const titre of titres) {
    if (titre.dataset.dossier) {
      titre.textContent = titre.dataset.dossier;
    } else {
      titre.textContent = titre.dataset.chiffre.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
    }
  }
  filtrerEspaces();
  return titres;
}

async function dechiffrer() {
  const demande = ++version;
  const titres = masquer();
  statut.textContent = '';
  champ.removeAttribute('aria-invalid');
  if (!champ.value.trim()) {
    return;
  }
  try {
    if (!globalThis.crypto?.subtle) {
      throw new Error('Ouvrez la page sur HTTPS ou localhost.');
    }
    const octets = decoder(champ.value.trim());
    if (octets.length !== 32) {
      throw new Error('Clé invalide.');
    }
    const cle = await crypto.subtle.importKey('raw', octets, 'AES-GCM', false, ['decrypt']);
    const resultats = await Promise.allSettled(titres.map(async titre => {
      const texte = await crypto.subtle.decrypt({
        name: 'AES-GCM',
        iv: decoder(titre.dataset.iv),
        additionalData: new TextEncoder().encode(titre.dataset.id)
      }, cle, decoder(titre.dataset.chiffre));
      return new TextDecoder('utf-8', { fatal: true }).decode(texte);
    }));
    if (demande !== version) {
      return;
    }
    let total = 0;
    resultats.forEach((resultat, index) => {
      if (resultat.status === 'fulfilled') {
        titres[index].textContent = resultat.value;
        total += 1;
      }
    });
    filtrerEspaces();
    statut.textContent = `${total} textes déchiffrés sur ${titres.length}.`;
    if (total === 0) {
      champ.setAttribute('aria-invalid', 'true');
      statut.textContent = 'Clé incorrecte ou données chiffrées invalides.';
    }
  } catch (erreur) {
    if (demande === version) {
      champ.setAttribute('aria-invalid', 'true');
      statut.textContent = erreur.message;
    }
  }
}

async function chargerContribution(espace) {
  const dossier = new URL(`contributions/${espace.dataset.dossier}/`, location.href);
  const reponse = await fetch(new URL('index.html', dossier), { cache: 'no-store' });
  if (!reponse.ok) {
    throw new Error(`Contribution indisponible : ${espace.dataset.dossier}.`);
  }
  const contenu = await reponse.text();
  if (contenu.trim() === '') {
    return null;
  }
  const section = document.createElement('section');
  const identite = document.createElement('div');
  identite.className = 'identite';
  const titre = espace.cloneNode(true);
  titre.textContent = espace.dataset.dossier;
  identite.append(titre, espace.nextElementSibling.cloneNode(true));
  const cadre = document.createElement('iframe');
  cadre.title = `Contribution ${espace.dataset.dossier}`;
  cadre.loading = 'lazy';
  cadre.setAttribute('sandbox', 'allow-scripts');
  cadre.srcdoc = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="${dossier.href}">
<link rel="stylesheet" href="style.css">
</head>
<body>${contenu}</body>
</html>`;
  section.append(identite, cadre);
  return section;
}

async function chargerFrise() {
  try {
    const sections = await Promise.all(espaces.map(chargerContribution));
    for (const section of sections) {
      if (section) {
        zone.append(section);
      }
    }
    await dechiffrer();
  } catch (erreur) {
    const message = document.querySelector('#erreur');
    message.textContent = erreur.message;
    message.hidden = false;
  }
}

recherche.addEventListener('input', filtrerEspaces);
champ.addEventListener('input', dechiffrer);
window.addEventListener('pageshow', dechiffrer);
window.addEventListener('pagehide', () => {
  version += 1;
  champ.value = '';
  masquer();
});

chargerFrise();
