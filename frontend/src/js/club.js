var clubInfo = null;
var clubUsers = [];

function displayClubInfo() {
    if (clubInfo) {
        document.getElementById("club-name").textContent = clubInfo.nomClub;
        document.getElementById("club-address").textContent = clubInfo.adresse;
        document.getElementById("club-city").textContent = clubInfo.ville;
        document.getElementById("club-dept").textContent = clubInfo.departement;
        document.getElementById("club-region").textContent = clubInfo.region;
        document.getElementById("club-phone").textContent = clubInfo.numTelephone;
    }
}

function displayClubUsers(users = null) {
    var dataToLoad = users ? users : clubUsers;
    if (dataToLoad) {
        const clubUsersDiv = document.getElementById('users-list');
        dataToLoad.forEach(user => {
            const profileImg = user.pp ? user.pp : "/img/default_profile.png";
            clubUsersDiv.insertAdjacentHTML('beforeend', `
                <div class="user-card">
                    <img src="${profileImg}" alt="Profile" class="user-avatar">
                    <div class="user-details">
                        <h3 class="user-name">${user.prenom} ${user.nom} - ${user.age}</h3>
                        <p class="user-login">${user.login}</p>
                        <p class="user-address">${user.adresse}</p>
                    </div>
                </div>
            `);
        });
    }
}

document.getElementById("load-more-users").addEventListener("click", function() {
    getMoreUsers(1);
});

function getMoreUsers(clubId){
    const currentCount = clubUsers ? clubUsers.length : 0;
    apiFetch(`/club/${clubId}/users?limit=12&index=${currentCount}`).then(users => {
        if(users.users.length !== 13) {
            document.getElementById("load-more-users").style.display = "none";
        } 
        clubUsers = clubUsers.concat(users.users);
        displayClubUsers(users.users);
    });
}

function loadClubData(clubId) {
    apiFetch(`/club/${clubId}`).then(info => {
        clubInfo = info.club;
        displayClubInfo();
    });
    getMoreUsers(clubId);
}

// TODO : implement when getting a club id
loadClubData(1);