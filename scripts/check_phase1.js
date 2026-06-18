#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");
const baseMap = fs.readFileSync(path.join(root, "js/baseMap.js"), "utf8");
const { COUNTRIES } = require(path.join(root, "js/data.js"));
const { LAND_POLYGONS, RIVER_LINES } = require(path.join(root, "js/geodata.js"));
const { MAP_CONFIG } = require(path.join(root, "js/config.js"));

function assertCheck(name, pass, detail = "") {
  if (!pass) {
    throw new Error(`${name} failed${detail ? `: ${detail}` : ""}`);
  }
  console.log(`PASS ${name}${detail ? ` - ${detail}` : ""}`);
}

const requiredIds = ["map-container", "base-canvas", "route-canvas", "anim-canvas", "hit-layer", "label-layer", "ui-layer"];
assertCheck(
  "1-1 render layer DOM ids",
  requiredIds.every((id) => indexHtml.includes(`id="${id}"`)),
);

assertCheck(
  "1-2 local script order",
  indexHtml.indexOf("js/config.js") < indexHtml.indexOf("js/data.js") &&
    indexHtml.indexOf("js/data.js") < indexHtml.indexOf("js/geodata.js") &&
    indexHtml.indexOf("js/geodata.js") < indexHtml.indexOf("js/baseMap.js"),
);

assertCheck("1-3 no external CDN", !/https?:\/\//.test(indexHtml + css + baseMap));
assertCheck("1-4 canvas fills viewport", css.includes("100vw") && css.includes("100vh") && css.includes("overflow: hidden"));
assertCheck("1-5 countries available", Object.keys(COUNTRIES).length >= 20, `${Object.keys(COUNTRIES).length}`);
assertCheck("1-6 base map exposes projection", baseMap.includes("global.latLngToPixel = latLngToPixel"));
assertCheck("1-7 Natural Earth land polygons present", LAND_POLYGONS.length >= 100, `${LAND_POLYGONS.length}`);
assertCheck("1-8 Natural Earth river lines present", RIVER_LINES.length >= 10, `${RIVER_LINES.length}`);
assertCheck(
  "1-9 country coordinates inside bounds",
  Object.values(COUNTRIES).every(
    (country) =>
      country.lat >= MAP_CONFIG.bounds.latMin &&
      country.lat <= MAP_CONFIG.bounds.latMax &&
      country.lng >= MAP_CONFIG.bounds.lngMin &&
      country.lng <= MAP_CONFIG.bounds.lngMax,
  ),
);
assertCheck(
  "1-10 Natural Earth map bounds",
  MAP_CONFIG.bounds.lngMin === 73 &&
    MAP_CONFIG.bounds.lngMax === 152 &&
    MAP_CONFIG.bounds.latMin === -12 &&
    MAP_CONFIG.bounds.latMax === 52,
  JSON.stringify(MAP_CONFIG.bounds),
);

console.log("Phase 1 static checks completed.");
