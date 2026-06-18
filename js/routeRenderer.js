(function (global) {
  "use strict";

  const { COUNTRIES, NANJING, ROUTE_TEMPLATES, TRIBUTE_DATA, TRIBUTE_COLORS } = global;
  const routeCanvas = document.getElementById("route-canvas");
  const ctx = routeCanvas.getContext("2d");
  const routePathCache = new Map();
  let currentYear = 2;
  let currentMonth = 8;

  function setupCanvas() {
    const dpr = global.devicePixelRatio || 1;
    const rect = routeCanvas.parentElement.getBoundingClientRect();
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    const resized = routeCanvas.width !== width || routeCanvas.height !== height;
    if (resized) {
      routeCanvas.width = width;
      routeCanvas.height = height;
      routePathCache.clear();
    }
    routeCanvas.style.width = `${rect.width}px`;
    routeCanvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    routeCanvas.logicalWidth = rect.width;
    routeCanvas.logicalHeight = rect.height;
  }

  function getRecordsByYear(year) {
    return TRIBUTE_DATA.filter((record) => record.year === Number(year));
  }

  function getRecordsByPeriod(year, month) {
    if (month === undefined || month === null) {
      return getRecordsByYear(year);
    }
    return TRIBUTE_DATA.filter((record) => record.year === Number(year) && record.month === Number(month));
  }

  function getActiveCountryIds(year, month) {
    return new Set(getRecordsByPeriod(year, month).map((record) => record.countryId));
  }

  function getActiveCountryIdsFromRecords(records) {
    return new Set(records.map((record) => record.countryId));
  }

  function getRecordCountsByCountry(year, month) {
    return getRecordsByPeriod(year, month).reduce((counts, record) => {
      counts[record.countryId] = (counts[record.countryId] || 0) + 1;
      return counts;
    }, {});
  }

  function getRecordCountsFromRecords(records) {
    return records.reduce((counts, record) => {
      counts[record.countryId] = (counts[record.countryId] || 0) + 1;
      return counts;
    }, {});
  }

  function pointForCountry(country) {
    return global.latLngToPixel(country.lat, country.lng);
  }

  function pointForGeo(point) {
    return global.latLngToPixel(point.lat, point.lng);
  }

  function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return {
      x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    };
  }

  function sampleRoutePath(country) {
    const cacheKey = `${country.id}:${routeCanvas.logicalWidth}x${routeCanvas.logicalHeight}`;
    if (routePathCache.has(cacheKey)) {
      return routePathCache.get(cacheKey);
    }

    const template = ROUTE_TEMPLATES[country.routeType];
    const geoPoints = [
      { lat: country.lat, lng: country.lng },
      ...(template ? template.waypoints : []),
      { lat: NANJING.lat, lng: NANJING.lng },
    ];
    const anchors = geoPoints.map(pointForGeo);
    const points = [];
    const samplesPerSegment = Math.max(8, Math.round(100 / (anchors.length - 1)));

    for (let i = 0; i < anchors.length - 1; i += 1) {
      const p0 = anchors[Math.max(0, i - 1)];
      const p1 = anchors[i];
      const p2 = anchors[i + 1];
      const p3 = anchors[Math.min(anchors.length - 1, i + 2)];
      for (let step = 0; step <= samplesPerSegment; step += 1) {
        if (i > 0 && step === 0) {
          continue;
        }
        points.push(catmullRom(p0, p1, p2, p3, step / samplesPerSegment));
      }
    }

    const angles = points.map((point, index) => {
      const next = points[Math.min(points.length - 1, index + 1)];
      const previous = points[Math.max(0, index - 1)];
      return Math.atan2(next.y - previous.y, next.x - previous.x);
    });
    const path = { points, angles };
    routePathCache.set(cacheKey, path);
    return path;
  }

  function pointAtRoute(path, t) {
    const clamped = Math.max(0, Math.min(1, t));
    const rawIndex = (path.points.length - 1) * clamped;
    const index = Math.floor(rawIndex);
    const nextIndex = Math.min(path.points.length - 1, index + 1);
    const mix = rawIndex - index;
    const point = path.points[index];
    const next = path.points[nextIndex];
    return {
      x: point.x + (next.x - point.x) * mix,
      y: point.y + (next.y - point.y) * mix,
      angle: path.angles[index],
    };
  }

  function drawArrowHead(path) {
    const end = pointAtRoute(path, 0.985);
    ctx.save();
    ctx.translate(end.x, end.y);
    ctx.rotate(end.angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8, -4);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-8, 4);
    ctx.closePath();
    ctx.fillStyle = "rgba(139, 105, 20, 0.62)";
    ctx.fill();
    ctx.restore();
  }

  function drawRouteLine(country) {
    const path = sampleRoutePath(country);
    ctx.save();
    ctx.beginPath();
    path.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "rgba(139, 105, 20, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);
    drawArrowHead(path);
    ctx.restore();
    return path;
  }

  function drawRoutesForYear(activeIds) {
    activeIds.forEach((countryId) => {
      const country = COUNTRIES[countryId];
      if (!country) {
        return;
      }
      drawRouteLine(country);
    });
  }

  function drawSilentPoint(country) {
    const point = pointForCountry(country);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(245, 240, 232, 0.76)";
    ctx.fill();
    ctx.strokeStyle = "#B0A898";
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }

  function drawActivePoint(country) {
    const point = pointForCountry(country);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 16, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(192, 57, 43, 0.22)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = TRIBUTE_COLORS.vermillion || "#C0392B";
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 240, 232, 0.88)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function renderTributePoints(year = currentYear, month = currentMonth) {
    currentYear = Number(year);
    currentMonth = Number(month);
    const records = getRecordsByPeriod(currentYear, currentMonth);
    return renderTributeRecords(records);
  }

  function renderTributeRecords(records) {
    setupCanvas();
    ctx.clearRect(0, 0, routeCanvas.logicalWidth, routeCanvas.logicalHeight);

    const activeIds = getActiveCountryIdsFromRecords(records);
    drawRoutesForYear(activeIds);
    Object.values(COUNTRIES).forEach((country) => {
      if (activeIds.has(country.id)) {
        drawActivePoint(country);
      } else {
        drawSilentPoint(country);
      }
    });

    return activeIds;
  }

  function getRoutePathForCountry(countryId) {
    const country = COUNTRIES[countryId];
    if (!country) {
      return null;
    }
    setupCanvas();
    return sampleRoutePath(country);
  }

  global.getRecordsByYear = getRecordsByYear;
  global.getRecordsByPeriod = getRecordsByPeriod;
  global.getActiveCountryIds = getActiveCountryIds;
  global.getActiveCountryIdsFromRecords = getActiveCountryIdsFromRecords;
  global.getRecordCountsByCountry = getRecordCountsByCountry;
  global.getRecordCountsFromRecords = getRecordCountsFromRecords;
  global.getRoutePathForCountry = getRoutePathForCountry;
  global.pointAtRoute = pointAtRoute;
  global.renderTributePoints = renderTributePoints;
  global.renderTributeRecords = renderTributeRecords;
  global.routePathCache = routePathCache;
})(window);
