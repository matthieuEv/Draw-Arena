/**
 * Concours Detail - Page de détail d'un concours
 */

"use strict";

var currentConcours = null;
var currentConcoursId = null;
var dessinsLoaded = [];
var participantsLoaded = [];

const STATUS_LABELS = {
    'pas_commence': 'À venir',
    'en_cours': 'En cours',
    'attente': 'En attente d\'évaluation',
    'resultat': 'Résultats disponibles',
    'evalue': 'Terminé'
};

const STATUS_COLORS = {
    'pas_commence': 'status-upcoming',
    'en_cours': 'status-active',
    'attente': 'status-waiting',
    'resultat': 'status-results',
    'evalue': 'status-done'
};

// ============================================
// DISPLAY FUNCTIONS
// ============================================

function displayConcoursInfo(concours) {
    if (!concours) return;
    
    currentConcours = concours;
    
    // Header
    const theme = document.getElementById("concours-theme");
    const statusBadge = document.getElementById("concours-status-badge");
    const status = document.getElementById("concours-status");
    
    if (theme) theme.textContent = concours.theme || "Concours";
    if (status) status.textContent = STATUS_LABELS[concours.etat] || concours.etat;
    if (statusBadge) {
        statusBadge.className = "concours-status-badge " + (STATUS_COLORS[concours.etat] || "");
    }
    
    // Show depot button if en_cours
    const depotAction = document.getElementById("depot-action");
    const depotLink = document.getElementById("depot-link");
    if (concours.etat === 'en_cours' && depotAction) {
        depotAction.style.display = "";
        if (depotLink) depotLink.href = `/depot?concours=${currentConcoursId}`;
    }
    
    // Update top tab label based on concours state
    const tabTopLabel = document.getElementById("tab-top-label");
    const isFinished = concours.etat === 'resultat' || concours.etat === 'evalue';
    if (tabTopLabel) {
        tabTopLabel.textContent = isFinished ? 'Résultats' : 'Leaderboard';
    }
    
    // Load leaderboard/results data
    loadLeaderboard(isFinished);
    
    // Info cards
    const dateDebutEl = document.getElementById("concours-date-debut");
    const dateFinEl = document.getElementById("concours-date-fin");
    if (dateDebutEl) dateDebutEl.textContent = concours.dateDebut || "-";
    if (dateFinEl) dateFinEl.textContent = concours.dateFin || "-";
    
    // Description
    if (concours.description) {
        const descCard = document.getElementById("description-card");
        const descText = document.getElementById("concours-description");
        if (descCard) descCard.style.display = "";
        if (descText) descText.textContent = concours.description;
    }
}

function displayStats(stats) {
    if (!stats) return;
    
    document.getElementById("nb-participants").textContent = stats.participants || 0;
    document.getElementById("nb-dessins").textContent = stats.dessins || 0;
    document.getElementById("nb-evaluateurs").textContent = stats.evaluateurs || 0;
    document.getElementById("nb-evaluations").textContent = stats.evaluations || 0;
}

function displayDessins(dessins, append = false) {
    const gallery = document.getElementById("dessins-gallery");
    if (!gallery) return;
    
    if (!append) gallery.innerHTML = "";
    
    if (!dessins || dessins.length === 0) {
        if (!append) {
            gallery.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-rounded">image</span>
                    <p>Aucun dessin soumis</p>
                </div>
            `;
        }
        return;
    }
    
    dessins.forEach(d => {
        const imgUrl = d.le_dessin || "/img/empty_image.jpg";
        gallery.insertAdjacentHTML('beforeend', `
            <a href="/dessin/${d.numDessin}" data-link class="dessin-gallery-item">
                <img src="${imgUrl}" alt="Dessin" loading="lazy">
                <div class="dessin-overlay">
                    <span class="dessin-author">${d.prenom || ''} ${d.nom || ''}</span>
                    ${d.classement ? `<span class="dessin-rank">#${d.classement}</span>` : ''}
                </div>
            </a>
        `);
    });
}

function displayParticipants(users, append = false) {
    const grid = document.getElementById("participants-grid");
    if (!grid) return;
    
    if (!append) grid.innerHTML = "";
    
    if (!users || users.length === 0) {
        if (!append) {
            grid.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-rounded">people</span>
                    <p>Aucun participant</p>
                </div>
            `;
        }
        return;
    }
    
    users.forEach(u => {
        const profileImg = u.photoProfilUrl || "/img/default_profile.png";
        grid.insertAdjacentHTML('beforeend', `
            <div class="user-card">
                <img src="${profileImg}" alt="Profile" class="user-avatar">
                <div class="user-details">
                    <h3 class="user-name">${u.prenom || ''} ${u.nom || ''}</h3>
                    <p class="user-login">${u.login || ''}</p>
                </div>
            </div>
        `);
    });
}

