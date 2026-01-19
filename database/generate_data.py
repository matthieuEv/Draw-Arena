#!/usr/bin/env python3
"""
Script pour générer la suite du fichier insertion.sql avec les concours, dessins et évaluations
"""

# =============================================================================
# CONCOURS (8 concours sur 2024 et 2025, 1 par saison)
# =============================================================================
concours_data = """
-- =============================================================================
-- CONCOURS (8 concours, 4 par année sur 2024 et 2025)
-- =============================================================================
INSERT INTO Concours (theme, date_debut, date_fin, description, etat, num_club, num_president) VALUES
('Nature et Printemps', '2024-03-01', '2024-05-31', 'Concours du printemps 2024 sur le thème de la nature', 'evalue', NULL, 1),
('Ville en Été', '2024-06-01', '2024-08-31', 'Concours de l''été 2024 sur le thème de la ville', 'evalue', NULL, 2),
('Portraits d''Automne', '2024-09-01', '2024-11-30', 'Concours de l''automne 2024 sur le portrait', 'evalue', NULL, 3),
('Abstrait d''Hiver', '2024-12-01', '2025-02-28', 'Concours de l''hiver 2024 sur l''art abstrait', 'evalue', NULL, 4),
('Animaux du Printemps', '2025-03-01', '2025-05-31', 'Concours du printemps 2025 sur les animaux', 'resultat', NULL, 5),
('Paysages d''Été', '2025-06-01', '2025-08-31', 'Concours de l''été 2025 sur les paysages', 'attente', NULL, 6),
('Architecture d''Automne', '2025-09-01', '2025-11-30', 'Concours de l''automne 2025 sur l''architecture', 'en_cours', NULL, 7),
('Fantastique d''Hiver', '2025-12-01', '2026-02-28', 'Concours de l''hiver 2025 sur le fantastique', 'pas_commence', NULL, 8);

"""

# =============================================================================
# ASSOCIATIONS CLUB-CONCOURS (chaque concours mobilise au moins 6 clubs)
# =============================================================================
club_concours = []
# Concours 1: clubs 1-7 (7 clubs)
for club in [1, 2, 3, 4, 5, 6, 7]:
    club_concours.append(f"({club}, 1)")
# Concours 2: clubs 2-8 (7 clubs)
for club in [2, 3, 4, 5, 6, 7, 8]:
    club_concours.append(f"({club}, 2)")
# Concours 3: clubs 1, 3-9 (7 clubs)
for club in [1, 3, 4, 5, 6, 7, 8, 9]:
    club_concours.append(f"({club}, 3)")
# Concours 4: clubs 1, 2, 4-10 (8 clubs)
for club in [1, 2, 4, 5, 6, 7, 8, 9, 10]:
    club_concours.append(f"({club}, 4)")
# Concours 5: clubs 1-6, 10 (7 clubs)
for club in [1, 2, 3, 4, 5, 6, 10]:
    club_concours.append(f"({club}, 5)")
# Concours 6: clubs 3-9 (7 clubs)
for club in [3, 4, 5, 6, 7, 8, 9]:
    club_concours.append(f"({club}, 6)")
# Concours 7: clubs 1, 2, 5-10 (7 clubs)
for club in [1, 2, 5, 6, 7, 8, 9, 10]:
    club_concours.append(f"({club}, 7)")
# Concours 8: clubs 1-8 (8 clubs)
for club in [1, 2, 3, 4, 5, 6, 7, 8]:
    club_concours.append(f"({club}, 8)")

club_concours_data = f"""-- =============================================================================
-- ASSOCIATIONS CLUB-CONCOURS (chaque concours mobilise au moins 6 clubs)
-- =============================================================================
INSERT INTO Club_Concours (num_club, num_concours) VALUES
{", ".join(club_concours)};

"""

# =============================================================================
# CONCOURS_EVALUATEUR: 3 évaluateurs par club participant
# =============================================================================
concours_evaluateur = []

# Concours 1: clubs 1-7, 3 évaluateurs par club
# Club 1: évaluateurs 24, 25, 26
for eval_id in [24, 25, 26]:
    concours_evaluateur.append(f"(1, {eval_id})")
