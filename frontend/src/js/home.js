/**
 * Home Dashboard JavaScript
 * Gère l'affichage du tableau de bord selon le rôle de l'utilisateur
 */

"use strict";

// État global du dashboard
var userInfo = null;
var clubInfo = null;
var currentClubId = null;

// ============================================
// ROLE CONFIGURATION
// ============================================
const ROLES = {
    ADMINISTRATEUR: 'administrateur',
    DIRECTEUR: 'directeur',
    PRESIDENT: 'president',
    EVALUATEUR: 'evaluateur',
    COMPETITEUR: 'competiteur'
};

const ROLE_ICONS = {
    [ROLES.ADMINISTRATEUR]: 'admin_panel_settings',
    [ROLES.DIRECTEUR]: 'business',
    [ROLES.PRESIDENT]: 'stars',
    [ROLES.EVALUATEUR]: 'assignment',
    [ROLES.COMPETITEUR]: 'brush'
};

const ROLE_LABELS = {
    [ROLES.ADMINISTRATEUR]: 'Administrateur',
    [ROLES.DIRECTEUR]: 'Directeur',
    [ROLES.PRESIDENT]: 'Président',
    [ROLES.EVALUATEUR]: 'Évaluateur',
    [ROLES.COMPETITEUR]: 'Compétiteur'
};

// ============================================
// DISPLAY FUNCTIONS - Common
// ============================================

/**
 * Affiche les informations du club
 */
function displayClubInfo() {
    if (clubInfo) {
        const name = document.getElementById("club-name");
        const address = document.getElementById("club-address");
        const city = document.getElementById("club-city");
        const dept = document.getElementById("club-dept");
        const region = document.getElementById("club-region");
        const phone = document.getElementById("club-phone");
        
        if (name) name.textContent = clubInfo.nomClub || "Club";
        if (address) address.textContent = clubInfo.adresse || "";
        if (city) city.textContent = clubInfo.ville ? clubInfo.ville + ", " : "";
        if (dept) dept.textContent = clubInfo.departement || "";
        if (region) region.textContent = clubInfo.region ? "(" + clubInfo.region + ")" : "";
        if (phone) phone.textContent = clubInfo.numTelephone ? "Tél : " + clubInfo.numTelephone : "";
    }
}

/**
 * Configure le badge de rôle de l'utilisateur
 */
function setupRoleBadge(role) {
    const badge = document.getElementById("user-role-badge");
    const icon = document.getElementById("role-icon");
    const text = document.getElementById("role-text");
    
    if (badge) {
        badge.className = "dashboard-role-badge " + (role || "competiteur");
    }
    if (icon) {
        icon.textContent = ROLE_ICONS[role] || ROLE_ICONS[ROLES.COMPETITEUR];
    }
    if (text) {
        text.textContent = ROLE_LABELS[role] || ROLE_LABELS[ROLES.COMPETITEUR];
    }
}

/**
 * Affiche le nom de l'utilisateur
 */
function displayUserName() {
    const userNameDisplay = document.getElementById("user-name-display");
    const adminNameDisplay = document.getElementById("admin-name-display");
    
    if (userInfo) {
        const fullName = (userInfo.prenom || "") + " " + (userInfo.nom || "");
        if (userNameDisplay) userNameDisplay.textContent = fullName.trim() || "Utilisateur";
        if (adminNameDisplay) adminNameDisplay.textContent = fullName.trim() || "Admin";
    }
}

/**
 * Affiche une liste de concours dans un conteneur
 */
function displayConcoursList(containerId, concours) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!concours || concours.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="material-symbols-rounded">event_busy</span>
                <p>Aucun concours disponible</p>
            </div>
        `;
        return;
    }
    
    concours.forEach(c => {
        const statusClass = c.etat || "pas_commence";
        const statusLabel = formatConcoursStatus(c.etat);
        const concoursId = c.numConcours;
        
        container.insertAdjacentHTML('beforeend', `
            <div class="dashboard-concours-item" onclick="location.href='/concours/${concoursId}'">
                <div class="concours-status-dot ${statusClass}"></div>
                <div class="concours-item-info">
                    <div class="concours-item-theme">${c.theme || "Concours"}</div>
                    <div class="concours-item-dates">${c.dateDebut || ""} - ${c.dateFin || ""}</div>
                </div>
                <span class="concours-item-status">${statusLabel}</span>
            </div>
        `);
    });
}

/**
 * Formate le statut d'un concours pour l'affichage
 */
function formatConcoursStatus(status) {
    const statusMap = {
        'pas_commence': 'À venir',
        'en_cours': 'En cours',
        'attente': 'En attente',
        'resultat': 'Résultats',
        'evalue': 'Évalué'
    };
    return statusMap[status] || status || 'Inconnu';
}

/**
 * Affiche une grille de dessins
 */
function displayDessinsGrid(containerId, dessins) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!dessins || dessins.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="material-symbols-rounded">image</span>
                <p>Aucun dessin</p>
            </div>
        `;
        return;
    }
    
    dessins.forEach(d => {
        const imgUrl = d.le_dessin || "/img/empty_image.jpg";
        container.insertAdjacentHTML('beforeend', `
            <div class="dashboard-dessin-item">
                <img src="${imgUrl}" alt="Dessin" loading="lazy">
            </div>
        `);
    });
}

