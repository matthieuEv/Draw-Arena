// CODED BY CLAUDE OPUS 4.5

let currentImage = null;
let puzzleState = Array(9).fill(null);
let draggedPiece = null;
let isDragging = false;

const imageInput = document.getElementById('imageInput');
const puzzleModal = document.getElementById('puzzleModal');
const closeModal = document.getElementById('closeModal');
const puzzleGrid = document.getElementById('puzzleGrid');
const piecesArea = document.getElementById('piecesArea');
const sendButton = document.getElementById('sendButton');
const messageDiv = document.getElementById('message');
const dragPreview = document.getElementById('dragPreview');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const captchaButton = document.getElementById('captchaButton');
const inputComment = document.getElementById('commentInput');
const errorMessage = document.getElementById('errorMessage');

// Charger l'image
imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Recadrer l'image en carré et afficher la preview
                cropImageToSquare(img, function(croppedImg) {
                    currentImage = croppedImg;
                    showImagePreview(croppedImg);
                });
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Afficher la preview de l'image
function showImagePreview(img) {
    previewImg.src = img.src;
    imagePreview.classList.remove('hidden');
}

// Bouton captcha pour ouvrir le puzzle
captchaButton.addEventListener('click', function() {
    if (currentImage) {
        if(inputComment.value.trim() === "") {
            errorMessage.textContent = "Veuillez ajouter un commentaire avant de continuer.";
            return;
        }
        initializePuzzle();
    }else{
        errorMessage.textContent = "Veuillez sélectionner une image avant de continuer.";
    }
});

// Recadrer l'image en format carré (centré)
function cropImageToSquare(img, callback) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Déterminer la taille du carré (le minimum entre largeur et hauteur)
    const size = Math.min(img.width, img.height);
    tempCanvas.width = size;
    tempCanvas.height = size;
    
    // Calculer le décalage pour centrer le crop
    const offsetX = (img.width - size) / 2;
    const offsetY = (img.height - size) / 2;
    
    // Dessiner la partie centrale de l'image
    tempCtx.drawImage(
        img,
        offsetX, offsetY, size, size,  // Source (partie centrale)
        0, 0, size, size                // Destination (tout le canvas)
    );
    
    // Créer une nouvelle image à partir du canvas
    const croppedImg = new Image();
    croppedImg.onload = function() {
        callback(croppedImg);
    };
    croppedImg.src = tempCanvas.toDataURL();
}

// Fermer le modal
closeModal.addEventListener('click', function() {
    puzzleModal.classList.add('hidden');
    resetPuzzle();
});

// Fermer en cliquant sur l'overlay
document.querySelector('.modal-overlay').addEventListener('click', function() {
    puzzleModal.classList.add('hidden');
    resetPuzzle();
});

// Initialiser le puzzle
function initializePuzzle() {
    // Réinitialiser l'état
    puzzleState = Array(9).fill(null);
    messageDiv.textContent = '';
    messageDiv.className = 'message';
    
    // Réactiver le bouton
    sendButton.disabled = false;
    sendButton.style.opacity = '1';
    sendButton.style.cursor = 'pointer';
    
    // Afficher le modal
    puzzleModal.classList.remove('hidden');
    
    // Créer la grille de puzzle
    createPuzzleGrid();
    
    // Créer les pièces de puzzle
    createPuzzlePieces();
}

// Réinitialiser le puzzle
function resetPuzzle() {
    puzzleState = Array(9).fill(null);
    messageDiv.textContent = '';
    messageDiv.className = 'message';
    puzzleGrid.classList.remove('complete', 'final-image');
    sendButton.disabled = false;
    sendButton.style.opacity = '1';
    sendButton.style.cursor = 'pointer';
    
    // Réafficher la zone des pièces disponibles
    const piecesContainer = document.querySelector('.pieces-container');
    if (piecesContainer) {
        piecesContainer.style.display = '';
    }
    
    // Vider les zones
    puzzleGrid.innerHTML = '';
    piecesArea.innerHTML = '';
}

