#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const mapHtmlPath = fs.existsSync(path.join(root, "map.html")) ? path.join(root, "map.html") : path.join(root, "index.html");
const indexHtml = fs.readFileSync(mapHtmlPath, "utf8");
const countryHtml = fs.readFileSync(path.join(root, "country.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");
const baseMap = fs.readFileSync(path.join(root, "js/baseMap.js"), "utf8");
const routeRenderer = fs.readFileSync(path.join(root, "js/routeRenderer.js"), "utf8");
const caravanAnim = fs.readFileSync(path.join(root, "js/caravanAnim.js"), "utf8");

function assertCheck(name, pass, detail = "") {
  if (!pass) {
    throw new Error(`${name} failed${detail ? `: ${detail}` : ""}`);
  }
  console.log(`PASS ${name}${detail ? ` - ${detail}` : ""}`);
}

const allHtml = `${indexHtml}\n${countryHtml}`;

assertCheck("6-1 phase label updated", indexHtml.includes("打磨合規 · Phase 6"));
assertCheck("6-2 main page compliance panel removed", !indexHtml.includes("competition-compliance"));
assertCheck("6-3 country page has compliance footer", countryHtml.includes("country-compliance") && countryHtml.includes("Natural Earth"));
assertCheck(
  "6-4 compliance text includes competition and AI workflow",
  ["2026 理大人工智能", "B組", "AI輔助", "人工判讀"].every((text) => allHtml.includes(text)),
);
assertCheck(
  "6-5 compliance text includes source and license",
  ["《明太祖實錄》", "Natural Earth", "Public Domain", "無外部 CDN"].every((text) => allHtml.includes(text)),
);
assertCheck("6-6 no external scripts or styles", !/https?:\/\//i.test(indexHtml) && !/https?:\/\//i.test(countryHtml));
assertCheck("6-7 responsive mobile map rules present", css.includes("@media (max-width: 760px)") && css.includes("#map-container"));
assertCheck("6-8 map no longer forces 1024px minimum width", !css.includes("min-width: 1024px"));
assertCheck("6-9 country page background covers long pages", css.includes("body.country-page") && css.includes("min-height: 100vh"));
assertCheck("6-10 canvas resize avoids unnecessary route cache churn", routeRenderer.includes("if (resized)") && routeRenderer.includes("routePathCache.clear()"));
assertCheck("6-11 animation uses per-route speed normalization", caravanAnim.includes("measureRouteLength") && caravanAnim.includes("durationMs"));
assertCheck("6-12 base map resize remains debounced", baseMap.includes("resizeTimer") && baseMap.includes("setTimeout(render, 80)"));

console.log("Phase 6 checks completed.");
