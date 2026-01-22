# Commandes SQL (Draw-Arena)

Petite collection de requêtes SQL utiles pour analyser les concours.

## Sommaire

- [Compétiteurs par concours (filtre année)](#comp%C3%A9titeurs-par-concours-filtre-ann%C3%A9e)
- [Dessins évalués (filtre année)](#dessins-%C3%A9valu%C3%A9s-filtre-ann%C3%A9e)
- [Détail des évaluations (dessin + évaluateur)](#d%C3%A9tail-des-%C3%A9valuations-dessin--%C3%A9valuateur)
- [Compétiteurs présents à tous les concours](#comp%C3%A9titeurs-pr%C3%A9sents-%C3%A0-tous-les-concours)
- [Région avec la meilleure moyenne](#r%C3%A9gion-avec-la-meilleure-moyenne)
- [Classement des clubs (dessins évalués par concours)](#classement-des-clubs-dessins-%C3%A9valu%C3%A9s-par-concours)
- [Classement des clubs (meilleur dessin)](#classement-des-clubs-meilleur-dessin)
- [Meilleur compétiteur par concours](#meilleur-comp%C3%A9titeur-par-concours)

## Compétiteurs par concours (filtre année)

Liste les compétiteurs inscrits à des concours sur une année donnée, avec leurs infos (dont l’âge), le concours et le club.

```sql
SELECT
  u.nom,
  u.prenom,
  u.adresse,
  u.age,
  c.theme,
  c.date_debut,
  c.date_fin,
  cl.nom_club,
  cl.departement,
  cl.region
FROM Concours c
JOIN Concours_Competiteur cc ON cc.num_concours = c.num_concours
JOIN Competiteur comp ON comp.num_competiteur = cc.num_competiteur
JOIN Utilisateur u ON u.num_utilisateur = comp.num_competiteur
JOIN Club cl ON cl.num_club = u.num_club
WHERE YEAR(c.date_debut) = 2024
ORDER BY c.num_concours, cl.nom_club, u.nom, u.prenom;
```

## Dessins évalués (filtre année)

Liste les dessins évalués avec leur note, le compétiteur et les infos du concours, filtré sur l’année de l’évaluation.

```sql
SELECT
  d.num_dessin,
  e.note,
  u.nom,
  u.prenom,
  c.theme,
  c.description,
  e.date_evaluation
FROM Dessin d
JOIN Evaluation e ON e.num_dessin = d.num_dessin
JOIN Utilisateur u ON u.num_utilisateur = d.num_competiteur
JOIN Concours c ON c.num_concours = d.num_concours
WHERE YEAR(e.date_evaluation) = 2024
ORDER BY e.note ASC;
```

## Détail des évaluations (dessin + évaluateur)

Affiche le détail des évaluations : dessin, note, commentaires, compétiteur, évaluateur, et infos du concours.

```sql
SELECT
  d.num_dessin,
  e.date_evaluation,
  c.theme,
  c.description,
  uc.nom AS nom_competiteur,
  uc.prenom AS prenom_competiteur,
  d.commentaire AS commentaire_dessin,
  e.note,
  e.commentaire AS commentaire_evaluation,
  ue.nom AS nom_evaluateur,
  ue.prenom AS prenom_evaluateur
FROM Dessin d
JOIN Evaluation e ON e.num_dessin = d.num_dessin
JOIN Concours c ON c.num_concours = d.num_concours
JOIN Utilisateur uc ON uc.num_utilisateur = d.num_competiteur
JOIN Utilisateur ue ON ue.num_utilisateur = e.num_evaluateur
ORDER BY c.num_concours, d.num_dessin, e.date_evaluation, e.num_evaluateur;
```

## Compétiteurs présents à tous les concours

Trouve les compétiteurs qui ont participé à **tous** les concours (requête type “division relationnelle”).

```sql
SELECT
  u.nom,
  u.prenom,
  u.age
FROM Utilisateur u
JOIN Competiteur comp ON comp.num_competiteur = u.num_utilisateur
WHERE NOT EXISTS (
  SELECT *
  FROM Concours c
  WHERE NOT EXISTS (
    SELECT *
    FROM Concours_Competiteur cc
    WHERE cc.num_competiteur = comp.num_competiteur
      AND cc.num_concours = c.num_concours
  )
)
ORDER BY u.age ASC, u.nom, u.prenom;
```

## Région avec la meilleure moyenne

Trouve la/les région(s) dont les compétiteurs ont la **meilleure moyenne de notes** sur les dessins évalués.

```sql
SELECT
  cl.region,
  AVG(e.note) AS moyenne
FROM Evaluation e
JOIN Dessin d ON d.num_dessin = e.num_dessin
JOIN Utilisateur u ON u.num_utilisateur = d.num_competiteur
JOIN Club cl ON cl.num_club = u.num_club
GROUP BY cl.region
HAVING AVG(e.note) >= ALL (
  SELECT AVG(e2.note)
  FROM Evaluation e2
  JOIN Dessin d2 ON d2.num_dessin = e2.num_dessin
  JOIN Utilisateur u2 ON u2.num_utilisateur = d2.num_competiteur
  JOIN Club cl2 ON cl2.num_club = u2.num_club
  GROUP BY cl2.region
);
```

## Classement des clubs (dessins évalués par concours)

Compte, pour chaque concours, le **nombre de dessins évalués** par club.

Utile pour voir quels clubs ont le plus de dessins effectivement notés dans un concours donné (ce n'est pas une moyenne de notes, mais un volume de dessins évalués).

```sql
SELECT
  c.num_concours,
  c.theme,
  cl.nom_club,
  COUNT(DISTINCT d.num_dessin) AS nb_dessins_evalues
FROM Concours c
JOIN Dessin d ON d.num_concours = c.num_concours
JOIN Evaluation e ON e.num_dessin = d.num_dessin
JOIN Utilisateur u ON u.num_utilisateur = d.num_competiteur
JOIN Club cl ON cl.num_club = u.num_club
GROUP BY c.num_concours, c.theme, cl.nom_club
ORDER BY c.num_concours, nb_dessins_evalues DESC;
```

## Classement des clubs (meilleur dessin)

Donne, pour chaque club, la **meilleure note obtenue** sur un dessin (maximum des notes parmi toutes les évaluations associées aux dessins des compétiteurs du club).

Remarque : si un dessin a plusieurs évaluations, on prend ici le maximum parmi ces évaluations (ce n'est pas une moyenne par dessin).

```sql
SELECT
  cl.nom_club,
  MAX(e.note) AS meilleure_note
FROM Evaluation e
JOIN Dessin d ON d.num_dessin = e.num_dessin
JOIN Utilisateur u ON u.num_utilisateur = d.num_competiteur
JOIN Club cl ON cl.num_club = u.num_club
GROUP BY cl.nom_club
ORDER BY meilleure_note DESC;
```

## Meilleur compétiteur par concours

Calcule, pour chaque concours, le compétiteur classé n°1 selon :

- la **moyenne** des notes de ses dessins évalués dans le concours (desc)
- puis le **nombre de dessins** évalués (desc) en cas d'égalité

```sql
SELECT
  r.num_concours,
  c.theme,
  u.nom,
  u.prenom,
  cl.nom_club,
  ROUND(r.moyenne_note, 2) AS moyenne_note,
  r.nb_dessins
FROM (
  SELECT
    d.num_concours,
    d.num_competiteur,
    AVG(e.note) AS moyenne_note,
    COUNT(DISTINCT d.num_dessin) AS nb_dessins,
    ROW_NUMBER() OVER (
      PARTITION BY d.num_concours
      ORDER BY AVG(e.note) DESC, COUNT(DISTINCT d.num_dessin) DESC
    ) AS rang
  FROM Dessin d
  JOIN Evaluation e ON e.num_dessin = d.num_dessin
  GROUP BY d.num_concours, d.num_competiteur
) r
JOIN Concours c ON c.num_concours = r.num_concours
JOIN Utilisateur u ON u.num_utilisateur = r.num_competiteur
JOIN Club cl ON cl.num_club = u.num_club
WHERE r.rang = 1
ORDER BY r.num_concours;
```