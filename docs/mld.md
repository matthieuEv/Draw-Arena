# Schema de Base de Donnees Textuel - Draw Arena

## Tables

### 1. Club
- <u>num_club</u> : ID
- nom_club : String
- adresse : String
- num_telephone : String
- ville : String
- departement : String
- region : String
- num_directeur* : ID

### 2. Utilisateur
- <u>num_utilisateur</u> : ID
- nom : String
- prenom : String
- adresse : String
- age : int
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

## Contraintes et remarques
- Un club a un seul directeur et un directeur dirige un seul club (FK num_directeur dans Club).
- Chaque dessin doit avoir exactement 2 evaluateurs : contrainte applicative ou trigger SQL.
- Les enums doivent etre traduites en tables de reference ou via CHECK selon le SGBD.
