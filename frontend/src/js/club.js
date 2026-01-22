var clubInfo = null;
var clubUsers = null;

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

function displayClubUsers() {
    if (clubUsers) {
        const clubUsersDiv = document.getElementById('users-list');
        clubUsers.forEach(user => {
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

function loadClubData(clubId) {
    apiFetch(`/club/${clubId}`).then(info => {
        clubInfo = info.club;
        console.log('Club Info Loaded:', clubInfo);
    });
    apiFetch(`/club/${clubId}/users`).then(users => {
        clubUsers = users.users;
        console.log('Club Users Loaded:', clubUsers);
    });
}

// TODO : implement when getting a club id
loadClubData(1);