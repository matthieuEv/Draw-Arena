DROP TABLE IF EXISTS Club_Concours;
DROP TABLE IF EXISTS Concours_Competiteur;
DROP TABLE IF EXISTS Club_Directeur;
DROP TABLE IF EXISTS Concours_Evaluateur;
DROP TABLE IF EXISTS Evaluation;
DROP TABLE IF EXISTS Dessin;
DROP TABLE IF EXISTS Concours;
DROP TABLE IF EXISTS Directeur;
DROP TABLE IF EXISTS Administrateur;
DROP TABLE IF EXISTS President;
DROP TABLE IF EXISTS Evaluateur;
DROP TABLE IF EXISTS Competiteur;
DROP TABLE IF EXISTS Utilisateur;
DROP TABLE IF EXISTS Club;
USE drawarena;

CREATE TABLE IF NOT EXISTS Club (
    num_club INT AUTO_INCREMENT PRIMARY KEY,
    nom_club VARCHAR(255) NOT NULL,
    adresse VARCHAR(255),
    num_telephone VARCHAR(20),
    nombre_adherents INT NOT NULL,
    ville VARCHAR(100) NOT NULL,
    departement VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Utilisateur (
    num_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    adresse VARCHAR(255),
    login VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    photo_profil_url VARCHAR(255),
    type_compte ENUM('prive', 'public') NOT NULL,
    num_club INT,
    CONSTRAINT fk_utilisateur_club FOREIGN KEY (num_club) REFERENCES Club(num_club)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Competiteur (
    num_competiteur INT PRIMARY KEY,
    date_premiere_participation DATE NOT NULL,
    CONSTRAINT fk_competiteur_utilisateur FOREIGN KEY (num_competiteur) REFERENCES Utilisateur(num_utilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Evaluateur (
    num_evaluateur INT PRIMARY KEY,
    specialite VARCHAR(255) NOT NULL,
    CONSTRAINT fk_evaluateur_utilisateur FOREIGN KEY (num_evaluateur) REFERENCES Utilisateur(num_utilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS President (
    num_president INT PRIMARY KEY,
    prime FLOAT,
    CONSTRAINT fk_president_utilisateur FOREIGN KEY (num_president) REFERENCES Utilisateur(num_utilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Administrateur (
    num_administrateur INT PRIMARY KEY,
    date_debut DATE NOT NULL,
    CONSTRAINT fk_administrateur_utilisateur FOREIGN KEY (num_administrateur) REFERENCES Utilisateur(num_utilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Directeur (
    num_directeur INT PRIMARY KEY,
    date_debut DATE NOT NULL,
    CONSTRAINT fk_directeur_utilisateur FOREIGN KEY (num_directeur) REFERENCES Utilisateur(num_utilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Concours (
    num_concours INT AUTO_INCREMENT PRIMARY KEY,
    theme VARCHAR(255) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    description TEXT,
    etat ENUM('pas_commence', 'en_cours', 'attente', 'resultat', 'evalue') NOT NULL,
    num_club INT,
    num_president INT NOT NULL,
    CONSTRAINT fk_concours_club FOREIGN KEY (num_club) REFERENCES Club(num_club),
    CONSTRAINT fk_concours_president FOREIGN KEY (num_president) REFERENCES President(num_utilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Dessin (
    num_dessin INT AUTO_INCREMENT PRIMARY KEY,
    commentaire TEXT,
    classement INT,
    date_remise DATE NOT NULL,
    le_dessin VARCHAR(255) NOT NULL,
    num_concours INT NOT NULL,
    num_competiteur INT NOT NULL,
    CONSTRAINT fk_dessin_concours FOREIGN KEY (num_concours) REFERENCES Concours(num_concours),
    CONSTRAINT fk_dessin_competiteur FOREIGN KEY (num_competiteur) REFERENCES Competiteur(num_utilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Evaluation (
    num_dessin INT,
    num_evaluateur INT,
    date_evaluation DATE NOT NULL,
    note FLOAT NOT NULL,
    commentaire TEXT,
    PRIMARY KEY (num_dessin, num_evaluateur),
    CONSTRAINT fk_evaluation_dessin FOREIGN KEY (num_dessin) REFERENCES Dessin(num_dessin),
    CONSTRAINT fk_evaluation_evaluateur FOREIGN KEY (num_evaluateur) REFERENCES Evaluateur(num_utilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Concours_Evaluateur (
    num_concours INT NOT NULL,
    num_evaluateur INT NOT NULL,
    PRIMARY KEY (num_concours, num_evaluateur),
    CONSTRAINT fk_concours_evaluateur_concours FOREIGN KEY (num_concours) REFERENCES Concours(num_concours),
    CONSTRAINT fk_concours_evaluateur_evaluateur FOREIGN KEY (num_evaluateur) REFERENCES Evaluateur(num_utilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Club_Directeur (
    num_club INT,
    num_directeur INT,
    PRIMARY KEY (num_club, num_directeur),
    CONSTRAINT fk_club_directeur_club FOREIGN KEY (num_club) REFERENCES Club(num_club),
    CONSTRAINT fk_club_directeur_directeur FOREIGN KEY (num_directeur) REFERENCES Directeur(num_utilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Concours_Competiteur (
    num_concours INT,
    num_competiteur INT,
    PRIMARY KEY (num_concours, num_competiteur),
    CONSTRAINT fk_concours_competiteur_concours FOREIGN KEY (num_concours) REFERENCES Concours(num_concours),
    CONSTRAINT fk_concours_competiteur_competiteur FOREIGN KEY (num_competiteur) REFERENCES Competiteur(num_utilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Club_Concours (
    num_club INT,
    num_concours INT,
    PRIMARY KEY (num_concours, num_club),
    CONSTRAINT fk_club_concours_club FOREIGN KEY (num_club) REFERENCES Club(num_club),
    CONSTRAINT fk_club_concours_concours FOREIGN KEY (num_concours) REFERENCES Concours(num_concours)
) ENGINE=InnoDB;
