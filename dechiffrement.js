const champ = document.querySelector('#cle');
const statut = document.querySelector('#statut');
const titres = Array.from(document.querySelectorAll('main > section > h2'));
const identitesChiffrees = titres.map(titre => titre.textContent.trim());
let version = 0;

function decoder(base64) {
  return Uint8Array.from(atob(base64), caractere => caractere.charCodeAt(0));
}

function masquer() {
  titres.forEach((titre, index) => {
    titre.textContent = identitesChiffrees[index];
  });
}

async function dechiffrer() {
  const demande = ++version;
  masquer();
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
      throw new Error('La clé doit contenir 32 octets encodés en Base64.');
    }

    const cle = await crypto.subtle.importKey('raw', octets, 'AES-GCM', false, ['decrypt']);
    const resultats = await Promise.allSettled(titres.map(async (titre, index) => {
      const texte = await crypto.subtle.decrypt({
        name: 'AES-GCM',
        iv: decoder(titre.dataset.iv),
        additionalData: new TextEncoder().encode(titre.closest('section').id)
      }, cle, decoder(identitesChiffrees[index]));

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

    statut.textContent = `${total} identités déchiffrées sur ${titres.length}.`;
    if (total === 0) {
      champ.setAttribute('aria-invalid', 'true');
      statut.textContent = 'Clé incorrecte ou données chiffrées invalides.';
    }
  } catch (erreur) {
    if (demande === version) {
      champ.setAttribute('aria-invalid', 'true');
      statut.textContent = 'Clé invalide ou déchiffrement indisponible.';
      if (erreur instanceof Error && erreur.message.startsWith('Ouvrez')) {
        statut.textContent = erreur.message;
      }
    }
  }
}

champ.addEventListener('input', dechiffrer);
window.addEventListener('pageshow', dechiffrer);
window.addEventListener('pagehide', () => {
  version += 1;
  champ.value = '';
  masquer();
});
