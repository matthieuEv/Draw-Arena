"use strict";

const palette = {
  primary: "#5AAFE8",
  primarySoft: "rgba(90, 175, 232, 0.3)",
  accentOrange: "#F7A659",
  accentPink: "#F95671",
  accentGreen: "#B4D1A2",
  accentPeach: "#E6D4AE",
  text: "#4B4E52",
  textMuted: "#8A9198",
  grid: "rgba(75, 78, 82, 0.08)",
};

var nbClub = 0;
var nbUser = 0;
var nbEval = 0;

var barRegions = [
  // { label: "Portrait", value: 42 },
  // { label: "Nature", value: 58 },
  // { label: "Urban", value: 36 },
  // { label: "Sport", value: 29 },
  // { label: "Fantasy", value: 51 },
  // { label: "Retro", value: 24 },
];

var barCompetiteurs = [
  // { label: "Portrait", value: 42 },
  // { label: "Nature", value: 58 },
  // { label: "Urban", value: 36 },
  // { label: "Sport", value: 29 },
  // { label: "Fantasy", value: 51 },
  // { label: "Retro", value: 24 },
];

var barConcours = [
  // { label: "Portrait", value: 42 },
  // { label: "Nature", value: 58 },
  // { label: "Urban", value: 36 },
  // { label: "Sport", value: 29 },
  // { label: "Fantasy", value: 51 },
  // { label: "Retro", value: 24 },
];

var lineDepoLabels = [] // = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
var lineDepoData = [] // = [18, 22, 20, 34, 38, 33, 46];

var lineEvalLabels = [] // = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
var lineEvalData = [] // = [18, 22, 20, 34, 38, 33, 46];

let defaultBars = [
  { id: "chartConcours", data: barConcours, valueLabel: "Participations" },
];

let defaultLines = [
  {
    id: "chartEvaluation",
    labels: lineEvalLabels,
    data: lineEvalData,
    valueLabel: "Valeur",
  },
];

const defaultPies = [];
const defaultMultis = [];

let activeInstance = null;
let resizeBound = false;
let animationToken = 0;
const animationState = {
  bars: 1,
  line: 1,
  pie: 1,
  multi: 1,
};
const numberFormatter = new Intl.NumberFormat("fr-FR");

function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return `${value}`;
  return numberFormatter.format(value);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function setupCanvas(canvas) {
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  return { ctx, width: rect.width, height: rect.height };
}

function resolveRoot(root) {
  if (!root) return document.querySelector(".stats-page");
  if (typeof root === "string") return document.querySelector(root);
  if (root instanceof HTMLElement) return root;
  return null;
}

function resolveCanvas(root, entry) {
  if (!entry) return null;
  if (entry.canvas instanceof HTMLCanvasElement) return entry.canvas;
  if (typeof entry.canvas === "string") {
    return root.querySelector(entry.canvas) || document.querySelector(entry.canvas);
  }
  if (entry.id) {
    return root.querySelector(`#${entry.id}`) ||
      document.querySelector(`#${entry.id}`);
  }
  return null;
}

function resolveLegend(root, entry) {
  if (!entry) return null;
  if (entry.legend instanceof HTMLElement) return entry.legend;
  if (typeof entry.legend === "string") {
    return root.querySelector(entry.legend) || document.querySelector(entry.legend);
  }
  if (entry.id) {
    return root.querySelector(`[data-legend-for="${entry.id}"]`);
  }
  if (typeof entry.canvas === "string" && entry.canvas.startsWith("#")) {
    const id = entry.canvas.slice(1);
    return root.querySelector(`[data-legend-for="${id}"]`);
  }
  return null;
}

function normalizeBarEntries(root, entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (!entry || !Array.isArray(entry.data)) return null;
      const canvas = resolveCanvas(root, entry);
      if (!canvas) return null;
      return {
        canvas,
        data: entry.data,
        valueLabel: entry.valueLabel || "Participations",
      };
    })
    .filter(Boolean);
}

function normalizeLineEntries(root, entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (!entry || !Array.isArray(entry.data) || !Array.isArray(entry.labels)) {
        return null;
      }
      const canvas = resolveCanvas(root, entry);
      if (!canvas) return null;
      return {
        canvas,
        data: entry.data,
        labels: entry.labels,
        valueLabel: entry.valueLabel || "Valeur",
      };
    })
    .filter(Boolean);
}