// Créer la grille de puzzle (9 cases vides)
function createPuzzleGrid() {
    puzzleGrid.innerHTML = '';
    puzzleGrid.classList.remove('complete', 'compressed');
    
    for (let i = 0; i < 9; i++) {
        const slot = document.createElement('div');
        slot.className = 'puzzle-slot';
        slot.dataset.position = i;
        
        // Événements de drag & drop pour les slots
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
        slot.addEventListener('dragleave', handleDragLeave);
        
        puzzleGrid.appendChild(slot);
    }
}

// Créer les pièces de puzzle mélangées
function createPuzzlePieces() {
    piecesArea.innerHTML = '';
    
    const pieceSize = 180;      // Taille totale du SVG
    const innerSize = 150;      // Taille de la partie carrée (= taille de la case)
    const tabSize = 15;         // Marge/décalage pour les onglets
    const tabRadius = 15;       // Rayon des cercles
    
    // Créer un tableau des positions et le mélanger
    let positions = Array.from({length: 9}, (_, i) => i);
    positions = shuffleArray(positions);
    
    // Définir les connexions pour chaque pièce (haut, droite, bas, gauche)
    // 1 = sortant, -1 = entrant, 0 = plat
    // Layout: 0 1 2
    //         3 4 5
    //         6 7 8
    const connections = [
        [0, 1, 1, 0],      // 0: coin haut-gauche
        [0, 1, 1, -1],     // 1: milieu haut (left=-1 pour s'emboîter avec 0 right=1)
        [0, 0, -1, -1],    // 2: coin haut-droit (left=-1 pour s'emboîter avec 1 right=-1)
        [-1, 1, 1, 0],     // 3: milieu gauche (top=-1 pour s'emboîter avec 0 bottom=1)
        [-1, -1, 1, -1],   // 4: centre (top=-1 avec 1, left=-1 avec 3 right=1)
        [1, 0, -1, 1],     // 5: milieu droit (top=1 avec 2 bottom=-1, left=1 avec 4 right=-1)
        [-1, -1, 0, 0],    // 6: coin bas-gauche (top=-1 avec 3 bottom=1)
        [-1, 1, 0, 1],     // 7: milieu bas (top=-1 avec 4 bottom=1, left=1 avec 6 right=-1)
        [1, 0, 0, -1]      // 8: coin bas-droit (top=1 avec 5 bottom=-1, left=-1 avec 7 right=1)
    ];
    
    positions.forEach((originalPosition) => {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.draggable = true;
        piece.dataset.correctPosition = originalPosition;
        
        // Calculer la position de la pièce dans l'image
        const row = Math.floor(originalPosition / 3);
        const col = originalPosition % 3;
        
        // Dessiner la pièce sur le canvas - on doit inclure les onglets
        canvas.width = pieceSize;
        canvas.height = pieceSize;
        
        // Calculer la zone source en incluant les débordements pour les onglets
        const pieceWidthInImage = currentImage.width / 3;
        const pieceHeightInImage = currentImage.height / 3;
        const tabWidthInImage = pieceWidthInImage * (tabSize / innerSize);
        const tabHeightInImage = pieceHeightInImage * (tabSize / innerSize);
        
        // Position source avec extension pour les onglets
        const sourceX = col * pieceWidthInImage - tabWidthInImage;
        const sourceY = row * pieceHeightInImage - tabHeightInImage;
        const sourceWidth = pieceWidthInImage + (tabWidthInImage * 2);
        const sourceHeight = pieceHeightInImage + (tabHeightInImage * 2);
        
        // Dessiner l'image complète dans tout le canvas
        ctx.clearRect(0, 0, pieceSize, pieceSize);
        ctx.drawImage(
            currentImage,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, pieceSize, pieceSize
        );
        
        // Créer le SVG pour cette pièce
        const imageData = canvas.toDataURL();
        const svg = createPuzzlePieceSVG(pieceSize, innerSize, tabSize, tabRadius, connections[originalPosition], imageData);
        piece.innerHTML = svg;
        
        // Événements de drag & drop
        piece.addEventListener('dragstart', handleDragStart);
        piece.addEventListener('dragend', handleDragEnd);
        piece.addEventListener('drag', handleDrag);
        
        piecesArea.appendChild(piece);
    });
}

