#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const routeRenderer = fs.readFileSync(path.join(root, "js/routeRenderer.js"), "utf8");
const { COUNTRIES, TRIBUTE_DATA } = require(path.join(root, "js/data.js"));
const { ROUTE_TEMPLATES } = require(path.join(root, "js/config.js"));

function assertCheck(name, pass, detail = "") {
  if (!pass) {
    throw new Error(`${name} failed${detail ? `: ${detail}` : ""}`);
  }
  console.log(`PASS ${name}${detail ? ` - ${detail}` : ""}`);
}

assertCheck(
  "3-1 transport icons load before route renderer",
  indexHtml.indexOf("js/icons.js") > -1 && indexHtml.indexOf("js/icons.js") < indexHtml.indexOf("js/routeRenderer.js"),
);
assertCheck(
  "3-2 route renderer no longer draws tribute icons",
  !routeRenderer.includes("drawRouteIcons") && !routeRenderer.includes("TRIBUTE_ICONS"),
);
assertCheck(
  "3-3 route renderer uses route templates",
  routeRenderer.includes("ROUTE_TEMPLATES") && Object.keys(ROUTE_TEMPLATES).length === 4,
);
assertCheck("3-4 route path cache present", routeRenderer.includes("routePathCache") && routeRenderer.includes("sampleRoutePath"));
assertCheck("3-5 dashed route drawing present", routeRenderer.includes("setLineDash([6, 4])"));
assertCheck("3-6 arrow drawing present", routeRenderer.includes("drawArrowHead"));
assertCheck(
  "3-7 every country has valid route type",
  Object.values(COUNTRIES).every((country) => ROUTE_TEMPLATES[country.routeType]),
);
assertCheck(
  "3-8 Hongwu 4 active route countries retained",
  new Set(TRIBUTE_DATA.filter((record) => record.year === 4).map((record) => record.countryId)).size === 8,
);

console.log("Phase 3 checks completed.");
