#!/usr/bin/env python3
"""Preprocess Natural Earth land and river GeoJSON for the tribute map."""

from __future__ import annotations

import json
import math
import os
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
LAND_INPUT = Path("/tmp/ne_50m_land.geojson")
RIVER_INPUT = Path("/tmp/ne_50m_rivers.geojson")
OUTPUT_PATH = ROOT / "tribute-map" / "js" / "geodata.js"

BOUNDS = {"lng_min": 73, "lng_max": 152, "lat_min": -12, "lat_max": 52}
SIMPLIFY_TOLERANCE = 0.05

KEEP_RIVERS = [
    "Chang Jiang",
    "Yangtze",
    "Huang",
    "Mekong",
    "Lancang",
    "Jinsha",
    "Han",
    "Amur",
    "Songhua",
    "Ayeyarwady",
    "Red",
    "Xi",
    "Pearl",
]


def point_in_bounds(coord: list[float]) -> bool:
    lng, lat = coord
    return (
        BOUNDS["lng_min"] <= lng <= BOUNDS["lng_max"]
        and BOUNDS["lat_min"] <= lat <= BOUNDS["lat_max"]
    )


def bbox_touches_bounds(coords: list[list[float]]) -> bool:
    lngs = [coord[0] for coord in coords]
    lats = [coord[1] for coord in coords]
    return not (
        max(lngs) < BOUNDS["lng_min"]
        or min(lngs) > BOUNDS["lng_max"]
        or max(lats) < BOUNDS["lat_min"]
        or min(lats) > BOUNDS["lat_max"]
    )


def clip_polygon(subject: list[list[float]]) -> list[list[float]]:
    """Clip a ring to BOUNDS with Sutherland-Hodgman."""

    def clip_edge(points, inside, intersect):
        if not points:
            return []
        output = []
        previous = points[-1]
        previous_inside = inside(previous)
        for current in points:
            current_inside = inside(current)
            if current_inside:
                if not previous_inside:
                    output.append(intersect(previous, current))
                output.append(current)
            elif previous_inside:
                output.append(intersect(previous, current))
            previous = current
            previous_inside = current_inside
        return output

    def vertical_intersection(lng, p1, p2):
        x1, y1 = p1
        x2, y2 = p2
        if x1 == x2:
            return [lng, y1]
        t = (lng - x1) / (x2 - x1)
        return [lng, y1 + t * (y2 - y1)]

    def horizontal_intersection(lat, p1, p2):
        x1, y1 = p1
        x2, y2 = p2
        if y1 == y2:
            return [x1, lat]
        t = (lat - y1) / (y2 - y1)
        return [x1 + t * (x2 - x1), lat]

    points = subject[:]
    points = clip_edge(
        points,
        lambda p: p[0] >= BOUNDS["lng_min"],
        lambda a, b: vertical_intersection(BOUNDS["lng_min"], a, b),
    )
    points = clip_edge(
        points,
        lambda p: p[0] <= BOUNDS["lng_max"],
        lambda a, b: vertical_intersection(BOUNDS["lng_max"], a, b),
    )
    points = clip_edge(
        points,
        lambda p: p[1] >= BOUNDS["lat_min"],
        lambda a, b: horizontal_intersection(BOUNDS["lat_min"], a, b),
    )
    points = clip_edge(
        points,
        lambda p: p[1] <= BOUNDS["lat_max"],
        lambda a, b: horizontal_intersection(BOUNDS["lat_max"], a, b),
    )
    return points


def perpendicular_distance(point, line_start, line_end):
    x0, y0 = point
    x1, y1 = line_start
    x2, y2 = line_end
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2)
    t = max(0, min(1, ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy)))
    px, py = x1 + t * dx, y1 + t * dy
    return math.sqrt((x0 - px) ** 2 + (y0 - py) ** 2)


def douglas_peucker(coords, tolerance):
    if len(coords) <= 2:
        return coords
    max_dist = 0
    max_idx = 0
    for i in range(1, len(coords) - 1):
        distance = perpendicular_distance(coords[i], coords[0], coords[-1])
        if distance > max_dist:
            max_dist = distance
            max_idx = i
    if max_dist > tolerance:
        left = douglas_peucker(coords[: max_idx + 1], tolerance)
        right = douglas_peucker(coords[max_idx:], tolerance)
        return left[:-1] + right
    return [coords[0], coords[-1]]


