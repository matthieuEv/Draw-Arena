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
    numClub INT AUTO_INCREMENT PRIMARY KEY,
    nomClub VARCHAR(255) NOT NULL,
    adresse VARCHAR(255),
    numTelephone VARCHAR(20),
    nombreAdherents INT,
    ville VARCHAR(100),
    departement VARCHAR(100),
    region VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Utilisateur (
    numUtilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    adresse VARCHAR(255),
    login VARCHAR(100) UNIQUE NOT NULL,
    motDePasse VARCHAR(255) NOT NULL,
    typeCompte ENUM('prive', 'public') NOT NULL,
    numClub INT,
    CONSTRAINT fk_utilisateur_club FOREIGN KEY (numClub) REFERENCES Club(numClub)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Competiteur (
    numUtilisateur INT PRIMARY KEY,
    datePremiereParticipation DATE,
    CONSTRAINT fk_competiteur_utilisateur FOREIGN KEY (numUtilisateur) REFERENCES Utilisateur(numUtilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Evaluateur (
    numUtilisateur INT PRIMARY KEY,
    specialite VARCHAR(255),
    CONSTRAINT fk_evaluateur_utilisateur FOREIGN KEY (numUtilisateur) REFERENCES Utilisateur(numUtilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS President (
    numUtilisateur INT PRIMARY KEY,
    prime FLOAT,
    CONSTRAINT fk_president_utilisateur FOREIGN KEY (numUtilisateur) REFERENCES Utilisateur(numUtilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Administrateur (
    numUtilisateur INT PRIMARY KEY,
    dateDebut DATE,
    CONSTRAINT fk_administrateur_utilisateur FOREIGN KEY (numUtilisateur) REFERENCES Utilisateur(numUtilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Directeur (
    numUtilisateur INT PRIMARY KEY,
    dateDebut DATE,
    CONSTRAINT fk_directeur_utilisateur FOREIGN KEY (numUtilisateur) REFERENCES Utilisateur(numUtilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Concours (
    numConcours INT AUTO_INCREMENT PRIMARY KEY,
    theme VARCHAR(255) NOT NULL,
    dateDebut DATE,
    dateFin DATE,
    etat ENUM('pas commence', 'en cours', 'attente', 'resultat', 'evalue') NOT NULL,
    numClub INT,
    numPresident INT,
    CONSTRAINT fk_concours_club FOREIGN KEY (numClub) REFERENCES Club(numClub),
    CONSTRAINT fk_concours_president FOREIGN KEY (numPresident) REFERENCES President(numUtilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Dessin (
    numDessin INT AUTO_INCREMENT PRIMARY KEY,
    commentaire TEXT,
    classement INT,
    dateRemise DATE,
    leDessin VARCHAR(255),
    numConcours INT,
    numCompetiteur INT,
    CONSTRAINT fk_dessin_concours FOREIGN KEY (numConcours) REFERENCES Concours(numConcours),
    CONSTRAINT fk_dessin_competiteur FOREIGN KEY (numCompetiteur) REFERENCES Competiteur(numUtilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Evaluation (
    numDessin INT,
    numEvaluateur INT,
    dateEvaluation DATE,
    note FLOAT,
    commentaire TEXT,
    PRIMARY KEY (numDessin, numEvaluateur),
    CONSTRAINT fk_evaluation_dessin FOREIGN KEY (numDessin) REFERENCES Dessin(numDessin),
    CONSTRAINT fk_evaluation_evaluateur FOREIGN KEY (numEvaluateur) REFERENCES Evaluateur(numUtilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Concours_Evaluateur (
    numConcours INT,
    numEvaluateur INT,
    PRIMARY KEY (numConcours, numEvaluateur),
    CONSTRAINT fk_concours_evaluateur_concours FOREIGN KEY (numConcours) REFERENCES Concours(numConcours),
    CONSTRAINT fk_concours_evaluateur_evaluateur FOREIGN KEY (numEvaluateur) REFERENCES Evaluateur(numUtilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Club_Directeur (
    numClub INT,
    numDirecteur INT,
    PRIMARY KEY (numClub, numDirecteur),
    CONSTRAINT fk_club_directeur_club FOREIGN KEY (numClub) REFERENCES Club(numClub),
    CONSTRAINT fk_club_directeur_directeur FOREIGN KEY (numDirecteur) REFERENCES Directeur(numUtilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Concours_Competiteur (
    numConcours INT,
    numCompetiteur INT,
    PRIMARY KEY (numConcours, numCompetiteur),
    CONSTRAINT fk_concours_competiteur_concours FOREIGN KEY (numConcours) REFERENCES Concours(numConcours),
    CONSTRAINT fk_concours_competiteur_competiteur FOREIGN KEY (numCompetiteur) REFERENCES Competiteur(numUtilisateur)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Club_Concours (
    numClub INT,
    numConcours INT,
    PRIMARY KEY (numConcours, numClub),
    CONSTRAINT fk_club_concours_club FOREIGN KEY (numClub) REFERENCES Club(numClub),
    CONSTRAINT fk_club_concours_concours FOREIGN KEY (numConcours) REFERENCES Concours(numConcours)
) ENGINE=InnoDB;
