/**
 * Profil Page JavaScript
 * Gère l'affichage et la modification du profil utilisateur
 */

"use strict";

// Données du profil
var profilData = null;
var originalData = null;

// Configuration des rôles
const ROLE_CONFIG = {
    'administrateur': { icon: 'admin_panel_settings', label: 'Administrateur' },
    'directeur': { icon: 'business', label: 'Directeur' },
    'president': { icon: 'stars', label: 'Président' },
    'evaluateur': { icon: 'assignment', label: 'Évaluateur' },
    'competiteur': { icon: 'brush', label: 'Compétiteur' }
};

/**
 * Affiche un message de feedback
 */
function showMessage(message, type = 'success') {
    const messageEl = document.getElementById('profil-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = 'profil-message ' + type;
        
        // Masquer après 5 secondes
        setTimeout(() => {
            messageEl.className = 'profil-message';
        }, 5000);
    }
}

/**
 * Charge les données du profil
 */
function loadProfilData() {
    const userInfo = state.userInfo;
    
    if (!userInfo) {
        showMessage("Impossible de charger les données utilisateur", "error");
        return;
    }
    
    // Afficher les données de base depuis le state
    displayBasicInfo(userInfo);
    
    // Charger les données complètes depuis l'API
    if (userInfo.club && userInfo.id) {
        apiFetch(`/club/${userInfo.club}/user/${userInfo.id}`).then(data => {
            if (data && data.user) {
                profilData = data.user;
                originalData = { ...data.user };
                displayProfilData(profilData);
                
                // Déterminer et afficher le rôle
                const role = data.user.typeCompte?.toLowerCase() || userInfo.role || 'competiteur';
                displayRole(role);
            }
        }).catch(err => {
            console.error("Erreur chargement profil:", err);
            // Utiliser les données du state comme fallback
            profilData = {
                numUtilisateur: userInfo.id,
                nom: userInfo.nom,
                prenom: userInfo.prenom,
                login: userInfo.login,
                photoProfilUrl: userInfo.photoProfilUrl
            };
            originalData = { ...profilData };
            displayProfilData(profilData);
            displayRole(userInfo.role || 'competiteur');
        });
        
        // Charger le nom du club
        apiFetch(`/club/${userInfo.club}`).then(data => {
            if (data && data.club) {
                const clubInput = document.getElementById('profil-club');
                if (clubInput) clubInput.value = data.club.nomClub || '';
            }
        }).catch(err => {
            console.error("Erreur chargement club:", err);
        });
    } else {
        // Pas de club, utiliser les données du state
        profilData = {
            numUtilisateur: userInfo.id,
            nom: userInfo.nom,
            prenom: userInfo.prenom,
            login: userInfo.login,
            photoProfilUrl: userInfo.photoProfilUrl
        };
        originalData = { ...profilData };
        displayProfilData(profilData);
        displayRole(userInfo.role || 'competiteur');
    }
}

/**
 * Affiche les informations de base (header)
 */
function displayBasicInfo(userInfo) {
    const fullnameEl = document.getElementById('profil-fullname');
    const emailEl = document.getElementById('profil-email');
    const avatarEl = document.getElementById('profil-avatar');
    
    const fullname = `${userInfo.prenom || ''} ${userInfo.nom || ''}`.trim();
    
    if (fullnameEl) fullnameEl.textContent = fullname || 'Utilisateur';
    if (emailEl) emailEl.textContent = userInfo.login || '';
    
    // Charger l'avatar depuis state.userInfo.photoProfilUrl
    if (avatarEl) {
        const avatarUrl = userInfo.photoProfilUrl || '/img/default_profile.png';
        avatarEl.src = avatarUrl;
    }
}

/**
 * Affiche les données du profil dans le formulaire
 */
function displayProfilData(data) {
    if (!data) return;
    
    // Mettre à jour le header
    const fullnameEl = document.getElementById('profil-fullname');
    const emailEl = document.getElementById('profil-email');
    const avatarEl = document.getElementById('profil-avatar');
    
    const fullname = `${data.prenom || ''} ${data.nom || ''}`.trim();
    if (fullnameEl) fullnameEl.textContent = fullname || 'Utilisateur';
    if (emailEl) emailEl.textContent = data.login || '';
    
    // Charger l'avatar - priorité aux données API, sinon state.userInfo
    if (avatarEl) {
        const avatarUrl = data.photoProfilUrl || state.userInfo?.photoProfilUrl || '/img/default_profile.png';
        avatarEl.src = avatarUrl;
    }
    
    // Remplir le formulaire
    const prenomInput = document.getElementById('profil-prenom');
    const nomInput = document.getElementById('profil-nom');
    const loginInput = document.getElementById('profil-login');
    const adresseInput = document.getElementById('profil-adresse');
    const ageInput = document.getElementById('profil-age');
    
    if (prenomInput) prenomInput.value = data.prenom || '';
    if (nomInput) nomInput.value = data.nom || '';
    if (loginInput) loginInput.value = data.login || '';
    if (adresseInput) adresseInput.value = data.adresse || '';
    if (ageInput) ageInput.value = data.age || '';
}

