function init(){
    var userLabel = document.getElementById("userLabel");
    
    if (userLabel && state.userInfo) {
        var userInfo = state.userInfo;
        userLabel.textContent = userInfo.nom + " " + userInfo.prenom;
    }
}

init();