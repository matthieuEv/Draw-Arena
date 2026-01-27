var clubInfo = null;
var clubUsers = [];
var currentClubId = null;

function displayClubInfo() {
    if (clubInfo) {
        const name = document.getElementById("club-name");
        const address = document.getElementById("club-address");
        const city = document.getElementById("club-city");
        const dept = document.getElementById("club-dept");
        const region = document.getElementById("club-region");
        const phone = document.getElementById("club-phone");
        if (name) name.textContent = clubInfo.nomClub;
        if (address) address.textContent = clubInfo.adresse;
        if (city) city.textContent = clubInfo.ville+", ";
        if (dept) dept.textContent = clubInfo.departement;
        if (region) region.textContent = "("+clubInfo.region+")";
        if (phone) phone.textContent = "Tél : "+clubInfo.numTelephone;
    }
}

function displayClubUsers(users = null) {
    var dataToLoad = users ? users : clubUsers;
    if (dataToLoad) {
        const clubUsersDiv = document.getElementById('users-list');
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

document.addEventListener("click", function(event) {
    const button = event.target.closest("#load-more-users");
    if (!button) return;
    if (!currentClubId) return;
    getMoreUsers(currentClubId);
});

function resetClubState() {
    clubInfo = null;
    clubUsers = [];
    const clubUsersDiv = document.getElementById('users-list');
    if (clubUsersDiv) clubUsersDiv.innerHTML = "";
    const loadMoreButton = document.getElementById("load-more-users");
    if (loadMoreButton) loadMoreButton.style.display = "";
}

function getMoreUsers(clubId){
    const currentCount = clubUsers ? clubUsers.length : 0;
    apiFetch(`/club/${clubId}/users?limit=12&index=${currentCount}`).then(users => {
        if(users.users.length !== 13) {
            const loadMoreButton = document.getElementById("load-more-users");
            if (loadMoreButton) loadMoreButton.style.display = "none";
        }else{
            users.users.pop();
        }
        clubUsers = clubUsers.concat(users.users);
        displayClubUsers(users.users);
    });
}

function loadClubData(clubId) {
    currentClubId = clubId;
    apiFetch(`/club/${clubId}`).then(info => {
        clubInfo = info.club;
        displayClubInfo();
    });
    getMoreUsers(clubId);
}

function onRouteChange(event) {
    const detail = event && event.detail ? event.detail : {};
    const path = detail.path || "";
    if (!/^\/club(\/|$)/.test(path)) return;
    const rawId = detail.params ? detail.params.id : null;
    const clubId = rawId ? Number(rawId) : null;
    if (!clubId || Number.isNaN(clubId)) return;
    resetClubState();
    loadClubData(clubId);
}

document.addEventListener("route-change", onRouteChange);