/**
 * Affiche une liste d'évaluations
 */
function displayEvaluationsList(containerId, evaluations, showNote = true) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!evaluations || evaluations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="material-symbols-rounded">rate_review</span>
                <p>Aucune évaluation</p>
            </div>
        `;
        return;
    }
    
    evaluations.forEach(e => {
        const thumb = e.le_dessin || "/img/empty_image.jpg";
        const noteHtml = showNote ? `<div class="evaluation-note">${e.note || '-'}</div>` : '';
        
        container.insertAdjacentHTML('beforeend', `
            <div class="dashboard-evaluation-item">
                <img src="${thumb}" alt="Dessin" class="evaluation-thumb">
                <div class="evaluation-info">
                    <div class="evaluation-theme">${e.theme || 'Concours'}</div>
                    <div class="evaluation-author">${e.prenom || ''} ${e.nom || ''}</div>
                </div>
                ${noteHtml}
            </div>
        `);
    });
}

/**
 * Affiche une liste de membres
 */
function displayMembersList(containerId, members) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!members || members.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="material-symbols-rounded">people</span>
                <p>Aucun membre</p>
            </div>
        `;
        return;
    }
    
    members.forEach(m => {
        const profileImg = m.photoProfilUrl || "/img/default_profile.png";
        container.insertAdjacentHTML('beforeend', `
            <div class="user-card">
                <img src="${profileImg}" alt="Profile" class="user-avatar">
                <div class="user-details">
                    <h3 class="user-name">${m.prenom || ''} ${m.nom || ''}</h3>
                    <p class="user-login">${m.login || ''}</p>
                </div>
            </div>
        `);
    });
}

/**
 * Affiche une liste de clubs (pour admin)
 */
function displayClubsList(containerId, clubs) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!clubs || clubs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="material-symbols-rounded">groups</span>
                <p>Aucun club</p>
            </div>
        `;
        return;
    }
    
    clubs.forEach(c => {
        container.insertAdjacentHTML('beforeend', `
            <div class="dashboard-concours-item" onclick="location.href='/club/${c.numClub}'">
                <div class="concours-status-dot en_cours"></div>
                <div class="concours-item-info">
                    <div class="concours-item-theme">${c.nomClub || 'Club'}</div>
                    <div class="concours-item-dates">${c.ville || ''}, ${c.region || ''}</div>
                </div>
            </div>
        `);
    });
}

/**
 * Affiche l'activité récente (pour admin)
 */
function displayActivityList(containerId, activities) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!activities || activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="material-symbols-rounded">history</span>
                <p>Aucune activité récente</p>
            </div>
        `;
        return;
    }
    
    activities.forEach(a => {
        const iconClass = a.type || 'new-user';
        const icon = getActivityIcon(a.type);
        
        container.insertAdjacentHTML('beforeend', `
            <div class="activity-item">
                <div class="activity-icon ${iconClass}">
                    <span class="material-symbols-rounded">${icon}</span>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${a.message || 'Activité'}</div>
                    <div class="activity-time">${a.date || ''}</div>
                </div>
            </div>
        `);
    });
}

function getActivityIcon(type) {
    const icons = {
        'new-user': 'person_add',
        'new-concours': 'trophy',
        'new-dessin': 'draw',
        'new-evaluation': 'rate_review'
    };
    return icons[type] || 'info';
}

// ============================================
// DATA LOADING FUNCTIONS
// ============================================

/**
 * Charge les données du club
 */
function loadClubData(clubId) {
    if (!clubId) return;
    
    currentClubId = clubId;
    
    // TODO: GET /api/club/{clubId}
    // Retourne: { club: { numClub, nomClub, adresse, numTelephone, ville, departement, region } }
    apiFetch(`/club/${clubId}`).then(info => {
        clubInfo = info.club;
        displayClubInfo();
    }).catch(err => {
        console.error("Erreur chargement club:", err);
    });
}

