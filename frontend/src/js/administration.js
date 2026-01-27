/**
 * Administration Panel - Full management interface
 */

"use strict";

// ============================================
// STATE
// ============================================

const adminState = {
    users: { data: [], page: 1, total: 0, search: '', filter: '' },
    clubs: { data: [], page: 1, total: 0, search: '', filter: '' },
    concours: { data: [], page: 1, total: 0, search: '', filter: '' },
    evaluateurs: { data: [], page: 1, total: 0, search: '', filter: '' },
    dessins: { data: [], page: 1, total: 0, search: '', filter: '' },
    activity: { data: [], page: 1, total: 0, filter: '', date: '' },
    currentSection: 'users',
    deleteCallback: null,
    allClubs: [],
    allPresidents: [],
    allEvaluateurs: []
};

const PAGE_SIZE = 10;

const STATUS_LABELS = {
    'pas_commence': 'À venir',
    'en_cours': 'En cours',
    'attente': 'En attente',
    'resultat': 'Résultats',
    'evalue': 'Terminé'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="material-symbols-rounded">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// PAGINATION
// ============================================

function renderPagination(containerId, currentPage, totalItems) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
        <span class="material-symbols-rounded">chevron_left</span>
    </button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    // Next button
    html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
        <span class="material-symbols-rounded">chevron_right</span>
    </button>`;
    
    container.innerHTML = html;
}

// ============================================
// SECTION: STATS
// ============================================

function loadGlobalStats() {
    // TODO: GET /api/admin/stats
    // Retourne: { users: number, clubs: number, concours: number, dessins: number }
    apiFetch('/admin/stats').then(data => {
        document.getElementById('total-users').textContent = data.users || 0;
        document.getElementById('total-clubs').textContent = data.clubs || 0;
        document.getElementById('total-concours').textContent = data.concours || 0;
        document.getElementById('total-dessins').textContent = data.dessins || 0;
    }).catch(err => {
        console.error('Erreur chargement stats:', err);
    });
}

// ============================================
// SECTION: USERS
// ============================================

function loadUsers() {
    const { page, search, filter } = adminState.users;
    const offset = (page - 1) * PAGE_SIZE;
    
    // TODO: GET /api/admin/users?limit={PAGE_SIZE}&offset={offset}&search={search}&role={filter}
    // Retourne: { users: [...], total: number }
    let url = `/admin/users?limit=${PAGE_SIZE}&offset=${offset}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (filter) url += `&role=${filter}`;
    
    apiFetch(url).then(data => {
        adminState.users.data = data.users || [];
        adminState.users.total = data.total || 0;
        renderUsersTable();
        renderPagination('pagination-users', page, adminState.users.total);
    }).catch(err => {
        console.error('Erreur chargement users:', err);
    });
}

