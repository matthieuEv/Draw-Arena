var clubsInfo = [];

function displayClub(clubs = null) {
    var dataToLoad = clubs ? clubs : clubsInfo;
    if (dataToLoad) {
        const clubClubsDiv = document.getElementById('clubs-list');
        if (!clubClubsDiv) return;
        dataToLoad.forEach(club => {
            clubClubsDiv.insertAdjacentHTML('beforeend', `
                <a href="/club/${club.numClub}" class="user-card">
                    <img src="/img/default_club.png" alt="Profile" class="user-avatar">
                    <div class="user-details">
                        <h3 class="user-name">${club.nomClub}</h3>
                        <p class="user-login">${club.adresse}</p>
                    </div>
                </a>
            `);
        });
    }
}

document.addEventListener("click", function(event) {
    const button = event.target.closest("#load-more-clubs");
    if (!button) return;
    if (!currentClubId) return;
    getMoreClubs(currentClubId);
});

function resetClubState() {
    clubsInfo = [];
    const clubClubsDiv = document.getElementById('clubs-list');
    if (clubClubsDiv) clubClubsDiv.innerHTML = "";
    const loadMoreButton = document.getElementById("my-club-button");
    if (loadMoreButton) loadMoreButton.style.display = "";
    const loadMoreClubsButton = document.getElementById("load-more-clubs");
    if (loadMoreClubsButton) loadMoreClubsButton.style.display = "";
}

function hasAClub(){
    const loadMoreButton = document.getElementById("my-club-button");
    if(!state.userInfo.club){
        if (loadMoreButton) loadMoreButton.style.display = "none";
    }else{
        if (loadMoreButton) loadMoreButton.style.display = "inline-block";
        loadMoreButton.href = "/club/"+state.userInfo.club;
    }
}

function getMoreClubs(){
    hasAClub();
    const currentCount = clubsInfo ? clubsInfo.length : 0;
    apiFetch(`/club?limit=12&index=${currentCount}`).then(clubs => {
        if(clubs.clubs.length !== 13) {
            const loadMoreButton = document.getElementById("load-more-clubs");
            if (loadMoreButton) loadMoreButton.style.display = "none";
        }else{
            clubs.clubs.pop();
        }
        clubsInfo = clubsInfo.concat(clubs.clubs);
        displayClub(clubs.clubs);
    });
}

function onRouteChange(event) {
    resetClubState();
    getMoreClubs();
}

document.addEventListener("route-change", onRouteChange);