def rounded_coords(coords):
    return [[round(coord[0], 2), round(coord[1], 2)] for coord in coords]


def build_land() -> list[list[list[float]]]:
    with LAND_INPUT.open() as file:
        land_data = json.load(file)

    land_polygons = []
    total_original = 0
    total_simplified = 0

    for feature in land_data["features"]:
        geom = feature["geometry"]
        if geom["type"] == "Polygon":
            all_polys = [geom["coordinates"]]
        elif geom["type"] == "MultiPolygon":
            all_polys = geom["coordinates"]
        else:
            continue

        for poly in all_polys:
            for ring_index, ring in enumerate(poly):
                # Interior rings are lakes/holes. Phase 1 renders land silhouettes, so skip holes.
                if ring_index > 0:
                    continue
                if not bbox_touches_bounds(ring):
                    continue
                total_original += len(ring)
                clipped = clip_polygon(ring)
                if len(clipped) < 4:
                    continue
                simplified = douglas_peucker(clipped, SIMPLIFY_TOLERANCE)
                total_simplified += len(simplified)
                if len(simplified) >= 4:
                    land_polygons.append(rounded_coords(simplified))

    print(f"Land: {total_original} pts -> {total_simplified} pts, {len(land_polygons)} polygons")
    return land_polygons


def build_rivers() -> list[dict]:
    with RIVER_INPUT.open() as file:
        river_data = json.load(file)

    rivers = []
    for feature in river_data["features"]:
        props = feature["properties"]
        names = [
            props.get("name", ""),
            props.get("name_en", ""),
            props.get("name_alt", ""),
            props.get("note", ""),
        ]
        haystack = " ".join(name for name in names if name)
        if not any(river_name.lower() in haystack.lower() for river_name in KEEP_RIVERS):
            continue

        geom = feature["geometry"]
        if geom["type"] == "LineString":
            lines = [geom["coordinates"]]
        elif geom["type"] == "MultiLineString":
            lines = geom["coordinates"]
        else:
            continue

        for line in lines:
            if not bbox_touches_bounds(line) or not any(point_in_bounds(coord) for coord in line):
                continue
            simplified = douglas_peucker(line, SIMPLIFY_TOLERANCE * 2)
            if len(simplified) >= 2:
                rivers.append({"name": props.get("name_en") or props.get("name") or "", "coords": rounded_coords(simplified)})

    print(f"Rivers: {len(rivers)} segments kept")
    return rivers


def main() -> None:
    if not LAND_INPUT.exists() or not RIVER_INPUT.exists():
        raise FileNotFoundError("Download Natural Earth files to /tmp before running this script.")

    land_polygons = build_land()
    rivers = build_rivers()
    output = (
        "// Auto-generated by tribute-map/scripts/build_geodata.py.\n"
        "// Natural Earth 50m geography clipped to East/Southeast Asia.\n"
        "// Source: https://www.naturalearthdata.com/ (Public Domain)\n"
        "(function (global) {\n"
        '  "use strict";\n'
        f"  const LAND_POLYGONS = {json.dumps(land_polygons, ensure_ascii=False, separators=(',', ':'))};\n"
        f"  const RIVER_LINES = {json.dumps(rivers, ensure_ascii=False, separators=(',', ':'))};\n"
        "  global.LAND_POLYGONS = LAND_POLYGONS;\n"
        "  global.RIVER_LINES = RIVER_LINES;\n"
        '  if (typeof module !== "undefined" && module.exports) {\n'
        "    module.exports = { LAND_POLYGONS, RIVER_LINES };\n"
        "  }\n"
        "})(typeof window !== \"undefined\" ? window : globalThis);\n"
    )

    OUTPUT_PATH.write_text(output, encoding="utf-8")
    size_kb = os.path.getsize(OUTPUT_PATH) / 1024
    print(f"Output: {OUTPUT_PATH} ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
