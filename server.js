// Serveur de l'application E.S.Bougara — Kick-Boxing
// Sert le site (dossier public/) et fournit une API pour lire/écrire les données du club
// dans une vraie base de données (MongoDB Atlas), afin que les informations restent
// enregistrées durablement, même après fermeture du navigateur ou redémarrage du serveur.

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERREUR : la variable d\'environnement MONGODB_URI est manquante.');
  console.error('Ajoutez-la dans les "Environment Variables" de votre service Render.');
}

mongoose.connect(MONGODB_URI, {})
  .then(() => console.log('Connecté à MongoDB avec succès.'))
  .catch(err => console.error('Erreur de connexion à MongoDB :', err.message));

// Un seul document est utilisé pour stocker toutes les données du club
// (judokas, séances, archives, réglages) sous forme d'un objet JSON unique.
const ClubDataSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'club-data-kick' },
  value: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now }
});
const ClubData = mongoose.model('ClubData', ClubDataSchema);

app.use(express.json({ limit: '15mb' })); // 15mb pour autoriser les photos des judokas
app.use(express.static(path.join(__dirname, 'public')));

// Récupérer les données du club
app.get('/api/data', async (req, res) => {
  try {
    const doc = await ClubData.findOne({ key: 'club-data-kick' });
    res.json(doc ? doc.value : null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur de lecture des données.' });
  }
});

// Fiche publique d'un athlète (accessible sans connexion, via le QR code de sa carte).
// Ne renvoie QUE des informations non sensibles : nom, prénom, photo, sexe, catégorie.
// Ne renvoie JAMAIS : téléphone du tuteur, copies de documents, groupe sanguin, statut assurance...
app.get('/api/athlete/:id', async (req, res) => {
  try {
    const doc = await ClubData.findOne({ key: 'club-data-kick' });
    const wrestlers = (doc && doc.value && doc.value.wrestlers) || [];
    const w = wrestlers.find(x => x.id === req.params.id);
    if (!w) return res.status(404).json({ error: 'Introuvable' });
    const refYear = (doc.value.settings && doc.value.settings.refYear) || new Date().getFullYear();
    res.json({
      nom: w.nom,
      prenom: w.prenom,
      sexe: w.sexe,
      photo: w.photo || null,
      categorie: categorizeLabel(w.dateNaissance, refYear, w.discipline)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur de lecture.' });
  }
});

// Reproduit exactement la logique de catégorisation par âge/spécialité utilisée côté client (voir categorize() dans index.html).
const CATS_RING = [
  { min: 14, max: 15, label: 'RING — Younger Juniors (YJ) — أشبال' },
  { min: 16, max: 17, label: 'RING — Older Juniors (OJ) — أواسط' },
  { min: 18, max: 999, label: 'RING — Seniors (S) — أكابر' }
];
const CATS_TATAMI = [
  { min: 6, max: 8, label: 'TATAMI — Children (CH) — براعم' },
  { min: 9, max: 11, label: 'TATAMI — Younger Cadets (YC) — أصاغر' },
  { min: 12, max: 14, label: 'TATAMI — Older Cadets (OC) — أشبال' },
  { min: 15, max: 17, label: 'TATAMI — Juniors (J) — أواسط' },
  { min: 18, max: 999, label: 'TATAMI — Seniors (S) — أكابر' }
];
function categorizeLabel(dateNaissanceISO, refYear, discipline) {
  const table = discipline === 'ring' ? CATS_RING : (discipline === 'tatami' ? CATS_TATAMI : null);
  if (!table || !dateNaissanceISO) return '—';
  const y = parseInt(dateNaissanceISO.slice(0, 4), 10);
  const diff = refYear - y;
  const found = table.find(c => diff >= c.min && diff <= c.max);
  return found ? found.label : '—';
}

// Enregistrer les données du club (remplace l'ensemble du document)
app.post('/api/data', async (req, res) => {
  try {
    await ClubData.findOneAndUpdate(
      { key: 'club-data-kick' },
      { value: req.body, updatedAt: new Date() },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur d\'enregistrement des données.' });
  }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`Serveur E.S.Bougara Kick-Boxing démarré sur le port ${PORT}`);
});
