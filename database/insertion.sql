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

-- Utilisateurs
INSERT INTO Utilisateur (nom, prenom, adresse, login, mot_de_passe, type_compte, num_club) VALUES
('Doe', 'John', '10 Rue A', 'johndoe', '$2y$10$hashedpassword1', 'public', NULL);