/**
 * Charge les concours du club
 */
function loadClubConcours(clubId) {
    if (!clubId) return;
    
    // TODO: GET /api/club/{clubId}/concours
    // Retourne: { concours: [{ numConcours, theme, dateDebut, dateFin, etat, description }] }
    // Filtrer par concours actifs (en_cours ou pas_commence)
    apiFetch(`/club/${clubId}/concours`).then(data => {
        displayConcoursList("club-concours-list", data.concours || []);
        
        // Compter les concours actifs
        const actifs = (data.concours || []).filter(c => 
            c.etat === 'en_cours' || c.etat === 'pas_commence'
        );
        const countEl = document.getElementById("concours-actifs-count");
        if (countEl) countEl.textContent = actifs.length;
    }).catch(err => {
        console.error("Erreur chargement concours club:", err);
        displayConcoursList("club-concours-list", []);
    });
}

// ============================================
// ROLE-SPECIFIC LOADING FUNCTIONS
// ============================================

/**
 * Configure et charge les données spécifiques au compétiteur
 */
function loadCompetiteurData(userId) {
    // Afficher les éléments spécifiques
    showElement("stat-mes-dessins");
    showElement("stat-mes-participations");
    showElement("stat-ma-moyenne");
    showElement("card-mes-dessins");
    
    // Note: Les endpoints /user/{userId}/dessins et /user/{userId}/stats n'existent pas encore
    // Afficher des données vides en attendant
    displayDessinsGrid("mes-dessins-grid", []);
    
    const countEl = document.getElementById("mes-dessins-count");
    if (countEl) countEl.textContent = "-";
    
    const partEl = document.getElementById("mes-participations-count");
    const moyEl = document.getElementById("ma-moyenne-value");
    if (partEl) partEl.textContent = "-";
    if (moyEl) moyEl.textContent = "-";
}

/**
 * Configure et charge les données spécifiques à l'évaluateur
 */
function loadEvaluateurData(userId) {
    // Afficher les éléments spécifiques
    showElement("stat-mes-evaluations");
    showElement("stat-a-evaluer");
    showElement("card-a-evaluer");
    showElement("card-mes-evaluations");
    
    // Note: Les endpoints /evaluateur/{userId}/pending et /evaluateur/{userId}/evaluations n'existent pas encore
    // Afficher des données vides en attendant
    displayEvaluationsList("dessins-a-evaluer-list", [], false);
    displayEvaluationsList("mes-evaluations-list", []);
    
    const aEvaluerCountEl = document.getElementById("a-evaluer-count");
    if (aEvaluerCountEl) aEvaluerCountEl.textContent = "-";
    
    const mesEvalsCountEl = document.getElementById("mes-evaluations-count");
    if (mesEvalsCountEl) mesEvalsCountEl.textContent = "-";
}

/**
 * Configure et charge les données spécifiques au président
 */
function loadPresidentData(userId) {
    // Afficher les éléments spécifiques
    showElement("stat-concours-geres");
    showElement("card-concours-president");
    
    // Note: L'endpoint /president/{userId}/concours n'existe pas encore
    // Afficher des données vides en attendant
    displayConcoursList("president-concours-list", []);
    
    const countEl = document.getElementById("concours-geres-count");
    if (countEl) countEl.textContent = "-";
}

/**
 * Configure et charge les données spécifiques au directeur
 */
function loadDirecteurData(userId, clubId) {
    // Afficher les éléments spécifiques
    showElement("stat-membres-club");
    showElement("card-membres-directeur");
    
    if (!clubId) return;
    
    // Note: L'endpoint /club/{clubId}/users n'existe pas encore
    // Afficher des données vides en attendant
    displayMembersList("derniers-membres-list", []);
    
    const countEl = document.getElementById("membres-club-count");
    if (countEl) countEl.textContent = "-";
}

// ============================================
// ADMIN DASHBOARD FUNCTIONS
// ============================================

/**
 * Charge toutes les données du dashboard admin
 */
function loadAdminDashboard() {
    displayUserName();
    loadAdminStats();
    loadAdminClubs();
    loadAdminConcours();
    loadAdminDessins();
    loadAdminActivity();
}

/**
 * Charge les statistiques globales pour l'admin
 */
