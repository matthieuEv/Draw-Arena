# Schéma de Base de Données Textuel - Draw Arena

## Tables

### 1. Club
- <u>numClub</u> : ID
- nomClub : String
- adresse : String
- numTéléphone : String
- nombreAdherents : int
- ville : String
- département : String
- région : String

### 2. Utilisateur
- <u>numUtilisateur</u> : ID
- nom : String
- prénom : String
- adresse : String
- login : String
- motDePasse : String
- typeCompte : enum {'prive', 'public'}
- numClub* : ID

### 3. Concours
- <u>numConcours</u> : ID
- thème : String
- dateDebut : Date
- dateFin : Date
- etat : enum {'pas commence', 'en cours', 'attente', 'resultat', 'evalue'}
- numClub* : ID
- numPresident* : ID

### 4. Dessin
- <u>numDessin</u> : ID
- commentaire : String
- classement : int
- dateRemise : Date
- leDessin : Blob
- numConcours* : ID
- numCompetiteur* : ID

### 5. Evaluation
- numDessin* : ID
- numEvaluateur* : ID
- dateEvaluation : Date
- note : float
- commentaire : String
- Clé primaire composite* : (numDessin, numEvaluateur)

### 6. Compétiteur
- <u>numUtilisateur*</u> : ID
- datePremiereParticipation : Date

### 7. Evaluateur
- <u>numUtilisateur*</u> : ID
- specialite : String

### 8. Président
- <u>numUtilisateur*</u> : ID
- prime : float

### 9. Administrateur
- <u>numUtilisateur*</u> : ID
- dateDebut : Date

### 10. Directeur
- <u>numUtilisateur*</u> : ID
- dateDebut : Date

### 11. Concours_Evaluateur
- numConcours* : ID
- numEvaluateur* : ID
- Clé primaire composite* : (numConcours, numEvaluateur)

### 12. Club_Directeur
- numClub* : ID
- numDirecteur* : ID 
- Clé primaire* : (numClub, numDirecteur)

### 13. Concours_Competiteur
- numConcours* : ID
- numCompetiteur* : ID
- Clé primaire* : (numConcours, numCompetiteur)

### 14. Club_Concours
- numClub* : ID
- numConcours* : ID
- Clé primaire* : (numConcours, numClub)