function normalizePieEntries(root, entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (!entry || !Array.isArray(entry.data)) return null;
      const canvas = resolveCanvas(root, entry);
      if (!canvas) return null;
      return {
        canvas,
        data: entry.data,
        legend: resolveLegend(root, entry),
      };
    })
    .filter(Boolean);
}

function normalizeMultiEntries(root, entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (!entry || !Array.isArray(entry.labels) || !Array.isArray(entry.series)) {
        return null;
      }
      const canvas = resolveCanvas(root, entry);
      if (!canvas) return null;
      return {
        canvas,
        labels: entry.labels,
        series: entry.series,
        legend: resolveLegend(root, entry),
      };
    })
    .filter(Boolean);
}

function buildInstance(options = {}) {
  const root = resolveRoot(options.root);
  if (!root) return null;

  const bars = options.bars !== undefined ? options.bars : defaultBars;
  const lines = options.lines !== undefined ? options.lines : defaultLines;
  const pies = options.pies !== undefined ? options.pies : defaultPies;
  const multis = options.multis !== undefined ? options.multis : defaultMultis;

  return {
    root,
    charts: {
      bars: normalizeBarEntries(root, bars),
      lines: normalizeLineEntries(root, lines),
      pies: normalizePieEntries(root, pies),
      multis: normalizeMultiEntries(root, multis),
    },
  };
}

function getPointerPosition(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function ensureTooltip(canvas) {
  const container = canvas.closest(".chart-canvas");
  if (!container) return null;
  let tooltip = container.querySelector(".chart-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "chart-tooltip";
    tooltip.setAttribute("aria-hidden", "true");
    container.appendChild(tooltip);
  }
  return { container, tooltip };
}

function renderTooltip(tooltip, title, rows) {
  tooltip.innerHTML = "";
  const titleEl = document.createElement("div");
  titleEl.className = "chart-tooltip-title";
  titleEl.textContent = title;
  tooltip.appendChild(titleEl);

  rows.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "chart-tooltip-row";
    if (row.isActive) rowEl.classList.add("is-active");

    if (row.color) {
      const dot = document.createElement("span");
      dot.className = "chart-tooltip-dot";
      dot.style.backgroundColor = row.color;
      rowEl.appendChild(dot);
    }

    const labelEl = document.createElement("span");
    labelEl.textContent = row.label;
    rowEl.appendChild(labelEl);

    if (row.value !== undefined && row.value !== null) {
      const valueEl = document.createElement("span");
      valueEl.className = "chart-tooltip-value";
      valueEl.textContent = row.value;
      rowEl.appendChild(valueEl);
    }

    tooltip.appendChild(rowEl);
  });
}

function showTooltip(tooltip, container, x, y) {
  const margin = 8;
  const boundedX = Math.max(
    margin,
    Math.min(x, container.clientWidth - margin)
  );
  const boundedY = Math.max(
    margin,
    Math.min(y, container.clientHeight - margin)
  );
  tooltip.style.left = `${boundedX}px`;
  tooltip.style.top = `${boundedY}px`;
  if (boundedY < 46) tooltip.classList.add("is-bottom");
  else tooltip.classList.remove("is-bottom");
  tooltip.classList.add("is-visible");
  tooltip.setAttribute("aria-hidden", "false");
}

function hideTooltip(tooltip) {
  if (!tooltip) return;
  tooltip.classList.remove("is-visible", "is-bottom");
  tooltip.setAttribute("aria-hidden", "true");
}

function drawGrid(ctx, width, height, padding, rows, cols) {
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 1;

  for (let i = 0; i <= rows; i += 1) {
    const y = padding.top + (innerHeight / rows) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + innerWidth, y);
    ctx.stroke();
  }

  if (cols > 0) {
    for (let i = 0; i <= cols; i += 1) {
      const x = padding.left + (innerWidth / cols) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + innerHeight);
      ctx.stroke();
    }
  }
}

