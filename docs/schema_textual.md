# Schema de Base de Donnees Textuel - Draw Arena

## Tables

### 1. Club
- <u>num_club</u> : ID
- nom_club : String
- adresse : String
- num_telephone : String
- nombre_adherents : int
- ville : String
- departement : String
- region : String

### 2. Utilisateur
- <u>num_utilisateur</u> : ID
- nom : String
- prenom : String
- adresse : String
- login : String
- mot_de_passe : String
- photo_profil_url : String
- type_compte : enum {'prive', 'public'}
- num_club* : ID

### 3. Concours
- <u>num_concours</u> : ID
- theme : String
- date_debut : Date
- description : String
- date_fin : Date
- etat : enum {'pas commence', 'en cours', 'attente', 'resultat', 'evalue'}
- etat : enum {'pas_commence', 'en_cours', 'attente', 'resultat', 'evalue'}
- num_club* : ID
- num_president* : ID

### 4. Dessin
- <u>num_dessin</u> : ID
- commentaire : String
- classement : int
- date_remise : Date
- le_dessin : String
- num_concours* : ID
- num_competiteur* : ID

### 5. Evaluation
- num_dessin* : ID
- num_evaluateur* : ID
- date_evaluation : Date
- note : float
- commentaire : String
- Cle primaire composite* : (num_dessin, num_evaluateur)

### 6. Competiteur
- <u>num_utilisateur*</u> : ID
- date_premiere_participation : Date

### 7. Evaluateur
- <u>num_utilisateur*</u> : ID
- specialite : String

### 8. President
- <u>num_utilisateur*</u> : ID
- prime : float

### 9. Administrateur
- <u>num_utilisateur*</u> : ID
- date_debut : Date

### 10. Directeur
- <u>num_utilisateur*</u> : ID
- date_debut : Date

### 11. Concours_Evaluateur
- num_concours* : ID
- num_evaluateur* : ID
- Cle primaire composite* : (num_concours, num_evaluateur)

### 12. Club_Directeur
- num_club* : ID
- num_directeur* : ID 
- Cle primaire* : (num_club, num_directeur)

### 13. Concours_Competiteur
- num_concours* : ID
- num_competiteur* : ID
- Cle primaire* : (num_concours, num_competiteur)

### 14. Club_Concours
- num_club* : ID
- num_concours* : ID
- Cle primaire* : (num_concours, num_club)