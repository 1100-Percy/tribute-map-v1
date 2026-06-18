#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const baseMap = fs.readFileSync(path.join(root, "js/baseMap.js"), "utf8");
const hitLayer = fs.readFileSync(path.join(root, "js/hitLayer.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");
const countryHtmlPath = path.join(root, "country.html");
const countryPagePath = path.join(root, "js/countryPage.js");
const { COUNTRIES, TRIBUTE_DATA } = require(path.join(root, "js/data.js"));

function assertCheck(name, pass, detail = "") {
  if (!pass) {
    throw new Error(`${name} failed${detail ? `: ${detail}` : ""}`);
  }
  console.log(`PASS ${name}${detail ? ` - ${detail}` : ""}`);
}

assertCheck("5-1 country page exists", fs.existsSync(countryHtmlPath));
assertCheck("5-2 country page script exists", fs.existsSync(countryPagePath));

const countryHtml = fs.existsSync(countryHtmlPath) ? fs.readFileSync(countryHtmlPath, "utf8") : "";
const countryPage = fs.existsSync(countryPagePath) ? fs.readFileSync(countryPagePath, "utf8") : "";

assertCheck(
  "5-3 country page loads data before page script",
  countryHtml.indexOf("js/data.js") > -1 && countryHtml.indexOf("js/data.js") < countryHtml.indexOf("js/countryPage.js"),
);
assertCheck("5-4 country page has required regions", ["country-title", "country-summary", "tribute-timeline"].every((id) => countryHtml.includes(`id="${id}"`)));
assertCheck("5-5 base map country labels are links", baseMap.includes('options.href ? "a" : "div"') && baseMap.includes("country.html?id="));
assertCheck("5-6 point hit layer no longer owns country navigation", !hitLayer.includes("country.html?id=") && hitLayer.includes("renderHitLayer"));
assertCheck("5-7 clickable labels styled", css.includes(".country-label") && css.includes("pointer-events: auto") && css.includes("text-decoration"));
assertCheck("5-8 child page parses country id", countryPage.includes("URLSearchParams") && countryPage.includes("COUNTRIES[countryId]"));
assertCheck("5-9 child page renders all country records", countryPage.includes("TRIBUTE_DATA.filter") && countryPage.includes("record.countryId === countryId"));
assertCheck("5-10 child page renders tribute timeline", countryPage.includes("renderTimeline") && countryPage.includes("tribute-timeline"));
assertCheck("5-11 child page renders key fields", ["tributeRaw", "giftsRaw", "envoy", "source"].every((field) => countryPage.includes(field)));
assertCheck("5-12 ryukyu chuzan records available", COUNTRIES.ryukyu_chuzan && TRIBUTE_DATA.filter((record) => record.countryId === "ryukyu_chuzan").length === COUNTRIES.ryukyu_chuzan.totalRecords);

console.log("Phase 5 checks completed.");