function drawBars(canvas, data, options = {}) {
  const info = setupCanvas(canvas);
  if (!info) return;
  if (!Array.isArray(data) || data.length === 0) return;
  const { ctx, width, height } = info;
  const padding = { top: 20, right: 18, bottom: 36, left: 38 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const values = data.map((item) => item.value).filter(Number.isFinite);
  const maxValue = (values.length ? Math.max(...values) : 1) * 1.15;
  const hoverIndex = Number.isFinite(options.hoverIndex)
    ? options.hoverIndex
    : null;
  const progress =
    typeof options.progress === "number" ? options.progress : 1;

  drawGrid(ctx, width, height, padding, 4, data.length - 1);

  const step = innerWidth / data.length;
  const barWidth = step * 0.58;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "11px 'Space Grotesk', 'Segoe UI', sans-serif";
  ctx.fillStyle = palette.textMuted;

  data.forEach((item, index) => {
    const isHover = hoverIndex === index;
    const barHeight = (item.value / maxValue) * innerHeight * progress;
    const x = padding.left + index * step + (step - barWidth) / 2;
    const y = padding.top + innerHeight - barHeight;
    const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
    if (isHover) {
      gradient.addColorStop(0, "#7BC1F2");
      gradient.addColorStop(1, "rgba(90, 175, 232, 0.55)");
    } else {
      gradient.addColorStop(0, palette.primary);
      gradient.addColorStop(1, palette.primarySoft);
    }
    if (isHover) {
      ctx.shadowColor = "rgba(90, 175, 232, 0.35)";
      ctx.shadowBlur = 10;
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);
    if (isHover) {
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "rgba(75, 78, 82, 0.25)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 0.5, y + 0.5, barWidth - 1, barHeight - 1);
    }

    ctx.fillStyle = palette.textMuted;
    ctx.fillText(
      item.label,
      x + barWidth / 2,
      padding.top + innerHeight + 16
    );
  });

  ctx.strokeStyle = "rgba(75, 78, 82, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + innerHeight);
  ctx.lineTo(padding.left + innerWidth, padding.top + innerHeight);
  ctx.stroke();
}

function getLinePoints(data, width, height, padding) {
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  return data.map((value, index) => {
    const x = padding.left + (innerWidth / (data.length - 1)) * index;
    const y =
      padding.top +
      innerHeight -
      ((value - minValue) / range) * innerHeight;
    return { x, y, value };
  });
}

function drawSmoothLine(canvas, data, labels, options = {}) {
  const info = setupCanvas(canvas);
  if (!info) return;
  if (!Array.isArray(data) || !Array.isArray(labels)) return;
  const length = Math.min(data.length, labels.length);
  if (length < 2) return;
  const safeData = data.slice(0, length);
  const safeLabels = labels.slice(0, length);
  const { ctx, width, height } = info;
  const padding = { top: 22, right: 18, bottom: 36, left: 38 };
  const hoverIndex = Number.isFinite(options.hoverIndex)
    ? options.hoverIndex
    : null;
  const progress =
    typeof options.progress === "number" ? options.progress : 1;
  const innerWidth = width - padding.left - padding.right;

  drawGrid(ctx, width, height, padding, 4, safeLabels.length - 1);

  const points = getLinePoints(safeData, width, height, padding);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, padding.left + innerWidth * progress, height);
  ctx.clip();

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i += 1) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }
  ctx.quadraticCurveTo(
    points[points.length - 1].x,
    points[points.length - 1].y,
    points[points.length - 1].x,
    points[points.length - 1].y
  );

  ctx.strokeStyle = palette.accentPink;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, padding.top, 0, height);
  gradient.addColorStop(0, "rgba(249, 86, 113, 0.25)");
  gradient.addColorStop(1, "rgba(249, 86, 113, 0.05)");
  ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
  ctx.lineTo(points[0].x, height - padding.bottom);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = palette.textMuted;
  ctx.font = "11px 'Space Grotesk', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  safeLabels.forEach((label, index) => {
    const x = points[index].x;
    ctx.fillText(label, x, height - padding.bottom + 16);
  });

  if (hoverIndex !== null && points[hoverIndex]) {
    const revealRatio = points.length > 1 ? hoverIndex / (points.length - 1) : 1;
    if (revealRatio > progress + 0.02) {
      return;
    }
    const hovered = points[hoverIndex];
    ctx.save();
    ctx.strokeStyle = "rgba(75, 78, 82, 0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(hovered.x, padding.top);
    ctx.lineTo(hovered.x, height - padding.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = palette.accentPink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hovered.x, hovered.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawPie(canvas, data, legendEl, options = {}) {
  const info = setupCanvas(canvas);
  if (!info) return;
  if (!Array.isArray(data) || data.length === 0) return;
  const { ctx, width, height } = info;
  const radius = Math.min(width, height) * 0.38;
  const centerX = width / 2;
  const centerY = height / 2;
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const hoverIndex = Number.isFinite(options.hoverIndex)
    ? options.hoverIndex
    : null;
  const progress =
    typeof options.progress === "number" ? options.progress : 1;
  const shouldRenderLegend = options.renderLegend !== false;

  let startAngle = -Math.PI / 2;
  const maxAngle = startAngle + Math.PI * 2 * progress;
  data.forEach((item, index) => {
    const slice = (item.value / total) * Math.PI * 2;
    const endAngle = startAngle + slice;
    if (maxAngle <= startAngle) {
      startAngle = endAngle;
      return;
    }
    const drawEnd = Math.min(endAngle, maxAngle);
    const midAngle = startAngle + slice / 2;
    const canHover = maxAngle >= midAngle;
    const isHover = hoverIndex === index && canHover;
    const offset = isHover ? 12 : 0;
    const offsetX = Math.cos(midAngle) * offset;
    const offsetY = Math.sin(midAngle) * offset;
    const cx = centerX + offsetX;
    const cy = centerY + offsetY;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, drawEnd);
    ctx.closePath();
    ctx.fillStyle = item.color;
    if (isHover) {
      ctx.shadowColor = "rgba(75, 78, 82, 0.25)";
      ctx.shadowBlur = 8;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    if (isHover) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    startAngle = endAngle;
  });

  if (legendEl && shouldRenderLegend) {
    renderLegend(legendEl, data, (item) => `${item.label} (${item.value}%)`);
  }
}

function drawMultiLine(canvas, labels, series, legendEl, options = {}) {
  const info = setupCanvas(canvas);
  if (!info) return;
  if (!Array.isArray(labels) || !Array.isArray(series)) return;
  if (labels.length < 2 || series.length === 0) return;
  const trimmedLabels = labels.slice();
  const trimmedSeries = series.map((item) => ({
    ...item,
    data: Array.isArray(item.data) ? item.data.slice(0, labels.length) : [],
  }));
  const { ctx, width, height } = info;
  const padding = { top: 22, right: 18, bottom: 36, left: 38 };
  const hoverIndex = Number.isFinite(options.hoverIndex)
    ? options.hoverIndex
    : null;
  const activeSeriesIndex = Number.isFinite(options.activeSeriesIndex)
    ? options.activeSeriesIndex
    : null;
  const progress =
    typeof options.progress === "number" ? options.progress : 1;
  const shouldRenderLegend = options.renderLegend !== false;

  drawGrid(ctx, width, height, padding, 4, trimmedLabels.length - 1);

  const allValues = trimmedSeries.flatMap((item) => item.data);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue || 1;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, padding.left + innerWidth * progress, height);
  ctx.clip();

  trimmedSeries.forEach((item) => {
    ctx.beginPath();
    item.data.forEach((value, index) => {
      const x = padding.left + (innerWidth / (trimmedLabels.length - 1)) * index;
      const y =
        padding.top +
        innerHeight -
        ((value - minValue) / range) * innerHeight;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
  });
  ctx.restore();

  if (hoverIndex !== null) {
    const revealRatio =
      trimmedLabels.length > 1 ? hoverIndex / (trimmedLabels.length - 1) : 1;
    if (revealRatio <= progress + 0.02) {
      const xPos =
        padding.left + (innerWidth / (trimmedLabels.length - 1)) * hoverIndex;
      ctx.save();
      ctx.strokeStyle = "rgba(75, 78, 82, 0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(xPos, padding.top);
      ctx.lineTo(xPos, padding.top + innerHeight);
      ctx.stroke();
      ctx.restore();
    }
  }

  trimmedSeries.forEach((item, seriesIndex) => {
    item.data.forEach((value, index) => {
      const revealRatio =
        trimmedLabels.length > 1 ? index / (trimmedLabels.length - 1) : 1;
      if (revealRatio > progress + 0.02) return;
      const x = padding.left + (innerWidth / (trimmedLabels.length - 1)) * index;
      const y =
        padding.top +
        innerHeight -
        ((value - minValue) / range) * innerHeight;
      const isHover = hoverIndex === index;
      const isActive = isHover && seriesIndex === activeSeriesIndex;
      const radius = isActive ? 5 : isHover ? 4 : 3;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = isActive ? 2.5 : 2;
      ctx.stroke();
    });
  });

  ctx.fillStyle = palette.textMuted;
  ctx.font = "11px 'Space Grotesk', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  trimmedLabels.forEach((label, index) => {
    const x = padding.left + (innerWidth / (trimmedLabels.length - 1)) * index;
    ctx.fillText(label, x, height - padding.bottom + 16);
  });

  if (legendEl && shouldRenderLegend) {
    renderLegend(legendEl, trimmedSeries, (item) => item.label);
  }
}

function renderLegend(container, items, formatter) {
  if (!container) return;
  container.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "legend-item";
    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.backgroundColor = item.color;
    const label = document.createElement("span");
    label.textContent = formatter ? formatter(item) : item.label;
    row.appendChild(dot);
    row.appendChild(label);
    container.appendChild(row);
  });
}

