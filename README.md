# E.S.Bougara — Kick-Boxing — Gestion du Club

Application jumelle de l'application judo, adaptée pour la section Kick-Boxing.

## Ce qui a été changé par rapport à l'app judo
- "Judoka(s)" → "Athlète(s)" partout dans l'interface
- Catégorie "Baby Judo (Éveil)" → "Baby Kick (Éveil)"
- Champ "اختصاص" (spécialité) sur la carte → "Kick-Boxing"
- Même club (E.S. Bougara), mêmes couleurs, même logo, même design de carte
- Mêmes mots de passe : admin = omar1208, entraîneur = esb2026
- Base de données séparée (clé "club-data-kick") pour ne jamais mélanger les données avec l'app judo

## Déploiement (IMPORTANT : c'est une application à PART ENTIÈRE)
Cette app doit être déployée séparément de l'app judo :
1. Créer un NOUVEAU dépôt GitHub (ex: esb-gestion-club-kick)
2. Créer une NOUVELLE base de données MongoDB Atlas (ou un nouveau cluster/DB) pour le kick-boxing
   — ne pas réutiliser la même URI MongoDB que l'app judo, sinon il faudra gérer 2 apps sur la même base
   (techniquement possible grâce à la clé "club-data-kick", mais plus simple de séparer)
3. Créer un NOUVEAU service Render, connecté à ce nouveau dépôt
4. Ajouter la variable d'environnement MONGODB_URI (nouvelle base)
5. Déployer

## Saison affichée
La saison par défaut est 2026/2027 (réglage refYear=2026). Elle se met à jour depuis le site
lui-même, dans l'onglet "Réglages" → bouton "Archiver et démarrer la saison suivante" —
pas besoin de modifier le code chaque année.