// Créer un SVG de pièce de puzzle
function createPuzzlePieceSVG(size, innerSize, tabSize, radius, connections, imageUrl) {
    const [top, right, bottom, left] = connections;
    const center = size / 2;
    
    // Générer des IDs uniques pour ce SVG
    const uniqueId = Math.random().toString(36).substr(2, 9);
    const patternId = `img-${uniqueId}`;
    
    // Construire le path pour la forme de la pièce
    // La partie carrée va de tabSize à (tabSize + innerSize)
    let path = `M ${tabSize},${tabSize}`;
    
    // Haut
    if (top === 0) {
        path += ` L ${tabSize + innerSize},${tabSize}`;
    } else {
        const tabY = top === 1 ? 0 : tabSize * 2;  // Sortant: y=0, Entrant: y=30
        path += ` L ${center - radius},${tabSize}`;
        path += ` Q ${center - radius},${tabY} ${center},${tabY}`;
        path += ` Q ${center + radius},${tabY} ${center + radius},${tabSize}`;
        path += ` L ${tabSize + innerSize},${tabSize}`;
    }
    
    // Droite
    if (right === 0) {
        path += ` L ${tabSize + innerSize},${tabSize + innerSize}`;
    } else {
        const tabX = right === 1 ? size : innerSize;  // Sortant: x=180, Entrant: x=150
        path += ` L ${tabSize + innerSize},${center - radius}`;
        path += ` Q ${tabX},${center - radius} ${tabX},${center}`;
        path += ` Q ${tabX},${center + radius} ${tabSize + innerSize},${center + radius}`;
        path += ` L ${tabSize + innerSize},${tabSize + innerSize}`;
    }
    
    // Bas
    if (bottom === 0) {
        path += ` L ${tabSize},${tabSize + innerSize}`;
    } else {
        const tabY = bottom === 1 ? size : innerSize;  // Sortant: y=180, Entrant: y=150
        path += ` L ${center + radius},${tabSize + innerSize}`;
        path += ` Q ${center + radius},${tabY} ${center},${tabY}`;
        path += ` Q ${center - radius},${tabY} ${center - radius},${tabSize + innerSize}`;
        path += ` L ${tabSize},${tabSize + innerSize}`;
    }
    
    // Gauche
    if (left === 0) {
        path += ` L ${tabSize},${tabSize}`;
    } else {
        const tabX = left === 1 ? 0 : tabSize * 2;  // Sortant: x=0, Entrant: x=30
        path += ` L ${tabSize},${center + radius}`;
        path += ` Q ${tabX},${center + radius} ${tabX},${center}`;
        path += ` Q ${tabX},${center - radius} ${tabSize},${center - radius}`;
        path += ` L ${tabSize},${tabSize}`;
    }
    
    path += ' Z';
    
    return `
        <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
                    <image href="${imageUrl}" x="0" y="0" width="${size}" height="${size}" />
                </pattern>
            </defs>
            <path d="${path}" fill="url(#${patternId})" stroke="#333" stroke-width="1" />
        </svg>
    `;
}

// Mélanger un tableau
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Gestion du drag & drop
function handleDragStart(e) {
    draggedPiece = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    
    // Copier le SVG dans le preview
    isDragging = true;
    dragPreview.innerHTML = e.target.innerHTML;
    
    // Créer une image transparente pour le drag par défaut
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(img, 0, 0);
}