function bindBarTooltip(canvas, data, options = {}) {
  if (!canvas || canvas.dataset.tooltipBound === "true") return;
  if (!Array.isArray(data) || data.length === 0) return;
  canvas.dataset.tooltipBound = "true";
  const handle = ensureTooltip(canvas);
  if (!handle) return;
  const { container, tooltip } = handle;
  const padding = { top: 20, right: 18, bottom: 36, left: 38 };
  const values = data.map((item) => item.value).filter(Number.isFinite);
  const maxValue = (values.length ? Math.max(...values) : 1) * 1.15;
  const valueLabel = options.valueLabel || "Participations";
  let lastIndex = null;

  canvas.addEventListener("mousemove", (event) => {
    const { x, y, width, height } = getPointerPosition(event, canvas);
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    if (
      x < padding.left ||
      x > padding.left + innerWidth ||
      y < padding.top ||
      y > padding.top + innerHeight
    ) {
      hideTooltip(tooltip);
      if (lastIndex !== null) {
        drawBars(canvas, data, { progress: animationState.bars });
        lastIndex = null;
      }
      return;
    }

    const step = innerWidth / data.length;
    const index = Math.floor((x - padding.left) / step);
    if (index < 0 || index >= data.length) {
      hideTooltip(tooltip);
      if (lastIndex !== null) {
        drawBars(canvas, data, { progress: animationState.bars });
        lastIndex = null;
      }
      return;
    }

    const item = data[index];
    const barHeight = (item.value / maxValue) * innerHeight;
    const barX = padding.left + index * step + step / 2;
    const barY = padding.top + innerHeight - barHeight;

    if (lastIndex !== index) {
      drawBars(canvas, data, {
        hoverIndex: index,
        progress: animationState.bars,
      });
      lastIndex = index;
    }
    renderTooltip(tooltip, item.label, [
      { label: valueLabel, value: formatNumber(item.value) },
    ]);
    showTooltip(tooltip, container, barX, barY);
  });

  canvas.addEventListener("mouseleave", () => {
    hideTooltip(tooltip);
    if (lastIndex !== null) {
      drawBars(canvas, data, { progress: animationState.bars });
      lastIndex = null;
    }
  });
}

