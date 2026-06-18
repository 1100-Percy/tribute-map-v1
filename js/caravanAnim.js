(function (global) {
  "use strict";

  const { COUNTRIES, TRIBUTE_DATA, TRANSPORT_ICONS } = global;
  const { drawHorse, drawShip } = TRANSPORT_ICONS;
  const animCanvas = document.getElementById("anim-canvas");
  const hitLayer = document.getElementById("hit-layer");
  const uiLayer = document.getElementById("ui-layer");
  const ctx = animCanvas.getContext("2d");

  const DURATION_MS = 9000;
  const ICON_SCALE = 0.8;
  const START_OFFSET = 0.04;
  const END_OFFSET = 0.96;

  let animationFrame = null;
  let activeYear = null;
  let activeMonth = null;
  let activeRecords = [];
  let activeCaravans = [];
  let referenceRouteLength = null;
  const activeHitTargets = new Map();

  function setupCanvas() {
    const dpr = global.devicePixelRatio || 1;
    const rect = animCanvas.parentElement.getBoundingClientRect();
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    animCanvas.width = width;
    animCanvas.height = height;
    animCanvas.style.width = `${rect.width}px`;
    animCanvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    animCanvas.logicalWidth = rect.width;
    animCanvas.logicalHeight = rect.height;
  }

  function closeTributePopup() {
    const popup = document.getElementById("tribute-popup");
    if (popup) {
      popup.style.display = "none";
    }
  }

  function cleanupHitTargets() {
    document.querySelectorAll(".caravan-hit-target").forEach((target) => target.remove());
    activeHitTargets.clear();
  }

  function clearAnimationCanvas() {
    setupCanvas();
    ctx.clearRect(0, 0, animCanvas.logicalWidth, animCanvas.logicalHeight);
  }

  function escapeHtml(value) {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    return String(value).replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[char];
    });
  }

  function formatMonth(record) {
    if (!record.month) {
      return "";
    }
    return `${record.month}月${record.isLeapMonth ? "（閏）" : ""}`;
  }

  function showTributePopup(countryId, year = activeYear, month = activeMonth, recordsOverride = null) {
    const sourceRecords = recordsOverride || activeRecords;
    const records = sourceRecords.length
      ? sourceRecords.filter((record) => record.countryId === countryId)
      : TRIBUTE_DATA.filter((record) => record.countryId === countryId && record.year === year && record.month === month);
    const country = COUNTRIES[countryId];
    if (!country) {
      return;
    }

    let popup = document.getElementById("tribute-popup");
    if (!popup) {
      popup = document.createElement("div");
      popup.id = "tribute-popup";
      uiLayer.appendChild(popup);
    }

    popup.style.cssText = `
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: #F5F0E8;
      border: 1px solid #8B8070;
      border-radius: 8px;
      padding: 24px;
      max-width: 360px;
      min-width: 280px;
      max-height: min(70vh, 560px);
      overflow: auto;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      z-index: 1000;
      pointer-events: auto;
      font-family: 'Noto Serif TC', serif;
    `;

    const sortedRecords = records
      .slice()
      .sort((a, b) => a.year - b.year || a.monthSort - b.monthSort || a.sourceRow - b.sourceRow);
    const recordBlocks = sortedRecords
      .map((record) => {
        const month = formatMonth(record);
        return `
          <div style="border-top:1px solid #E0D8C8; padding:12px 0;">
            <div style="font-size:12px; color:#C0392B; margin-bottom:4px;">洪武${record.year}年${escapeHtml(month)}</div>
            ${record.purpose ? `<div style="font-size:13px; color:#1A1008; margin-bottom:4px;">目的：${escapeHtml(record.purpose)}</div>` : ""}
            ${record.king ? `<div style="font-size:13px; color:#1A1008; margin-bottom:4px;">國王：${escapeHtml(record.king)}</div>` : ""}
            ${record.envoy ? `<div style="font-size:13px; color:#1A1008; margin-bottom:4px;">使者：${escapeHtml(record.envoy)}</div>` : ""}
            <div style="font-size:13px; margin-bottom:4px;">
              <span style="color:#8B6914;">貢物：</span>
              <span style="color:#1A1008;">${escapeHtml(record.tributeRaw || "方物")}</span>
            </div>
            ${
              record.giftsRaw
                ? `<div style="font-size:13px;"><span style="color:#8B6914;">回賜：</span><span style="color:#1A1008;">${escapeHtml(record.giftsRaw)}</span></div>`
                : ""
            }
          </div>
        `;
      })
      .join("");
    const isFilteredPopup =
      recordsOverride ||
      activeYear === null ||
      activeMonth === null ||
      activeRecords.length !== global.getRecordsByPeriod(activeYear, activeMonth).length;
    const periodLabel = isFilteredPopup
      ? `篩選結果 · ${records.length}次遣使`
      : `洪武${year}年${month}月 · ${records.length}次遣使`;

    popup.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:16px;">
        <h3 style="margin:0; color:#1A1008; font-size:18px;">${escapeHtml(country.name)}</h3>
        <button class="tribute-popup-close" type="button" aria-label="關閉" style="cursor:pointer; border:0; background:transparent; font-size:20px; color:#8B8070; line-height:1;">&times;</button>
      </div>
      <div style="font-size:13px; color:#8B6914; margin-bottom:12px;">
        ${escapeHtml(periodLabel)}
      </div>
      ${recordBlocks || '<div style="font-size:13px; color:#1A1008;">本年無朝貢記錄。</div>'}
    `;
    popup.querySelector(".tribute-popup-close").addEventListener("click", closeTributePopup);
    popup.style.display = "block";
  }

  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  function getTransportMode(country, countryId) {
    return country.routeType === "land" || country.routeType === "land_north" || countryId === "goryeo" || countryId === "joseon" ? "land" : "sea";
  }

  function measureRouteLength(points) {
    return points.reduce((length, point, index) => {
      if (index === 0) {
        return length;
      }
      const previous = points[index - 1];
      return length + Math.hypot(point.x - previous.x, point.y - previous.y);
    }, 0);
  }

  function getReferenceRouteLength() {
    if (referenceRouteLength !== null) {
      return referenceRouteLength;
    }
    const referencePath = global.getRoutePathForCountry("goryeo");
    referenceRouteLength = referencePath ? measureRouteLength(referencePath.points) : 1;
    return referenceRouteLength;
  }

  function getCaravanDuration(path) {
    const routeLength = measureRouteLength(path.points);
    const referenceLength = Math.max(1, getReferenceRouteLength());
    return Math.max(DURATION_MS, Math.round((routeLength / referenceLength) * DURATION_MS));
  }

  function getCaravansForPeriod(year, month) {
    return Array.from(global.getActiveCountryIds(year, month))
      .map((countryId) => {
        const country = COUNTRIES[countryId];
        const path = global.getRoutePathForCountry(countryId);
        if (!country || !path) {
          return null;
        }
        return {
          countryId,
          country,
          path,
          transportMode: getTransportMode(country, countryId),
          durationMs: getCaravanDuration(path),
          delay: Math.abs(countryId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 1400,
        };
      })
      .filter(Boolean);
  }

  function getRouteSample(path, t) {
    const pathPoints = path.points;
    const totalPoints = pathPoints.length;
    if (totalPoints < 2) {
      const point = pathPoints[0] || { x: 0, y: 0 };
      return { x: point.x, y: point.y, angle: 0 };
    }
    const idx = Math.min(Math.floor(t * (totalPoints - 1)), totalPoints - 2);
    const curr = pathPoints[idx];
    const next = pathPoints[idx + 1];
    const angle = Math.atan2(next.y - curr.y, next.x - curr.x);
    return { x: curr.x, y: curr.y, angle };
  }

  function updateCaravanHitTarget(caravan, point) {
    let target = activeHitTargets.get(caravan.countryId);
    if (!target || !target.isConnected) {
      target = document.createElement("div");
      target.id = `caravan-hit-${caravan.countryId}`;
      target.className = "caravan-hit-target";
      target.setAttribute("role", "button");
      target.setAttribute("tabindex", "0");
      target.setAttribute("aria-label", `${caravan.country.name}朝貢使團`);
      target.style.cssText = `
        position: absolute;
        width: 50px; height: 50px;
        cursor: pointer;
        z-index: 100;
        transform: translate(-50%, -50%);
      `;
      target.addEventListener("click", (event) => {
        event.stopPropagation();
        showTributePopup(caravan.countryId);
      });
      target.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showTributePopup(caravan.countryId);
        }
      });
      hitLayer.appendChild(target);
      activeHitTargets.set(caravan.countryId, target);
    }
    target.style.left = `${point.x}px`;
    target.style.top = `${point.y}px`;
  }

  function drawCaravan(caravan, progress) {
    const routeT = START_OFFSET + (END_OFFSET - START_OFFSET) * progress;
    const point = getRouteSample(caravan.path, routeT);
    const drawFn = caravan.transportMode === "land" ? drawHorse : drawShip;
    drawFn(ctx, point.x, point.y, ICON_SCALE, point.angle);
    return point;
  }

  function drawFrame(timestamp, startTime) {
    ctx.clearRect(0, 0, animCanvas.logicalWidth, animCanvas.logicalHeight);

    activeCaravans.forEach((caravan) => {
      const localElapsed = Math.max(0, timestamp - startTime - caravan.delay);
      const loopProgress = (localElapsed % caravan.durationMs) / caravan.durationMs;
      const point = drawCaravan(caravan, easeInOutSine(loopProgress));
      updateCaravanHitTarget(caravan, point);
    });

    animationFrame = global.requestAnimationFrame((nextTimestamp) => {
      drawFrame(nextTimestamp, startTime);
    });
  }

  function stopCaravanAnimation() {
    if (animationFrame !== null) {
      global.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    activeYear = null;
    activeMonth = null;
    activeRecords = [];
    activeCaravans = [];
    cleanupHitTargets();
    closeTributePopup();
    clearAnimationCanvas();
  }

  function startCaravanAnimation(year, month) {
    stopCaravanAnimation();
    activeYear = Number(year);
    activeMonth = Number(month);
    activeRecords = global.getRecordsByPeriod(activeYear, activeMonth);
    activeCaravans = getCaravansForPeriod(activeYear, activeMonth);
    if (!activeCaravans.length) {
      return;
    }
    setupCanvas();
    animationFrame = global.requestAnimationFrame((timestamp) => {
      drawFrame(timestamp, timestamp);
    });
  }

  function getCaravansFromRecords(records) {
    return Array.from(global.getActiveCountryIdsFromRecords(records))
      .map((countryId) => {
        const country = COUNTRIES[countryId];
        const path = global.getRoutePathForCountry(countryId);
        if (!country || !path) {
          return null;
        }
        return {
          countryId,
          country,
          path,
          transportMode: getTransportMode(country, countryId),
          durationMs: getCaravanDuration(path),
          delay: Math.abs(countryId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 1400,
        };
      })
      .filter(Boolean);
  }

  function startCaravanAnimationForRecords(records) {
    stopCaravanAnimation();
    activeYear = null;
    activeMonth = null;
    activeRecords = records.slice();
    activeCaravans = getCaravansFromRecords(activeRecords);
    if (!activeCaravans.length) {
      return;
    }
    setupCanvas();
    animationFrame = global.requestAnimationFrame((timestamp) => {
      drawFrame(timestamp, timestamp);
    });
  }

  global.addEventListener("tribute:silence", (event) => {
    if (Array.isArray(event.detail.records)) {
      startCaravanAnimationForRecords(event.detail.records);
      return;
    }
    startCaravanAnimation(event.detail.year, event.detail.month);
  });

  global.addEventListener("tribute:interrupt", stopCaravanAnimation);
  global.addEventListener("resize", stopCaravanAnimation);

  global.startCaravanAnimation = startCaravanAnimation;
  global.startCaravanAnimationForRecords = startCaravanAnimationForRecords;
  global.stopCaravanAnimation = stopCaravanAnimation;
  global.clearCaravanAnimation = clearAnimationCanvas;
  global.showTributePopup = showTributePopup;
  global.closeTributePopup = closeTributePopup;
  global.getTransportMode = getTransportMode;
  global.getActiveCaravanCount = () => activeCaravans.length;
})(window);