/**
 * Affiche le leaderboard (classement actuel) ou les résultats finaux avec podium
 */
function displayLeaderboard(competiteurs, showPodium = false) {
    const podium = document.getElementById("podium-container");
    const list = document.getElementById("leaderboard-list");
    
    if (!competiteurs || competiteurs.length === 0) {
        if (podium) {
            podium.style.display = "none";
            podium.innerHTML = "";
        }
        if (list) {
            list.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-rounded">leaderboard</span>
                    <p>Aucun classement disponible</p>
                </div>
            `;
        }
        return;
    }
    
    // Podium (top 3) - only shown when concours is finished
    if (podium) {
        if (showPodium && competiteurs.length > 0) {
            podium.style.display = "";
            podium.innerHTML = "";
            const top3 = competiteurs.slice(0, 3);
            const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd
            
            podiumOrder.forEach(idx => {
                if (top3[idx]) {
                    const c = top3[idx];
                    const height = idx === 0 ? '180px' : idx === 1 ? '140px' : '100px';
                    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                    const moyenne = c.moyenne_note !== null && c.moyenne_note !== undefined 
                        ? parseFloat(c.moyenne_note).toFixed(1) 
                        : '-';
                    
                    podium.insertAdjacentHTML('beforeend', `
                        <div class="podium-item podium-${idx + 1}" style="--podium-height: ${height}">
                            <div class="podium-avatar">
                                <span class="material-symbols-rounded">person</span>
                            </div>
                            <div class="podium-info">
                                <span class="podium-medal">${medal}</span>
                                <span class="podium-name">${c.prenom || ''} ${c.nom || ''}</span>
                                <span class="podium-note">${moyenne}/20</span>
                                <span class="podium-stats">${c.nb_dessins || 0} dessin(s)</span>
                            </div>
                            <div class="podium-stand"></div>
                        </div>
                    `);
                }
            });
        } else {
            podium.style.display = "none";
            podium.innerHTML = "";
        }
    }
    
    // Full leaderboard list
    if (list) {
        list.innerHTML = "";
        competiteurs.forEach((c, idx) => {
            const moyenne = c.moyenne_note !== null && c.moyenne_note !== undefined 
                ? parseFloat(c.moyenne_note).toFixed(1) 
                : '-';
            const rankClass = idx < 3 ? `rank-${idx + 1}` : '';
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
            
            list.insertAdjacentHTML('beforeend', `
                <div class="leaderboard-item ${rankClass}">
                    <span class="leaderboard-rank">${medal || (idx + 1)}</span>
                    <div class="leaderboard-avatar">
                        <span class="material-symbols-rounded">person</span>
                    </div>
                    <div class="leaderboard-info">
                        <span class="leaderboard-name">${c.prenom || ''} ${c.nom || ''}</span>
                        <span class="leaderboard-stats">${c.nb_dessins || 0} dessin(s) - ${c.nb_dessins_evalues || 0} évalué(s)</span>
                    </div>
                    <div class="leaderboard-score">
                        <span class="leaderboard-note">${moyenne}</span>
                        <span class="leaderboard-note-label">/20</span>
                    </div>
                </div>
            `);
        });
    }
}

// ============================================
// DATA LOADING
// ============================================

function loadConcoursData(concoursId) {
    currentConcoursId = concoursId;
    
    // GET /api/concours/{concoursId}
    apiFetch(`/concours/${concoursId}`).then(data => {
        if (data.concours) {
            displayConcoursInfo(data.concours);
        }
    }).catch(err => {
        console.error("Erreur chargement concours:", err);
    });
    
    // Load initial dessins et calculer les stats
    loadMoreDessins();
    
    // Charger les stats (participants, évaluateurs, etc.)
    loadConcoursStats();
}

/**
 * Charge les stats en utilisant les endpoints users et dessins
 */
function loadConcoursStats() {
    // Charger les users pour compter participants et évaluateurs
    const usersPromise = apiFetch(`/concours/${currentConcoursId}/users?limit=1000&index=0`).then(data => {
        const users = data.users || [];
        const evaluateurs = users.filter(u => u.role === 'evaluateur' || u.role === 'president');
        const competiteurs = users.filter(u => u.role === 'competiteur');
        return {
            totalUsers: users.length,
            nbEvaluateurs: evaluateurs.length,
            nbCompetiteurs: competiteurs.length
        };
    }).catch(err => {
        console.error("Erreur chargement users:", err);
        return { totalUsers: 0, nbEvaluateurs: 0, nbCompetiteurs: 0 };
    });
    
    // Charger les dessins pour compter dessins et évaluations
    const dessinsPromise = apiFetch(`/concours/${currentConcoursId}/dessins?limit=1000`).then(data => {
        const dessins = data.dessins || [];
        
        // Compter toutes les évaluations des dessins
        let nbEvaluations = 0;
        
        dessins.forEach(d => {
            if (d.evaluations && Array.isArray(d.evaluations)) {
                nbEvaluations += d.evaluations.length;
            }
            // Si le dessin a une note directe
            if (d.note !== undefined && d.note !== null) {
                nbEvaluations++;
            }
        });
        
        return {
            nbDessins: dessins.length,
            nbEvaluations: nbEvaluations
        };
    }).catch(err => {
        console.error("Erreur chargement dessins:", err);
        return { nbDessins: 0, nbEvaluations: 0 };
    });
    
    // Combiner les résultats
    Promise.all([usersPromise, dessinsPromise]).then(([usersData, dessinsData]) => {
        // Mettre à jour les stats avec les vraies données
        displayStats({
            participants: usersData.nbCompetiteurs || usersData.totalUsers,
            dessins: dessinsData.nbDessins,
            evaluateurs: usersData.nbEvaluateurs,
            evaluations: dessinsData.nbEvaluations
        });
    });
}

function loadMoreDessins() {
    const currentCount = dessinsLoaded.length;
    
    // TODO: GET /api/concours/{concoursId}/dessins?limit=12&index={currentCount}
    // Retourne: { dessins: [{ numDessin, le_dessin, prenom, nom, classement }] }
    apiFetch(`/concours/${currentConcoursId}/dessins?limit=12&index=${currentCount}`).then(data => {
        const dessins = data.dessins || [];
        if (dessins.length < 12) {
            const btn = document.getElementById("load-more-dessins-container");
            if (btn) btn.style.display = "none";
        }
        dessinsLoaded = dessinsLoaded.concat(dessins);
        displayDessins(dessins, currentCount > 0);
    }).catch(err => {
        console.error("Erreur chargement dessins:", err);
    });
}

function loadMoreParticipants() {
    const currentCount = participantsLoaded.length;
    
    // TODO: GET /api/concours/{concoursId}/users?limit=12&index={currentCount}
    // Retourne: { users: [{ numUtilisateur, prenom, nom, login, photoProfilUrl }] }
    apiFetch(`/concours/${currentConcoursId}/users?limit=12&index=${currentCount}`).then(data => {
        const users = data.users || [];
        if (users.length < 12) {
            const btn = document.getElementById("load-more-participants-container");
            if (btn) btn.style.display = "none";
        }
        participantsLoaded = participantsLoaded.concat(users);
        displayParticipants(users, currentCount > 0);
    }).catch(err => {
        console.error("Erreur chargement participants:", err);
    });
}

/**
 * Charge le leaderboard/résultats
 * @param {boolean} showPodium - Si true, affiche le podium (concours terminé)
 */
function loadLeaderboard(showPodium = false) {
    // GET /api/concours/{concoursId}/top
    // Retourne: { competiteurs: [{ num_utilisateur, nom, prenom, login, nb_dessins, nb_dessins_evalues, moyenne_note }] }
    apiFetch(`/concours/${currentConcoursId}/top`).then(data => {
        displayLeaderboard(data.competiteurs || [], showPodium);
    }).catch(err => {
        console.error("Erreur chargement leaderboard:", err);
        displayLeaderboard([], showPodium);
    });
}

// ============================================
// TABS MANAGEMENT
// ============================================

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update buttons
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update content
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const content = document.getElementById(`tab-content-${tabId}`);
            if (content) content.classList.add('active');
            
            // Load data if needed
            if (tabId === 'participants' && participantsLoaded.length === 0) {
                loadMoreParticipants();
            }
        });
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener("click", function(event) {
    if (event.target.closest("#load-more-dessins")) {
        loadMoreDessins();
    }
    if (event.target.closest("#load-more-participants")) {
        loadMoreParticipants();
    }
});

function onRouteChange(event) {
    const detail = event && event.detail ? event.detail : {};
    const params = detail.params || {};
    
    if (params.id) {
        // Reset state
        dessinsLoaded = [];
        participantsLoaded = [];
        
        initTabs();
        loadConcoursData(params.id);
    }
}

document.addEventListener("route-change", onRouteChange);