# Club 2: évaluateurs 30, 31, 32
for eval_id in [30, 31, 32]:
    concours_evaluateur.append(f"(1, {eval_id})")
# Club 3: évaluateurs 36, 37, 38
for eval_id in [36, 37, 38]:
    concours_evaluateur.append(f"(1, {eval_id})")
# Club 4: évaluateurs 42, 43, 44
for eval_id in [42, 43, 44]:
    concours_evaluateur.append(f"(1, {eval_id})")
# Club 5: évaluateurs 48, 49, 50
for eval_id in [48, 49, 50]:
    concours_evaluateur.append(f"(1, {eval_id})")
# Club 6: évaluateurs 54, 55, 56
for eval_id in [54, 55, 56]:
    concours_evaluateur.append(f"(1, {eval_id})")
# Club 7: évaluateurs 60, 61, 62
for eval_id in [60, 61, 62]:
    concours_evaluateur.append(f"(1, {eval_id})")

# Concours 2: clubs 2-8, 3 évaluateurs par club
for eval_id in [30, 31, 32]:  # Club 2
    concours_evaluateur.append(f"(2, {eval_id})")
for eval_id in [36, 37, 38]:  # Club 3
    concours_evaluateur.append(f"(2, {eval_id})")
for eval_id in [42, 43, 44]:  # Club 4
    concours_evaluateur.append(f"(2, {eval_id})")
for eval_id in [48, 49, 50]:  # Club 5
    concours_evaluateur.append(f"(2, {eval_id})")
for eval_id in [54, 55, 56]:  # Club 6
    concours_evaluateur.append(f"(2, {eval_id})")
for eval_id in [60, 61, 62]:  # Club 7
    concours_evaluateur.append(f"(2, {eval_id})")
for eval_id in [66, 67, 68]:  # Club 8
    concours_evaluateur.append(f"(2, {eval_id})")

# Concours 3: clubs 1, 3-9
for eval_id in [24, 25, 26]:  # Club 1
    concours_evaluateur.append(f"(3, {eval_id})")
for eval_id in [36, 37, 38]:  # Club 3
    concours_evaluateur.append(f"(3, {eval_id})")
for eval_id in [42, 43, 44]:  # Club 4
    concours_evaluateur.append(f"(3, {eval_id})")
for eval_id in [48, 49, 50]:  # Club 5
    concours_evaluateur.append(f"(3, {eval_id})")
for eval_id in [54, 55, 56]:  # Club 6
    concours_evaluateur.append(f"(3, {eval_id})")
for eval_id in [60, 61, 62]:  # Club 7
    concours_evaluateur.append(f"(3, {eval_id})")
for eval_id in [66, 67, 68]:  # Club 8
    concours_evaluateur.append(f"(3, {eval_id})")
for eval_id in [72, 73, 74]:  # Club 9
    concours_evaluateur.append(f"(3, {eval_id})")

# Concours 4: clubs 1, 2, 4-10
for eval_id in [24, 25, 26]:  # Club 1
    concours_evaluateur.append(f"(4, {eval_id})")
for eval_id in [30, 31, 32]:  # Club 2
    concours_evaluateur.append(f"(4, {eval_id})")
for eval_id in [42, 43, 44]:  # Club 4
    concours_evaluateur.append(f"(4, {eval_id})")
for eval_id in [48, 49, 50]:  # Club 5
    concours_evaluateur.append(f"(4, {eval_id})")
for eval_id in [54, 55, 56]:  # Club 6
    concours_evaluateur.append(f"(4, {eval_id})")
for eval_id in [60, 61, 62]:  # Club 7
    concours_evaluateur.append(f"(4, {eval_id})")
for eval_id in [66, 67, 68]:  # Club 8
    concours_evaluateur.append(f"(4, {eval_id})")
for eval_id in [72, 73, 74]:  # Club 9
    concours_evaluateur.append(f"(4, {eval_id})")
for eval_id in [78, 79, 80]:  # Club 10
    concours_evaluateur.append(f"(4, {eval_id})")

