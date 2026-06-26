(function (global) {
  "use strict";

  const { COUNTRIES, LAND_POLYGONS, MAP_CONFIG, NANJING, RIVER_LINES, TRIBUTE_COLORS } = global;

  const SEA_LABELS = [
    { text: "東海", lng: 126, lat: 29 },
    { text: "南海", lng: 115, lat: 14 },
    { text: "印度洋", lng: 83, lat: 5 },
    { text: "黃海", lng: 123, lat: 36 },
    { text: "渤海", lng: 120, lat: 39 },
  ];

  const MING_BORDER = [
    [121.2, 39.0],
    [122.0, 40.5],
    [124.0, 41.0],
    [126.0, 42.0],
    [127.5, 43.5],
    [126.0, 44.5],
    [123.5, 44.0],
    [121.0, 41.5],
    [117.5, 41.0],
    [116.0, 41.0],
    [114.0, 41.0],
    [113.0, 40.5],
    [111.5, 41.0],
    [110.0, 40.8],
    [108.5, 40.5],
    [107.0, 39.5],
    [106.0, 39.0],
    [104.5, 38.0],
    [103.0, 37.5],
    [100.5, 38.5],
    [98.5, 39.5],
    [97.5, 39.8],
    [97.0, 37.5],
    [97.5, 36.0],
    [100.0, 34.0],
    [99.0, 31.0],
    [98.5, 28.5],
    [98.5, 26.0],
    [98.0, 24.5],
    [98.5, 22.5],
    [100.5, 21.5],
    [102.0, 22.0],
    [104.5, 22.5],
    [106.5, 22.0],
    [108.0, 21.5],
    [109.5, 18.2],
    [110.5, 20.0],
    [109.5, 21.2],
    [110.0, 21.5],
    [113.5, 22.5],
    [117.0, 23.5],
    [118.5, 24.5],
    [120.0, 26.0],
    [121.5, 28.5],
    [122.0, 30.5],
    [121.5, 31.5],
    [120.5, 32.5],
    [119.5, 34.5],
    [120.0, 36.0],
    [122.5, 37.5],
    [121.0, 38.0],
    [121.2, 39.0],
  ];

  // Zero-based index of the last inland border point. Later points follow coastlines.
  const MING_BORDER_INLAND_END = 34;

  function scaledFontSize(size) {
    const scale = typeof global.getFontScale === "function" ? global.getFontScale() : 1;
    return Math.round(size * scale * 10) / 10;
  }

  const labelOffsets = {
    ryukyu_chuzan: [10, -21],
    ryukyu_sannan: [10, 0],
    ryukyu_hokuzan: [10, -42],
    java: [12, -30],
    java_east: [14, 14],
    java_west: [-96, -16],
    baihua: [-70, 14],
    jawa: [-46, -34],
    pahang: [9, 12],
    timor: [9, -15],
    lambri: [9, -18],
    samudra: [9, 7],
    xiyang: [10, -18],
    soli: [10, 7],
    fulin: [24, 34],
    goryeo: [10, -16],
    joseon: [10, 6],
    brunei: [10, -13],
  };

  const canvas = document.getElementById("base-canvas");
  const labelLayer = document.getElementById("label-layer");
  const hitLayer = document.getElementById("hit-layer");
  const ctx = canvas.getContext("2d");

  function latLngToPixel(lat, lng) {
    const bounds = MAP_CONFIG.bounds;
    const width = canvas.logicalWidth || canvas.clientWidth;
    const height = canvas.logicalHeight || canvas.clientHeight;
    const x = ((lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin)) * width;
    const y = ((bounds.latMax - lat) / (bounds.latMax - bounds.latMin)) * height;
    return { x, y };
  }

  function project(lng, lat) {
    return latLngToPixel(lat, lng);
  }

  function setupCanvas() {
    const dpr = global.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.logicalWidth = rect.width;
    canvas.logicalHeight = rect.height;
  }

  function drawBaseWash() {
    const width = canvas.logicalWidth;
    const height = canvas.logicalHeight;
    const gradient = ctx.createRadialGradient(width * 0.55, height * 0.45, width * 0.1, width * 0.55, height * 0.45, width * 0.75);
    gradient.addColorStop(0, "rgba(245, 240, 232, 0.22)");
    gradient.addColorStop(0.7, "rgba(216, 225, 220, 0.18)");
    gradient.addColorStop(1, "rgba(139, 105, 20, 0.08)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawGrid() {
    const bounds = MAP_CONFIG.bounds;
    ctx.save();
    ctx.strokeStyle = "rgba(139, 128, 112, 0.12)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 8]);

    for (let lng = 80; lng <= 150; lng += 10) {
      const start = project(lng, bounds.latMax);
      const end = project(lng, bounds.latMin);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    for (let lat = 0; lat <= 50; lat += 10) {
      const start = project(bounds.lngMin, lat);
      const end = project(bounds.lngMax, lat);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function tracePolygon(polygon) {
    ctx.beginPath();
    polygon.forEach(([lng, lat], index) => {
      const point = project(lng, lat);
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
  }

  function drawLand() {
    if (!Array.isArray(LAND_POLYGONS)) {
      throw new Error("LAND_POLYGONS is missing. Load js/geodata.js before js/baseMap.js.");
    }

    ctx.save();
    ctx.fillStyle = TRIBUTE_COLORS.land || "#E8E0D0";
    ctx.strokeStyle = TRIBUTE_COLORS.coast || "#8B8070";
    ctx.lineWidth = 0.8;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    for (const polygon of LAND_POLYGONS) {
      tracePolygon(polygon);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function isMajorRiver(name) {
    return /Huang|Chang Jiang|Yangtze|Jinsha/i.test(name);
  }

  function drawRivers() {
    if (!Array.isArray(RIVER_LINES)) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = "#A8BFC8";
    ctx.setLineDash([]);

    for (const river of RIVER_LINES) {
      ctx.beginPath();
      ctx.lineWidth = isMajorRiver(river.name) ? 1.5 : 0.8;
      ctx.globalAlpha = isMajorRiver(river.name) ? 0.62 : 0.42;
      river.coords.forEach(([lng, lat], index) => {
        const point = project(lng, lat);
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSeaLabels() {
    ctx.save();
    ctx.font = `italic ${scaledFontSize(18)}px "Noto Serif TC", "Noto Serif SC", serif`;
    ctx.fillStyle = "rgba(120, 150, 165, 0.35)";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    SEA_LABELS.forEach((label) => {
      const point = project(label.lng, label.lat);
      ctx.fillText(label.text, point.x, point.y);
    });
    ctx.restore();
  }

  function drawMingTerritory() {
    ctx.save();

    ctx.beginPath();
    for (const polygon of LAND_POLYGONS) {
      polygon.forEach(([lng, lat], index) => {
        const point = project(lng, lat);
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.closePath();
    }
    ctx.clip();

    ctx.beginPath();
    MING_BORDER.forEach(([lng, lat], index) => {
      const point = project(lng, lat);
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();

    const center = project(112, 32);
    const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, canvas.logicalWidth * 0.3);
    gradient.addColorStop(0, "rgba(150, 120, 70, 0.06)");
    gradient.addColorStop(0.6, "rgba(150, 120, 70, 0.03)");
    gradient.addColorStop(1, "rgba(150, 120, 70, 0)");
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(139, 105, 20, 0.15)";
    ctx.lineWidth = 0.7;
    ctx.setLineDash([2, 4]);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let index = 0; index <= MING_BORDER_INLAND_END; index += 1) {
      const point = project(MING_BORDER[index][0], MING_BORDER[index][1]);
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    const textPos = project(108, 33);
    ctx.save();
    ctx.translate(textPos.x, textPos.y);
    ctx.rotate(-0.05);
    ctx.font = `${scaledFontSize(22)}px "Noto Serif TC", "Noto Serif SC", serif`;
    ctx.fillStyle = "rgba(139, 105, 20, 0.08)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = "8px";
    ctx.fillText("大  明", 0, 0);
    ctx.restore();
  }

  function drawCompass() {
    const cx = canvas.logicalWidth - 76;
    const cy = 82;
    const r = 28;
    const dirs = [
      { angle: -Math.PI / 2, label: "北" },
      { angle: Math.PI / 2, label: "南" },
      { angle: 0, label: "東" },
      { angle: Math.PI, label: "西" },
    ];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = "rgba(139, 128, 112, 0.4)";
    ctx.fillStyle = "rgba(139, 128, 112, 0.25)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    dirs.forEach((direction) => {
      ctx.save();
      ctx.rotate(direction.angle);
      ctx.beginPath();
      ctx.moveTo(r - 6, 0);
      ctx.lineTo(0, -4);
      ctx.lineTo(0, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.rotate(-direction.angle);
      const lx = Math.cos(direction.angle) * (r + 14);
      const ly = Math.sin(direction.angle) * (r + 14);
      ctx.font = `${scaledFontSize(11)}px "Noto Serif TC", "Noto Serif SC", serif`;
      ctx.fillStyle = "rgba(139, 128, 112, 0.5)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(direction.label, lx, ly);
      ctx.restore();
    });

    ctx.restore();
  }

  function drawCoastline() {
    drawLand();
    drawRivers();
  }

  function drawCapital() {
    const point = project(NANJING.lng, NANJING.lat);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.fillStyle = TRIBUTE_COLORS.vermillion || "#C0392B";
    ctx.strokeStyle = "rgba(26, 16, 8, 0.62)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.rect(-6, -6, 12, 12);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(192, 57, 43, 0.28)";
    ctx.stroke();
    ctx.restore();
  }

  function drawCountryPoint(country) {
    const point = project(country.lng, country.lat);
    const isMajor = country.totalRecords >= 20;
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, isMajor ? 4.8 : 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(245, 240, 232, 0.82)";
    ctx.fill();
    ctx.strokeStyle = country.positionStatus === "edge_marker" ? "rgba(139, 105, 20, 0.86)" : "#8F887B";
    ctx.lineWidth = country.positionStatus === "edge_marker" ? 1.7 : 1.2;
    ctx.stroke();

    if (country.positionStatus === "edge_marker") {
      ctx.beginPath();
      ctx.moveTo(point.x - 16, point.y);
      ctx.lineTo(point.x - 4, point.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function placeLabel(className, text, lat, lng, options = {}) {
    const point = project(lng, lat);
    const label = document.createElement(options.href ? "a" : "div");
    label.className = className;
    label.textContent = text;
    if (options.href) {
      label.href = options.href;
      label.setAttribute("aria-label", `查看${text}朝貢記錄`);
    }
    if (options.countryId) {
      label.dataset.countryId = options.countryId;
    }
    label.style.left = `${point.x}px`;
    label.style.top = `${point.y}px`;
    if (options.offset) {
      label.style.setProperty("--label-x", `${options.offset[0]}px`);
      label.style.setProperty("--label-y", `${options.offset[1]}px`);
    }
    if (options.major) {
      label.dataset.major = "true";
    }
    if (options.edge) {
      label.dataset.edge = "true";
    }
    labelLayer.appendChild(label);
  }

  function drawLabels() {
    labelLayer.textContent = "";
    hitLayer.textContent = "";

    Object.values(COUNTRIES).forEach((country) => {
      const offset = labelOffsets[country.id] || [9, -6];
      placeLabel("country-label", country.name, country.lat, country.lng, {
        countryId: country.id,
        href: `country.html?id=${encodeURIComponent(country.id)}`,
        offset,
        major: country.totalRecords >= 20,
        edge: country.positionStatus === "edge_marker",
      });
    });

    placeLabel("capital-label", NANJING.name, NANJING.lat, NANJING.lng, { offset: [12, -8] });
  }

  function render() {
    setupCanvas();
    ctx.clearRect(0, 0, canvas.logicalWidth, canvas.logicalHeight);
    drawBaseWash();
    drawGrid();
    drawCoastline();
    drawMingTerritory();
    Object.values(COUNTRIES).forEach(drawCountryPoint);
    drawCapital();
    drawCompass();
    drawSeaLabels();
    drawLabels();
  }

  let resizeTimer = null;
  function handleResize() {
    global.clearTimeout(resizeTimer);
    resizeTimer = global.setTimeout(render, 80);
  }

  global.latLngToPixel = latLngToPixel;
  global.renderBaseMap = render;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
  global.addEventListener("resize", handleResize);
  global.addEventListener("fontSizeChange", render);
})(window);
