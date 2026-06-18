#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");
const data = require(path.join(root, "js/data.js"));

function assertCheck(name, pass, detail = "") {
  if (!pass) {
    throw new Error(`${name} failed${detail ? `: ${detail}` : ""}`);
  }
  console.log(`PASS ${name}${detail ? ` - ${detail}` : ""}`);
}

function uniqueCountryCount(year) {
  return new Set(data.TRIBUTE_DATA.filter((record) => record.year === year).map((record) => record.countryId)).size;
}

function uniqueCountryCountByMonth(year, month) {
  return new Set(data.TRIBUTE_DATA.filter((record) => record.year === year && record.month === month).map((record) => record.countryId)).size;
}

const requiredDomIds = [
  "timeline-panel",
  "year-slider",
  "month-slider",
  "current-year-label",
  "current-month-label",
  "gregorian-year-label",
  "active-country-count",
  "active-country-list",
];

assertCheck(
  "2-1 timeline DOM exists",
  requiredDomIds.every((id) => indexHtml.includes(`id="${id}"`)),
);
assertCheck(
  "2-2 slider ranges",
  indexHtml.includes('id="year-slider"') &&
    indexHtml.includes('min="2"') &&
    indexHtml.includes('max="31"') &&
    indexHtml.includes('id="month-slider"') &&
    indexHtml.includes('min="1"') &&
    indexHtml.includes('max="12"'),
);
assertCheck(
  "2-3 Phase 2 scripts loaded after base map",
  indexHtml.indexOf("js/baseMap.js") < indexHtml.indexOf("js/routeRenderer.js") &&
    indexHtml.indexOf("js/routeRenderer.js") < indexHtml.indexOf("js/hitLayer.js") &&
    indexHtml.indexOf("js/hitLayer.js") < indexHtml.indexOf("js/bindEvents.js"),
);

const routeRenderer = fs.readFileSync(path.join(root, "js/routeRenderer.js"), "utf8");
const baseMap = fs.readFileSync(path.join(root, "js/baseMap.js"), "utf8");
const hitLayer = fs.readFileSync(path.join(root, "js/hitLayer.js"), "utf8");
const bindEvents = fs.readFileSync(path.join(root, "js/bindEvents.js"), "utf8");

assertCheck("2-4 route renderer exposes month-aware active-country API", routeRenderer.includes("global.getActiveCountryIds") && routeRenderer.includes("global.getRecordsByPeriod"));
assertCheck("2-5 route renderer draws active glow", routeRenderer.includes("rgba(192, 57, 43, 0.22)") && routeRenderer.includes("arc"));
assertCheck("2-6 country labels support country jump", baseMap.includes("country.html?id=") && !hitLayer.includes("country.html?id="));
assertCheck("2-7 labels support active count badges", hitLayer.includes("record-count"));
assertCheck("2-8 bind events has month-aware silence timer", bindEvents.includes("silenceTimer") && bindEvents.includes("setTimeout") && bindEvents.includes("currentMonth"));
assertCheck("2-9 timeline panel accepts pointer events", css.includes(".timeline-panel") && css.includes("pointer-events: auto"));
assertCheck(
  "2-10 reference active-country counts",
  uniqueCountryCount(2) === 3 &&
    uniqueCountryCount(4) === 8 &&
    uniqueCountryCount(16) === 9 &&
    uniqueCountryCount(26) === 6,
);
assertCheck(
  "2-11 reference active-country month counts",
  uniqueCountryCountByMonth(2, 8) === 1 &&
    uniqueCountryCountByMonth(2, 6) === 1 &&
    uniqueCountryCountByMonth(4, 9) === 3,
);
assertCheck("2-12 month slider styled compactly", css.includes("#month-slider") && css.includes(".slider-row"));

console.log("Phase 2 checks completed.");