function bindLineTooltip(canvas, data, labels, options = {}) {
  if (!canvas || canvas.dataset.tooltipBound === "true") return;
  if (!Array.isArray(data) || !Array.isArray(labels)) return;
  const length = Math.min(data.length, labels.length);
  if (length < 2) return;
  const safeData = data.slice(0, length);
  const safeLabels = labels.slice(0, length);
  canvas.dataset.tooltipBound = "true";
  const handle = ensureTooltip(canvas);
  if (!handle) return;
  const { container, tooltip } = handle;
  const padding = { top: 22, right: 18, bottom: 36, left: 38 };
  const minValue = Math.min(...safeData);
  const maxValue = Math.max(...safeData);
  const range = maxValue - minValue || 1;
  const valueLabel = options.valueLabel || "Valeur";
  let lastIndex = null;

  canvas.addEventListener("mousemove", (event) => {
    const { x, y, width, height } = getPointerPosition(event, canvas);
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    if (
      x < padding.left ||
      x > padding.left + innerWidth ||
      y < padding.top ||
      y > padding.top + innerHeight
    ) {
      hideTooltip(tooltip);
      if (lastIndex !== null) {
        drawSmoothLine(canvas, safeData, safeLabels, {
          progress: animationState.line,
        });
        lastIndex = null;
      }
      return;
    }

    const step = innerWidth / (safeData.length - 1);
    let index = Math.round((x - padding.left) / step);
    index = Math.max(0, Math.min(safeData.length - 1, index));

    const value = safeData[index];
    const xPos = padding.left + step * index;
    const yPos =
      padding.top + innerHeight - ((value - minValue) / range) * innerHeight;

    if (lastIndex !== index) {
      drawSmoothLine(canvas, safeData, safeLabels, {
        hoverIndex: index,
        progress: animationState.line,
      });
      lastIndex = index;
    }
    renderTooltip(tooltip, safeLabels[index], [
      { label: valueLabel, value: formatNumber(value) },
    ]);
    showTooltip(tooltip, container, xPos, yPos);
  });

  canvas.addEventListener("mouseleave", () => {
    hideTooltip(tooltip);
    if (lastIndex !== null) {
      drawSmoothLine(canvas, safeData, safeLabels, {
        progress: animationState.line,
      });
      lastIndex = null;
    }
  });
}