function renderUsersTable() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    
    if (adminState.users.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">Aucun utilisateur trouvé</td></tr>`;
        return;
    }
    
    tbody.innerHTML = adminState.users.data.map(u => {
        const roles = [];
        if (u.isCompetiteur) roles.push('<span class="role-badge competiteur">Compétiteur</span>');
        if (u.isEvaluateur) roles.push('<span class="role-badge evaluateur">Évaluateur</span>');
        if (u.isPresident) roles.push('<span class="role-badge president">Président</span>');
        if (u.isDirecteur) roles.push('<span class="role-badge directeur">Directeur</span>');
        if (u.isAdministrateur) roles.push('<span class="role-badge administrateur">Admin</span>');
        
        return `
            <tr>
                <td>${u.numUtilisateur}</td>
                <td>
                    <div class="user-cell">
                        <img src="${u.photoProfilUrl || '/img/default_profile.png'}" alt="" class="cell-avatar">
                        <div>
                            <strong>${u.prenom} ${u.nom}</strong>
                        </div>
                    </div>
                </td>
                <td>${u.login}</td>
                <td>${u.nomClub || '-'}</td>
                <td><div class="roles-cell">${roles.join('') || '-'}</div></td>
                <td><span class="account-badge ${u.typeCompte}">${u.typeCompte}</span></td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn edit" title="Modifier" onclick="editUser(${u.numUtilisateur})">
                            <span class="material-symbols-rounded">edit</span>
                        </button>
                        <button class="action-btn delete" title="Supprimer" onclick="confirmDeleteUser(${u.numUtilisateur})">
                            <span class="material-symbols-rounded">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function editUser(userId) {
    // TODO: GET /api/admin/users/{userId}
    // Retourne: { user: { numUtilisateur, nom, prenom, login, age, adresse, numClub, typeCompte,
    //            isCompetiteur, isEvaluateur, isPresident, isDirecteur, isAdministrateur,
    //            specialite, xp, prime } }
    apiFetch(`/admin/users/${userId}`).then(data => {
        const user = data.user;
        if (!user) return;
        
        document.getElementById('modal-user-title').textContent = 'Modifier l\'utilisateur';
        document.getElementById('user-id').value = user.numUtilisateur;
        document.getElementById('user-nom').value = user.nom || '';
        document.getElementById('user-prenom').value = user.prenom || '';
        document.getElementById('user-login').value = user.login || '';
        document.getElementById('user-age').value = user.age || '';
        document.getElementById('user-adresse').value = user.adresse || '';
        document.getElementById('user-club').value = user.numClub || '';
        document.getElementById('user-type-compte').value = user.typeCompte || 'public';
        
        // Roles
        document.getElementById('role-competiteur').checked = !!user.isCompetiteur;
        document.getElementById('role-evaluateur').checked = !!user.isEvaluateur;
        document.getElementById('role-president').checked = !!user.isPresident;
        document.getElementById('role-directeur').checked = !!user.isDirecteur;
        document.getElementById('role-administrateur').checked = !!user.isAdministrateur;
        
        // Role-specific fields
        toggleRoleFields();
        if (user.isEvaluateur) {
            document.getElementById('evaluateur-specialite').value = user.specialite || '';
            document.getElementById('evaluateur-xp').value = user.xp || 0;
        }
        if (user.isPresident) {
            document.getElementById('president-prime').value = user.prime || 0;
        }
        
        openModal('modal-user');
    }).catch(err => {
        console.error('Erreur chargement user:', err);
        showToast('Erreur lors du chargement', 'error');
    });
}

function addUser() {
    document.getElementById('modal-user-title').textContent = 'Nouvel utilisateur';
    document.getElementById('form-user').reset();
    document.getElementById('user-id').value = '';
    toggleRoleFields();
    openModal('modal-user');
}

function saveUser(formData) {
    const userId = formData.numUtilisateur;
    const isNew = !userId;
    
    // Collect roles
    const roles = [];
    if (formData.roles) {
        if (Array.isArray(formData.roles)) {
            roles.push(...formData.roles);
        } else {
            roles.push(formData.roles);
        }
    }
    formData.roles = roles;
    
    // TODO: POST /api/admin/users (create) or PUT /api/admin/users/{userId} (update)
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/admin/users' : `/admin/users/${userId}`;
    
    apiFetch(url, { method, body: JSON.stringify(formData) }).then(() => {
        showToast(isNew ? 'Utilisateur créé' : 'Utilisateur modifié', 'success');
        closeModal('modal-user');
        loadUsers();
        loadGlobalStats();
    }).catch(err => {
        console.error('Erreur sauvegarde user:', err);
        showToast('Erreur lors de la sauvegarde', 'error');
    });
}

function confirmDeleteUser(userId) {
    document.getElementById('delete-confirm-message').textContent = 
        'Êtes-vous sûr de vouloir supprimer cet utilisateur ?';
    adminState.deleteCallback = () => deleteUser(userId);
    openModal('modal-confirm-delete');
}

function deleteUser(userId) {
    // TODO: DELETE /api/admin/users/{userId}
    apiFetch(`/admin/users/${userId}`, { method: 'DELETE' }).then(() => {
        showToast('Utilisateur supprimé', 'success');
        closeModal('modal-confirm-delete');
        loadUsers();
        loadGlobalStats();
    }).catch(err => {
        console.error('Erreur suppression user:', err);
        showToast('Erreur lors de la suppression', 'error');
    });
}

function toggleRoleFields() {
    const evalCheck = document.getElementById('role-evaluateur');
    const presCheck = document.getElementById('role-president');
    
    document.getElementById('evaluateur-fields').style.display = evalCheck && evalCheck.checked ? '' : 'none';
    document.getElementById('president-fields').style.display = presCheck && presCheck.checked ? '' : 'none';
}

// ============================================
// SECTION: CLUBS
// ============================================

function loadClubs() {
    const { page, search, filter } = adminState.clubs;
    const offset = (page - 1) * PAGE_SIZE;
    
    // TODO: GET /api/admin/clubs?limit={PAGE_SIZE}&offset={offset}&search={search}&region={filter}
    // Retourne: { clubs: [...], total: number }
    let url = `/admin/clubs?limit=${PAGE_SIZE}&offset=${offset}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (filter) url += `&region=${encodeURIComponent(filter)}`;
    
    apiFetch(url).then(data => {
        adminState.clubs.data = data.clubs || [];
        adminState.clubs.total = data.total || 0;
        renderClubsTable();
        renderPagination('pagination-clubs', page, adminState.clubs.total);
    }).catch(err => {
        console.error('Erreur chargement clubs:', err);
    });
}

function renderClubsTable() {
    const tbody = document.getElementById('clubs-tbody');
    if (!tbody) return;
    
    if (adminState.clubs.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">Aucun club trouvé</td></tr>`;
        return;
    }
    
    tbody.innerHTML = adminState.clubs.data.map(c => `
        <tr>
            <td>${c.numClub}</td>
            <td><strong>${c.nomClub}</strong></td>
            <td>${c.ville || '-'}</td>
            <td>${c.departement || '-'}</td>
            <td>${c.region || '-'}</td>
            <td>${c.nbMembres || 0}</td>
            <td>
                <div class="actions-cell">
                    <a href="/club/${c.numClub}" data-link class="action-btn view" title="Voir">
                        <span class="material-symbols-rounded">visibility</span>
                    </a>
                    <button class="action-btn edit" title="Modifier" onclick="editClub(${c.numClub})">
                        <span class="material-symbols-rounded">edit</span>
                    </button>
                    <button class="action-btn delete" title="Supprimer" onclick="confirmDeleteClub(${c.numClub})">
                        <span class="material-symbols-rounded">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function editClub(clubId) {
    // TODO: GET /api/admin/clubs/{clubId}
    apiFetch(`/admin/clubs/${clubId}`).then(data => {
        const club = data.club;
        if (!club) return;
        
        document.getElementById('modal-club-title').textContent = 'Modifier le club';
        document.getElementById('club-id').value = club.numClub;
        document.getElementById('club-nom').value = club.nomClub || '';
        document.getElementById('club-adresse').value = club.adresse || '';
        document.getElementById('club-ville').value = club.ville || '';
        document.getElementById('club-telephone').value = club.numTelephone || '';
        document.getElementById('club-departement').value = club.departement || '';
        document.getElementById('club-region').value = club.region || '';
        
        openModal('modal-club');
    }).catch(err => {
        console.error('Erreur chargement club:', err);
        showToast('Erreur lors du chargement', 'error');
    });
}

function addClub() {
    document.getElementById('modal-club-title').textContent = 'Nouveau club';
    document.getElementById('form-club').reset();
    document.getElementById('club-id').value = '';
    openModal('modal-club');
}

function saveClub(formData) {
    const clubId = formData.numClub;
    const isNew = !clubId;
    
    // TODO: POST /api/admin/clubs (create) or PUT /api/admin/clubs/{clubId} (update)
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/admin/clubs' : `/admin/clubs/${clubId}`;
    
    apiFetch(url, { method, body: JSON.stringify(formData) }).then(() => {
        showToast(isNew ? 'Club créé' : 'Club modifié', 'success');
        closeModal('modal-club');
        loadClubs();
        loadGlobalStats();
        loadAllClubs(); // Refresh clubs list for selects
    }).catch(err => {
        console.error('Erreur sauvegarde club:', err);
        showToast('Erreur lors de la sauvegarde', 'error');
    });
}

function confirmDeleteClub(clubId) {
    document.getElementById('delete-confirm-message').textContent = 
        'Êtes-vous sûr de vouloir supprimer ce club ?';
    adminState.deleteCallback = () => deleteClub(clubId);
    openModal('modal-confirm-delete');
}

function deleteClub(clubId) {
    // TODO: DELETE /api/admin/clubs/{clubId}
    apiFetch(`/admin/clubs/${clubId}`, { method: 'DELETE' }).then(() => {
        showToast('Club supprimé', 'success');
        closeModal('modal-confirm-delete');
        loadClubs();
        loadGlobalStats();
    }).catch(err => {
        console.error('Erreur suppression club:', err);
        showToast('Erreur lors de la suppression', 'error');
    });
}

// ============================================
// SECTION: CONCOURS
// ============================================

function loadConcours() {
    const { page, search, filter } = adminState.concours;
    const offset = (page - 1) * PAGE_SIZE;
    
    // TODO: GET /api/admin/concours?limit={PAGE_SIZE}&offset={offset}&search={search}&etat={filter}
    // Retourne: { concours: [...], total: number }
    let url = `/admin/concours?limit=${PAGE_SIZE}&offset=${offset}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (filter) url += `&etat=${filter}`;
    
    apiFetch(url).then(data => {
        adminState.concours.data = data.concours || [];
        adminState.concours.total = data.total || 0;
        renderConcoursTable();
        renderPagination('pagination-concours', page, adminState.concours.total);
    }).catch(err => {
        console.error('Erreur chargement concours:', err);
    });
}

function renderConcoursTable() {
    const tbody = document.getElementById('concours-tbody');
    if (!tbody) return;
    
    if (adminState.concours.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">Aucun concours trouvé</td></tr>`;
        return;
    }
    
    tbody.innerHTML = adminState.concours.data.map(c => `
        <tr>
            <td>${c.numConcours}</td>
            <td><strong>${c.theme}</strong></td>
            <td>${formatDate(c.dateDebut)} - ${formatDate(c.dateFin)}</td>
            <td>${c.nomClub || '-'}</td>
            <td>${c.presidentNom ? c.presidentPrenom + ' ' + c.presidentNom : '-'}</td>
            <td><span class="status-badge status-${c.etat}">${STATUS_LABELS[c.etat] || c.etat}</span></td>
            <td>
                <div class="actions-cell">
                    <a href="/concours/${c.numConcours}" data-link class="action-btn view" title="Voir">
                        <span class="material-symbols-rounded">visibility</span>
                    </a>
                    <button class="action-btn edit" title="Modifier" onclick="editConcours(${c.numConcours})">
                        <span class="material-symbols-rounded">edit</span>
                    </button>
                    <button class="action-btn delete" title="Supprimer" onclick="confirmDeleteConcours(${c.numConcours})">
                        <span class="material-symbols-rounded">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function editConcours(concoursId) {
    // TODO: GET /api/admin/concours/{concoursId}
    apiFetch(`/admin/concours/${concoursId}`).then(data => {
        const concours = data.concours;
        if (!concours) return;
        
        document.getElementById('modal-concours-title').textContent = 'Modifier le concours';
        document.getElementById('concours-id').value = concours.numConcours;
        document.getElementById('concours-theme').value = concours.theme || '';
        document.getElementById('concours-description').value = concours.description || '';
        document.getElementById('concours-date-debut').value = concours.dateDebut || '';
        document.getElementById('concours-date-fin').value = concours.dateFin || '';
        document.getElementById('concours-club').value = concours.numClub || '';
        document.getElementById('concours-president').value = concours.numPresident || '';
        document.getElementById('concours-etat').value = concours.etat || 'pas_commence';
        
        // Load evaluateurs for this concours
        loadEvaluateursForConcours(concours.evaluateurs || []);
        
        openModal('modal-concours');
    }).catch(err => {
        console.error('Erreur chargement concours:', err);
        showToast('Erreur lors du chargement', 'error');
    });
}

function addConcours() {
    document.getElementById('modal-concours-title').textContent = 'Nouveau concours';
    document.getElementById('form-concours').reset();
    document.getElementById('concours-id').value = '';
    loadEvaluateursForConcours([]);
    openModal('modal-concours');
}

function loadEvaluateursForConcours(selectedIds) {
    const container = document.getElementById('concours-evaluateurs-container');
    if (!container) return;
    
    container.innerHTML = adminState.allEvaluateurs.map(e => `
        <label class="checkbox-label">
            <input type="checkbox" name="evaluateurs" value="${e.numEvaluateur}" 
                   ${selectedIds.includes(e.numEvaluateur) ? 'checked' : ''}>
            <span>${e.prenom} ${e.nom} (${e.specialite || 'N/A'})</span>
        </label>
    `).join('') || '<p class="empty-text">Aucun évaluateur disponible</p>';
}

function saveConcours(formData) {
    const concoursId = formData.numConcours;
    const isNew = !concoursId;
    
    // Collect evaluateurs
    const evaluateurs = [];
    const evalCheckboxes = document.querySelectorAll('input[name="evaluateurs"]:checked');
    evalCheckboxes.forEach(cb => evaluateurs.push(parseInt(cb.value)));
    formData.evaluateurs = evaluateurs;
    
    // TODO: POST /api/admin/concours (create) or PUT /api/admin/concours/{concoursId} (update)
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/admin/concours' : `/admin/concours/${concoursId}`;
    
    apiFetch(url, { method, body: JSON.stringify(formData) }).then(() => {
        showToast(isNew ? 'Concours créé' : 'Concours modifié', 'success');
        closeModal('modal-concours');
        loadConcours();
        loadGlobalStats();
    }).catch(err => {
        console.error('Erreur sauvegarde concours:', err);
        showToast('Erreur lors de la sauvegarde', 'error');
    });
}

function confirmDeleteConcours(concoursId) {
    document.getElementById('delete-confirm-message').textContent = 
        'Êtes-vous sûr de vouloir supprimer ce concours ?';
    adminState.deleteCallback = () => deleteConcours(concoursId);
    openModal('modal-confirm-delete');
}

function deleteConcours(concoursId) {
    // TODO: DELETE /api/admin/concours/{concoursId}
    apiFetch(`/admin/concours/${concoursId}`, { method: 'DELETE' }).then(() => {
        showToast('Concours supprimé', 'success');
        closeModal('modal-confirm-delete');
        loadConcours();
        loadGlobalStats();
    }).catch(err => {
        console.error('Erreur suppression concours:', err);
        showToast('Erreur lors de la suppression', 'error');
    });
}

// ============================================
// SECTION: EVALUATEURS
// ============================================

function loadEvaluateurs() {
    const { page, search, filter } = adminState.evaluateurs;
    const offset = (page - 1) * PAGE_SIZE;
    
    // TODO: GET /api/admin/evaluateurs?limit={PAGE_SIZE}&offset={offset}&search={search}&specialite={filter}
    // Retourne: { evaluateurs: [...], total: number }
    let url = `/admin/evaluateurs?limit=${PAGE_SIZE}&offset=${offset}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (filter) url += `&specialite=${encodeURIComponent(filter)}`;
    
    apiFetch(url).then(data => {
        adminState.evaluateurs.data = data.evaluateurs || [];
        adminState.evaluateurs.total = data.total || 0;
        renderEvaluateursTable();
        renderPagination('pagination-evaluateurs', page, adminState.evaluateurs.total);
    }).catch(err => {
        console.error('Erreur chargement évaluateurs:', err);
    });
}

function renderEvaluateursTable() {
    const tbody = document.getElementById('evaluateurs-tbody');
    if (!tbody) return;
    
    if (adminState.evaluateurs.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">Aucun évaluateur trouvé</td></tr>`;
        return;
    }
    
    tbody.innerHTML = adminState.evaluateurs.data.map(e => `
        <tr>
            <td>${e.numEvaluateur}</td>
            <td>
                <div class="user-cell">
                    <img src="${e.photoProfilUrl || '/img/default_profile.png'}" alt="" class="cell-avatar">
                    <div>
                        <strong>${e.prenom} ${e.nom}</strong>
                    </div>
                </div>
            </td>
            <td>${e.specialite || '-'}</td>
            <td><span class="xp-badge">${e.xp || 0} XP</span></td>
            <td>${e.nbEvaluations || 0}</td>
            <td>${e.nbConcours || 0}</td>
            <td>
                <div class="actions-cell">
                    <button class="action-btn assign" title="Assigner" onclick="openAssignEvaluateur(${e.numEvaluateur})">
                        <span class="material-symbols-rounded">assignment_add</span>
                    </button>
                    <button class="action-btn edit" title="Modifier" onclick="editUser(${e.numEvaluateur})">
                        <span class="material-symbols-rounded">edit</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAssignEvaluateur(evaluateurId) {
    document.getElementById('assign-evaluateur-id').value = evaluateurId;
    loadConcoursForAssign();
    openModal('modal-assign-evaluateur');
}

function loadConcoursForAssign() {
    const select = document.getElementById('assign-concours');
    if (!select) return;
    
    // TODO: GET /api/concours?etat=en_cours,attente
    apiFetch('/concours?etat=en_cours,attente').then(data => {
        select.innerHTML = '<option value="">Sélectionner un concours</option>';
        (data.concours || []).forEach(c => {
            select.insertAdjacentHTML('beforeend', 
                `<option value="${c.numConcours}">${c.theme} (${formatDate(c.dateDebut)})</option>`);
        });
    }).catch(err => {
        console.error('Erreur chargement concours:', err);
    });
}

function assignEvaluateur(formData) {
    // TODO: POST /api/admin/concours/{numConcours}/evaluateurs
    // Body: { numEvaluateur: number }
    apiFetch(`/admin/concours/${formData.numConcours}/evaluateurs`, {
        method: 'POST',
        body: JSON.stringify({ numEvaluateur: formData.numEvaluateur })
    }).then(() => {
        showToast('Évaluateur assigné', 'success');
        closeModal('modal-assign-evaluateur');
        loadEvaluateurs();
    }).catch(err => {
        console.error('Erreur assignation évaluateur:', err);
        showToast('Erreur lors de l\'assignation', 'error');
    });
}

// ============================================
// SECTION: DESSINS
// ============================================

function loadDessins() {
    const { page, search, filter } = adminState.dessins;
    const offset = (page - 1) * PAGE_SIZE;
    
    // TODO: GET /api/admin/dessins?limit={PAGE_SIZE}&offset={offset}&search={search}&concours={filter}
    // Retourne: { dessins: [...], total: number }
    let url = `/admin/dessins?limit=${PAGE_SIZE}&offset=${offset}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (filter) url += `&concours=${filter}`;
    
    apiFetch(url).then(data => {
        adminState.dessins.data = data.dessins || [];
        adminState.dessins.total = data.total || 0;
        renderDessinsGrid();
        renderPagination('pagination-dessins', page, adminState.dessins.total);
    }).catch(err => {
        console.error('Erreur chargement dessins:', err);
    });
}

function renderDessinsGrid() {
    const grid = document.getElementById('dessins-admin-grid');
    if (!grid) return;
    
    if (adminState.dessins.data.length === 0) {
        grid.innerHTML = `<div class="empty-state"><span class="material-symbols-rounded">draw</span><p>Aucun dessin trouvé</p></div>`;
        return;
    }
    
    grid.innerHTML = adminState.dessins.data.map(d => `
        <div class="dessin-admin-card">
            <a href="/dessin/${d.numDessin}" data-link class="dessin-image">
                <img src="${d.leDessin || '/img/empty_image.jpg'}" alt="Dessin" loading="lazy">
            </a>
            <div class="dessin-info">
                <span class="dessin-author">${d.prenom || ''} ${d.nom || ''}</span>
                <span class="dessin-concours">${d.theme || ''}</span>
                <span class="dessin-date">${formatDate(d.dateRemise)}</span>
            </div>
            <div class="dessin-actions">
                <button class="action-btn delete" title="Supprimer" onclick="confirmDeleteDessin(${d.numDessin})">
                    <span class="material-symbols-rounded">delete</span>
                </button>
            </div>
        </div>
    `).join('');
}

function confirmDeleteDessin(dessinId) {
    document.getElementById('delete-confirm-message').textContent = 
        'Êtes-vous sûr de vouloir supprimer ce dessin ?';
    adminState.deleteCallback = () => deleteDessin(dessinId);
    openModal('modal-confirm-delete');
}

function deleteDessin(dessinId) {
    // TODO: DELETE /api/admin/dessins/{dessinId}
    apiFetch(`/admin/dessins/${dessinId}`, { method: 'DELETE' }).then(() => {
        showToast('Dessin supprimé', 'success');
        closeModal('modal-confirm-delete');
        loadDessins();
        loadGlobalStats();
    }).catch(err => {
        console.error('Erreur suppression dessin:', err);
        showToast('Erreur lors de la suppression', 'error');
    });
}

// ============================================
// SECTION: ACTIVITY LOG
// ============================================

function loadActivity() {
    const { page, filter, date } = adminState.activity;
    const offset = (page - 1) * PAGE_SIZE;
    
    // TODO: GET /api/admin/activity?limit={PAGE_SIZE}&offset={offset}&type={filter}&date={date}
    // Retourne: { logs: [...], total: number }
    let url = `/admin/activity?limit=${PAGE_SIZE}&offset=${offset}`;
    if (filter) url += `&type=${filter}`;
    if (date) url += `&date=${date}`;
    
    apiFetch(url).then(data => {
        adminState.activity.data = data.logs || [];
        adminState.activity.total = data.total || 0;
        renderActivityTimeline();
        renderPagination('pagination-activity', page, adminState.activity.total);
    }).catch(err => {
        console.error('Erreur chargement activité:', err);
    });
}

function renderActivityTimeline() {
    const container = document.getElementById('activity-timeline');
    if (!container) return;
    
    if (adminState.activity.data.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="material-symbols-rounded">history</span><p>Aucune activité enregistrée</p></div>`;
        return;
    }
    
    const iconMap = {
        'create': 'add_circle',
        'update': 'edit',
        'delete': 'delete',
        'login': 'login'
    };
    
    container.innerHTML = adminState.activity.data.map(log => `
        <div class="activity-item type-${log.type}">
            <div class="activity-icon">
                <span class="material-symbols-rounded">${iconMap[log.type] || 'info'}</span>
            </div>
            <div class="activity-content">
                <p class="activity-message">${log.message}</p>
                <div class="activity-meta">
                    <span class="activity-user">${log.userName || 'Système'}</span>
                    <span class="activity-time">${formatDate(log.createdAt)} ${new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// LOAD REFERENCE DATA
// ============================================

function loadAllClubs() {
    // TODO: GET /api/clubs/all
    apiFetch('/clubs').then(data => {
        adminState.allClubs = data.clubs || [];
        populateClubSelects();
    }).catch(err => {
        console.error('Erreur chargement clubs:', err);
    });
}

function loadAllPresidents() {
    // TODO: GET /api/admin/presidents
    apiFetch('/admin/presidents').then(data => {
        adminState.allPresidents = data.presidents || [];
        populatePresidentSelect();
    }).catch(err => {
        console.error('Erreur chargement présidents:', err);
    });
}

function loadAllEvaluateurs() {
    // TODO: GET /api/admin/evaluateurs/all
    apiFetch('/admin/evaluateurs/all').then(data => {
        adminState.allEvaluateurs = data.evaluateurs || [];
    }).catch(err => {
        console.error('Erreur chargement évaluateurs:', err);
    });
}

function populateClubSelects() {
    const selects = ['user-club', 'concours-club'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        
        // Keep first option
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        adminState.allClubs.forEach(c => {
            select.insertAdjacentHTML('beforeend', 
                `<option value="${c.numClub}">${c.nomClub}</option>`);
        });
    });
}

function populatePresidentSelect() {
    const select = document.getElementById('concours-president');
    if (!select) return;
    
    const firstOption = select.options[0];
    select.innerHTML = '';
    select.appendChild(firstOption);
    
    adminState.allPresidents.forEach(p => {
        select.insertAdjacentHTML('beforeend', 
            `<option value="${p.numPresident}">${p.prenom} ${p.nom}</option>`);
    });
}

// ============================================
// NAVIGATION
// ============================================

function switchSection(sectionId) {
    // Update nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.toggle('active', section.id === `section-${sectionId}`);
    });
    
    adminState.currentSection = sectionId;
    
    // Load data for section
    switch (sectionId) {
        case 'users': loadUsers(); break;
        case 'clubs': loadClubs(); break;
        case 'concours': loadConcours(); break;
        case 'evaluateurs': loadEvaluateurs(); break;
        case 'dessins': loadDessins(); break;
        case 'activity': loadActivity(); break;
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
    // Navigation
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', () => switchSection(item.dataset.section));
    });
    
    // Modal close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });
    
    // Modal overlay click to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });
    
    // Add buttons
    document.getElementById('btn-add-user')?.addEventListener('click', addUser);
    document.getElementById('btn-add-club')?.addEventListener('click', addClub);
    document.getElementById('btn-add-concours')?.addEventListener('click', addConcours);
    
    // Confirm delete
    document.getElementById('btn-confirm-delete')?.addEventListener('click', () => {
        if (adminState.deleteCallback) adminState.deleteCallback();
    });
    
    // Forms
    document.getElementById('form-user')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        saveUser(formData);
    });
    
    document.getElementById('form-club')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        saveClub(formData);
    });
    
    document.getElementById('form-concours')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        saveConcours(formData);
    });
    
    document.getElementById('form-assign-evaluateur')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        assignEvaluateur(formData);
    });
    
    // Role checkboxes toggle fields
    document.getElementById('role-evaluateur')?.addEventListener('change', toggleRoleFields);
    document.getElementById('role-president')?.addEventListener('change', toggleRoleFields);
    
    // Search inputs with debounce
    const searchUsers = document.getElementById('search-users');
    if (searchUsers) {
        searchUsers.addEventListener('input', debounce(() => {
            adminState.users.search = searchUsers.value;
            adminState.users.page = 1;
            loadUsers();
        }, 300));
    }
    
    const searchClubs = document.getElementById('search-clubs');
    if (searchClubs) {
        searchClubs.addEventListener('input', debounce(() => {
            adminState.clubs.search = searchClubs.value;
            adminState.clubs.page = 1;
            loadClubs();
        }, 300));
    }
    
    const searchConcours = document.getElementById('search-concours');
    if (searchConcours) {
        searchConcours.addEventListener('input', debounce(() => {
            adminState.concours.search = searchConcours.value;
            adminState.concours.page = 1;
            loadConcours();
        }, 300));
    }
    
    const searchEvaluateurs = document.getElementById('search-evaluateurs');
    if (searchEvaluateurs) {
        searchEvaluateurs.addEventListener('input', debounce(() => {
            adminState.evaluateurs.search = searchEvaluateurs.value;
            adminState.evaluateurs.page = 1;
            loadEvaluateurs();
        }, 300));
    }
    
    const searchDessins = document.getElementById('search-dessins');
    if (searchDessins) {
        searchDessins.addEventListener('input', debounce(() => {
            adminState.dessins.search = searchDessins.value;
            adminState.dessins.page = 1;
            loadDessins();
        }, 300));
    }
    
    // Filter selects
    document.getElementById('filter-users-role')?.addEventListener('change', (e) => {
        adminState.users.filter = e.target.value;
        adminState.users.page = 1;
        loadUsers();
    });
    
    document.getElementById('filter-concours-etat')?.addEventListener('change', (e) => {
        adminState.concours.filter = e.target.value;
        adminState.concours.page = 1;
        loadConcours();
    });
    
    document.getElementById('filter-dessins-concours')?.addEventListener('change', (e) => {
        adminState.dessins.filter = e.target.value;
        adminState.dessins.page = 1;
        loadDessins();
    });
    
    document.getElementById('filter-activity-type')?.addEventListener('change', (e) => {
        adminState.activity.filter = e.target.value;
        adminState.activity.page = 1;
        loadActivity();
    });
    
    document.getElementById('filter-activity-date')?.addEventListener('change', (e) => {
        adminState.activity.date = e.target.value;
        adminState.activity.page = 1;
        loadActivity();
    });
    
    // Pagination clicks
    document.addEventListener('click', (e) => {
        const paginationBtn = e.target.closest('.pagination-btn');
        if (!paginationBtn || paginationBtn.disabled) return;
        
        const page = parseInt(paginationBtn.dataset.page);
        const container = paginationBtn.closest('.pagination');
        
        if (container.id === 'pagination-users') {
            adminState.users.page = page;
            loadUsers();
        } else if (container.id === 'pagination-clubs') {
            adminState.clubs.page = page;
            loadClubs();
        } else if (container.id === 'pagination-concours') {
            adminState.concours.page = page;
            loadConcours();
        } else if (container.id === 'pagination-evaluateurs') {
            adminState.evaluateurs.page = page;
            loadEvaluateurs();
        } else if (container.id === 'pagination-dessins') {
            adminState.dessins.page = page;
            loadDessins();
        } else if (container.id === 'pagination-activity') {
            adminState.activity.page = page;
            loadActivity();
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    initEventListeners();
    loadGlobalStats();
    loadAllClubs();
    loadAllPresidents();
    loadAllEvaluateurs();
    loadUsers(); // Load first section
}

document.addEventListener("route-change", init);