function loadAdminStats() {
    // Charger le nombre de clubs
    apiFetch(`/club/count`).then(data => {
        const clubsEl = document.getElementById("admin-clubs-count");
        if (clubsEl) clubsEl.textContent = data.count || 0;
    }).catch(err => {
        console.error("Erreur chargement count clubs:", err);
    });
    
    // Charger le nombre d'utilisateurs
    apiFetch(`/utilisateur/count`).then(data => {
        const usersEl = document.getElementById("admin-users-count");
        if (usersEl) usersEl.textContent = data.count || 0;
    }).catch(err => {
        console.error("Erreur chargement count users:", err);
    });
    
    // Charger le nombre de concours
    apiFetch(`/concours?limit=1000`).then(data => {
        const concoursEl = document.getElementById("admin-concours-count");
        if (concoursEl) concoursEl.textContent = (data.concours || []).length;
    }).catch(err => {
        console.error("Erreur chargement count concours:", err);
    });
    
    // Charger le nombre d'évaluations
    apiFetch(`/evaluation/count`).then(data => {
        const evalsEl = document.getElementById("admin-evaluations-count");
        if (evalsEl) evalsEl.textContent = data.count || 0;
    }).catch(err => {
        console.error("Erreur chargement count evaluations:", err);
    });
}

/**
 * Charge les clubs récents pour l'admin
 */
function loadAdminClubs() {
    // TODO: GET /api/clubs?limit=5&orderBy=recent
    // Retourne: { clubs: [{ numClub, nomClub, ville, region }] }
    apiFetch(`/clubs?limit=5`).then(data => {
        displayClubsList("admin-clubs-list", data.clubs || []);
    }).catch(err => {
        console.error("Erreur chargement clubs admin:", err);
        displayClubsList("admin-clubs-list", []);
    });
}

/**
 * Charge les concours actifs pour l'admin
 */
function loadAdminConcours() {
    // TODO: GET /api/concours?status=en_cours,pas_commence&limit=5
    // Retourne: { concours: [{ numConcours, theme, dateDebut, dateFin, etat }] }
    apiFetch(`/concours?limit=5`).then(data => {
        const actifs = (data.concours || []).filter(c => 
            c.etat === 'en_cours' || c.etat === 'pas_commence' || c.etat === 'attente'
        );
        displayConcoursList("admin-concours-list", actifs);
    }).catch(err => {
        console.error("Erreur chargement concours admin:", err);
        displayConcoursList("admin-concours-list", []);
    });
}

/**
 * Charge les derniers dessins pour l'admin
 */
function loadAdminDessins() {
    // TODO: GET /api/dessins?limit=8&orderBy=recent
    // Retourne: { dessins: [{ numDessin, le_dessin, commentaire, dateRemise }] }
    apiFetch(`/dessins?limit=8`).then(data => {
        displayDessinsGrid("admin-dessins-grid", data.dessins || []);
    }).catch(err => {
        console.error("Erreur chargement dessins admin:", err);
        displayDessinsGrid("admin-dessins-grid", []);
    });
}

/**
 * Charge l'activité récente pour l'admin
 */