function bindPieTooltip(canvas, data) {
  if (!canvas || canvas.dataset.tooltipBound === "true") return;
  if (!Array.isArray(data) || data.length === 0) return;
  canvas.dataset.tooltipBound = "true";
  const handle = ensureTooltip(canvas);
  if (!handle) return;
  const { container, tooltip } = handle;
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const slices = data.map((item) => ({
    ...item,
    slice: (item.value / total) * Math.PI * 2,
  }));
  const startAngle = -Math.PI / 2;
  let lastIndex = null;

  canvas.addEventListener("mousemove", (event) => {
    const { x, y, width, height } = getPointerPosition(event, canvas);
    const radius = Math.min(width, height) * 0.38;
    const centerX = width / 2;
    const centerY = height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > radius) {
      hideTooltip(tooltip);
      if (lastIndex !== null) {
        drawPie(canvas, data, null, {
          progress: animationState.pie,
          renderLegend: false,
        });
        lastIndex = null;
      }
      return;
    }

    const rawAngle = Math.atan2(dy, dx);
    let normalized = rawAngle - startAngle;
    if (normalized < 0) normalized += Math.PI * 2;

    let accumulator = 0;
    let picked = slices[0];
    let pickedIndex = 0;
    for (let i = 0; i < slices.length; i += 1) {
      accumulator += slices[i].slice;
      if (normalized <= accumulator) {
        picked = slices[i];
        pickedIndex = i;
        break;
      }
    }

    if (lastIndex !== pickedIndex) {
      drawPie(canvas, data, null, {
        hoverIndex: pickedIndex,
        progress: animationState.pie,
        renderLegend: false,
      });
      lastIndex = pickedIndex;
    }
    const percent = Math.round((picked.value / total) * 100);
    renderTooltip(tooltip, picked.label, [
      { label: "Part", value: `${percent}%`, color: picked.color },
    ]);
    showTooltip(tooltip, container, x, y);
  });

  canvas.addEventListener("mouseleave", () => {
    hideTooltip(tooltip);
    if (lastIndex !== null) {
      drawPie(canvas, data, null, {
        progress: animationState.pie,
        renderLegend: false,
      });
      lastIndex = null;
    }
  });
}

function bindMultiTooltip(canvas, labels, series) {
  if (!canvas || canvas.dataset.tooltipBound === "true") return;
  if (!Array.isArray(labels) || !Array.isArray(series)) return;
  if (labels.length < 2 || series.length === 0) return;
  canvas.dataset.tooltipBound = "true";
  const handle = ensureTooltip(canvas);
  if (!handle) return;
  const { container, tooltip } = handle;
  const padding = { top: 22, right: 18, bottom: 36, left: 38 };
  const trimmedSeries = series.map((item) => ({
    ...item,
    data: Array.isArray(item.data) ? item.data.slice(0, labels.length) : [],
  }));
  const allValues = trimmedSeries.flatMap((item) => item.data);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue || 1;
  let lastIndex = null;
  let lastActive = null;

  canvas.addEventListener("mousemove", (event) => {
    const { x, y, width, height } = getPointerPosition(event, canvas);
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    if (
      x < padding.left ||
      x > padding.left + innerWidth ||
      y < padding.top ||
      y > padding.top + innerHeight
    ) {
      hideTooltip(tooltip);
      if (lastIndex !== null) {
        drawMultiLine(canvas, labels, trimmedSeries, null, {
          progress: animationState.multi,
          renderLegend: false,
        });
        lastIndex = null;
        lastActive = null;
      }
      return;
    }

    const step = innerWidth / (labels.length - 1);
    let index = Math.round((x - padding.left) / step);
    index = Math.max(0, Math.min(labels.length - 1, index));
    const xPos = padding.left + step * index;

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    const rows = trimmedSeries.map((item, seriesIndex) => {
      const value = item.data[index];
      const yPos =
        padding.top +
        innerHeight -
        ((value - minValue) / range) * innerHeight;
      const distance = Math.abs(y - yPos);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = seriesIndex;
      }
      return {
        label: item.label,
        value: formatNumber(value),
        color: item.color,
        yPos,
      };
    });

    rows.forEach((row, rowIndex) => {
      row.isActive = rowIndex === nearestIndex;
    });

    if (lastIndex !== index || lastActive !== nearestIndex) {
      drawMultiLine(canvas, labels, trimmedSeries, null, {
        hoverIndex: index,
        activeSeriesIndex: nearestIndex,
        progress: animationState.multi,
        renderLegend: false,
      });
      lastIndex = index;
      lastActive = nearestIndex;
    }
    renderTooltip(
      tooltip,
      labels[index],
      rows.map((row) => ({
        label: row.label,
        value: row.value,
        color: row.color,
        isActive: row.isActive,
      }))
    );
    showTooltip(tooltip, container, xPos, rows[nearestIndex].yPos);
  });

  canvas.addEventListener("mouseleave", () => {
    hideTooltip(tooltip);
    if (lastIndex !== null) {
      drawMultiLine(canvas, labels, trimmedSeries, null, {
        progress: animationState.multi,
        renderLegend: false,
      });
      lastIndex = null;
      lastActive = null;
    }
  });
}

