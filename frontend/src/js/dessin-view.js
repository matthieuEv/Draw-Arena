/**
 * Dessin View - Affichage d'un dessin en plein écran
 */

"use strict";

var currentDessin = null;

function displayDessin(dessin) {
    if (!dessin) return;
    
    currentDessin = dessin;
    
    const image = document.getElementById("dessin-image");
    const theme = document.getElementById("dessin-theme");
    const author = document.getElementById("dessin-author");
    const date = document.getElementById("dessin-date");
    const concours = document.getElementById("dessin-concours");
    const classement = document.getElementById("dessin-classement");
    const classementContainer = document.getElementById("dessin-classement-container");
    const note = document.getElementById("dessin-note");
    const noteContainer = document.getElementById("dessin-note-container");
    const comment = document.getElementById("dessin-comment");
    const commentContainer = document.getElementById("dessin-comment-container");
    
    if (image) image.src = dessin.leDessin || "/img/empty_image.jpg";
    if (theme) theme.textContent = dessin.theme || "Dessin";
    if (author) author.textContent = dessin.prenom && dessin.nom ? 
        `Par ${dessin.prenom} ${dessin.nom}` : "";
    if (date) date.textContent = dessin.dateRemise || "-";
    if (concours) concours.textContent = dessin.theme || "-";
    
    if (dessin.classement && classementContainer) {
        classementContainer.style.display = "";
        if (classement) classement.textContent = `${dessin.classement}${getOrdinalSuffix(dessin.classement)} place`;
    }
    
    if (dessin.note !== undefined && dessin.note !== null && noteContainer) {
        noteContainer.style.display = "";
        if (note) note.textContent = `${dessin.note}/20`;
    }
    
    if (dessin.commentaire && commentContainer) {
        commentContainer.style.display = "";
        if (comment) comment.textContent = dessin.commentaire;
    }
}

function getOrdinalSuffix(n) {
    if (n === 1) return "ère";
    return "ème";
}

function loadDessin(dessinId) {
    // TODO: GET /api/dessin/{dessinId}
    // Retourne: { dessin: { numDessin, leDessin, commentaire, dateRemise, classement, 
    //            theme, prenom, nom, note (moyenne des évaluations) } }
    apiFetch(`/dessin/${dessinId}`).then(data => {
        if (data.dessin) {
            displayDessin(data.dessin);
        }
    }).catch(err => {
        console.error("Erreur chargement dessin:", err);
    });
}

// Download functionality
document.addEventListener("click", function(event) {
    if (event.target.closest("#download-btn")) {
        if (currentDessin && currentDessin.leDessin) {
            const link = document.createElement("a");
            link.href = currentDessin.leDessin;
            link.download = `dessin-${currentDessin.numDessin || 'image'}.jpg`;
            link.click();
        }
    }
});

// Fullscreen functionality
document.addEventListener("click", function(event) {
    if (event.target.closest("#fullscreen-btn")) {
        const container = document.querySelector(".dessin-container");
        if (container) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                container.requestFullscreen();
            }
        }
    }
});

// Keyboard navigation
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        history.back();
    }
});

function onRouteChange(event) {
    const detail = event && event.detail ? event.detail : {};
    const params = detail.params || {};
    
    if (params.id) {
        loadDessin(params.id);
    }
}

document.addEventListener("route-change", onRouteChange);
