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

-- Insert sample data

-- Clubs
INSERT INTO Club (nom_club, adresse, num_telephone, ville, departement, region) VALUES
('Club des Artistes', '123 Rue de Paris', '0123456789', 'Paris', '75', 'Île-de-France'),
('Club des Peintres', '456 Rue de Lyon', '0987654321', 'Lyon', '69', 'Auvergne-Rhône-Alpes');

-- Utilisateurs (password hash for "password" using PASSWORD_BCRYPT)
INSERT INTO Utilisateur (nom, prenom, adresse, age, login, mot_de_passe, type_compte, num_club) VALUES
('Dupont', 'Jean', '10 Rue A', 30, 'a@a.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', 1),
('Martin', 'Marie', '20 Rue B', 25, 'marie@example.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'prive', 2),
('Admin', 'User', '30 Rue C', 40, 'admin@example.fr', '$2y$10$QVg80szbDY2Mta5PoysTo.pCcRFpMb2hnYzmTTIch72fp/LD3xSIu', 'public', NULL);

-- Administrateurs
INSERT INTO Administrateur (num_administrateur, date_debut) VALUES
(1, '2024-01-01');
