#!/usr/bin/env node
"use strict";

const path = require("path");

const jsDir = path.resolve(__dirname, "../js");
const { TRIBUTE_DATA, COUNTRIES } = require(path.join(jsDir, "data.js"));
const { MAP_CONFIG, ROUTE_TEMPLATES } = require(path.join(jsDir, "config.js"));

function assertCheck(name, pass, detail = "") {
  if (!pass) {
    throw new Error(`${name} failed${detail ? `: ${detail}` : ""}`);
  }
  console.log(`PASS ${name}${detail ? ` - ${detail}` : ""}`);
}

function unique(values) {
  return Array.from(new Set(values));
}

const bounds = MAP_CONFIG.bounds;

assertCheck("0-1 record count", TRIBUTE_DATA.length === 290, String(TRIBUTE_DATA.length));
assertCheck(
  "0-2 year range",
  TRIBUTE_DATA.every((record) => record.year >= 2 && record.year <= 31 && !Number.isNaN(record.year)),
);
assertCheck("0-3 country count", Object.keys(COUNTRIES).length >= 20, String(Object.keys(COUNTRIES).length));
assertCheck(
  "0-4 coordinates in configured map bounds",
  Object.values(COUNTRIES).every(
    (country) =>
      country.lat >= bounds.latMin &&
      country.lat <= bounds.latMax &&
      country.lng >= bounds.lngMin &&
      country.lng <= bounds.lngMax,
  ),
  JSON.stringify(bounds),
);

const countByCountry = TRIBUTE_DATA.reduce((acc, record) => {
  acc[record.countryId] = (acc[record.countryId] || 0) + 1;
  return acc;
}, {});

assertCheck(
  "0-5 high-frequency countries",
  (countByCountry.goryeo || 0) + (countByCountry.joseon || 0) >= 80 &&
    (countByCountry.siam || 0) >= 40 &&
    (countByCountry.champa || 0) >= 25,
  `Goryeo+Joseon=${(countByCountry.goryeo || 0) + (countByCountry.joseon || 0)}, Siam=${
    countByCountry.siam || 0
  }, Champa=${countByCountry.champa || 0}`,
);

assertCheck(
  "0-6 Hongwu 4 active countries",
  unique(TRIBUTE_DATA.filter((record) => record.year === 4).map((record) => record.countryId)).length === 8,
);

const nonEmptyTributes = TRIBUTE_DATA.filter((record) => record.tributeItems.length > 0);
const classifiedTributes = nonEmptyTributes.filter((record) =>
  record.tributeCategories.some((category) => category !== "misc"),
);
const coverage = classifiedTributes.length / nonEmptyTributes.length;
assertCheck("0-7 tribute category coverage", coverage >= 0.7, `${(coverage * 100).toFixed(1)}%`);

const leapRecords = TRIBUTE_DATA.filter((record) => record.timeRaw.includes("闰"));
assertCheck(
  "0-8 leap month handling",
  leapRecords.length >= 2 && leapRecords.every((record) => record.isLeapMonth === true),
  String(leapRecords.length),
);

assertCheck(
  "0-9 source retained",
  TRIBUTE_DATA.every((record) => record.source && record.source.includes("明太祖实录")),
);

const routeTypes = new Set(Object.keys(ROUTE_TEMPLATES));
assertCheck(
  "0-10 route templates complete",
  ["sea_south", "east_sea", "land_north", "west_sea"].every((routeType) => routeTypes.has(routeType)) &&
    Object.values(COUNTRIES).every((country) => routeTypes.has(country.routeType)),
);

console.log("Phase 0 checks completed.");