function bindTooltips(instance) {
  if (!instance) return;
  instance.charts.bars.forEach((chart) => {
    bindBarTooltip(chart.canvas, chart.data, {
      valueLabel: chart.valueLabel,
    });
  });
  instance.charts.lines.forEach((chart) => {
    bindLineTooltip(chart.canvas, chart.data, chart.labels, {
      valueLabel: chart.valueLabel,
    });
  });
  instance.charts.pies.forEach((chart) => {
    bindPieTooltip(chart.canvas, chart.data);
  });
  instance.charts.multis.forEach((chart) => {
    bindMultiTooltip(chart.canvas, chart.labels, chart.series);
  });
}

function animateLoad(instance) {
  if (!instance) return;
  animationToken += 1;
  const token = animationToken;
  const start = performance.now();
  const timings = {
    bars: { delay: 0, duration: 720 },
    line: { delay: 120, duration: 820 },
    pie: { delay: 200, duration: 820 },
    multi: { delay: 280, duration: 860 },
  };

  animationState.bars = 0;
  animationState.line = 0;
  animationState.pie = 0;
  animationState.multi = 0;
  drawAll(instance);

  function step(now) {
    if (token !== animationToken) return;
    if (!document.body.contains(instance.root)) return;
    let done = true;

    Object.keys(timings).forEach((key) => {
      const { delay, duration } = timings[key];
      const raw = (now - start - delay) / duration;
      const clamped = Math.max(0, Math.min(1, raw));
      const eased = easeOutCubic(clamped);
      if (clamped < 1) done = false;

      animationState[key] = eased;

      if (key === "bars") {
        instance.charts.bars.forEach((chart) => {
          drawBars(chart.canvas, chart.data, { progress: eased });
        });
      } else if (key === "line") {
        instance.charts.lines.forEach((chart) => {
          drawSmoothLine(chart.canvas, chart.data, chart.labels, {
            progress: eased,
          });
        });
      } else if (key === "pie") {
        instance.charts.pies.forEach((chart) => {
          drawPie(chart.canvas, chart.data, null, {
            progress: eased,
            renderLegend: false,
          });
        });
      } else if (key === "multi") {
        instance.charts.multis.forEach((chart) => {
          drawMultiLine(chart.canvas, chart.labels, chart.series, null, {
            progress: eased,
            renderLegend: false,
          });
        });
      }
    });

    if (!done) {
      requestAnimationFrame(step);
    } else {
      animationState.bars = 1;
      animationState.line = 1;
      animationState.pie = 1;
      animationState.multi = 1;
      drawAll(instance);
    }
  }

  requestAnimationFrame(step);
}

function drawAll(instance) {
  console.log("Drawing all charts");
  if (!instance) return;
  console.log("Drawing bars");

  instance.charts.bars.forEach((chart) => {
    drawBars(chart.canvas, chart.data, { progress: animationState.bars });
  });
  instance.charts.lines.forEach((chart) => {
    drawSmoothLine(chart.canvas, chart.data, chart.labels, {
      progress: animationState.line,
    });
  });
  instance.charts.pies.forEach((chart) => {
    drawPie(chart.canvas, chart.data, chart.legend, {
      progress: animationState.pie,
    });
  });
  instance.charts.multis.forEach((chart) => {
    drawMultiLine(chart.canvas, chart.labels, chart.series, chart.legend, {
      progress: animationState.multi,
    });
  });

  console.log("NB Eval :" + nbEval);
  console.log("NB Club :" + nbClub);
  console.log("NB User :" + nbUser);

  console.log("Bar concours :" + barConcours);
  console.log("Line Depo Labels :" + lineDepoLabels);
  console.log("Line Depo Data :" + lineDepoData);
  console.log("Line Eval Labels :" + lineEvalLabels);
  console.log("Line Eval Data :" + lineEvalData);

  const clubCount = Number.isFinite(instance.clubCount) ? instance.clubCount : nbClub;
  const userCount = Number.isFinite(instance.userCount) ? instance.userCount : nbUser;
  const evaluationCount = Number.isFinite(instance.evaluationCount)
    ? instance.evaluationCount
    : nbEval;
  document.getElementById("clubCount").textContent = formatNumber(clubCount);
  document.getElementById("userCount").textContent = formatNumber(userCount);
  document.getElementById("evaluationCount").textContent = formatNumber(evaluationCount);
}

