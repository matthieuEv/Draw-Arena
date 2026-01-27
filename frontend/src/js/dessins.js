concoursDataDessins = [];
concoursDessins = {};

function distplayConcoursDessins(){
    var dataToLoad = concoursDataDessins;
    if (dataToLoad) {
        const concoursDiv = document.getElementById('concours-dessins-list');
        concoursDiv.innerHTML = "";
        if (!concoursDiv) return;
        dataToLoad.forEach(concours => {
            concoursID = concours.numConcours;
            concoursDessins[concoursID] = [];
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

                    <div id="dessins-list-${concoursID}" class="users-grid">
                        
                    </div>
                    <div class="load-more-container">
                        <button id="load-more-dessins-${concoursID}" onclick="getDessins(${concoursID})" class="load-more-button">Charger plus de dessins</button>
                    </div>

                </div>
            `);
        });
    }
}

function displayDessins(concoursID, users = null){
    var dataToLoad = users ? users : concoursDessins[concoursID];
    if (dataToLoad) {
        const clubUsersDiv = document.getElementById('dessins-list-'+concoursID);
        if (!clubUsersDiv) return;
        dataToLoad.forEach(user => {
            const profileImg = user.le_dessin ? user.le_dessin : "/img/empty_image.jpg";
            clubUsersDiv.insertAdjacentHTML('beforeend', `
                <div class="dessins-card">
                    <img src="${profileImg}" class="dessins-img">
                    <div class="user-details">
                        <h3 class="user-name">${user.prenom} ${user.nom} - ${user.age}</h3>
                        <p class="user-login">${user.login}</p>
                        <p class="user-address">${user.adresse}</p>
                        <p class="user-address">${user.note}/20 - ${user.date_evaluation}</p>
                    </div>
                </div>
            `);
        });
    }
}

function getConcoursDessins(year){
    concoursDataDessins = [];
    concoursDessins = {};

    var param = year === "all" ? "" : year;
    
    apiFetch(`/concours?year=${year}`).then(info => {
        concoursDataDessins = info.concours;
        distplayConcoursDessins();
    });
}

function getDessins(concoursID){
    const currentCount = concoursDessins[concoursID] ? concoursDessins[concoursID].length : 0;
    apiFetch(`/concours/${concoursID}/dessins?limit=12&index=${currentCount}`).then(dessins => {
        if(dessins.dessins.length !== 13) {
            const loadMoreButton = document.getElementById("load-more-dessins-"+concoursID);
            if (loadMoreButton) loadMoreButton.style.display = "none";
        }else{
            dessins.dessins.pop();
        }

        concoursDessins[concoursID] = (concoursDessins[concoursID] || []).concat(dessins.dessins);
        displayDessins(concoursID, dessins.dessins);
    });
}

function onRouteChange(event) {
    getConcoursDessins("all");


    document.getElementById("year-select").addEventListener("change", function() {
        const selectedYear = this.value;

        getConcoursDessins(selectedYear);
    });
}

document.addEventListener("route-change", onRouteChange);