# Concours 5: clubs 1-6, 10
for eval_id in [24, 25, 26]:  # Club 1
    concours_evaluateur.append(f"(5, {eval_id})")
for eval_id in [30, 31, 32]:  # Club 2
    concours_evaluateur.append(f"(5, {eval_id})")
for eval_id in [36, 37, 38]:  # Club 3
    concours_evaluateur.append(f"(5, {eval_id})")
for eval_id in [42, 43, 44]:  # Club 4
    concours_evaluateur.append(f"(5, {eval_id})")
for eval_id in [48, 49, 50]:  # Club 5
    concours_evaluateur.append(f"(5, {eval_id})")
for eval_id in [54, 55, 56]:  # Club 6
    concours_evaluateur.append(f"(5, {eval_id})")
for eval_id in [78, 79, 80]:  # Club 10
    concours_evaluateur.append(f"(5, {eval_id})")

# Concours 6: clubs 3-9
for eval_id in [36, 37, 38]:  # Club 3
    concours_evaluateur.append(f"(6, {eval_id})")
for eval_id in [42, 43, 44]:  # Club 4
    concours_evaluateur.append(f"(6, {eval_id})")
for eval_id in [48, 49, 50]:  # Club 5
    concours_evaluateur.append(f"(6, {eval_id})")
for eval_id in [54, 55, 56]:  # Club 6
    concours_evaluateur.append(f"(6, {eval_id})")
for eval_id in [60, 61, 62]:  # Club 7
    concours_evaluateur.append(f"(6, {eval_id})")
for eval_id in [66, 67, 68]:  # Club 8
    concours_evaluateur.append(f"(6, {eval_id})")
for eval_id in [72, 73, 74]:  # Club 9
    concours_evaluateur.append(f"(6, {eval_id})")

# Concours 7: clubs 1, 2, 5-10
for eval_id in [24, 25, 26]:  # Club 1
    concours_evaluateur.append(f"(7, {eval_id})")
for eval_id in [30, 31, 32]:  # Club 2
    concours_evaluateur.append(f"(7, {eval_id})")
for eval_id in [48, 49, 50]:  # Club 5
    concours_evaluateur.append(f"(7, {eval_id})")
for eval_id in [54, 55, 56]:  # Club 6
    concours_evaluateur.append(f"(7, {eval_id})")
for eval_id in [60, 61, 62]:  # Club 7
    concours_evaluateur.append(f"(7, {eval_id})")
for eval_id in [66, 67, 68]:  # Club 8
    concours_evaluateur.append(f"(7, {eval_id})")
for eval_id in [72, 73, 74]:  # Club 9
    concours_evaluateur.append(f"(7, {eval_id})")
for eval_id in [78, 79, 80]:  # Club 10
    concours_evaluateur.append(f"(7, {eval_id})")

# Concours 8: clubs 1-8
for eval_id in [24, 25, 26]:  # Club 1
    concours_evaluateur.append(f"(8, {eval_id})")
for eval_id in [30, 31, 32]:  # Club 2
    concours_evaluateur.append(f"(8, {eval_id})")
for eval_id in [36, 37, 38]:  # Club 3
    concours_evaluateur.append(f"(8, {eval_id})")
for eval_id in [42, 43, 44]:  # Club 4
    concours_evaluateur.append(f"(8, {eval_id})")
for eval_id in [48, 49, 50]:  # Club 5
    concours_evaluateur.append(f"(8, {eval_id})")
for eval_id in [54, 55, 56]:  # Club 6
    concours_evaluateur.append(f"(8, {eval_id})")
for eval_id in [60, 61, 62]:  # Club 7
    concours_evaluateur.append(f"(8, {eval_id})")
for eval_id in [66, 67, 68]:  # Club 8
    concours_evaluateur.append(f"(8, {eval_id})")

concours_evaluateur_data = f"""-- =============================================================================
-- CONCOURS_EVALUATEUR (3 évaluateurs par club participant)
-- =============================================================================
INSERT INTO Concours_Evaluateur (num_concours, num_evaluateur) VALUES
{", ".join(concours_evaluateur)};

"""

# Afficher toutes les données
print(concours_data)
print(club_concours_data)
print(concours_evaluateur_data)