export function initStatistique(options = {}) {
  const instance = buildInstance(options);
  if (!instance) return null;
  activeInstance = instance;
  console.log("before loading")

  loadData();

  animateLoad(instance);
  bindTooltips(instance);

  if (!resizeBound) {
    window.addEventListener("resize", () => {
      if (!activeInstance || !document.body.contains(activeInstance.root)) return;
      drawAll(activeInstance);
    });
    resizeBound = true;
  }

  console.log("after drawing")

  function applyCounts() {
    instance.clubCount = nbClub;
    instance.userCount = nbUser;
    instance.evaluationCount = nbEval;
  }

  function loadData(){
    // barRegions, barCompetiteurs, barConcours
    // lineDepoLabels, lineDepoData
    // lineEvalLabels, lineEvalData

    nbEval = 0;
    nbClub = 0;
    nbUser = 0;
    barConcours.length = 0;
    lineDepoLabels.length = 0;
    lineDepoData.length = 0;
    lineEvalLabels.length = 0;
    lineEvalData.length = 0;

    // const evaluationPromise = apiFetch('/evaluation').then(data => {
    //   if (!data || !Array.isArray(data.evaluations)) return;
    //   let dataSimple = data.evaluations;

    //   nbEval = dataSimple.length;
      
    //   const evalByDate = {};
    //   dataSimple.forEach(item => {
    //     const date = new Date(item.date_evaluation);
    //     const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    //     if (!evalByDate[dateKey]) {
    //       evalByDate[dateKey] = 0;
    //     }
    //     evalByDate[dateKey] += 1;
    //   });
    //   const evalDateKeys = Object.keys(evalByDate).sort();
    //   lineDepoLabels.push(...evalDateKeys);
    //   lineDepoData.push(...evalDateKeys.map(dateKey => evalByDate[dateKey]));
    //   lineEvalLabels.push(...evalDateKeys);
    //   lineEvalData.push(...evalDateKeys.map(dateKey => evalByDate[dateKey]));
    // });


    apiFetch('/evaluation').then(data => {
      if (!data || !Array.isArray(data.evaluations)) return;
      let dataSimple = data.evaluations;

      nbEval = dataSimple.length;
      
      const themeMap = {};
      const evalByDate = {};
      dataSimple.forEach(item => {
        if (!themeMap[item.theme]) {
          themeMap[item.theme] = { total: 0, count: 0 };
        }
        themeMap[item.theme].total += item.note;
        themeMap[item.theme].count += 1;
      });
      dataSimple.forEach(item => {
        const date = new Date(item.date_evaluation);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!evalByDate[dateKey]) {
          evalByDate[dateKey] = 0;
        }
        evalByDate[dateKey] += 1;
      });

      const evalDateKeys = Object.keys(evalByDate).sort();
      lineDepoLabels.push(...evalDateKeys);
      lineDepoData.push(...evalDateKeys.map(dateKey => evalByDate[dateKey]));

      const themeKeys = Object.keys(themeMap);
      lineEvalLabels.push(...themeKeys);
      lineEvalData.push(...themeKeys.map(theme => {
        const avg = themeMap[theme].total / themeMap[theme].count;
        return avg;
      }));
    });

    const clubPromise = apiFetch('/club').then(async data => {
      if (!Array.isArray(data.clubs)) return;
      nbClub = data.clubs.length;
      const memberCounts = await Promise.all(
        data.clubs.map((club) =>
          apiFetch(`/club/${club.numClub}`).then((clubData) => {
            if (!clubData || !Array.isArray(clubData.membres)) return 0;
            return clubData.membres.length;
          })
        )
      );
      nbUser = memberCounts.reduce((total, count) => total + count, 0);
    });

    Promise.all([evaluationPromise, clubPromise]).then(() => {
      applyCounts();
      animateLoad(instance);
    });
  }

  return {
    redraw() {
      drawAll(instance);
    },
  };
}