function loadAdminActivity() {
    // TODO: GET /api/admin/activity?limit=10
    // Retourne: { activities: [{ type: 'new-user'|'new-concours'|'new-dessin'|'new-evaluation', message: string, date: string }] }
    apiFetch(`/admin/activity?limit=10`).then(data => {
        displayActivityList("admin-activity-list", data.activities || []);
    }).catch(err => {
        console.error("Erreur chargement activité admin:", err);
        // Afficher un message par défaut si l'endpoint n'existe pas encore
        displayActivityList("admin-activity-list", []);
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Affiche un élément par son ID
 */
function showElement(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = "";
}

/**
 * Cache un élément par son ID
 */
function hideElement(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = "none";
}

/**
 * Bascule entre le dashboard utilisateur et admin
 */
function switchDashboard(isAdmin) {
    const userBody = document.getElementById("home-user-body");
    const adminBody = document.getElementById("admin-home-body");
    
    if (userBody) {
        if (isAdmin) {
            userBody.classList.remove("active");
        } else {
            userBody.classList.add("active");
        }
    }
    if (adminBody) {
        if (isAdmin) {
            adminBody.classList.add("active");
        } else {
            adminBody.classList.remove("active");
        }
    }
    
    console.log("Dashboard switch - isAdmin:", isAdmin, 
        "userBody.active:", userBody?.classList.contains("active"),
        "adminBody.active:", adminBody?.classList.contains("active"));
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialise le dashboard en fonction du rôle
 */
function initDashboard() {
    userInfo = state.userInfo;
    
    if (!userInfo) {
        console.error("Aucune information utilisateur disponible");
        return;
    }
    
    const role = userInfo.role;
    const isAdmin = role === ROLES.ADMINISTRATEUR;
    
    // Basculer vers le bon dashboard
    switchDashboard(isAdmin);
    
    if (isAdmin) {
        // Dashboard administrateur
        loadAdminDashboard();
    } else {
        // Dashboard utilisateur classique
        displayUserName();
        
        // Charger les données du club si disponible
        if (userInfo.club) {
            loadClubData(userInfo.club);
            loadClubConcours(userInfo.club);
            
            // Récupérer les informations de l'utilisateur dans le club pour déterminer son rôle
            fetchUserRoleFromClub(userInfo.club, userInfo.id);
        } else {
            // Pas de club, afficher un rôle par défaut
            setupRoleBadge(role || ROLES.COMPETITEUR);
            loadRoleSpecificData(role || ROLES.COMPETITEUR);
        }
    }
}

/**
 * Récupère les informations de l'utilisateur dans le club pour déterminer son rôle
 */
function fetchUserRoleFromClub(clubId, userId) {
    apiFetch(`/club/${clubId}/user/${userId}`).then(data => {
        if (data && data.user) {
            // Déterminer le rôle en fonction du type de compte ou des propriétés
            const userRole = determineUserRole(data.user);
            setupRoleBadge(userRole);
            loadRoleSpecificData(userRole);
        } else {
            // Fallback sur le rôle stocké ou compétiteur par défaut
            const fallbackRole = userInfo.role || ROLES.COMPETITEUR;
            setupRoleBadge(fallbackRole);
            loadRoleSpecificData(fallbackRole);
        }
    }).catch(err => {
        console.error("Erreur récupération rôle utilisateur:", err);
        // Fallback sur le rôle stocké ou compétiteur par défaut
        const fallbackRole = userInfo.role || ROLES.COMPETITEUR;
        setupRoleBadge(fallbackRole);
        loadRoleSpecificData(fallbackRole);
    });
}

/**
 * Détermine le rôle de l'utilisateur à partir des données retournées par l'API
 */
function determineUserRole(userData) {
    console.log("determineUserRole - userInfo.role:", userInfo.role);
    console.log("determineUserRole - userData:", userData);
    
    // Le rôle est stocké dans userInfo.role lors de la connexion
    if (userInfo.role) {
        const role = userInfo.role.toLowerCase();
        console.log("determineUserRole - role from userInfo:", role);
        if (role === 'directeur') return ROLES.DIRECTEUR;
        if (role === 'president') return ROLES.PRESIDENT;
        if (role === 'evaluateur') return ROLES.EVALUATEUR;
        if (role === 'competiteur') return ROLES.COMPETITEUR;
        if (role === 'administrateur') return ROLES.ADMINISTRATEUR;
    }
    
    // Fallback: vérifier typeCompte au cas où il contiendrait le rôle
    if (userData && userData.typeCompte) {
        const type = userData.typeCompte.toLowerCase();
        console.log("determineUserRole - typeCompte:", type);
        if (type === 'directeur') return ROLES.DIRECTEUR;
        if (type === 'president') return ROLES.PRESIDENT;
        if (type === 'evaluateur') return ROLES.EVALUATEUR;
        if (type === 'competiteur') return ROLES.COMPETITEUR;
    }
    
    console.log("determineUserRole - fallback to COMPETITEUR");
    // Par défaut, compétiteur
    return ROLES.COMPETITEUR;
}

/**
 * Charge les données spécifiques au rôle
 */
function loadRoleSpecificData(role) {
    switch (role) {
        case ROLES.COMPETITEUR:
            loadCompetiteurData(userInfo.id);
            break;
        case ROLES.EVALUATEUR:
            loadEvaluateurData(userInfo.id);
            // Les évaluateurs peuvent aussi être compétiteurs
            loadCompetiteurData(userInfo.id);
            break;
        case ROLES.PRESIDENT:
            loadPresidentData(userInfo.id);
            // Les présidents peuvent aussi être évaluateurs/compétiteurs
            loadEvaluateurData(userInfo.id);
            break;
        case ROLES.DIRECTEUR:
            loadDirecteurData(userInfo.id, userInfo.club);
            // Les directeurs peuvent aussi avoir d'autres rôles
            loadPresidentData(userInfo.id);
            break;
        default:
            // Rôle non reconnu, charger les données de base en tant que compétiteur
            console.warn("Rôle non reconnu:", role);
            loadCompetiteurData(userInfo.id);
    }
}

/**
 * Gestionnaire d'événement de changement de route
 */
function onRouteChange(event) {
    const detail = event && event.detail ? event.detail : {};
    const route = detail.route || "";
    
    // Ne charger que si on est sur la page home
    if (route !== "home" && detail.path !== "/") return;
    
    initDashboard();
}

// Écouter les changements de route
document.addEventListener("route-change", onRouteChange);