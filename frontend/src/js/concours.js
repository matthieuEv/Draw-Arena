concoursDataUser = [];
concoursUsers = {};
currentUserRole = null;

/**
 * Récupère le rôle de l'utilisateur depuis le club
 */
function fetchCurrentUserRole() {
    const userInfo = state.userInfo;
    if (!userInfo || !userInfo.club || !userInfo.id) {
        currentUserRole = userInfo?.role || 'competiteur';
        return Promise.resolve();
    }
    
    return apiFetch(`/club/${userInfo.club}/user/${userInfo.id}`).then(data => {
        if (data && data.user && data.user.typeCompte) {
            currentUserRole = data.user.typeCompte.toLowerCase();
        } else {
            currentUserRole = userInfo.role || 'competiteur';
        }
    }).catch(err => {
        console.error("Erreur récupération rôle:", err);
        currentUserRole = userInfo?.role || 'competiteur';
    });
}

function distplayConcoursUser(){
    var dataToLoad = concoursDataUser;
    if (dataToLoad) {
        const concoursDiv = document.getElementById('concours-users-list');
        concoursDiv.innerHTML = "";
        if (!concoursDiv) return;
        dataToLoad.forEach(concours => {
            concoursID = concours.numConcours;
            concoursUsers[concoursID] = [];
            
            const isEnCours = concours.etat === 'en_cours';
            const isAttente = concours.etat === 'attente';
            
            // Bouton "Déposer un dessin" uniquement pour les compétiteurs et concours en cours
            const isCompetiteur = currentUserRole === 'competiteur';
            const depotButton = (isEnCours && isCompetiteur) ? `
                <a href="/depot?concours=${concoursID}" class="load-more-button depot-btn">
                    <span class="material-symbols-rounded">image_arrow_up</span>
                    Déposer un dessin
                </a>
            ` : '';
            
            // Bouton "Évaluer un dessin" uniquement pour les évaluateurs et concours en attente d'évaluation
            const isEvaluateur = currentUserRole === 'evaluateur' || currentUserRole === 'president';
            const evalButton = ((isAttente || isEnCours) && isEvaluateur) ? `
                <a href="/concours-detail?id=${concoursID}" class="load-more-button eval-btn">
                    <span class="material-symbols-rounded">rate_review</span>
                    Évaluer les dessins
                </a>
            ` : '';
            
            concoursDiv.insertAdjacentHTML('beforeend', `
                <div class="main-card" id="concour-card-${concoursID}">
                    <div class="user-card" id="main-card-${concoursID}">
                        <img src="/img/default_concours.png" alt="Profile" class="user-avatar noround">
                        <div class="user-details">
                            <h3 class="concours-theme">${concours.theme}</h3>
                            <p class="concours-status">Status: ${concours.etat}</p>
                            <p class="concours-dates">De ${concours.dateDebut} à ${concours.dateFin}</p>
                        </div>
                        <div class="concours-actions">
                            ${depotButton}
                            ${evalButton}
                        </div>
                    </div>

                    <div id="users-list-${concoursID}" class="users-grid">
                        
                    </div>
                    <div class="load-more-container">
                        <button id="load-more-users-${concoursID}" onclick="getUsers(${concoursID})" class="load-more-button">Charger plus de membres</button>
                    </div>

                </div>
            `);
        });
    }
}

function displayUsers(concoursID, users = null){
    var dataToLoad = users ? users : concoursUsers[concoursID];
    if (dataToLoad) {
        const clubUsersDiv = document.getElementById('users-list-'+concoursID);
        if (!clubUsersDiv) return;
        dataToLoad.forEach(user => {
            const profileImg = user.photoProfilUrl ? user.photoProfilUrl : "/img/default_profile.png";

            let icon = '';
            if(user.role === 'president'){
                icon = `<span class="material-symbols-rounded president-icon role-icon" title="Président">taunt</span>`;
            }else if(user.role === 'evaluateur'){
                icon = `<span class="material-symbols-rounded evaluateur-icon role-icon" title="Évaluateur">assignment</span>`;
            }

            clubUsersDiv.insertAdjacentHTML('beforeend', `
                <div class="user-card ${user.role}">
                    <img src="${profileImg}" alt="Profile" class="user-avatar">
                    <div class="user-details">
                        <h3 class="user-name">${user.prenom} ${user.nom} - ${user.age}</h3>
                        <p class="user-login">${user.login}</p>
                        <p class="user-address">${user.adresse}</p>
                    </div>
                    ${icon}
                </div>
            `);
        });
    }
}

function getConcoursUser(year){
    concoursDataUser = [];
    concoursUsers = {};

    var param = year === "all" ? "" : year;
    
    apiFetch(`/concours?year=${year}`).then(info => {
        concoursDataUser = info.concours;
        distplayConcoursUser();
    });
}

function getUsers(concoursID){
    const currentCount = concoursUsers[concoursID] ? concoursUsers[concoursID].length : 0;
    apiFetch(`/concours/${concoursID}/users?limit=12&index=${currentCount}`).then(users => {
        if(users.users.length !== 13) {
            const loadMoreButton = document.getElementById("load-more-users-"+concoursID);
            if (loadMoreButton) loadMoreButton.style.display = "none";
        }else{
            users.users.pop();
        }
        concoursUsers[concoursID] = (concoursUsers[concoursID] || []).concat(users.users);
        displayUsers(concoursID, users.users);
    });
}

function onRouteChange(event) {
    // Récupérer le rôle de l'utilisateur avant d'afficher les concours
    fetchCurrentUserRole().then(() => {
        getConcoursUser("all");
    });

    document.getElementById("year-select").addEventListener("change", function() {
        const selectedYear = this.value;

        getConcoursUser(selectedYear);
    });
}

document.addEventListener("route-change", onRouteChange);