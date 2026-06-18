#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const routeRenderer = fs.readFileSync(path.join(root, "js/routeRenderer.js"), "utf8");
const bindEvents = fs.readFileSync(path.join(root, "js/bindEvents.js"), "utf8");
const icons = fs.readFileSync(path.join(root, "js/icons.js"), "utf8");
const caravanPath = path.join(root, "js/caravanAnim.js");

function assertCheck(name, pass, detail = "") {
  if (!pass) {
    throw new Error(`${name} failed${detail ? `: ${detail}` : ""}`);
  }
  console.log(`PASS ${name}${detail ? ` - ${detail}` : ""}`);
}

assertCheck("4-1 caravan animation file exists", fs.existsSync(caravanPath));
const caravan = fs.readFileSync(caravanPath, "utf8");

assertCheck(
  "4-2 caravan script loads after route renderer and before bind events",
  indexHtml.indexOf("js/caravanAnim.js") > indexHtml.indexOf("js/routeRenderer.js") &&
    indexHtml.indexOf("js/caravanAnim.js") < indexHtml.indexOf("js/bindEvents.js"),
);
assertCheck("4-3 phase label present", indexHtml.includes("phase-note"));
assertCheck(
  "4-4 route renderer exposes reusable route path helpers",
  routeRenderer.includes("global.getRoutePathForCountry") && routeRenderer.includes("global.pointAtRoute"),
);
assertCheck(
  "4-5 bind events interrupt animation before changing years",
  bindEvents.includes("tribute:interrupt") && bindEvents.indexOf("interruptAnimation();") < bindEvents.indexOf("renderPeriod(Number(event.target.value), currentMonth)"),
);
assertCheck("4-6 caravan listens for silence", caravan.includes('"tribute:silence"'));
assertCheck("4-7 caravan listens for interruption", caravan.includes('"tribute:interrupt"'));
assertCheck("4-8 caravan uses animation frame", caravan.includes("requestAnimationFrame") && caravan.includes("cancelAnimationFrame"));
assertCheck("4-9 caravan clears animation canvas", caravan.includes("clearRect"));
assertCheck("4-10 horse and ship icon functions exist", icons.includes("function drawHorse") && icons.includes("function drawShip"));
assertCheck("4-11 old rough icon exports removed", !icons.includes("drawCarriage") && !icons.includes("drawJunk"));
assertCheck("4-12 horse and ship handle direction flipping", icons.includes("const needFlip") && icons.includes("ctx.rotate(angle + Math.PI)") && icons.includes("ctx.scale(-1, 1)"));
assertCheck("4-13 caravan selects land or sea vehicle", caravan.includes("getTransportMode") && caravan.includes("country.routeType") && caravan.includes('countryId === "goryeo"'));
assertCheck("4-14 caravan draws horse and ship icons", caravan.includes("drawHorse") && caravan.includes("drawShip"));
assertCheck("4-15 caravan no longer uses tribute categories", !caravan.includes("getTopTributeCategories") && !caravan.includes("TRIBUTE_ICONS"));
assertCheck("4-16 caravan moves slowly", caravan.includes("const DURATION_MS = 9000"));
assertCheck("4-17 caravan uses 0.8 icon scale", caravan.includes("const ICON_SCALE = 0.8"));
assertCheck("4-18 caravan computes angle from adjacent path points", caravan.includes("getRouteSample") && caravan.includes("Math.atan2(next.y - curr.y, next.x - curr.x)"));
assertCheck("4-19 caravan creates dynamic hit divs", caravan.includes("caravan-hit-") && caravan.includes("updateCaravanHitTarget") && caravan.includes("cleanupHitTargets"));
assertCheck("4-20 caravan popup renders tribute records", caravan.includes("function showTributePopup") && caravan.includes("TRIBUTE_DATA.filter") && caravan.includes("tributeRaw") && caravan.includes("giftsRaw"));
assertCheck("4-21 popup closes on interruption", caravan.includes("closeTributePopup") && caravan.indexOf("closeTributePopup") < caravan.indexOf("clearAnimationCanvas"));
assertCheck("4-22 caravan filters animation and popup by month", caravan.includes("activeMonth") && caravan.includes("record.month === month") && caravan.includes("startCaravanAnimation(year, month)"));
assertCheck("4-23 caravan normalizes speed by route length", caravan.includes("measureRouteLength") && caravan.includes("getCaravanDuration") && caravan.includes("durationMs"));
assertCheck("4-24 animation loop uses per-caravan duration", caravan.includes("localElapsed % caravan.durationMs") && caravan.includes("/ caravan.durationMs"));

console.log("Phase 4 checks completed.");
