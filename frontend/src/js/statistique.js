(function () {
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

  const barData = [
    { label: "Portrait", value: 42 },
    { label: "Nature", value: 58 },
    { label: "Urban", value: 36 },
    { label: "Sport", value: 29 },
    { label: "Fantasy", value: 51 },
    { label: "Retro", value: 24 },
  ];

  const lineLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const lineData = [18, 22, 20, 34, 38, 33, 46];

  const pieData = [
    { label: "Digital", value: 34, color: palette.primary },
    { label: "Aquarelle", value: 22, color: palette.accentPeach },
    { label: "Crayon", value: 18, color: palette.accentGreen },
    { label: "Encre", value: 26, color: palette.accentOrange },
  ];

  const multiLabels = ["S1", "S2", "S3", "S4", "S5", "S6", "S7"];
  const multiSeries = [
    {
      label: "Equipe A",
      color: palette.accentPink,
      data: [28, 32, 25, 37, 41, 39, 46],
    },
    {
      label: "Equipe B",
      color: palette.primary,
      data: [22, 29, 31, 28, 35, 34, 40],
    },
    {
      label: "Equipe C",
      color: palette.accentGreen,
      data: [18, 24, 20, 26, 31, 30, 33],
    },
  ];

  let activeRoot = null;
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
    const { ctx, width, height } = info;
    const padding = { top: 20, right: 18, bottom: 36, left: 38 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...data.map((item) => item.value)) * 1.15;
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
    const { ctx, width, height } = info;
    const padding = { top: 22, right: 18, bottom: 36, left: 38 };
    const hoverIndex = Number.isFinite(options.hoverIndex)
      ? options.hoverIndex
      : null;
    const progress =
      typeof options.progress === "number" ? options.progress : 1;
    const innerWidth = width - padding.left - padding.right;

    drawGrid(ctx, width, height, padding, 4, labels.length - 1);

    const points = getLinePoints(data, width, height, padding);

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
    labels.forEach((label, index) => {
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

    drawGrid(ctx, width, height, padding, 4, labels.length - 1);

    const allValues = series.flatMap((item) => item.data);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const range = maxValue - minValue || 1;
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, padding.left + innerWidth * progress, height);
    ctx.clip();

    series.forEach((item) => {
      ctx.beginPath();
      item.data.forEach((value, index) => {
        const x = padding.left + (innerWidth / (labels.length - 1)) * index;
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
        labels.length > 1 ? hoverIndex / (labels.length - 1) : 1;
      if (revealRatio <= progress + 0.02) {
      const xPos = padding.left + (innerWidth / (labels.length - 1)) * hoverIndex;
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

    series.forEach((item, seriesIndex) => {
      item.data.forEach((value, index) => {
        const revealRatio =
          labels.length > 1 ? index / (labels.length - 1) : 1;
        if (revealRatio > progress + 0.02) return;
        const x = padding.left + (innerWidth / (labels.length - 1)) * index;
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
    labels.forEach((label, index) => {
      const x = padding.left + (innerWidth / (labels.length - 1)) * index;
      ctx.fillText(label, x, height - padding.bottom + 16);
    });

    if (legendEl && shouldRenderLegend) {
      renderLegend(legendEl, series, (item) => item.label);
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

  function bindBarTooltip(canvas, data) {
    if (!canvas || canvas.dataset.tooltipBound === "true") return;
    canvas.dataset.tooltipBound = "true";
    const handle = ensureTooltip(canvas);
    if (!handle) return;
    const { container, tooltip } = handle;
    const padding = { top: 20, right: 18, bottom: 36, left: 38 };
    const maxValue = Math.max(...data.map((item) => item.value)) * 1.15;
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
        { label: "Participations", value: formatNumber(item.value) },
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

  function bindLineTooltip(canvas, data, labels) {
    if (!canvas || canvas.dataset.tooltipBound === "true") return;
    canvas.dataset.tooltipBound = "true";
    const handle = ensureTooltip(canvas);
    if (!handle) return;
    const { container, tooltip } = handle;
    const padding = { top: 22, right: 18, bottom: 36, left: 38 };
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue || 1;
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
          drawSmoothLine(canvas, data, labels, {
            progress: animationState.line,
          });
          lastIndex = null;
        }
        return;
      }

      const step = innerWidth / (data.length - 1);
      let index = Math.round((x - padding.left) / step);
      index = Math.max(0, Math.min(data.length - 1, index));

      const value = data[index];
      const xPos = padding.left + step * index;
      const yPos =
        padding.top + innerHeight - ((value - minValue) / range) * innerHeight;

      if (lastIndex !== index) {
        drawSmoothLine(canvas, data, labels, {
          hoverIndex: index,
          progress: animationState.line,
        });
        lastIndex = index;
      }
      renderTooltip(tooltip, labels[index], [
        { label: "Valeur", value: formatNumber(value) },
      ]);
      showTooltip(tooltip, container, xPos, yPos);
    });

    canvas.addEventListener("mouseleave", () => {
      hideTooltip(tooltip);
      if (lastIndex !== null) {
        drawSmoothLine(canvas, data, labels, {
          progress: animationState.line,
        });
        lastIndex = null;
      }
    });
  }

  function bindPieTooltip(canvas, data) {
    if (!canvas || canvas.dataset.tooltipBound === "true") return;
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
    canvas.dataset.tooltipBound = "true";
    const handle = ensureTooltip(canvas);
    if (!handle) return;
    const { container, tooltip } = handle;
    const padding = { top: 22, right: 18, bottom: 36, left: 38 };
    const allValues = series.flatMap((item) => item.data);
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
          drawMultiLine(canvas, labels, series, null, {
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
      const rows = series.map((item, seriesIndex) => {
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
        drawMultiLine(canvas, labels, series, null, {
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
        drawMultiLine(canvas, labels, series, null, {
          progress: animationState.multi,
          renderLegend: false,
        });
        lastIndex = null;
        lastActive = null;
      }
    });
  }

  function bindTooltips(root) {
    if (!root) return;
    bindBarTooltip(root.querySelector("#chartBars"), barData);
    bindLineTooltip(root.querySelector("#chartCurve"), lineData, lineLabels);
    bindPieTooltip(root.querySelector("#chartPie"), pieData);
    bindMultiTooltip(root.querySelector("#chartMulti"), multiLabels, multiSeries);
  }

  function animateLoad(root) {
    if (!root) return;
    animationToken += 1;
    const token = animationToken;
    const start = performance.now();
    const charts = {
      bars: root.querySelector("#chartBars"),
      line: root.querySelector("#chartCurve"),
      pie: root.querySelector("#chartPie"),
      multi: root.querySelector("#chartMulti"),
    };
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
    drawAll(root);

    function step(now) {
      if (token !== animationToken) return;
      if (!document.body.contains(root)) return;
      let done = true;

      Object.keys(timings).forEach((key) => {
        const { delay, duration } = timings[key];
        const raw = (now - start - delay) / duration;
        const clamped = Math.max(0, Math.min(1, raw));
        const eased = easeOutCubic(clamped);
        if (clamped < 1) done = false;

        animationState[key] = eased;

        if (key === "bars") {
          drawBars(charts.bars, barData, { progress: eased });
        } else if (key === "line") {
          drawSmoothLine(charts.line, lineData, lineLabels, {
            progress: eased,
          });
        } else if (key === "pie") {
          drawPie(charts.pie, pieData, null, {
            progress: eased,
            renderLegend: false,
          });
        } else if (key === "multi") {
          drawMultiLine(charts.multi, multiLabels, multiSeries, null, {
            progress: eased,
            renderLegend: false,
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
        drawAll(root);
      }
    }

    requestAnimationFrame(step);
  }

  function drawAll(root) {
    if (!root) return;
    drawBars(root.querySelector("#chartBars"), barData, {
      progress: animationState.bars,
    });
    drawSmoothLine(root.querySelector("#chartCurve"), lineData, lineLabels, {
      progress: animationState.line,
    });
    drawPie(
      root.querySelector("#chartPie"),
      pieData,
      root.querySelector('[data-legend-for="chartPie"]'),
      { progress: animationState.pie }
    );
    drawMultiLine(
      root.querySelector("#chartMulti"),
      multiLabels,
      multiSeries,
      root.querySelector('[data-legend-for="chartMulti"]'),
      { progress: animationState.multi }
    );
  }

  function initStatistique() {
    const root = document.querySelector(".stats-page");
    if (!root) return;
    activeRoot = root;
    animateLoad(root);
    bindTooltips(root);
  }

  window.initStatistique = initStatistique;

  if (!resizeBound) {
    window.addEventListener("resize", () => {
      if (!activeRoot || !document.body.contains(activeRoot)) return;
      drawAll(activeRoot);
    });
    resizeBound = true;
  }
})();
