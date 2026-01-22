-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all existing data
TRUNCATE TABLE Club_Concours;
TRUNCATE TABLE Concours_Competiteur;
TRUNCATE TABLE Club_Directeur;
TRUNCATE TABLE Concours_Evaluateur;
TRUNCATE TABLE Evaluation;
TRUNCATE TABLE Dessin;
TRUNCATE TABLE Concours;
TRUNCATE TABLE Directeur;
TRUNCATE TABLE Administrateur;
TRUNCATE TABLE President;
TRUNCATE TABLE Evaluateur;
TRUNCATE TABLE Competiteur;
TRUNCATE TABLE Utilisateur;
TRUNCATE TABLE Club;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- CONTEXTE ET CONTRAINTES DE L'INSERTION DES DONNÉES
-- =============================================================================

-- La base de données doit contenir au moins  les données suivantes :
-- 8 concours, réalisés durant 2 années successives comme 2024 et 2025 (4 concours/année).
-- Les données à insérer dans la base de données doivent respecter les contraintes du cahier des charges, en particulier les contraintes suivantes :

-- Il ne peut y avoir que 4 concours par année durant les 4 saisons (1 concours par saison).
-- Un évaluateur ne pourra pas évaluer plus de 8 dessins en tout dans un même concours,
-- Un dessin doit être évalué par deux évaluateurs qui constituent un Jury.
-- Tout président d’un concours ne pourra pas être évaluateur ou compétiteur de ce même concours.
-- Tout compétiteur ne peut pas déposer plus de trois dessins dans un même concours donné
-- Un concours pour être organisé doit mobiliser au moins 6 Clubs.
-- Tout club qui participe à un concours donné doit mobiliser au moins 6 compétiteurs et 3 évaluateurs. A vous de bien remplir la BD afin d’avoir plusieurs scénarios.
-- Un évaluateur d’un concours ne peut pas concourir dans celui-ci


-- =============================================================================-- CLUBS (10 clubs)
-- =============================================================================

INSERT INTO Club (nom_club, adresse, num_telephone, ville, departement, region) VALUES
('Club Artistique Paris', '1 Rue des Arts', '0123456701', 'Paris', 'Paris', 'Île-de-France'),
('Atelier Créatif Lyon', '2 Avenue de la Créativité', '0123456702', 'Lyon', 'Rhône', 'Auvergne-Rhône-Alpes'),
('Association Dessin Marseille', '3 Boulevard des Pinceaux', '0123456703', 'Marseille', 'Bouches-du-Rhône', 'Provence-Alpes-Côte d''Azur'),
('Club Illustration Toulouse', '4 Place des Couleurs', '0123456704', 'Toulouse', 'Haute-Garonne', 'Occitanie'),
('Académie Art Nice', '5 Promenade des Artistes', '0123456705', 'Nice', 'Alpes-Maritimes', 'Provence-Alpes-Côte d''Azur'),
('Cercle des Dessinateurs Nantes', '6 Quai de la Palette', '0123456706', 'Nantes', 'Loire-Atlantique', 'Pays de la Loire'),
('Atelier Graphique Strasbourg', '7 Rue du Crayon', '0123456707', 'Strasbourg', 'Bas-Rhin', 'Grand Est'),
('Club Art Moderne Bordeaux', '8 Cours des Beaux-Arts', '0123456708', 'Bordeaux', 'Gironde', 'Nouvelle-Aquitaine'),
('Association Artistique Lille', '9 Avenue de l''Esquisse', '0123456709', 'Lille', 'Nord', 'Hauts-de-France'),
('Cercle Créatif Rennes', '10 Place de l''Illustration', '0123456710', 'Rennes', 'Ille-et-Vilaine', 'Bretagne');

-- =============================================================================-- UTILISATEURS (200 utilisateurs répartis dans les 10 clubs)
-- Password hash for "password" using PASSWORD_BCRYPT
-- =============================================================================

