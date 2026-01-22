
var isActive = false;
var element = null;
var ctx = null;
var drawing = false;
var resizeHandler = null;
var palette = null;
var colorInput = null;
var sizeInput = null;
var sizeValue = null;
var brushSelect = null;

var settings = {
    color: "#e53935",
    size: 3,
    brush: "round"
};

// Detect special key press
document.addEventListener("keydown", function(event) {
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.isContentEditable) {
        return;
    }
    if (event.key === "d" || event.key === "D") {
        setActive(!isActive);
    }
});

function initCanvas() {
    if (element) {
        return;
    }

    element = document.createElement("canvas");
    element.style.position = "fixed";
    element.style.top = "0";
    element.style.left = "0";
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.zIndex = "10000";
    element.style.pointerEvents = "none";
    element.style.cursor = "default";
    document.body.appendChild(element);

    ctx = element.getContext("2d");

    resizeHandler = function() {
        var snapshot = document.createElement("canvas");
        snapshot.width = element.width;
        snapshot.height = element.height;
        var snapshotCtx = snapshot.getContext("2d");
        snapshotCtx.drawImage(element, 0, 0);

        element.width = window.innerWidth;
        element.height = window.innerHeight;

        applyBrushSettings();
        ctx.drawImage(snapshot, 0, 0);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);

    element.addEventListener("mousedown", function(event) {
        if (!isActive) {
            return;
        }
        drawing = true;
        applyBrushSettings();
        ctx.beginPath();
        ctx.moveTo(event.clientX, event.clientY);
    });

    element.addEventListener("mousemove", function(event) {
        if (!drawing) {
            return;
        }
        applyBrushSettings();
        ctx.lineTo(event.clientX, event.clientY);
        ctx.stroke();
    });

    element.addEventListener("mouseup", function() {
        drawing = false;
    });

    element.addEventListener("mouseleave", function() {
        drawing = false;
    });

    window.addEventListener("mouseup", function() {
        drawing = false;
    });

    createPalette();
    setActive(false);
}

function setActive(active) {
    isActive = active;
    if (element) {
        element.style.pointerEvents = active ? "auto" : "none";
        element.style.cursor = active ? "crosshair" : "default";
    }
    if (palette) {
        palette.style.display = active ? "block" : "none";
    }
}

function applyBrushSettings() {
    if (!ctx) {
        return;
    }
    ctx.strokeStyle = settings.color;
    ctx.lineWidth = settings.size;
    ctx.lineCap = settings.brush;
    ctx.lineJoin = settings.brush === "round" ? "round" : "miter";
    ctx.globalCompositeOperation = "source-over";
}

function createPalette() {
    palette = document.createElement("div");
    palette.style.position = "fixed";
    palette.style.top = "12px";
    palette.style.right = "12px";
    palette.style.zIndex = "10001";
    palette.style.padding = "10px 12px";
    palette.style.background = "rgba(20, 20, 20, 0.85)";
    palette.style.border = "1px solid rgba(255, 255, 255, 0.2)";
    palette.style.borderRadius = "8px";
    palette.style.boxShadow = "0 6px 18px rgba(0, 0, 0, 0.25)";
    palette.style.fontFamily = "Courier New, monospace";
    palette.style.fontSize = "12px";
    palette.style.color = "#fff";
    palette.style.display = "none";

    var title = document.createElement("div");
    title.textContent = "Palette";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "6px";
    palette.appendChild(title);

    var colorRow = document.createElement("div");
    colorRow.style.display = "flex";
    colorRow.style.alignItems = "center";
    colorRow.style.justifyContent = "space-between";
    colorRow.style.gap = "8px";
    colorRow.style.marginBottom = "6px";
    var colorLabel = document.createElement("span");
    colorLabel.textContent = "Color";
    colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = settings.color;
    colorInput.addEventListener("input", function(event) {
        settings.color = event.target.value;
    });
    colorRow.appendChild(colorLabel);
    colorRow.appendChild(colorInput);
    palette.appendChild(colorRow);

    var sizeRow = document.createElement("div");
    sizeRow.style.display = "flex";
    sizeRow.style.alignItems = "center";
    sizeRow.style.justifyContent = "space-between";
    sizeRow.style.gap = "8px";
    sizeRow.style.marginBottom = "6px";
    var sizeLabel = document.createElement("span");
    sizeLabel.textContent = "Size";
    sizeInput = document.createElement("input");
    sizeInput.type = "range";
    sizeInput.min = "1";
    sizeInput.max = "30";
    sizeInput.value = String(settings.size);
    sizeInput.style.flex = "1";
    sizeValue = document.createElement("span");
    sizeValue.textContent = String(settings.size);
    sizeInput.addEventListener("input", function(event) {
        settings.size = Number(event.target.value);
        sizeValue.textContent = String(settings.size);
    });
    sizeRow.appendChild(sizeLabel);
    sizeRow.appendChild(sizeInput);
    sizeRow.appendChild(sizeValue);
    palette.appendChild(sizeRow);

    var brushRow = document.createElement("div");
    brushRow.style.display = "flex";
    brushRow.style.alignItems = "center";
    brushRow.style.justifyContent = "space-between";
    brushRow.style.gap = "8px";
    var brushLabel = document.createElement("span");
    brushLabel.textContent = "Brush";
    brushSelect = document.createElement("select");
    var roundOption = document.createElement("option");
    roundOption.value = "round";
    roundOption.textContent = "Round";
    var squareOption = document.createElement("option");
    squareOption.value = "square";
    squareOption.textContent = "Square";
    var buttOption = document.createElement("option");
    buttOption.value = "butt";
    buttOption.textContent = "Butt";
    brushSelect.appendChild(roundOption);
    brushSelect.appendChild(squareOption);
    brushSelect.appendChild(buttOption);
    brushSelect.value = settings.brush;
    brushSelect.addEventListener("change", function(event) {
        settings.brush = event.target.value;
    });
    brushRow.appendChild(brushLabel);
    brushRow.appendChild(brushSelect);
    palette.appendChild(brushRow);

    document.body.appendChild(palette);
}

if (document.body) {
    initCanvas();
} else {
    window.addEventListener("DOMContentLoaded", initCanvas);
}
