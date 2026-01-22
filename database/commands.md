# Commandes SQL (Draw-Arena)

Petite collection de requêtes SQL utiles pour analyser les concours.

## Sommaire

- [Classement des clubs (moyenne)](#classement-des-clubs-moyenne)
- [Classement des clubs (meilleur dessin)](#classement-des-clubs-meilleur-dessin)
- [Top 3 compétiteurs par concours](#top-3-comp%C3%A9titeurs-par-concours)

## Classement des clubs (moyenne)

Classe les clubs par concours selon la **note moyenne** de leurs dessins (en utilisant des fonctions fenêtre pour le ranking).

```sql
WITH dessin_score AS (
  SELECT
    d.num_dessin,
    d.num_concours,
    d.num_competiteur,
    AVG(e.note) AS score_moyen_dessin
  FROM Dessin d
  JOIN Evaluation e ON e.num_dessin = d.num_dessin
  GROUP BY d.num_dessin, d.num_concours, d.num_competiteur
),
club_score_concours AS (
  SELECT
    ds.num_concours,
    u.num_club,
    COUNT(*) AS nb_dessins_notes,
    AVG(ds.score_moyen_dessin) AS score_moyen_club
  FROM dessin_score ds
  JOIN Utilisateur u ON u.num_utilisateur = ds.num_competiteur
  GROUP BY ds.num_concours, u.num_club
)
SELECT
  c.num_concours,
  c.theme,
  cl.nom_club,
  csc.nb_dessins_notes,
  ROUND(csc.score_moyen_club, 2) AS score_moyen_club,
  DENSE_RANK() OVER (PARTITION BY c.num_concours ORDER BY csc.score_moyen_club DESC) AS rang_dans_concours
FROM club_score_concours csc
JOIN Concours c ON c.num_concours = csc.num_concours
JOIN Club cl ON cl.num_club = csc.num_club
ORDER BY c.num_concours, rang_dans_concours, cl.nom_club;
```

## Classement des clubs (meilleur dessin)

Classe les clubs par concours selon la **meilleure note moyenne d’un dessin** du club (avec un tie-break sur la moyenne du club).

```sql
WITH dessin_moyenne AS (
  SELECT
    d.num_concours,
    u.num_club,
    d.num_dessin,
    AVG(e.note) AS note_moy_dessin
  FROM Dessin d
  JOIN Evaluation e ON e.num_dessin = d.num_dessin
  JOIN Utilisateur u ON u.num_utilisateur = d.num_competiteur
  GROUP BY d.num_concours, u.num_club, d.num_dessin
),
club_stats AS (
  SELECT
    num_concours,
    num_club,
    COUNT(*) AS nb_dessins_notes,
    MAX(note_moy_dessin) AS meilleure_note_dessin,
    AVG(note_moy_dessin) AS moyenne_club
  FROM dessin_moyenne
  GROUP BY num_concours, num_club
)
SELECT
  c.num_concours,
  c.theme,
  cl.nom_club,
  cs.nb_dessins_notes,
  ROUND(cs.meilleure_note_dessin, 2) AS meilleure_note_dessin,
  ROUND(cs.moyenne_club, 2) AS moyenne_club,
  DENSE_RANK() OVER (
    PARTITION BY c.num_concours
    ORDER BY cs.meilleure_note_dessin DESC, cs.moyenne_club DESC
  ) AS rang_dans_concours
FROM club_stats cs
JOIN Concours c ON c.num_concours = cs.num_concours
JOIN Club cl ON cl.num_club = cs.num_club
ORDER BY c.num_concours, rang_dans_concours, cl.nom_club;
```

## Top 3 compétiteurs par concours

Liste les **3 meilleurs compétiteurs** par concours (au moins un dessin évalué), avec leur note moyenne et leur nombre de dessins.

```sql
WITH score_competiteur AS (
  SELECT
    d.num_concours,
    d.num_competiteur,
    AVG(e.note) AS moyenne_note,
    COUNT(DISTINCT d.num_dessin) AS nb_dessins
  FROM Dessin d
  JOIN Evaluation e ON e.num_dessin = d.num_dessin
  GROUP BY d.num_concours, d.num_competiteur
),
ranked AS (
  SELECT
    sc.*,
    ROW_NUMBER() OVER (
      PARTITION BY sc.num_concours
      ORDER BY sc.moyenne_note DESC, sc.nb_dessins DESC
    ) AS rang
  FROM score_competiteur sc
)
SELECT
  r.num_concours,
  c.theme,
  r.rang,
  u.nom,
  u.prenom,
  cl.nom_club,
  ROUND(r.moyenne_note, 2) AS moyenne_note,
  r.nb_dessins
FROM ranked r
JOIN Concours c ON c.num_concours = r.num_concours
JOIN Utilisateur u ON u.num_utilisateur = r.num_competiteur
JOIN Club cl ON cl.num_club = u.num_club
WHERE r.rang <= 3
ORDER BY r.num_concours, r.rang;
```