-- 8 Présidents (1 par concours) - utilisateurs 1-8
INSERT INTO Utilisateur (nom, prenom, age, adresse, login, mot_de_passe, type_compte, num_club) VALUES
('Leblanc', 'Pierre', 45, '1 Avenue des Présidents', 'president1@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 1),
('Moreau', 'Sophie', 46, '2 Avenue des Présidents', 'president2@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 2),
('Bernard', 'Luc', 47, '3 Avenue des Présidents', 'president3@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 3),
('Petit', 'Claire', 48, '4 Avenue des Présidents', 'president4@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 4),
('Robert', 'Thomas', 49, '5 Avenue des Présidents', 'president5@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 5),
('Richard', 'Julie', 50, '6 Avenue des Présidents', 'president6@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 6),
('Durand', 'Marc', 51, '7 Avenue des Présidents', 'president7@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 7),
('Dubois', 'Emma', 52, '8 Avenue des Présidents', 'president8@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 8);
-- 10 Directeurs (1 par club) - utilisateurs 9-18
INSERT INTO Utilisateur (nom, prenom, age, adresse, login, mot_de_passe, type_compte, num_club) VALUES
('Fontaine', 'Michel', 45, '9 Rue des Directeurs', 'directeur1@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 1),
('Leroy', 'Anne', 46, '10 Rue des Directeurs', 'directeur2@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 2),
('Girard', 'François', 47, '11 Rue des Directeurs', 'directeur3@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 3),
('Bonnet', 'Isabelle', 48, '12 Rue des Directeurs', 'directeur4@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 4),
('Lambert', 'Philippe', 49, '13 Rue des Directeurs', 'directeur5@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 5),
('Rousseau', 'Catherine', 50, '14 Rue des Directeurs', 'directeur6@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 6),
('Vincent', 'Nicolas', 51, '15 Rue des Directeurs', 'directeur7@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 7),
('Muller', 'Sandrine', 52, '16 Rue des Directeurs', 'directeur8@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 8),
('Lefebvre', 'Daniel', 40, '17 Rue des Directeurs', 'directeur9@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 9),
('Andre', 'Valérie', 41, '18 Rue des Directeurs', 'directeur10@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 10);
-- 5 Administrateurs - utilisateurs 19-23
INSERT INTO Utilisateur (nom, prenom, age, adresse, login, mot_de_passe, type_compte, num_club) VALUES
('Admin', 'Système', 45, '19 Rue de l''Administration', 'admin1@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', NULL),
('Garcia', 'Laurent', 46, '20 Rue de l''Administration', 'admin2@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', NULL),
('Martinez', 'Sylvie', 47, '21 Rue de l''Administration', 'admin3@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', NULL),
('David', 'Olivier', 48, '22 Rue de l''Administration', 'admin4@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', NULL),
('Bertrand', 'Nathalie', 49, '23 Rue de l''Administration', 'admin5@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', NULL);
-- 60 Évaluateurs (6 par club) - utilisateurs 24-83
INSERT INTO Utilisateur (nom, prenom, age, adresse, login, mot_de_passe, type_compte, num_club) VALUES
-- Club 1 (6 évaluateurs)
('Eval1', 'Jean', 30, '24 Rue des Évaluateurs', 'eval1@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 1),
('Eval2', 'Marie', 31, '25 Rue des Évaluateurs', 'eval2@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 1),
('Eval3', 'Paul', 32, '26 Rue des Évaluateurs', 'eval3@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 1),
('Eval4', 'Alice', 33, '27 Rue des Évaluateurs', 'eval4@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 1),
('Eval5', 'Bob', 34, '28 Rue des Évaluateurs', 'eval5@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 1),
('Eval6', 'Carol', 35, '29 Rue des Évaluateurs', 'eval6@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 1),
-- Club 2 (6 évaluateurs)
('Eval7', 'David', 36, '30 Rue des Évaluateurs', 'eval7@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 2),
('Eval8', 'Eve', 37, '31 Rue des Évaluateurs', 'eval8@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 2),
('Eval9', 'Frank', 38, '32 Rue des Évaluateurs', 'eval9@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 2),
('Eval10', 'Grace', 39, '33 Rue des Évaluateurs', 'eval10@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 2),
('Eval11', 'Henry', 40, '34 Rue des Évaluateurs', 'eval11@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 2),
('Eval12', 'Ivy', 41, '35 Rue des Évaluateurs', 'eval12@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 2),
-- Club 3 (6 évaluateurs)
('Eval13', 'Jack', 42, '36 Rue des Évaluateurs', 'eval13@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 3),
('Eval14', 'Kate', 43, '37 Rue des Évaluateurs', 'eval14@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 3),
('Eval15', 'Leo', 44, '38 Rue des Évaluateurs', 'eval15@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 3),
('Eval16', 'Mia', 45, '39 Rue des Évaluateurs', 'eval16@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 3),
('Eval17', 'Noah', 46, '40 Rue des Évaluateurs', 'eval17@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 3),
('Eval18', 'Olivia', 47, '41 Rue des Évaluateurs', 'eval18@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 3),
-- Club 4 (6 évaluateurs)
('Eval19', 'Peter', 48, '42 Rue des Évaluateurs', 'eval19@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 4),
('Eval20', 'Quinn', 49, '43 Rue des Évaluateurs', 'eval20@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 4),
('Eval21', 'Ryan', 50, '44 Rue des Évaluateurs', 'eval21@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 4),
('Eval22', 'Sara', 51, '45 Rue des Évaluateurs', 'eval22@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 4),
('Eval23', 'Tom', 52, '46 Rue des Évaluateurs', 'eval23@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 4),
('Eval24', 'Uma', 53, '47 Rue des Évaluateurs', 'eval24@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 4),
-- Club 5 (6 évaluateurs)
('Eval25', 'Victor', 54, '48 Rue des Évaluateurs', 'eval25@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 5),
('Eval26', 'Wendy', 55, '49 Rue des Évaluateurs', 'eval26@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 5),
('Eval27', 'Xavier', 56, '50 Rue des Évaluateurs', 'eval27@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 5),
('Eval28', 'Yara', 57, '51 Rue des Évaluateurs', 'eval28@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 5),
('Eval29', 'Zack', 58, '52 Rue des Évaluateurs', 'eval29@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 5),
('Eval30', 'Amy', 59, '53 Rue des Évaluateurs', 'eval30@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 5),
-- Club 6 (6 évaluateurs)
('Eval31', 'Ben', 60, '54 Rue des Évaluateurs', 'eval31@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 6),
('Eval32', 'Chloe', 61, '55 Rue des Évaluateurs', 'eval32@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 6),
('Eval33', 'Dan', 62, '56 Rue des Évaluateurs', 'eval33@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 6),
('Eval34', 'Emma', 63, '57 Rue des Évaluateurs', 'eval34@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 6),
('Eval35', 'Fred', 64, '58 Rue des Évaluateurs', 'eval35@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 6),
('Eval36', 'Gina', 30, '59 Rue des Évaluateurs', 'eval36@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 6),
-- Club 7 (6 évaluateurs)
('Eval37', 'Harry', 31, '60 Rue des Évaluateurs', 'eval37@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 7),
('Eval38', 'Iris', 32, '61 Rue des Évaluateurs', 'eval38@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 7),
('Eval39', 'Jake', 33, '62 Rue des Évaluateurs', 'eval39@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 7),
('Eval40', 'Kelly', 34, '63 Rue des Évaluateurs', 'eval40@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 7),
('Eval41', 'Luke', 35, '64 Rue des Évaluateurs', 'eval41@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 7),
('Eval42', 'Mona', 36, '65 Rue des Évaluateurs', 'eval42@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 7),
-- Club 8 (6 évaluateurs)
('Eval43', 'Nick', 37, '66 Rue des Évaluateurs', 'eval43@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 8),
('Eval44', 'Ora', 38, '67 Rue des Évaluateurs', 'eval44@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 8),
('Eval45', 'Pete', 39, '68 Rue des Évaluateurs', 'eval45@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 8),
('Eval46', 'Rose', 40, '69 Rue des Évaluateurs', 'eval46@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 8),
('Eval47', 'Sam', 41, '70 Rue des Évaluateurs', 'eval47@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 8),
('Eval48', 'Tina', 42, '71 Rue des Évaluateurs', 'eval48@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 8),
-- Club 9 (6 évaluateurs)
('Eval49', 'Umar', 43, '72 Rue des Évaluateurs', 'eval49@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 9),
('Eval50', 'Vera', 44, '73 Rue des Évaluateurs', 'eval50@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 9),
('Eval51', 'Will', 45, '74 Rue des Évaluateurs', 'eval51@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 9),
('Eval52', 'Xena', 46, '75 Rue des Évaluateurs', 'eval52@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 9),
('Eval53', 'Yale', 47, '76 Rue des Évaluateurs', 'eval53@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 9),
('Eval54', 'Zoe', 48, '77 Rue des Évaluateurs', 'eval54@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 9),
-- Club 10 (6 évaluateurs)
('Eval55', 'Adam', 49, '78 Rue des Évaluateurs', 'eval55@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 10),
('Eval56', 'Betty', 50, '79 Rue des Évaluateurs', 'eval56@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 10),
('Eval57', 'Carl', 51, '80 Rue des Évaluateurs', 'eval57@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 10),
('Eval58', 'Diana', 52, '81 Rue des Évaluateurs', 'eval58@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 10),
('Eval59', 'Eric', 53, '82 Rue des Évaluateurs', 'eval59@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 10),
('Eval60', 'Fiona', 54, '83 Rue des Évaluateurs', 'eval60@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 10);

-- 117 Compétiteurs (répartis dans les 10 clubs) - utilisateurs 84-200
-- Club 1: 12 compétiteurs (84-95)
INSERT INTO Utilisateur (nom, prenom, age, adresse, login, mot_de_passe, type_compte, num_club) VALUES
('Comp1', 'Arthur', 18, '84 Rue des Compétiteurs', 'comp1@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 1),
('Comp2', 'Bella', 19, '85 Rue des Compétiteurs', 'comp2@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 1),
('Comp3', 'Charlie', 20, '86 Rue des Compétiteurs', 'comp3@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 1),
('Comp4', 'Daisy', 21, '87 Rue des Compétiteurs', 'comp4@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 1),
('Comp5', 'Ethan', 22, '88 Rue des Compétiteurs', 'comp5@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 1),
('Comp6', 'Flora', 23, '89 Rue des Compétiteurs', 'comp6@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 1),
('Comp7', 'George', 24, '90 Rue des Compétiteurs', 'comp7@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 1),
('Comp8', 'Hannah', 25, '91 Rue des Compétiteurs', 'comp8@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 1),
('Comp9', 'Ian', 26, '92 Rue des Compétiteurs', 'comp9@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 1),
('Comp10', 'Julia', 27, '93 Rue des Compétiteurs', 'comp10@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 1),
('Comp11', 'Kevin', 28, '94 Rue des Compétiteurs', 'comp11@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 1),
('Comp12', 'Luna', 29, '95 Rue des Compétiteurs', 'comp12@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 1),
-- Club 2: 12 compétiteurs (96-107)
('Comp13', 'Max', 30, '96 Rue des Compétiteurs', 'comp13@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 2),
('Comp14', 'Nina', 31, '97 Rue des Compétiteurs', 'comp14@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 2),
('Comp15', 'Oscar', 32, '98 Rue des Compétiteurs', 'comp15@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 2),
('Comp16', 'Penny', 33, '99 Rue des Compétiteurs', 'comp16@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 2),
('Comp17', 'Quincy', 34, '100 Rue des Compétiteurs', 'comp17@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 2),
('Comp18', 'Ruby', 35, '101 Rue des Compétiteurs', 'comp18@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 2),
('Comp19', 'Steve', 36, '102 Rue des Compétiteurs', 'comp19@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 2),
('Comp20', 'Tara', 37, '103 Rue des Compétiteurs', 'comp20@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 2),
('Comp21', 'Ulysses', 38, '104 Rue des Compétiteurs', 'comp21@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 2),
('Comp22', 'Violet', 39, '105 Rue des Compétiteurs', 'comp22@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 2),
('Comp23', 'Walter', 40, '106 Rue des Compétiteurs', 'comp23@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 2),
('Comp24', 'Yasmine', 41, '107 Rue des Compétiteurs', 'comp24@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 2),
-- Club 3: 12 compétiteurs (108-119)
('Comp25', 'Zachary', 42, '108 Rue des Compétiteurs', 'comp25@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 3),
('Comp26', 'Abby', 43, '109 Rue des Compétiteurs', 'comp26@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 3),
('Comp27', 'Brian', 44, '110 Rue des Compétiteurs', 'comp27@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 3),
('Comp28', 'Cindy', 45, '111 Rue des Compétiteurs', 'comp28@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 3),
('Comp29', 'Derek', 46, '112 Rue des Compétiteurs', 'comp29@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 3),
('Comp30', 'Elena', 47, '113 Rue des Compétiteurs', 'comp30@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 3),
('Comp31', 'Felix', 48, '114 Rue des Compétiteurs', 'comp31@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 3),
('Comp32', 'Gloria', 49, '115 Rue des Compétiteurs', 'comp32@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 3),
('Comp33', 'Hank', 50, '116 Rue des Compétiteurs', 'comp33@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 3),
('Comp34', 'Irene', 51, '117 Rue des Compétiteurs', 'comp34@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 3),
('Comp35', 'James', 52, '118 Rue des Compétiteurs', 'comp35@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 3),
('Comp36', 'Karen', 53, '119 Rue des Compétiteurs', 'comp36@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 3),
-- Club 4: 12 compétiteurs (120-131)
('Comp37', 'Larry', 54, '120 Rue des Compétiteurs', 'comp37@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 4),
('Comp38', 'Monica', 55, '121 Rue des Compétiteurs', 'comp38@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 4),
('Comp39', 'Nathan', 56, '122 Rue des Compétiteurs', 'comp39@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 4),
('Comp40', 'Ophelia', 57, '123 Rue des Compétiteurs', 'comp40@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 4),
('Comp41', 'Patrick', 58, '124 Rue des Compétiteurs', 'comp41@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 4),
('Comp42', 'Queen', 59, '125 Rue des Compétiteurs', 'comp42@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 4),
('Comp43', 'Roger', 60, '126 Rue des Compétiteurs', 'comp43@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 4),
('Comp44', 'Samantha', 61, '127 Rue des Compétiteurs', 'comp44@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 4),
('Comp45', 'Terry', 62, '128 Rue des Compétiteurs', 'comp45@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 4),
('Comp46', 'Ursula', 63, '129 Rue des Compétiteurs', 'comp46@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 4),
('Comp47', 'Vincent2', 64, '130 Rue des Compétiteurs', 'comp47@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 4),
('Comp48', 'Whitney', 18, '131 Rue des Compétiteurs', 'comp48@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 4),
-- Club 5: 12 compétiteurs (132-143)
('Comp49', 'Xavier2', 19, '132 Rue des Compétiteurs', 'comp49@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 5),
('Comp50', 'Yvonne', 20, '133 Rue des Compétiteurs', 'comp50@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 5),
('Comp51', 'Zane', 21, '134 Rue des Compétiteurs', 'comp51@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 5),
('Comp52', 'Andrea', 22, '135 Rue des Compétiteurs', 'comp52@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 5),
('Comp53', 'Blake', 23, '136 Rue des Compétiteurs', 'comp53@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 5),
('Comp54', 'Casey', 24, '137 Rue des Compétiteurs', 'comp54@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 5),
('Comp55', 'Drew', 25, '138 Rue des Compétiteurs', 'comp55@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 5),
('Comp56', 'Ellis', 26, '139 Rue des Compétiteurs', 'comp56@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 5),
('Comp57', 'Frankie', 27, '140 Rue des Compétiteurs', 'comp57@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 5),
('Comp58', 'Gray', 28, '141 Rue des Compétiteurs', 'comp58@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 5),
('Comp59', 'Harper', 29, '142 Rue des Compétiteurs', 'comp59@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 5),
('Comp60', 'Indigo', 30, '143 Rue des Compétiteurs', 'comp60@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 5),
-- Club 6: 12 compétiteurs (144-155)
('Comp61', 'Jesse', 31, '144 Rue des Compétiteurs', 'comp61@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 6),
('Comp62', 'Kendall', 32, '145 Rue des Compétiteurs', 'comp62@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 6),
('Comp63', 'Logan', 33, '146 Rue des Compétiteurs', 'comp63@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 6),
('Comp64', 'Morgan', 34, '147 Rue des Compétiteurs', 'comp64@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 6),
('Comp65', 'Noel', 35, '148 Rue des Compétiteurs', 'comp65@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 6),
('Comp66', 'Ocean', 36, '149 Rue des Compétiteurs', 'comp66@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 6),
('Comp67', 'Parker', 37, '150 Rue des Compétiteurs', 'comp67@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 6),
('Comp68', 'Quinn2', 38, '151 Rue des Compétiteurs', 'comp68@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 6),
('Comp69', 'River', 39, '152 Rue des Compétiteurs', 'comp69@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 6),
('Comp70', 'Sage', 40, '153 Rue des Compétiteurs', 'comp70@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 6),
('Comp71', 'Taylor', 41, '154 Rue des Compétiteurs', 'comp71@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 6),
('Comp72', 'Unity', 42, '155 Rue des Compétiteurs', 'comp72@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 6),
-- Club 7: 12 compétiteurs (156-167)
('Comp73', 'Avery', 43, '156 Rue des Compétiteurs', 'comp73@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 7),
('Comp74', 'Blair', 44, '157 Rue des Compétiteurs', 'comp74@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 7),
('Comp75', 'Cameron', 45, '158 Rue des Compétiteurs', 'comp75@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 7),
('Comp76', 'Dakota', 46, '159 Rue des Compétiteurs', 'comp76@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 7),
('Comp77', 'Eden', 47, '160 Rue des Compétiteurs', 'comp77@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 7),
('Comp78', 'Finley', 48, '161 Rue des Compétiteurs', 'comp78@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 7),
('Comp79', 'Grey', 49, '162 Rue des Compétiteurs', 'comp79@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 7),
('Comp80', 'Hayden', 50, '163 Rue des Compétiteurs', 'comp80@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 7),
('Comp81', 'Indiana', 51, '164 Rue des Compétiteurs', 'comp81@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 7),
('Comp82', 'Jordan', 52, '165 Rue des Compétiteurs', 'comp82@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 7),
('Comp83', 'Kai', 53, '166 Rue des Compétiteurs', 'comp83@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 7),
('Comp84', 'Lane', 54, '167 Rue des Compétiteurs', 'comp84@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 7),
-- Club 8: 12 compétiteurs (168-179)
('Comp85', 'Marley', 55, '168 Rue des Compétiteurs', 'comp85@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 8),
('Comp86', 'Nevada', 56, '169 Rue des Compétiteurs', 'comp86@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 8),
('Comp87', 'Oakley', 57, '170 Rue des Compétiteurs', 'comp87@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 8),
('Comp88', 'Phoenix', 58, '171 Rue des Compétiteurs', 'comp88@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 8),
('Comp89', 'Quinlan', 59, '172 Rue des Compétiteurs', 'comp89@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 8),
('Comp90', 'Reese', 60, '173 Rue des Compétiteurs', 'comp90@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 8),
('Comp91', 'Skyler', 61, '174 Rue des Compétiteurs', 'comp91@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 8),
('Comp92', 'Tatum', 62, '175 Rue des Compétiteurs', 'comp92@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 8),
('Comp93', 'Urban', 63, '176 Rue des Compétiteurs', 'comp93@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 8),
('Comp94', 'Val', 64, '177 Rue des Compétiteurs', 'comp94@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 8),
('Comp95', 'Wren', 18, '178 Rue des Compétiteurs', 'comp95@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 8),
('Comp96', 'Xander', 19, '179 Rue des Compétiteurs', 'comp96@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 8),
-- Club 9: 11 compétiteurs (180-190)
('Comp97', 'York', 20, '180 Rue des Compétiteurs', 'comp97@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 9),
('Comp98', 'Zara', 21, '181 Rue des Compétiteurs', 'comp98@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 9),
('Comp99', 'Aspen', 22, '182 Rue des Compétiteurs', 'comp99@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 9),
('Comp100', 'Brook', 23, '183 Rue des Compétiteurs', 'comp100@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 9),
('Comp101', 'Cedar', 24, '184 Rue des Compétiteurs', 'comp101@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 9),
('Comp102', 'Dale', 25, '185 Rue des Compétiteurs', 'comp102@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 9),
('Comp103', 'Echo', 26, '186 Rue des Compétiteurs', 'comp103@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 9),
('Comp104', 'Forest', 27, '187 Rue des Compétiteurs', 'comp104@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 9),
('Comp105', 'Glen', 28, '188 Rue des Compétiteurs', 'comp105@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 9),
('Comp106', 'Haven', 29, '189 Rue des Compétiteurs', 'comp106@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 9),
('Comp107', 'Iris2', 30, '190 Rue des Compétiteurs', 'comp107@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 9),
-- Club 10: 10 compétiteurs (191-200)
('Comp108', 'Jade', 31, '191 Rue des Compétiteurs', 'comp108@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 10),
('Comp109', 'Kit', 32, '192 Rue des Compétiteurs', 'comp109@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 10),
('Comp110', 'Lake', 33, '193 Rue des Compétiteurs', 'comp110@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 10),
('Comp111', 'Maple', 34, '194 Rue des Compétiteurs', 'comp111@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 10),
('Comp112', 'North', 35, '195 Rue des Compétiteurs', 'comp112@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 10),
('Comp113', 'Onyx', 36, '196 Rue des Compétiteurs', 'comp113@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 10),
('Comp114', 'Pearl', 37, '197 Rue des Compétiteurs', 'comp114@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 10),
('Comp115', 'Rain', 38, '198 Rue des Compétiteurs', 'comp115@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 10),
('Comp116', 'Sky', 39, '199 Rue des Compétiteurs', 'comp116@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 10),
('Comp117', 'Vale', 40, '200 Rue des Compétiteurs', 'comp117@drawarena.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 10);

-- =============================================================================
-- PRÉSIDENTS (8 présidents pour les 8 concours)
-- =============================================================================
INSERT INTO President (num_president, prime) VALUES
(1, 2000.00),
(2, 2100.00),
(3, 1900.00),
(4, 2200.00),
(5, 2050.00),
(6, 1950.00),
(7, 2150.00),
(8, 2300.00);

-- =============================================================================
-- DIRECTEURS (10 directeurs, 1 par club)
-- =============================================================================
INSERT INTO Directeur (num_directeur, date_debut) VALUES
(9, '2020-01-01'),
(10, '2019-06-15'),
(11, '2021-03-10'),
(12, '2020-09-01'),
(13, '2019-11-20'),
(14, '2021-01-15'),
(15, '2020-05-05'),
(16, '2019-08-12'),
(17, '2021-07-01'),
(18, '2020-02-28');

-- =============================================================================
-- ADMINISTRATEURS (5 administrateurs)
-- =============================================================================
INSERT INTO Administrateur (num_administrateur, date_debut) VALUES
(19, '2018-01-01'),
(20, '2019-03-15'),
(21, '2020-06-01'),
(22, '2019-09-10'),
(23, '2021-01-20');

-- =============================================================================
-- ÉVALUATEURS (60 évaluateurs, 6 par club)
-- =============================================================================
INSERT INTO Evaluateur (num_evaluateur, specialite, xp) VALUES
(24, 'Peinture à l''huile', 500),
(25, 'Aquarelle', 550),
(26, 'Dessin au fusain', 600),
(27, 'Art contemporain', 650),
(28, 'Sculpture', 700),
(29, 'Art abstrait', 750),
(30, 'Portrait', 800),
(31, 'Paysage', 850),
(32, 'Nature morte', 900),
(33, 'Art numérique', 950),
(34, 'Gravure', 1000),
(35, 'Illustration', 1050),
(36, 'Peinture acrylique', 1100),
(37, 'Pastel', 1150),
(38, 'Calligraphie', 1200),
(39, 'Art urbain', 1250),
(40, 'Photographie', 1300),
(41, 'Collage', 1350),
(42, 'Peinture impressionniste', 1400),
(43, 'Art moderne', 1450),
(44, 'Dessin technique', 1500),
(45, 'Animation', 1550),
(46, 'Bande dessinée', 1600),
(47, 'Manga', 1650),
(48, 'Peinture expressionniste', 1700),
(49, 'Art surréaliste', 1750),
(50, 'Aquarelle moderne', 1800),
(51, 'Dessin réaliste', 1850),
(52, 'Art minimaliste', 1900),
(53, 'Peinture cubiste', 1950),
(54, 'Art conceptuel', 2000),
(55, 'Graffiti', 2050),
(56, 'Street art', 2100),
(57, 'Peinture figurative', 2150),
(58, 'Art naïf', 2200),
(59, 'Enluminure', 500),
(60, 'Fresque', 550),
(61, 'Peinture romantique', 600),
(62, 'Art déco', 650),
(63, 'Peinture baroque', 700),
(64, 'Art nouveau', 750),
(65, 'Dessin d''architecture', 800),
(66, 'Art pop', 850),
(67, 'Peinture à la gouache', 900),
(68, 'Art symboliste', 950),
(69, 'Dessin anatomique', 1000),
(70, 'Art hyperréaliste', 1050),
(71, 'Peinture pointilliste', 1100),
(72, 'Art fauviste', 1150),
(73, 'Sérigraphie', 1200),
(74, 'Lithographie', 1250),
(75, 'Art cinétique', 1300),
(76, 'Peinture métaphysique', 1350),
(77, 'Art brut', 1400),
(78, 'Dessin de mode', 1450),
(79, 'Art primitif', 1500),
(80, 'Peinture orientaliste', 1550),
(81, 'Art classique', 1600),
(82, 'Peinture néo-classique', 1650),
(83, 'Art renaissant', 1700);

-- =============================================================================
-- COMPÉTITEURS (117 compétiteurs)
-- =============================================================================
INSERT INTO Competiteur (num_competiteur, date_premiere_participation) VALUES
(84, '2022-01-15'), (85, '2021-03-20'), (86, '2023-06-10'), (87, '2022-09-05'), (88, '2021-11-12'), (89, '2023-02-28'),
(90, '2022-04-18'), (91, '2021-07-22'), (92, '2023-08-14'), (93, '2022-10-30'), (94, '2021-12-08'), (95, '2023-03-25'),
(96, '2022-05-17'), (97, '2021-08-29'), (98, '2023-09-11'), (99, '2022-11-03'), (100, '2021-01-26'), (101, '2023-04-19'),
(102, '2022-06-21'), (103, '2021-09-13'), (104, '2023-10-07'), (105, '2022-12-15'), (106, '2021-02-24'), (107, '2023-05-30'),
(108, '2022-07-12'), (109, '2021-10-18'), (110, '2023-11-22'), (111, '2022-01-09'), (112, '2021-04-14'), (113, '2023-07-03'),
(114, '2022-08-27'), (115, '2021-11-05'), (116, '2023-12-18'), (117, '2022-02-16'), (118, '2021-05-21'), (119, '2023-01-08'),
(120, '2022-09-29'), (121, '2021-12-11'), (122, '2023-02-14'), (123, '2022-03-06'), (124, '2021-06-19'), (125, '2023-08-25'),
(126, '2022-10-13'), (127, '2021-01-31'), (128, '2023-03-17'), (129, '2022-04-22'), (130, '2021-07-28'), (131, '2023-09-09'),
(132, '2022-11-16'), (133, '2021-02-12'), (134, '2023-04-27'), (135, '2022-05-24'), (136, '2021-08-07'), (137, '2023-10-20'),
(138, '2022-12-03'), (139, '2021-03-15'), (140, '2023-05-11'), (141, '2022-06-08'), (142, '2021-09-22'), (143, '2023-11-04'),
(144, '2022-07-19'), (145, '2021-10-26'), (146, '2023-12-15'), (147, '2022-01-28'), (148, '2021-04-09'), (149, '2023-06-21'),
(150, '2022-08-14'), (151, '2021-11-18'), (152, '2023-01-29'), (153, '2022-02-23'), (154, '2021-05-30'), (155, '2023-07-16'),
(156, '2022-09-11'), (157, '2021-12-20'), (158, '2023-02-07'), (159, '2022-03-19'), (160, '2021-06-25'), (161, '2023-08-03'),
(162, '2022-10-28'), (163, '2021-01-14'), (164, '2023-03-22'), (165, '2022-04-05'), (166, '2021-07-11'), (167, '2023-09-28'),
(168, '2022-11-22'), (169, '2021-02-08'), (170, '2023-04-13'), (171, '2022-05-17'), (172, '2021-08-24'), (173, '2023-10-09'),
(174, '2022-12-26'), (175, '2021-03-04'), (176, '2023-05-18'), (177, '2022-06-13'), (178, '2021-09-29'), (179, '2023-11-11'),
(180, '2022-07-25'), (181, '2021-10-07'), (182, '2023-12-22'), (183, '2022-01-18'), (184, '2021-04-26'), (185, '2023-06-04'),
(186, '2022-08-09'), (187, '2021-11-15'), (188, '2023-01-12'), (189, '2022-02-21'), (190, '2021-05-07'), (191, '2023-07-27'),
(192, '2022-09-19'), (193, '2021-12-02'), (194, '2023-02-19'), (195, '2022-03-28'), (196, '2021-06-14'), (197, '2023-08-30'),
(198, '2022-10-06'), (199, '2021-01-21'), (200, '2023-03-09');

-- =============================================================================
-- ASSOCIATIONS CLUB-DIRECTEUR (chaque directeur dirige son club)
-- =============================================================================
INSERT INTO Club_Directeur (num_club, num_directeur) VALUES
(1, 9), (2, 10), (3, 11), (4, 12), (5, 13),
(6, 14), (7, 15), (8, 16), (9, 17), (10, 18);

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

-- =============================================================================
-- ASSOCIATIONS CLUB-CONCOURS (chaque concours mobilise au moins 6 clubs)
-- =============================================================================
INSERT INTO Club_Concours (num_club, num_concours) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (2, 2), (3, 2), (4, 2), (5, 2), (6, 2), (7, 2), (8, 2), (1, 3), (3, 3), (4, 3), (5, 3), (6, 3), (7, 3), (8, 3), (9, 3), (1, 4), (2, 4), (4, 4), (5, 4), (6, 4), (7, 4), (8, 4), (9, 4), (10, 4), (1, 5), (2, 5), (3, 5), (4, 5), (5, 5), (6, 5), (10, 5), (3, 6), (4, 6), (5, 6), (6, 6), (7, 6), (8, 6), (9, 6), (1, 7), (2, 7), (5, 7), (6, 7), (7, 7), (8, 7), (9, 7), (10, 7), (1, 8), (2, 8), (3, 8), (4, 8), (5, 8), (6, 8), (7, 8), (8, 8);


-- =============================================================================
-- CONCOURS_EVALUATEUR (3 évaluateurs par club participant)
-- =============================================================================
INSERT INTO Concours_Evaluateur (num_concours, num_evaluateur) VALUES
(1, 24), (1, 25), (1, 26), (1, 30), (1, 31), (1, 32), (1, 36), (1, 37), (1, 38), (1, 42), (1, 43), (1, 44), (1, 48), (1, 49), (1, 50), (1, 54), (1, 55), (1, 56), (1, 60), (1, 61), (1, 62), (2, 30), (2, 31), (2, 32), (2, 36), (2, 37), (2, 38), (2, 42), (2, 43), (2, 44), (2, 48), (2, 49), (2, 50), (2, 54), (2, 55), (2, 56), (2, 60), (2, 61), (2, 62), (2, 66), (2, 67), (2, 68), (3, 24), (3, 25), (3, 26), (3, 36), (3, 37), (3, 38), (3, 42), (3, 43), (3, 44), (3, 48), (3, 49), (3, 50), (3, 54), (3, 55), (3, 56), (3, 60), (3, 61), (3, 62), (3, 66), (3, 67), (3, 68), (3, 72), (3, 73), (3, 74), (4, 24), (4, 25), (4, 26), (4, 30), (4, 31), (4, 32), (4, 42), (4, 43), (4, 44), (4, 48), (4, 49), (4, 50), (4, 54), (4, 55), (4, 56), (4, 60), (4, 61), (4, 62), (4, 66), (4, 67), (4, 68), (4, 72), (4, 73), (4, 74), (4, 78), (4, 79), (4, 80), (5, 24), (5, 25), (5, 26), (5, 30), (5, 31), (5, 32), (5, 36), (5, 37), (5, 38), (5, 42), (5, 43), (5, 44), (5, 48), (5, 49), (5, 50), (5, 54), (5, 55), (5, 56), (5, 78), (5, 79), (5, 80), (6, 36), (6, 37), (6, 38), (6, 42), (6, 43), (6, 44), (6, 48), (6, 49), (6, 50), (6, 54), (6, 55), (6, 56), (6, 60), (6, 61), (6, 62), (6, 66), (6, 67), (6, 68), (6, 72), (6, 73), (6, 74), (7, 24), (7, 25), (7, 26), (7, 30), (7, 31), (7, 32), (7, 48), (7, 49), (7, 50), (7, 54), (7, 55), (7, 56), (7, 60), (7, 61), (7, 62), (7, 66), (7, 67), (7, 68), (7, 72), (7, 73), (7, 74), (7, 78), (7, 79), (7, 80), (8, 24), (8, 25), (8, 26), (8, 30), (8, 31), (8, 32), (8, 36), (8, 37), (8, 38), (8, 42), (8, 43), (8, 44), (8, 48), (8, 49), (8, 50), (8, 54), (8, 55), (8, 56), (8, 60), (8, 61), (8, 62), (8, 66), (8, 67), (8, 68);

-- =============================================================================
-- CONCOURS_COMPETITEUR (6 compétiteurs minimum par club participant)
-- Note: Les compétiteurs sont répartis par club, ID 84-95 pour club 1, 96-107 pour club 2, etc.
-- =============================================================================
INSERT INTO Concours_Competiteur (num_concours, num_competiteur) VALUES
-- Concours 1: clubs 1-7
-- Club 1 (compétiteurs 84-95): 6 compétiteurs
(1, 84), (1, 85), (1, 86), (1, 87), (1, 88), (1, 89),
-- Club 2 (compétiteurs 96-107): 6 compétiteurs
(1, 96), (1, 97), (1, 98), (1, 99), (1, 100), (1, 101),
-- Club 3 (compétiteurs 108-119): 6 compétiteurs
(1, 108), (1, 109), (1, 110), (1, 111), (1, 112), (1, 113),
-- Club 4 (compétiteurs 120-131): 6 compétiteurs
(1, 120), (1, 121), (1, 122), (1, 123), (1, 124), (1, 125),
-- Club 5 (compétiteurs 132-143): 6 compétiteurs
(1, 132), (1, 133), (1, 134), (1, 135), (1, 136), (1, 137),
-- Club 6 (compétiteurs 144-155): 6 compétiteurs
(1, 144), (1, 145), (1, 146), (1, 147), (1, 148), (1, 149),
-- Club 7 (compétiteurs 156-167): 6 compétiteurs
(1, 156), (1, 157), (1, 158), (1, 159), (1, 160), (1, 161),

-- Concours 2: clubs 2-8
-- Club 2: 6 compétiteurs
(2, 96), (2, 97), (2, 98), (2, 99), (2, 100), (2, 101),
-- Club 3: 6 compétiteurs
(2, 108), (2, 109), (2, 110), (2, 111), (2, 112), (2, 113),
-- Club 4: 6 compétiteurs
(2, 120), (2, 121), (2, 122), (2, 123), (2, 124), (2, 125),
-- Club 5: 6 compétiteurs
(2, 132), (2, 133), (2, 134), (2, 135), (2, 136), (2, 137),
-- Club 6: 6 compétiteurs
(2, 144), (2, 145), (2, 146), (2, 147), (2, 148), (2, 149),
-- Club 7: 6 compétiteurs
(2, 156), (2, 157), (2, 158), (2, 159), (2, 160), (2, 161),
-- Club 8 (compétiteurs 168-179): 6 compétiteurs
(2, 168), (2, 169), (2, 170), (2, 171), (2, 172), (2, 173),

-- Concours 3: clubs 1, 3-9
-- Club 1: 6 compétiteurs
(3, 84), (3, 85), (3, 86), (3, 87), (3, 88), (3, 89),
-- Club 3: 6 compétiteurs
(3, 108), (3, 109), (3, 110), (3, 111), (3, 112), (3, 113),
-- Club 4: 6 compétiteurs
(3, 120), (3, 121), (3, 122), (3, 123), (3, 124), (3, 125),
-- Club 5: 6 compétiteurs
(3, 132), (3, 133), (3, 134), (3, 135), (3, 136), (3, 137),
-- Club 6: 6 compétiteurs
(3, 144), (3, 145), (3, 146), (3, 147), (3, 148), (3, 149),
-- Club 7: 6 compétiteurs
(3, 156), (3, 157), (3, 158), (3, 159), (3, 160), (3, 161),
-- Club 8: 6 compétiteurs
(3, 168), (3, 169), (3, 170), (3, 171), (3, 172), (3, 173),
-- Club 9 (compétiteurs 180-190): 6 compétiteurs
(3, 180), (3, 181), (3, 182), (3, 183), (3, 184), (3, 185),

-- Concours 4: clubs 1, 2, 4-10
-- Club 1: 6 compétiteurs
(4, 84), (4, 85), (4, 86), (4, 87), (4, 88), (4, 89),
-- Club 2: 6 compétiteurs
(4, 96), (4, 97), (4, 98), (4, 99), (4, 100), (4, 101),
-- Club 4: 6 compétiteurs
(4, 120), (4, 121), (4, 122), (4, 123), (4, 124), (4, 125),
-- Club 5: 6 compétiteurs
(4, 132), (4, 133), (4, 134), (4, 135), (4, 136), (4, 137),
-- Club 6: 6 compétiteurs
(4, 144), (4, 145), (4, 146), (4, 147), (4, 148), (4, 149),
-- Club 7: 6 compétiteurs
(4, 156), (4, 157), (4, 158), (4, 159), (4, 160), (4, 161),
-- Club 8: 6 compétiteurs
(4, 168), (4, 169), (4, 170), (4, 171), (4, 172), (4, 173),
-- Club 9: 6 compétiteurs
(4, 180), (4, 181), (4, 182), (4, 183), (4, 184), (4, 185),
-- Club 10 (compétiteurs 191-200): 6 compétiteurs
(4, 191), (4, 192), (4, 193), (4, 194), (4, 195), (4, 196),

-- Concours 5: clubs 1-6, 10
-- Club 1: 6 compétiteurs
(5, 84), (5, 85), (5, 86), (5, 87), (5, 88), (5, 89),
-- Club 2: 6 compétiteurs
(5, 96), (5, 97), (5, 98), (5, 99), (5, 100), (5, 101),
-- Club 3: 6 compétiteurs
(5, 108), (5, 109), (5, 110), (5, 111), (5, 112), (5, 113),
-- Club 4: 6 compétiteurs
(5, 120), (5, 121), (5, 122), (5, 123), (5, 124), (5, 125),
-- Club 5: 6 compétiteurs
(5, 132), (5, 133), (5, 134), (5, 135), (5, 136), (5, 137),
-- Club 6: 6 compétiteurs
(5, 144), (5, 145), (5, 146), (5, 147), (5, 148), (5, 149),
-- Club 10: 6 compétiteurs
(5, 191), (5, 192), (5, 193), (5, 194), (5, 195), (5, 196),

-- Concours 6: clubs 3-9
-- Club 3: 6 compétiteurs
(6, 108), (6, 109), (6, 110), (6, 111), (6, 112), (6, 113),
-- Club 4: 6 compétiteurs
(6, 120), (6, 121), (6, 122), (6, 123), (6, 124), (6, 125),
-- Club 5: 6 compétiteurs
(6, 132), (6, 133), (6, 134), (6, 135), (6, 136), (6, 137),
-- Club 6: 6 compétiteurs
(6, 144), (6, 145), (6, 146), (6, 147), (6, 148), (6, 149),
-- Club 7: 6 compétiteurs
(6, 156), (6, 157), (6, 158), (6, 159), (6, 160), (6, 161),
-- Club 8: 6 compétiteurs
(6, 168), (6, 169), (6, 170), (6, 171), (6, 172), (6, 173),
-- Club 9: 6 compétiteurs
(6, 180), (6, 181), (6, 182), (6, 183), (6, 184), (6, 185),

-- Concours 7: clubs 1, 2, 5-10
-- Club 1: 6 compétiteurs
(7, 84), (7, 85), (7, 86), (7, 87), (7, 88), (7, 89),
-- Club 2: 6 compétiteurs
(7, 96), (7, 97), (7, 98), (7, 99), (7, 100), (7, 101),
-- Club 5: 6 compétiteurs
(7, 132), (7, 133), (7, 134), (7, 135), (7, 136), (7, 137),
-- Club 6: 6 compétiteurs
(7, 144), (7, 145), (7, 146), (7, 147), (7, 148), (7, 149),
-- Club 7: 6 compétiteurs
(7, 156), (7, 157), (7, 158), (7, 159), (7, 160), (7, 161),
-- Club 8: 6 compétiteurs
(7, 168), (7, 169), (7, 170), (7, 171), (7, 172), (7, 173),
-- Club 9: 6 compétiteurs
(7, 180), (7, 181), (7, 182), (7, 183), (7, 184), (7, 185),
-- Club 10: 6 compétiteurs
(7, 191), (7, 192), (7, 193), (7, 194), (7, 195), (7, 196),

-- Concours 8: clubs 1-8
-- Club 1: 6 compétiteurs
(8, 84), (8, 85), (8, 86), (8, 87), (8, 88), (8, 89),
-- Club 2: 6 compétiteurs
(8, 96), (8, 97), (8, 98), (8, 99), (8, 100), (8, 101),
-- Club 3: 6 compétiteurs
(8, 108), (8, 109), (8, 110), (8, 111), (8, 112), (8, 113),
-- Club 4: 6 compétiteurs
(8, 120), (8, 121), (8, 122), (8, 123), (8, 124), (8, 125),
-- Club 5: 6 compétiteurs
(8, 132), (8, 133), (8, 134), (8, 135), (8, 136), (8, 137),
-- Club 6: 6 compétiteurs
(8, 144), (8, 145), (8, 146), (8, 147), (8, 148), (8, 149),
-- Club 7: 6 compétiteurs
(8, 156), (8, 157), (8, 158), (8, 159), (8, 160), (8, 161),
-- Club 8: 6 compétiteurs
(8, 168), (8, 169), (8, 170), (8, 171), (8, 172), (8, 173);

-- =============================================================================
-- DESSINS (2 dessins par compétiteur dans les concours 1-4 évalués)
-- Maximum 3 dessins par compétiteur et par concours
-- =============================================================================
-- Concours 1 (42 compétiteurs × 2 dessins = 84 dessins)
INSERT INTO Dessin (commentaire, classement, date_remise, le_dessin, num_concours, num_competiteur) VALUES
('Un arbre magnifique', 1, '2024-04-15', '/uploads/dessin_c1_p84_1.jpg', 1, 84),
('Paysage de printemps', NULL, '2024-05-10', '/uploads/dessin_c1_p84_2.jpg', 1, 84),
('Fleurs colorées', 2, '2024-04-20', '/uploads/dessin_c1_p85_1.jpg', 1, 85),
('Jardin fleuri', NULL, '2024-05-05', '/uploads/dessin_c1_p85_2.jpg', 1, 85),
('Nature sauvage', 3, '2024-04-18', '/uploads/dessin_c1_p86_1.jpg', 1, 86),
('Forêt', NULL, '2024-05-12', '/uploads/dessin_c1_p86_2.jpg', 1, 86),
('Rivière', NULL, '2024-04-22', '/uploads/dessin_c1_p87_1.jpg', 1, 87),
('Montagne', NULL, '2024-05-08', '/uploads/dessin_c1_p87_2.jpg', 1, 87),
('Cascade', NULL, '2024-04-25', '/uploads/dessin_c1_p88_1.jpg', 1, 88),
('Lac', NULL, '2024-05-15', '/uploads/dessin_c1_p88_2.jpg', 1, 88),
('Prairie', NULL, '2024-04-28', '/uploads/dessin_c1_p89_1.jpg', 1, 89),
('Champ', NULL, '2024-05-18', '/uploads/dessin_c1_p89_2.jpg', 1, 89);

-- Concours 1 (ajout : dépôts depuis 5 autres clubs pour avoir 6 clubs actifs)
-- Club 2 : compétiteur 96 (2 dessins)
-- Club 3 : compétiteur 108 (2 dessins)
-- Club 4 : compétiteur 120 (2 dessins)
-- Club 5 : compétiteur 132 (2 dessins)
-- Club 6 : compétiteur 144 (2 dessins)
INSERT INTO Dessin (commentaire, classement, date_remise, le_dessin, num_concours, num_competiteur) VALUES
('Rue fleurie', NULL, '2024-04-16', '/uploads/dessin_c1_p96_1.jpg', 1, 96),
('Parc urbain', NULL, '2024-05-11', '/uploads/dessin_c1_p96_2.jpg', 1, 96),
('Forêt lumineuse', NULL, '2024-04-19', '/uploads/dessin_c1_p108_1.jpg', 1, 108),
('Ruisseau', NULL, '2024-05-13', '/uploads/dessin_c1_p108_2.jpg', 1, 108),
('Fleurs sauvages', NULL, '2024-04-23', '/uploads/dessin_c1_p120_1.jpg', 1, 120),
('Jardin botanique', NULL, '2024-05-09', '/uploads/dessin_c1_p120_2.jpg', 1, 120),
('Ciel de printemps', NULL, '2024-04-26', '/uploads/dessin_c1_p132_1.jpg', 1, 132),
('Champ de coquelicots', NULL, '2024-05-16', '/uploads/dessin_c1_p132_2.jpg', 1, 132),
('Monts verdoyants', NULL, '2024-04-29', '/uploads/dessin_c1_p144_1.jpg', 1, 144),
('Lac au matin', NULL, '2024-05-19', '/uploads/dessin_c1_p144_2.jpg', 1, 144);

-- =============================================================================
-- ÉVALUATIONS (chaque dessin évalué par 2 évaluateurs)
-- Maximum 8 dessins évalués par évaluateur dans un même concours
-- =============================================================================
-- Concours 1: 12 dessins, 2 évaluateurs par dessin
-- Évaluateur 24 évalue 8 dessins (dessins 1-8)
INSERT INTO Evaluation (num_dessin, num_evaluateur, date_evaluation, note, commentaire) VALUES
(1, 24, '2024-05-20', 18.5, 'Excellent travail sur la composition'),
(1, 25, '2024-05-21', 17.0, 'Belles couleurs'),
(2, 24, '2024-05-22', 16.0, 'Bon mais peut mieux faire'),
(2, 25, '2024-05-22', 16.5, 'Agréable'),
(3, 24, '2024-05-23', 17.5, 'Très créatif'),
(3, 26, '2024-05-23', 18.0, 'Superbe travail'),
(4, 24, '2024-05-24', 15.0, 'Correct'),
(4, 26, '2024-05-24', 15.5, 'Bien'),
(5, 24, '2024-05-25', 17.0, 'Bon dessin'),
(5, 26, '2024-05-25', 17.2, 'Très bien'),
(6, 24, '2024-05-26', 14.5, 'Moyen'),
(6, 26, '2024-05-26', 14.8, 'Passable'),
(7, 24, '2024-05-27', 16.5, 'Bon travail'),
(7, 25, '2024-05-27', 16.7, 'Satisfaisant'),
(8, 24, '2024-05-28', 17.8, 'Excellent'),
(8, 25, '2024-05-28', 18.2, 'Remarquable'),
-- Évaluateur 25 évalue 4 autres dessins (dessins 9-12)
(9, 25, '2024-05-29', 15.5, 'Bien réalisé'),
(9, 26, '2024-05-29', 15.8, 'Correct'),
(10, 25, '2024-05-30', 16.8, 'Très bon'),
(10, 26, '2024-05-30', 17.0, 'Excellent'),
(11, 25, '2024-05-31', 14.0, 'Peut mieux faire'),
(11, 30, '2024-05-31', 14.2, 'Passable'),
(12, 26, '2024-06-01', 16.0, 'Bon travail'),
(12, 30, '2024-06-01', 16.3, 'Bien');

-- Concours 1: ajout évaluations pour les nouveaux dessins (13-22)
-- Chaque dessin est évalué par 2 évaluateurs, et chaque évaluateur reste <= 8 dessins sur le concours.
INSERT INTO Evaluation (num_dessin, num_evaluateur, date_evaluation, note, commentaire) VALUES
(13, 30, '2024-05-20', 15.9, 'Bonne ambiance'),
(13, 31, '2024-05-20', 16.4, 'Détails intéressants'),
(14, 30, '2024-05-21', 16.8, 'Composition solide'),
(14, 32, '2024-05-21', 16.2, 'Couleurs équilibrées'),
(15, 31, '2024-05-22', 17.1, 'Très bon rendu'),
(15, 32, '2024-05-22', 17.4, 'Beau contraste'),
(16, 36, '2024-05-22', 16.6, 'Trait maîtrisé'),
(16, 37, '2024-05-22', 16.9, 'Très agréable'),
(17, 36, '2024-05-23', 15.7, 'Correct et propre'),
(17, 38, '2024-05-23', 15.9, 'Bon potentiel'),
(18, 37, '2024-05-23', 16.3, 'Harmonieux'),
(18, 38, '2024-05-23', 16.1, 'Bien réalisé'),
(19, 42, '2024-05-24', 17.6, 'Très expressif'),
(19, 43, '2024-05-24', 17.2, 'Belles formes'),
(20, 42, '2024-05-24', 16.9, 'Belle profondeur'),
(20, 44, '2024-05-24', 17.1, 'Très bon niveau'),
(21, 43, '2024-05-25', 16.0, 'Bien mais perfectible'),
(21, 44, '2024-05-25', 16.4, 'Bon équilibre'),
(22, 48, '2024-05-25', 17.0, 'Très réussi'),
(22, 49, '2024-05-25', 17.3, 'Remarquable');

-- =============================================================================
-- DONNÉES SUPPLÉMENTAIRES : CONCOURS 2 (Ville en Été)
-- Objectif : avoir des dépôts + évaluations multi-clubs pour tester les classements par concours
-- =============================================================================

-- Concours 2 : 12 dessins (6 clubs × 2 dessins)
-- Clubs : 2, 3, 4, 5, 6, 7 via compétiteurs 96, 108, 120, 132, 144, 156
INSERT INTO Dessin (commentaire, classement, date_remise, le_dessin, num_concours, num_competiteur) VALUES
('Rue animée', NULL, '2024-06-15', '/uploads/dessin_c2_p96_1.jpg', 2, 96),
('Marché d''été', NULL, '2024-07-10', '/uploads/dessin_c2_p96_2.jpg', 2, 96),
('Tram au soleil', NULL, '2024-06-18', '/uploads/dessin_c2_p108_1.jpg', 2, 108),
('Place centrale', NULL, '2024-07-12', '/uploads/dessin_c2_p108_2.jpg', 2, 108),
('Façades colorées', NULL, '2024-06-20', '/uploads/dessin_c2_p120_1.jpg', 2, 120),
('Café en terrasse', NULL, '2024-07-15', '/uploads/dessin_c2_p120_2.jpg', 2, 120),
('Pont au crépuscule', NULL, '2024-06-22', '/uploads/dessin_c2_p132_1.jpg', 2, 132),
('Quai en fête', NULL, '2024-07-18', '/uploads/dessin_c2_p132_2.jpg', 2, 132),
('Rues pavées', NULL, '2024-06-25', '/uploads/dessin_c2_p144_1.jpg', 2, 144),
('Vitrine d''atelier', NULL, '2024-07-20', '/uploads/dessin_c2_p144_2.jpg', 2, 144),
('Skyline d''été', NULL, '2024-06-28', '/uploads/dessin_c2_p156_1.jpg', 2, 156),
('Parc urbain au crépuscule', NULL, '2024-07-25', '/uploads/dessin_c2_p156_2.jpg', 2, 156);

-- Concours 2 : évaluations pour les nouveaux dessins (23-34)
-- Répartition simple pour respecter la contrainte "<= 8 dessins/évaluateur/concours".
INSERT INTO Evaluation (num_dessin, num_evaluateur, date_evaluation, note, commentaire) VALUES
(23, 30, '2024-08-05', 16.2, 'Bonne scène de rue'),
(23, 31, '2024-08-05', 16.8, 'Dynamique'),
(24, 30, '2024-08-06', 15.7, 'Sympa'),
(24, 31, '2024-08-06', 16.1, 'Bien composé'),

(25, 30, '2024-08-07', 17.3, 'Très réussi'),
(25, 31, '2024-08-07', 17.0, 'Bon rythme'),
(26, 30, '2024-08-08', 16.6, 'Solide'),
(26, 31, '2024-08-08', 16.9, 'Très propre'),

(27, 32, '2024-08-09', 15.9, 'Correct'),
(27, 36, '2024-08-09', 16.4, 'Bon rendu'),
(28, 32, '2024-08-10', 16.8, 'Belle atmosphère'),
(28, 36, '2024-08-10', 16.2, 'Harmonieux'),

(29, 32, '2024-08-11', 17.1, 'Très bon'),
(29, 36, '2024-08-11', 17.4, 'Excellent'),
(30, 32, '2024-08-12', 16.0, 'Bien'),
(30, 36, '2024-08-12', 16.6, 'Bonne perspective'),

(31, 37, '2024-08-13', 16.9, 'Beau travail'),
(31, 38, '2024-08-13', 16.5, 'Propre'),
(32, 37, '2024-08-14', 15.8, 'Peut mieux faire'),
(32, 38, '2024-08-14', 16.2, 'Correct'),

(33, 37, '2024-08-15', 17.2, 'Très bon niveau'),
(33, 38, '2024-08-15', 17.6, 'Remarquable'),
(34, 37, '2024-08-16', 16.1, 'Bien équilibré'),
(34, 38, '2024-08-16', 16.4, 'Bonne lecture');

-- =============================================================================
-- DONNÉES SUPPLÉMENTAIRES : CONCOURS 3 À 8
-- Objectif : ajouter des dépôts + évaluations pour couvrir l'ensemble des concours
-- Notes :
-- - On fixe explicitement num_dessin pour pouvoir référencer facilement les évaluations.
-- - Chaque dessin est évalué par 2 évaluateurs.
-- - Répartition pensée pour que chaque évaluateur reste <= 8 dessins évalués par concours.
-- =============================================================================

-- =============================================================================
-- CONCOURS 3 (Portraits d'Automne) : 12 dessins (6 clubs × 2 dessins)
-- Clubs via compétiteurs : 1, 3, 4, 5, 6, 7 (84, 108, 120, 132, 144, 156)
-- =============================================================================
INSERT INTO Dessin (num_dessin, commentaire, classement, date_remise, le_dessin, num_concours, num_competiteur) VALUES
(35, 'Portrait au fusain', NULL, '2024-09-15', '/uploads/dessin_c3_p84_1.jpg', 3, 84),
(36, 'Regard d''automne', NULL, '2024-10-05', '/uploads/dessin_c3_p84_2.jpg', 3, 84),
(37, 'Sourire en clair-obscur', NULL, '2024-09-18', '/uploads/dessin_c3_p108_1.jpg', 3, 108),
(38, 'Profil mélancolique', NULL, '2024-10-10', '/uploads/dessin_c3_p108_2.jpg', 3, 108),
(39, 'Portrait à l''encre', NULL, '2024-09-22', '/uploads/dessin_c3_p120_1.jpg', 3, 120),
(40, 'Autoportrait', NULL, '2024-10-12', '/uploads/dessin_c3_p120_2.jpg', 3, 120),
(41, 'Expression fragile', NULL, '2024-09-25', '/uploads/dessin_c3_p132_1.jpg', 3, 132),
(42, 'Lumière sur le visage', NULL, '2024-10-15', '/uploads/dessin_c3_p132_2.jpg', 3, 132),
(43, 'Rides et sagesse', NULL, '2024-09-28', '/uploads/dessin_c3_p144_1.jpg', 3, 144),
(44, 'Silhouette d''automne', NULL, '2024-10-20', '/uploads/dessin_c3_p144_2.jpg', 3, 144),
(45, 'Portrait pastel', NULL, '2024-10-01', '/uploads/dessin_c3_p156_1.jpg', 3, 156),
(46, 'Ombres et contrastes', NULL, '2024-10-25', '/uploads/dessin_c3_p156_2.jpg', 3, 156);

-- Concours 3 : évaluations (35-46)
INSERT INTO Evaluation (num_dessin, num_evaluateur, date_evaluation, note, commentaire) VALUES
(35, 24, '2024-11-20', 16.8, 'Trait précis'),
(35, 25, '2024-11-20', 17.1, 'Bonne expression'),
(36, 24, '2024-11-21', 15.9, 'Correct'),
(36, 25, '2024-11-21', 16.2, 'Belle ambiance'),
(37, 24, '2024-11-22', 17.4, 'Très bon rendu'),
(37, 25, '2024-11-22', 17.0, 'Solide'),
(38, 24, '2024-11-23', 16.1, 'Bien'),
(38, 25, '2024-11-23', 16.4, 'Propre'),
(39, 24, '2024-11-24', 17.8, 'Excellent contraste'),
(39, 25, '2024-11-24', 17.5, 'Très expressif'),
(40, 24, '2024-11-25', 16.6, 'Bon travail'),
(40, 25, '2024-11-25', 16.9, 'Harmonieux'),
(41, 36, '2024-11-26', 16.3, 'Bonne composition'),
(41, 37, '2024-11-26', 16.7, 'Belle lumière'),
(42, 36, '2024-11-27', 17.2, 'Très réussi'),
(42, 37, '2024-11-27', 17.0, 'Bon niveau'),
(43, 36, '2024-11-28', 15.8, 'Peut mieux faire'),
(43, 37, '2024-11-28', 16.0, 'Correct'),
(44, 36, '2024-11-29', 16.9, 'Beau rendu'),
(44, 37, '2024-11-29', 16.5, 'Propre'),
(45, 36, '2024-11-30', 17.6, 'Très expressif'),
(45, 37, '2024-11-30', 17.3, 'Remarquable'),
(46, 36, '2024-11-30', 16.2, 'Bien'),
(46, 37, '2024-11-30', 16.4, 'Bonne lecture');

-- =============================================================================
-- CONCOURS 4 (Abstrait d'Hiver) : 12 dessins (6 clubs × 2 dessins)
-- Clubs via compétiteurs : 1, 2, 4, 5, 6, 7 (84, 96, 120, 132, 144, 156)
-- =============================================================================
INSERT INTO Dessin (num_dessin, commentaire, classement, date_remise, le_dessin, num_concours, num_competiteur) VALUES
(47, 'Formes géométriques', NULL, '2025-01-05', '/uploads/dessin_c4_p84_1.jpg', 4, 84),
(48, 'Abstrait glacé', NULL, '2025-02-01', '/uploads/dessin_c4_p84_2.jpg', 4, 84),
(49, 'Couleurs d''hiver', NULL, '2025-01-08', '/uploads/dessin_c4_p96_1.jpg', 4, 96),
(50, 'Textures froides', NULL, '2025-02-03', '/uploads/dessin_c4_p96_2.jpg', 4, 96),
(51, 'Composition minimaliste', NULL, '2025-01-12', '/uploads/dessin_c4_p120_1.jpg', 4, 120),
(52, 'Rythme abstrait', NULL, '2025-02-06', '/uploads/dessin_c4_p120_2.jpg', 4, 120),
(53, 'Taches et lumière', NULL, '2025-01-15', '/uploads/dessin_c4_p132_1.jpg', 4, 132),
(54, 'Contrastes', NULL, '2025-02-10', '/uploads/dessin_c4_p132_2.jpg', 4, 132),
(55, 'Fragments', NULL, '2025-01-18', '/uploads/dessin_c4_p144_1.jpg', 4, 144),
(56, 'Vagues abstraites', NULL, '2025-02-14', '/uploads/dessin_c4_p144_2.jpg', 4, 144),
(57, 'Éclats', NULL, '2025-01-22', '/uploads/dessin_c4_p156_1.jpg', 4, 156),
(58, 'Hiver chromatique', NULL, '2025-02-18', '/uploads/dessin_c4_p156_2.jpg', 4, 156);

-- Concours 4 : évaluations (47-58)
INSERT INTO Evaluation (num_dessin, num_evaluateur, date_evaluation, note, commentaire) VALUES
(47, 30, '2025-02-15', 16.4, 'Bonne structure'),
(47, 31, '2025-02-15', 16.8, 'Intéressant'),
(48, 30, '2025-02-16', 15.7, 'Correct'),
(48, 31, '2025-02-16', 16.0, 'Bien'),
(49, 30, '2025-02-17', 17.0, 'Très bon'),
(49, 31, '2025-02-17', 17.2, 'Solide'),
(50, 30, '2025-02-18', 16.1, 'Propre'),
(50, 31, '2025-02-18', 16.3, 'Bon rendu'),
(51, 30, '2025-02-19', 17.5, 'Très réussi'),
(51, 31, '2025-02-19', 17.1, 'Belle cohérence'),
(52, 30, '2025-02-20', 16.6, 'Bien équilibré'),
(52, 31, '2025-02-20', 16.9, 'Bonne énergie'),
(53, 42, '2025-02-21', 16.0, 'Correct'),
(53, 43, '2025-02-21', 16.4, 'Bonne lecture'),
(54, 42, '2025-02-22', 17.3, 'Très bon'),
(54, 43, '2025-02-22', 17.0, 'Bien'),
(55, 42, '2025-02-23', 15.9, 'Peut mieux faire'),
(55, 43, '2025-02-23', 16.1, 'Correct'),
(56, 42, '2025-02-24', 16.8, 'Beau contraste'),
(56, 43, '2025-02-24', 16.6, 'Propre'),
(57, 42, '2025-02-25', 17.6, 'Excellent'),
(57, 43, '2025-02-25', 17.2, 'Remarquable'),
(58, 42, '2025-02-26', 16.2, 'Bien'),
(58, 43, '2025-02-26', 16.5, 'Bonne harmonie');

-- =============================================================================
-- CONCOURS 5 (Animaux du Printemps) : 12 dessins (6 clubs × 2 dessins)
-- Clubs via compétiteurs : 1, 2, 3, 4, 5, 6 (84, 96, 108, 120, 132, 144)
-- =============================================================================
INSERT INTO Dessin (num_dessin, commentaire, classement, date_remise, le_dessin, num_concours, num_competiteur) VALUES
(59, 'Chat au soleil', NULL, '2025-03-20', '/uploads/dessin_c5_p84_1.jpg', 5, 84),
(60, 'Oiseau en vol', NULL, '2025-04-10', '/uploads/dessin_c5_p84_2.jpg', 5, 84),
(61, 'Renard discret', NULL, '2025-03-22', '/uploads/dessin_c5_p96_1.jpg', 5, 96),
(62, 'Lapin dans l''herbe', NULL, '2025-04-12', '/uploads/dessin_c5_p96_2.jpg', 5, 96),
(63, 'Cheval au galop', NULL, '2025-03-25', '/uploads/dessin_c5_p108_1.jpg', 5, 108),
(64, 'Poisson abstrait', NULL, '2025-04-15', '/uploads/dessin_c5_p108_2.jpg', 5, 108),
(65, 'Chien fidèle', NULL, '2025-03-28', '/uploads/dessin_c5_p120_1.jpg', 5, 120),
(66, 'Papillon', NULL, '2025-04-18', '/uploads/dessin_c5_p120_2.jpg', 5, 120),
(67, 'Hibou nocturne', NULL, '2025-04-01', '/uploads/dessin_c5_p132_1.jpg', 5, 132),
(68, 'Biche', NULL, '2025-04-20', '/uploads/dessin_c5_p132_2.jpg', 5, 132),
(69, 'Tortue', NULL, '2025-04-05', '/uploads/dessin_c5_p144_1.jpg', 5, 144),
(70, 'Loup', NULL, '2025-04-25', '/uploads/dessin_c5_p144_2.jpg', 5, 144);

-- Concours 5 : évaluations (59-70)
INSERT INTO Evaluation (num_dessin, num_evaluateur, date_evaluation, note, commentaire) VALUES
(59, 36, '2025-05-20', 16.7, 'Beau mouvement'),
(59, 37, '2025-05-20', 16.9, 'Bien réalisé'),
(60, 36, '2025-05-21', 17.4, 'Très bon'),
(60, 37, '2025-05-21', 17.0, 'Propre'),
(61, 36, '2025-05-22', 16.1, 'Correct'),
(61, 37, '2025-05-22', 16.4, 'Bonne ambiance'),
(62, 36, '2025-05-23', 15.8, 'Simple mais efficace'),
(62, 37, '2025-05-23', 16.0, 'Bien'),
(63, 36, '2025-05-24', 17.6, 'Excellent'),
(63, 37, '2025-05-24', 17.2, 'Remarquable'),
(64, 36, '2025-05-25', 16.5, 'Original'),
(64, 37, '2025-05-25', 16.8, 'Créatif'),
(65, 48, '2025-05-26', 16.2, 'Bon dessin'),
(65, 49, '2025-05-26', 16.6, 'Propre'),
(66, 48, '2025-05-27', 17.1, 'Très bon'),
(66, 49, '2025-05-27', 16.9, 'Belle couleur'),
(67, 48, '2025-05-28', 16.0, 'Correct'),
(67, 49, '2025-05-28', 16.3, 'Bien'),
(68, 48, '2025-05-29', 17.3, 'Très réussi'),
(68, 49, '2025-05-29', 17.1, 'Solide'),
(69, 48, '2025-05-30', 15.9, 'Peut mieux faire'),
(69, 49, '2025-05-30', 16.1, 'Correct'),
(70, 48, '2025-05-31', 17.8, 'Excellent'),
(70, 49, '2025-05-31', 17.5, 'Remarquable');

-- =============================================================================
-- CONCOURS 6 (Paysages d'Été) : 12 dessins (6 clubs × 2 dessins)
-- Clubs via compétiteurs : 3, 4, 5, 6, 7, 8 (108, 120, 132, 144, 156, 168)
-- =============================================================================
INSERT INTO Dessin (num_dessin, commentaire, classement, date_remise, le_dessin, num_concours, num_competiteur) VALUES
(71, 'Côte ensoleillée', NULL, '2025-06-20', '/uploads/dessin_c6_p108_1.jpg', 6, 108),
(72, 'Plage au matin', NULL, '2025-07-10', '/uploads/dessin_c6_p108_2.jpg', 6, 108),
(73, 'Montagnes lointaines', NULL, '2025-06-22', '/uploads/dessin_c6_p120_1.jpg', 6, 120),
(74, 'Vallée d''été', NULL, '2025-07-12', '/uploads/dessin_c6_p120_2.jpg', 6, 120),
(75, 'Forêt lumineuse', NULL, '2025-06-25', '/uploads/dessin_c6_p132_1.jpg', 6, 132),
(76, 'Rivière claire', NULL, '2025-07-15', '/uploads/dessin_c6_p132_2.jpg', 6, 132),
(77, 'Champ doré', NULL, '2025-06-28', '/uploads/dessin_c6_p144_1.jpg', 6, 144),
(78, 'Nuages d''été', NULL, '2025-07-18', '/uploads/dessin_c6_p144_2.jpg', 6, 144),
(79, 'Ville au loin', NULL, '2025-07-01', '/uploads/dessin_c6_p156_1.jpg', 6, 156),
(80, 'Port au crépuscule', NULL, '2025-07-20', '/uploads/dessin_c6_p156_2.jpg', 6, 156),
(81, 'Lac tranquille', NULL, '2025-07-05', '/uploads/dessin_c6_p168_1.jpg', 6, 168),
(82, 'Route vers l''horizon', NULL, '2025-07-25', '/uploads/dessin_c6_p168_2.jpg', 6, 168);

-- Concours 6 : évaluations (71-82)
INSERT INTO Evaluation (num_dessin, num_evaluateur, date_evaluation, note, commentaire) VALUES
(71, 60, '2025-08-20', 16.6, 'Bonne profondeur'),
(71, 61, '2025-08-20', 16.9, 'Beau travail'),
(72, 60, '2025-08-21', 16.0, 'Correct'),
(72, 61, '2025-08-21', 16.3, 'Bien'),
(73, 60, '2025-08-22', 17.2, 'Très bon'),
(73, 61, '2025-08-22', 17.0, 'Solide'),
(74, 60, '2025-08-23', 16.4, 'Propre'),
(74, 61, '2025-08-23', 16.6, 'Harmonieux'),
(75, 60, '2025-08-24', 17.6, 'Excellent'),
(75, 61, '2025-08-24', 17.3, 'Remarquable'),
(76, 60, '2025-08-25', 16.8, 'Très agréable'),
(76, 61, '2025-08-25', 17.1, 'Bon niveau'),
(77, 66, '2025-08-26', 16.1, 'Correct'),
(77, 67, '2025-08-26', 16.4, 'Bien composé'),
(78, 66, '2025-08-27', 17.0, 'Très bon'),
(78, 67, '2025-08-27', 16.7, 'Propre'),
(79, 66, '2025-08-28', 15.8, 'Peut mieux faire'),
(79, 67, '2025-08-28', 16.0, 'Correct'),
(80, 66, '2025-08-29', 17.3, 'Très réussi'),
(80, 67, '2025-08-29', 17.1, 'Belle atmosphère'),
(81, 66, '2025-08-30', 16.5, 'Bien'),
(81, 67, '2025-08-30', 16.8, 'Bonne lecture'),
(82, 66, '2025-08-31', 17.7, 'Excellent'),
(82, 67, '2025-08-31', 17.4, 'Remarquable');

-- =============================================================================
-- CONCOURS 7 (Architecture d'Automne) : 12 dessins (6 clubs × 2 dessins)
-- Clubs via compétiteurs : 1, 2, 5, 6, 7, 8 (84, 96, 132, 144, 156, 168)
-- =============================================================================
INSERT INTO Dessin (num_dessin, commentaire, classement, date_remise, le_dessin, num_concours, num_competiteur) VALUES
(83, 'Façade ancienne', NULL, '2025-09-20', '/uploads/dessin_c7_p84_1.jpg', 7, 84),
(84, 'Pont métallique', NULL, '2025-10-10', '/uploads/dessin_c7_p84_2.jpg', 7, 84),
(85, 'Immeuble moderne', NULL, '2025-09-22', '/uploads/dessin_c7_p96_1.jpg', 7, 96),
(86, 'Escalier en spirale', NULL, '2025-10-12', '/uploads/dessin_c7_p96_2.jpg', 7, 96),
(87, 'Cathédrale', NULL, '2025-09-25', '/uploads/dessin_c7_p132_1.jpg', 7, 132),
(88, 'Place urbaine', NULL, '2025-10-15', '/uploads/dessin_c7_p132_2.jpg', 7, 132),
(89, 'Arcades', NULL, '2025-09-28', '/uploads/dessin_c7_p144_1.jpg', 7, 144),
(90, 'Toits d''ardoise', NULL, '2025-10-18', '/uploads/dessin_c7_p144_2.jpg', 7, 144),
(91, 'Gare', NULL, '2025-10-01', '/uploads/dessin_c7_p156_1.jpg', 7, 156),
(92, 'Bibliothèque', NULL, '2025-10-20', '/uploads/dessin_c7_p156_2.jpg', 7, 156),
(93, 'Tour panoramique', NULL, '2025-10-05', '/uploads/dessin_c7_p168_1.jpg', 7, 168),
(94, 'Rue historique', NULL, '2025-10-25', '/uploads/dessin_c7_p168_2.jpg', 7, 168);

-- Concours 7 : évaluations (83-94)
INSERT INTO Evaluation (num_dessin, num_evaluateur, date_evaluation, note, commentaire) VALUES
(83, 72, '2025-11-20', 16.5, 'Bonne perspective'),
(83, 73, '2025-11-20', 16.8, 'Propre'),
(84, 72, '2025-11-21', 17.1, 'Très bon'),
(84, 73, '2025-11-21', 16.9, 'Solide'),
(85, 72, '2025-11-22', 16.0, 'Correct'),
(85, 73, '2025-11-22', 16.2, 'Bien'),
(86, 72, '2025-11-23', 16.7, 'Beau rendu'),
(86, 73, '2025-11-23', 16.4, 'Bonne lecture'),
(87, 72, '2025-11-24', 17.6, 'Excellent'),
(87, 73, '2025-11-24', 17.3, 'Remarquable'),
(88, 72, '2025-11-25', 16.9, 'Très agréable'),
(88, 73, '2025-11-25', 17.0, 'Bon niveau'),
(89, 78, '2025-11-26', 16.2, 'Correct'),
(89, 79, '2025-11-26', 16.5, 'Bien'),
(90, 78, '2025-11-27', 16.8, 'Beau contraste'),
(90, 79, '2025-11-27', 16.6, 'Propre'),
(91, 78, '2025-11-28', 15.9, 'Peut mieux faire'),
(91, 79, '2025-11-28', 16.1, 'Correct'),
(92, 78, '2025-11-29', 17.2, 'Très réussi'),
(92, 79, '2025-11-29', 16.9, 'Solide'),
(93, 78, '2025-11-30', 16.6, 'Bien'),
(93, 79, '2025-11-30', 16.8, 'Bonne lecture'),
(94, 78, '2025-11-30', 17.7, 'Excellent'),
(94, 79, '2025-11-30', 17.4, 'Remarquable');

-- =============================================================================
-- CONCOURS 8 (Fantastique d'Hiver) : 12 dessins (6 clubs × 2 dessins)
-- Clubs via compétiteurs : 1, 2, 3, 4, 5, 6 (84, 96, 108, 120, 132, 144)
-- =============================================================================
INSERT INTO Dessin (num_dessin, commentaire, classement, date_remise, le_dessin, num_concours, num_competiteur) VALUES
(95, 'Dragon endormi', NULL, '2025-12-20', '/uploads/dessin_c8_p84_1.jpg', 8, 84),
(96, 'Forêt enchantée', NULL, '2026-01-10', '/uploads/dessin_c8_p84_2.jpg', 8, 84),
(97, 'Château dans les nuages', NULL, '2025-12-22', '/uploads/dessin_c8_p96_1.jpg', 8, 96),
(98, 'Chevalier perdu', NULL, '2026-01-12', '/uploads/dessin_c8_p96_2.jpg', 8, 96),
(99, 'Sorcière', NULL, '2025-12-25', '/uploads/dessin_c8_p108_1.jpg', 8, 108),
(100, 'Potion lumineuse', NULL, '2026-01-15', '/uploads/dessin_c8_p108_2.jpg', 8, 108),
(101, 'Créature marine', NULL, '2025-12-28', '/uploads/dessin_c8_p120_1.jpg', 8, 120),
(102, 'Portail', NULL, '2026-01-18', '/uploads/dessin_c8_p120_2.jpg', 8, 120),
(103, 'Géant de glace', NULL, '2026-01-02', '/uploads/dessin_c8_p132_1.jpg', 8, 132),
(104, 'Lune violette', NULL, '2026-01-20', '/uploads/dessin_c8_p132_2.jpg', 8, 132),
(105, 'Phénix', NULL, '2026-01-05', '/uploads/dessin_c8_p144_1.jpg', 8, 144),
(106, 'Cité fantastique', NULL, '2026-01-25', '/uploads/dessin_c8_p144_2.jpg', 8, 144);

-- Concours 8 : évaluations (95-106)
INSERT INTO Evaluation (num_dessin, num_evaluateur, date_evaluation, note, commentaire) VALUES
(95, 54, '2026-02-10', 16.9, 'Très bon univers'),
(95, 55, '2026-02-10', 17.2, 'Belle narration'),
(96, 54, '2026-02-11', 16.2, 'Bien'),
(96, 55, '2026-02-11', 16.5, 'Atmosphère réussie'),
(97, 54, '2026-02-12', 17.4, 'Très bon'),
(97, 55, '2026-02-12', 17.0, 'Solide'),
(98, 54, '2026-02-13', 16.0, 'Correct'),
(98, 55, '2026-02-13', 16.3, 'Bien'),
(99, 54, '2026-02-14', 17.6, 'Excellent'),
(99, 55, '2026-02-14', 17.3, 'Remarquable'),
(100, 54, '2026-02-15', 16.7, 'Créatif'),
(100, 55, '2026-02-15', 16.9, 'Bonne idée'),
(101, 60, '2026-02-16', 16.1, 'Correct'),
(101, 61, '2026-02-16', 16.4, 'Bien réalisé'),
(102, 60, '2026-02-17', 17.0, 'Très bon'),
(102, 61, '2026-02-17', 16.7, 'Propre'),
(103, 60, '2026-02-18', 15.8, 'Peut mieux faire'),
(103, 61, '2026-02-18', 16.0, 'Correct'),
(104, 60, '2026-02-19', 17.2, 'Très réussi'),
(104, 61, '2026-02-19', 16.9, 'Solide'),
(105, 60, '2026-02-20', 16.6, 'Bien'),
(105, 61, '2026-02-20', 16.8, 'Bonne lecture'),
(106, 60, '2026-02-21', 17.7, 'Excellent'),
(106, 61, '2026-02-21', 17.4, 'Remarquable');

-- =============================================================================
-- FIN DU FICHIER D'INSERTION
-- =============================================================================