/**
 * Affiche le badge de rôle
 */
function displayRole(role) {
    const badgeEl = document.getElementById('profil-role-badge');
    const iconEl = document.getElementById('profil-role-icon');
    const textEl = document.getElementById('profil-role-text');
    
    const config = ROLE_CONFIG[role] || ROLE_CONFIG['competiteur'];
    
    if (iconEl) iconEl.textContent = config.icon;
    if (textEl) textEl.textContent = config.label;
    if (badgeEl) badgeEl.className = 'profil-role-badge ' + role;
}

/**
 * Prévisualise l'avatar sélectionné
 */
function previewAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarEl = document.getElementById('profil-avatar');
            if (avatarEl) avatarEl.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Réinitialise le formulaire avec les données originales
 */
function resetForm() {
    if (originalData) {
        displayProfilData(originalData);
        showMessage("Modifications annulées", "success");
    }
}

/**
 * Met à jour le profil
 */
function updateProfil(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const updatedData = {
        nom: formData.get('nom'),
        prenom: formData.get('prenom'),
        login: formData.get('login'),
        adresse: formData.get('adresse'),
        age: formData.get('age') ? parseInt(formData.get('age')) : null
    };
    
    // Vérifier si l'avatar a changé
    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput && avatarInput.files.length > 0) {
        // Upload de l'avatar (à implémenter côté backend)
        // Pour l'instant, on continue sans
    }
    
    const userInfo = state.userInfo;
    if (!userInfo || !userInfo.id) {
        showMessage("Erreur: utilisateur non identifié", "error");
        return;
    }
    
    // Appel API pour mettre à jour le profil
    apiFetch(`/utilisateur/${userInfo.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
    }).then(data => {
        showMessage("Profil mis à jour avec succès !", "success");
        
        // Mettre à jour le state local
        if (state.userInfo) {
            state.userInfo.nom = updatedData.nom;
            state.userInfo.prenom = updatedData.prenom;
            state.userInfo.login = updatedData.login;
            localStorage.setItem('drawarena_user', JSON.stringify(state.userInfo));
        }
        
        // Mettre à jour les données originales
        originalData = { ...profilData, ...updatedData };
        profilData = { ...originalData };
        
        // Mettre à jour l'affichage
        displayProfilData(profilData);
    }).catch(err => {
        console.error("Erreur mise à jour profil:", err);
        showMessage("Erreur lors de la mise à jour: " + err.message, "error");
    });
}

/**
 * Change le mot de passe
 */
function updatePassword(event) {
    event.preventDefault();
    
    const form = event.target;
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;
    
    // Validation
    if (newPassword !== confirmPassword) {
        showMessage("Les mots de passe ne correspondent pas", "error");
        return;
    }
    
    if (newPassword.length < 6) {
        showMessage("Le mot de passe doit contenir au moins 6 caractères", "error");
        return;
    }
    
    const userInfo = state.userInfo;
    if (!userInfo || !userInfo.id) {
        showMessage("Erreur: utilisateur non identifié", "error");
        return;
    }
    
    // Appel API pour changer le mot de passe
    apiFetch(`/utilisateur/${userInfo.id}/password`, {
        method: 'PUT',
        body: JSON.stringify({
            currentPassword: currentPassword,
            newPassword: newPassword
        })
    }).then(data => {
        showMessage("Mot de passe changé avec succès !", "success");
        form.reset();
    }).catch(err => {
        console.error("Erreur changement mot de passe:", err);
        showMessage("Erreur: " + err.message, "error");
    });
}

/**
 * Déconnexion
 */
function logout() {
    clearSession();
    window.location.href = '/login';
}

/**
 * Gestionnaire d'événement de changement de route
 */
function onRouteChange(event) {
    const detail = event && event.detail ? event.detail : {};
    const route = detail.route || "";
    
    // Ne charger que si on est sur la page profil
    if (route !== "profil") return;
    
    loadProfilData();
}

// Écouter les changements de route
document.addEventListener("route-change", onRouteChange);

// Charger immédiatement si on est déjà sur la page
if (window.location.pathname === '/profil') {
    document.addEventListener('DOMContentLoaded', loadProfilData);
}
