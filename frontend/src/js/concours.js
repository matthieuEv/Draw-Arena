concoursData = [];
concoursUsers = {};

function distplayConcours(){
    var dataToLoad = concoursData;
    if (dataToLoad) {
        const concoursDiv = document.getElementById('concours-list');
        concoursDiv.innerHTML = "";
        if (!concoursDiv) return;
        dataToLoad.forEach(concours => {
            concoursID = concours.numConcours;
            concoursUsers[concoursID] = [];
            concoursDiv.insertAdjacentHTML('beforeend', `
                <div class="main-card" id="concour-card-${concoursID}">
                    <div class="user-card" id="main-card-${concoursID}">
                        <img src="/img/default_concours.png" alt="Profile" class="user-avatar noround">
                        <div class="user-details">
                            <h3 class="concours-theme">${concours.theme}</h3>
                            <p class="concours-status">Status: ${concours.etat}</p>
                            <p class="concours-dates">De ${concours.dateDebut} à ${concours.dateFin}</p>
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
                <div class="user-card">
                    <img src="${profileImg}" alt="Profile" class="user-avatar ${user.role}">
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

function getConcours(year){
    concoursData = [];
    concoursUsers = {};

    var param = year === "all" ? "" : year;
    
    apiFetch(`/concours?year=${year}`).then(info => {
        concoursData = info.concours;
        distplayConcours();
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
    getConcours("all");


    document.getElementById("year-select").addEventListener("change", function() {
        const selectedYear = this.value;

        getConcours(selectedYear);
    });
}

document.addEventListener("route-change", onRouteChange);