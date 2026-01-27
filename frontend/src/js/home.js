// function init(){
//     var userLabel = document.getElementById("userLabel");
    
//     if (userLabel && state.userInfo) {
//         var userInfo = state.userInfo;
//         userLabel.textContent = userInfo.nom + " " + userInfo.prenom;
//     }

//     var userAvatar = document.getElementById("userAvatar");
//     if (userAvatar && state.userInfo) {
//         var userInfo = state.userInfo;
//         var profileImg = userInfo.photoProfilUrl ? userInfo.photoProfilUrl : "/img/default_profile.png";
//         userAvatar.setAttribute("src", profileImg);
//     }
// }

var userInfo = null;

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

function loadClubData(clubId) {
    currentClubId = clubId;
    apiFetch(`/club/${clubId}`).then(info => {
        clubInfo = info.club;
        displayClubInfo();
    });
    getMoreUsers(clubId);
}

function resetData(){
    var userBody = document.getElementById("home-user-body");
    var adminBody = document.getElementById("home-admin-body");
    if(userBody){
        // Remove class "active" for userBody
        userBody.classList.remove("active");
        
    }
    if(adminBody){
        // Remove class "active" for adminBody
        adminBody.classList.remove("active");
    }
    if(userInfo.role != "administrateur"){
        userBody.classList.add("active");
    }else{
        adminBody.classList.add("active");
    }
}

function onRouteChange(event) {
    userInfo = state.userInfo;
    resetData();
    loadClubData(userInfo.club);
}

document.addEventListener("route-change", onRouteChange);