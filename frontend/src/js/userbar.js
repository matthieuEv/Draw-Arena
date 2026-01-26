function init(){
    var userLabel = document.getElementById("userLabel");
    
    if (userLabel && state.userInfo) {
        var userInfo = state.userInfo;
        userLabel.textContent = userInfo.nom + " " + userInfo.prenom;
    }

    var userAvatar = document.getElementById("userAvatar");
    if (userAvatar && state.userInfo) {
        var userInfo = state.userInfo;
        var profileImg = userInfo.photoProfilUrl ? userInfo.photoProfilUrl : "/img/default_profile.png";
        userAvatar.setAttribute("src", profileImg);
    }
}

function onRouteChange(event) {
    init();
}

document.addEventListener("route-change", onRouteChange);