function handleDrag(e) {
    if (!isDragging) return;
    
    // Positionner le preview sous la souris
    if (e.clientX !== 0 && e.clientY !== 0) {
        dragPreview.classList.add('active');
        dragPreview.style.left = (e.clientX - 75) + 'px';
        dragPreview.style.top = (e.clientY - 75) + 'px';
    }
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    isDragging = false;
    dragPreview.classList.remove('active');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (e.target.classList.contains('puzzle-slot')) {
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains('puzzle-slot')) {
        e.target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    
    const slot = e.target.closest('.puzzle-slot');
    if (!slot) return;
    
    slot.classList.remove('drag-over');
    
    const position = parseInt(slot.dataset.position);
    
    // Récupérer l'ancienne position de la pièce déplacée
    let oldPosition = -1;
    let oldSlot = null;
    
    if (draggedPiece.classList.contains('in-grid')) {
        oldPosition = Array.from(puzzleGrid.children).findIndex(
            child => child.contains(draggedPiece)
        );
        if (oldPosition !== -1) {
            oldSlot = puzzleGrid.children[oldPosition];
        }
    }
    
    // Si le slot contient déjà une pièce, gérer l'échange
    if (puzzleState[position] !== null) {
        const existingPiece = slot.querySelector('.puzzle-piece');
        if (existingPiece && existingPiece !== draggedPiece) {
            existingPiece.classList.remove('in-grid');
            
            // Si la pièce déplacée vient d'un autre slot, échanger les pièces
            if (oldSlot && oldPosition !== -1) {
                // Échanger : mettre la pièce existante dans l'ancien slot
                oldSlot.appendChild(existingPiece);
                existingPiece.classList.add('in-grid');
                oldSlot.classList.add('filled');
                puzzleState[oldPosition] = parseInt(existingPiece.dataset.correctPosition);
            } else {
                // Sinon, renvoyer la pièce existante dans la zone de pièces
                piecesArea.appendChild(existingPiece);
            }
        }
    } else {
        // Si le slot cible est vide et la pièce vient d'un slot, libérer l'ancien slot
        if (oldPosition !== -1 && oldSlot) {
            puzzleState[oldPosition] = null;
            oldSlot.classList.remove('filled');
        }
    }
    
    // Placer la pièce dans le nouveau slot
    slot.appendChild(draggedPiece);
    draggedPiece.classList.add('in-grid');
    slot.classList.add('filled');
    
    // Mettre à jour l'état du puzzle
    puzzleState[position] = parseInt(draggedPiece.dataset.correctPosition);
    
    // Vérifier si le puzzle est correct
    checkPuzzle();
}

// Vérifier si le puzzle est correct
function checkPuzzle() {
    const isComplete = puzzleState.every((val, index) => val === index);
    
    if (isComplete) {
        // Désactiver le drag sur toutes les pièces
        const pieces = puzzleGrid.querySelectorAll('.puzzle-piece');
        pieces.forEach((piece) => {
            piece.draggable = false;
            piece.style.cursor = 'default';
        });
        
        // Cacher la zone des pièces disponibles
        const piecesContainer = document.querySelector('.pieces-container');
        piecesContainer.style.display = 'none';
        
        // Petite animation de succès
        puzzleGrid.classList.add('complete');
        
        // Après l'animation, remplacer par l'image complète
        setTimeout(() => {
            showCompleteImage();
        }, 600);
        
        messageDiv.textContent = '✓ Puzzle complété ! Vous pouvez maintenant envoyer.';
        messageDiv.className = 'message success';
    } else {
        puzzleGrid.classList.remove('complete', 'final-image');
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }
}

// Afficher l'image complète
function showCompleteImage() {
    // Créer un canvas avec l'image complète
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 450;
    finalCanvas.height = 450;
    const finalCtx = finalCanvas.getContext('2d');
    
    finalCtx.drawImage(currentImage, 0, 0, 450, 450);
    const finalImageData = finalCanvas.toDataURL();
    
    // Remplacer tout le contenu de la grille par l'image finale
    puzzleGrid.innerHTML = `
        <div class="final-image-container">
            <img src="${finalImageData}" alt="Puzzle complété" />
        </div>
    `;
    
    puzzleGrid.classList.add('final-image');
    puzzleGrid.classList.remove('complete');
}

// Vérifier si le puzzle est complet (tous les slots remplis)
function isPuzzleFilled() {
    return puzzleState.every(val => val !== null);
}

// Bouton envoyer
sendButton.addEventListener('click', function() {
    if (!isPuzzleFilled()) {
        messageDiv.textContent = '❌ Erreur : Le puzzle n\'est pas terminé !';
        messageDiv.className = 'message error';
        return;
    }
    
    const isCorrect = puzzleState.every((val, index) => val === index);
    
    if (isCorrect) {
        messageDiv.textContent = '✓ Image envoyée !';
        messageDiv.className = 'message success';
        
        // Désactiver le bouton après l'envoi
        sendButton.disabled = true;
        sendButton.style.opacity = '0.6';
        sendButton.style.cursor = 'not-allowed';
    } else {
        messageDiv.textContent = '❌ Erreur : Le puzzle n\'est pas correct !';
        messageDiv.className = 'message error';
    }
});
