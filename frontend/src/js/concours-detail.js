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
    
    // Show results tab if resultat or evalue
    const tabResultats = document.getElementById("tab-resultats");
    if ((concours.etat === 'resultat' || concours.etat === 'evalue') && tabResultats) {
        tabResultats.style.display = "";
    }
    
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
 * Affiche les évaluations (avec nom user et moyenne)
 */
function displayEvaluations(evaluations) {
    const list = document.getElementById("evaluations-list");
    if (!list) return;
    
    list.innerHTML = "";
    
    if (!evaluations || evaluations.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <span class="material-symbols-rounded">rate_review</span>
                <p>Aucune évaluation</p>
            </div>
        `;
        return;
    }
    
    // Grouper les évaluations par utilisateur pour calculer la moyenne
    const userEvaluations = {};
    evaluations.forEach(e => {
        const key = `${e.prenom || ''} ${e.nom || ''}`.trim() || 'Inconnu';
        if (!userEvaluations[key]) {
            userEvaluations[key] = {
                nom: e.nom || '',
                prenom: e.prenom || '',
                notes: []
            };
        }
        if (e.note !== undefined && e.note !== null) {
            userEvaluations[key].notes.push(parseFloat(e.note));
        }
    });
    
    // Afficher chaque utilisateur avec sa moyenne
    Object.keys(userEvaluations).forEach(userName => {
        const userData = userEvaluations[userName];
        const notes = userData.notes;
        const moyenne = notes.length > 0 
            ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1) 
            : '-';
        
        list.insertAdjacentHTML('beforeend', `
            <div class="evaluation-item">
                <div class="evaluation-user">
                    <span class="material-symbols-rounded">person</span>
                    <span class="evaluation-name">${userData.prenom} ${userData.nom}</span>
                </div>
                <div class="evaluation-stats">
                    <span class="evaluation-count">${notes.length} note(s)</span>
                    <span class="evaluation-moyenne">Moyenne: ${moyenne}/20</span>
                </div>
            </div>
        `);
    });
}

function displayResults(results) {
    const podium = document.getElementById("podium-container");
    const list = document.getElementById("results-list");
    
    if (!results || results.length === 0) {
        if (podium) podium.innerHTML = "";
        if (list) {
            list.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-rounded">emoji_events</span>
                    <p>Résultats non disponibles</p>
                </div>
            `;
        }
        return;
    }
    
    // Podium (top 3)
    if (podium) {
        podium.innerHTML = "";
        const top3 = results.slice(0, 3);
        const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd
        
        podiumOrder.forEach(idx => {
            if (top3[idx]) {
                const r = top3[idx];
                const imgUrl = r.le_dessin || "/img/empty_image.jpg";
                const height = idx === 0 ? '180px' : idx === 1 ? '140px' : '100px';
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                
                podium.insertAdjacentHTML('beforeend', `
                    <div class="podium-item podium-${idx + 1}" style="--podium-height: ${height}">
                        <a href="/dessin/${r.numDessin}" data-link class="podium-dessin">
                            <img src="${imgUrl}" alt="Dessin">
                        </a>
                        <div class="podium-info">
                            <span class="podium-medal">${medal}</span>
                            <span class="podium-name">${r.prenom || ''} ${r.nom || ''}</span>
                            <span class="podium-note">${r.moyenneNote ? r.moyenneNote.toFixed(1) : '-'}/20</span>
                        </div>
                        <div class="podium-stand"></div>
                    </div>
                `);
            }
        });
    }
    
    // Full results list
    if (list) {
        list.innerHTML = "";
        results.forEach((r, idx) => {
            const imgUrl = r.le_dessin || "/img/empty_image.jpg";
            list.insertAdjacentHTML('beforeend', `
                <div class="result-item">
                    <span class="result-rank">${idx + 1}</span>
                    <a href="/dessin/${r.numDessin}" data-link class="result-dessin">
                        <img src="${imgUrl}" alt="Dessin">
                    </a>
                    <div class="result-info">
                        <span class="result-name">${r.prenom || ''} ${r.nom || ''}</span>
                        <span class="result-note">${r.moyenneNote ? r.moyenneNote.toFixed(1) : '-'}/20</span>
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
    
    // Charger les évaluations depuis l'endpoint /concours/{id}/dessins
    // Les évaluations sont calculées à partir des dessins
    loadEvaluationsFromDessins();
}

/**
 * Charge les stats et évaluations en utilisant les endpoints users et dessins
 */
function loadEvaluationsFromDessins() {
    // Charger les users pour compter participants et évaluateurs
    const usersPromise = apiFetch(`/concours/${currentConcoursId}/users?limit=1000&index=0`).then(data => {
        const users = data.users || [];
        const evaluateurs = users.filter(u => u.role === 'evaluateur' || u.role === 'president');
        const competiteurs = users.filter(u => u.role === 'competiteur');
        return {
            totalUsers: users.length,
            nbEvaluateurs: evaluateurs.length,
            nbCompetiteurs: competiteurs.length,
            evaluateurs: evaluateurs
        };
    }).catch(err => {
        console.error("Erreur chargement users:", err);
        return { totalUsers: 0, nbEvaluateurs: 0, nbCompetiteurs: 0, evaluateurs: [] };
    });
    
    // Charger les dessins pour compter dessins et évaluations
    const dessinsPromise = apiFetch(`/concours/${currentConcoursId}/dessins?limit=1000`).then(data => {
        const dessins = data.dessins || [];
        
        // Collecter toutes les évaluations des dessins
        let allEvaluations = [];
        
        dessins.forEach(d => {
            if (d.evaluations && Array.isArray(d.evaluations)) {
                d.evaluations.forEach(e => {
                    allEvaluations.push({
                        ...e,
                        dessinId: d.numDessin
                    });
                });
            }
            // Si le dessin a une note directe
            if (d.note !== undefined && d.note !== null) {
                allEvaluations.push({
                    note: d.note,
                    prenom: d.prenom,
                    nom: d.nom,
                    dessinId: d.numDessin
                });
            }
        });
        
        return {
            nbDessins: dessins.length,
            evaluations: allEvaluations
        };
    }).catch(err => {
        console.error("Erreur chargement dessins:", err);
        return { nbDessins: 0, evaluations: [] };
    });
    
    // Combiner les résultats
    Promise.all([usersPromise, dessinsPromise]).then(([usersData, dessinsData]) => {
        // Mettre à jour les stats avec les vraies données
        displayStats({
            participants: usersData.nbCompetiteurs || usersData.totalUsers,
            dessins: dessinsData.nbDessins,
            evaluateurs: usersData.nbEvaluateurs,
            evaluations: dessinsData.evaluations.length
        });
        
        // Afficher les évaluations
        displayEvaluations(dessinsData.evaluations);
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

function loadResults() {
    // TODO: GET /api/concours/{concoursId}/results
    // Retourne: { results: [{ numDessin, le_dessin, prenom, nom, moyenneNote, classement }] }
    apiFetch(`/concours/${currentConcoursId}/results`).then(data => {
        displayResults(data.results || []);
    }).catch(err => {
        console.error("Erreur chargement résultats:", err);
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
            if (tabId === 'resultats') {
                loadResults();
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
