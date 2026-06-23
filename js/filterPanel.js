(function (global) {
  "use strict";

  const {
    COUNTRIES,
    TRIBUTE_DATA,
    TRIBUTE_CATEGORIES,
    GIFT_CATEGORIES,
    PURPOSE_CATEGORIES,
    getTributeCategories,
    getGiftCategories,
    getPurposeCategories,
  } = global;

  const monthNames = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const HEATMAP_DATA = {
    2: { 1: 0, 2: 1, 3: 0, 4: 0, 5: 0, 6: 1, 7: 0, 8: 1, 9: 2, 10: 0, 11: 0, 12: 1 },
    3: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 0, 6: 1, 7: 0, 8: 2, 9: 3, 10: 1, 11: 0, 12: 0 },
    4: { 1: 1, 2: 1, 3: 0, 4: 0, 5: 0, 6: 0, 7: 1, 8: 1, 9: 3, 10: 1, 11: 1, 12: 2 },
    5: { 1: 3, 2: 2, 3: 1, 4: 0, 5: 0, 6: 0, 7: 1, 8: 0, 9: 2, 10: 2, 11: 1, 12: 1 },
    6: { 1: 1, 2: 0, 3: 0, 4: 1, 5: 0, 6: 0, 7: 0, 8: 1, 9: 0, 10: 4, 11: 4, 12: 3 },
    7: { 1: 0, 2: 0, 3: 2, 4: 0, 5: 2, 6: 1, 7: 0, 8: 0, 9: 1, 10: 1, 11: 1, 12: 0 },
    8: { 1: 6, 2: 0, 3: 1, 4: 0, 5: 0, 6: 1, 7: 0, 8: 0, 9: 2, 10: 2, 11: 1, 12: 0 },
    9: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 1, 6: 0, 7: 0, 8: 1, 9: 1, 10: 0, 11: 0, 12: 0 },
    10: { 1: 2, 2: 0, 3: 0, 4: 0, 5: 1, 6: 0, 7: 1, 8: 1, 9: 2, 10: 0, 11: 1, 12: 2 },
    11: { 1: 1, 2: 0, 3: 1, 4: 1, 5: 2, 6: 0, 7: 0, 8: 0, 9: 0, 10: 1, 11: 1, 12: 3 },
    12: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 6: 0, 7: 0, 8: 0, 9: 3, 10: 2, 11: 0, 12: 2 },
    13: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 1, 6: 2, 7: 1, 8: 0, 9: 2, 10: 3, 11: 0, 12: 0 },
    14: { 1: 0, 2: 1, 3: 0, 4: 0, 5: 0, 6: 1, 7: 1, 8: 0, 9: 0, 10: 1, 11: 0, 12: 0 },
    15: { 1: 1, 2: 1, 3: 0, 4: 0, 5: 1, 6: 1, 7: 0, 8: 0, 9: 1, 10: 0, 11: 0, 12: 0 },
    16: { 1: 3, 2: 1, 3: 0, 4: 0, 5: 0, 6: 1, 7: 0, 8: 0, 9: 1, 10: 1, 11: 0, 12: 2 },
    17: { 1: 4, 2: 1, 3: 0, 4: 0, 5: 1, 6: 1, 7: 1, 8: 1, 9: 2, 10: 0, 11: 0, 12: 1 },
    18: { 1: 4, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 1, 8: 0, 9: 1, 10: 0, 11: 0, 12: 1 },
    19: { 1: 1, 2: 2, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 3, 10: 0, 11: 2, 12: 1 },
    20: { 1: 0, 2: 1, 3: 0, 4: 0, 5: 1, 6: 0, 7: 3, 8: 2, 9: 5, 10: 2, 11: 0, 12: 1 },
    21: { 1: 4, 2: 1, 3: 1, 4: 0, 5: 0, 6: 0, 7: 1, 8: 1, 9: 3, 10: 1, 11: 0, 12: 2 },
    22: { 1: 3, 2: 0, 3: 0, 4: 1, 5: 0, 6: 2, 7: 0, 8: 1, 9: 2, 10: 1, 11: 1, 12: 1 },
    23: { 1: 4, 2: 0, 3: 0, 4: 2, 5: 1, 6: 0, 7: 1, 8: 0, 9: 3, 10: 0, 11: 1, 12: 2 },
    24: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 0, 6: 0, 7: 0, 8: 1, 9: 2, 10: 0, 11: 2, 12: 1 },
    25: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 6: 0, 7: 0, 8: 0, 9: 1, 10: 0, 11: 2, 12: 2 },
    26: { 1: 4, 2: 3, 3: 0, 4: 1, 5: 1, 6: 1, 7: 0, 8: 0, 9: 1, 10: 0, 11: 1, 12: 1 },
    27: { 1: 2, 2: 0, 3: 0, 4: 1, 5: 1, 6: 0, 7: 0, 8: 0, 9: 1, 10: 0, 11: 1, 12: 0 },
    28: { 1: 4, 2: 0, 3: 0, 4: 1, 5: 1, 6: 0, 7: 0, 8: 1, 9: 1, 10: 0, 11: 1, 12: 1 },
    29: { 1: 3, 2: 2, 3: 0, 4: 2, 5: 0, 6: 0, 7: 0, 8: 0, 9: 2, 10: 0, 11: 2, 12: 1 },
    30: { 1: 0, 2: 5, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1, 9: 1, 10: 1, 11: 0, 12: 2 },
    31: { 1: 2, 2: 0, 3: 1, 4: 2, 5: 2, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
  };

  const filterState = {
    selectedCells: new Set(),
    countries: new Set(),
    tribute: new Set(),
    gifts: new Set(),
    purpose: new Set(),
  };
  const FILTER_STORAGE_KEY = "hongwu-tribute-map-filter-state-v1";
  const FILTER_STATE_KEYS = ["selectedCells", "countries", "tribute", "gifts", "purpose"];

  let filterSilenceTimer = null;

  function readStoredFilterState() {
    try {
      const raw = global.localStorage?.getItem(FILTER_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch (error) {
      return null;
    }
  }

  function loadStoredFilterState() {
    const stored = readStoredFilterState();
    if (!stored) return;
    FILTER_STATE_KEYS.forEach((key) => {
      if (!Array.isArray(stored[key])) return;
      filterState[key].clear();
      stored[key].forEach((value) => {
        if (typeof value === "string" && value.trim()) {
          filterState[key].add(value);
        }
      });
    });
  }

  function persistFilterState() {
    try {
      const payload = {};
      FILTER_STATE_KEYS.forEach((key) => {
        payload[key] = Array.from(filterState[key]);
      });
      global.localStorage?.setItem(FILTER_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      // Storage can be unavailable in private or restricted file contexts.
    }
  }

  function getFilteredRecords() {
    return TRIBUTE_DATA.filter((record) => {
      if (filterState.selectedCells.size > 0 && !filterState.selectedCells.has(`${record.year}-${record.month}`)) return false;
      if (filterState.countries.size > 0 && !filterState.countries.has(record.countryId)) return false;

      if (filterState.tribute.size > 0 && !getTributeCategories(record).some((cat) => filterState.tribute.has(cat))) {
        return false;
      }
      if (filterState.gifts.size > 0 && !getGiftCategories(record).some((cat) => filterState.gifts.has(cat))) {
        return false;
      }
      if (filterState.purpose.size > 0 && !getPurposeCategories(record).some((cat) => filterState.purpose.has(cat))) {
        return false;
      }
      return true;
    });
  }

  function getFilteredCountryIds() {
    return new Set(getFilteredRecords().map((record) => record.countryId));
  }

  function scheduleFilteredAnimation(records) {
    global.clearTimeout(filterSilenceTimer);
    filterSilenceTimer = global.setTimeout(() => {
      global.dispatchEvent(new CustomEvent("tribute:silence", { detail: { records } }));
    }, 3000);
  }

  function getFilterTags() {
    const tags = [];
    if (filterState.selectedCells.size > 0) {
      tags.push(`已選${filterState.selectedCells.size}個年月`);
    }
    filterState.countries.forEach((id) => tags.push(COUNTRIES[id]?.name || id));
    filterState.tribute.forEach((cat) => tags.push(cat));
    filterState.gifts.forEach((cat) => tags.push(cat));
    filterState.purpose.forEach((cat) => tags.push(cat));
    return tags;
  }

  function updateResultBar(records, activeCountries) {
    const countEl = document.getElementById("result-count");
    const nationsEl = document.getElementById("result-nations");
    const tagsEl = document.getElementById("result-tags");

    countEl.textContent = String(records.length);
    nationsEl.textContent = String(activeCountries.size);
    const tags = getFilterTags();
    tagsEl.textContent = tags.join(" × ") || "全部記錄";
  }

  function onFilterChange() {
    persistFilterState();
    const filtered = getFilteredRecords();
    const activeCountries = new Set(filtered.map((record) => record.countryId));

    global.dispatchEvent(new CustomEvent("tribute:filter-change", { detail: { records: filtered } }));
    if (typeof global.stopCaravanAnimation === "function") {
      global.stopCaravanAnimation();
    }
    if (typeof global.renderTributeRecords === "function") {
      global.renderTributeRecords(filtered);
    }
    if (typeof global.renderHitLayer === "function") {
      global.renderHitLayer();
    }
    if (typeof global.updateCountryLabelsByRecords === "function") {
      global.updateCountryLabelsByRecords(filtered);
    }
    updateResultBar(filtered, activeCountries);
    scheduleFilteredAnimation(filtered);
  }

  function createPill(label, count, onClick) {
    const btn = document.createElement("button");
    const countSpan = document.createElement("span");
    btn.className = "filter-pill";
    btn.type = "button";
    btn.append(label);
    countSpan.className = "pill-count";
    countSpan.textContent = String(count);
    btn.appendChild(countSpan);
    btn.addEventListener("click", onClick);
    return btn;
  }

  function toggleSetValue(set, value, btnEl) {
    if (set.has(value)) {
      set.delete(value);
      btnEl.classList.remove("active");
    } else {
      set.add(value);
      btnEl.classList.add("active");
    }
  }

  function updateBadge(dim) {
    const badge = document.getElementById(`badge-${dim}`);
    if (!badge) return;
    const count = filterState[dim].size;
    badge.textContent = String(count);
    badge.style.display = count > 0 ? "inline" : "none";
  }

  function getHeatLevel(count) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    if (count <= 5) return 4;
    return 5;
  }

  function refreshYearLabelState(year) {
    const label = document.getElementById(`yr-label-${year}`);
    if (!label) return;
    const hasAny = Object.keys(HEATMAP_DATA[year] || {}).some((month) => filterState.selectedCells.has(`${year}-${Number(month)}`));
    label.classList.toggle("yr-active", hasAny);
  }

  function toggleCell(year, month, cellEl) {
    const key = `${year}-${month}`;
    if (filterState.selectedCells.has(key)) {
      filterState.selectedCells.delete(key);
      cellEl.classList.remove("cell-selected");
    } else {
      filterState.selectedCells.add(key);
      cellEl.classList.add("cell-selected");
    }
    refreshYearLabelState(year);
    onFilterChange();
  }

  function toggleYear(year) {
    const monthsWithData = [];
    for (let month = 1; month <= 12; month += 1) {
      if (HEATMAP_DATA[year] && HEATMAP_DATA[year][month] > 0) {
        monthsWithData.push(month);
      }
    }

    const allSelected = monthsWithData.length > 0 && monthsWithData.every((month) => filterState.selectedCells.has(`${year}-${month}`));
    monthsWithData.forEach((month) => {
      const key = `${year}-${month}`;
      const cellEl = document.getElementById(`cell-${key}`);
      if (allSelected) {
        filterState.selectedCells.delete(key);
        cellEl?.classList.remove("cell-selected");
      } else {
        filterState.selectedCells.add(key);
        cellEl?.classList.add("cell-selected");
      }
    });

    refreshYearLabelState(year);
    onFilterChange();
  }

  function initHeatmap() {
    const body = document.getElementById("heatmap-body");
    if (!body) return;
    body.innerHTML = "";

    for (let year = 2; year <= 31; year += 1) {
      const row = document.createElement("div");
      row.className = "heatmap-row";

      const yrLabel = document.createElement("span");
      yrLabel.className = "heatmap-yr-label";
      yrLabel.id = `yr-label-${year}`;
      yrLabel.textContent = `${year}年`;
      yrLabel.title = "點擊選整年";
      yrLabel.addEventListener("click", () => toggleYear(year));
      row.appendChild(yrLabel);

      for (let month = 1; month <= 12; month += 1) {
        const count = (HEATMAP_DATA[year] && HEATMAP_DATA[year][month]) || 0;
        const key = `${year}-${month}`;
        const cell = document.createElement("div");
        cell.className = `heatmap-cell heat-${getHeatLevel(count)}`;
        cell.id = `cell-${key}`;
        cell.dataset.year = String(year);
        cell.dataset.month = String(month);
        cell.title = `洪武${year}年${monthNames[month - 1]}：${count}條記錄`;

        if (count > 0) {
          cell.addEventListener("click", () => toggleCell(year, month, cell));
          if (filterState.selectedCells.has(key)) {
            cell.classList.add("cell-selected");
          }
        } else {
          cell.classList.add("cell-empty");
        }

        row.appendChild(cell);
      }

      body.appendChild(row);
      refreshYearLabelState(year);
    }
  }

  function clearAllFilters() {
    filterState.selectedCells.clear();
    document.querySelectorAll(".heatmap-cell.cell-selected").forEach((cell) => cell.classList.remove("cell-selected"));
    document.querySelectorAll(".heatmap-yr-label.yr-active").forEach((label) => label.classList.remove("yr-active"));

    filterState.countries.clear();
    filterState.tribute.clear();
    filterState.gifts.clear();
    filterState.purpose.clear();
    document.querySelectorAll(".filter-pill.active").forEach((pill) => pill.classList.remove("active"));
    ["countries", "tribute", "gifts", "purpose"].forEach(updateBadge);
    onFilterChange();
  }

  function setFilterPeriod(year, month) {
    filterState.selectedCells.clear();
    document.querySelectorAll(".heatmap-cell.cell-selected").forEach((cell) => cell.classList.remove("cell-selected"));
    document.querySelectorAll(".heatmap-yr-label.yr-active").forEach((label) => label.classList.remove("yr-active"));

    const key = `${Number(year)}-${Number(month)}`;
    const cell = document.getElementById(`cell-${key}`);
    filterState.selectedCells.add(key);
    cell?.classList.add("cell-selected");
    refreshYearLabelState(Number(year));
    onFilterChange();
  }

  function toggleFilterSection(name) {
    const section = document.getElementById(`sec-${name}`);
    const chevron = document.getElementById(`chev-${name}`);
    if (!section) return;
    section.hidden = !section.hidden;
    chevron?.classList.toggle("open", !section.hidden);
  }

  function togglePanel() {
    const panel = document.getElementById("filter-panel");
    const toggle = document.getElementById("filter-toggle");
    const collapseBtn = document.querySelector(".filter-collapse-btn");
    panel?.classList.toggle("collapsed");
    toggle?.classList.toggle("collapsed");
    if (toggle) {
      const isCollapsed = panel?.classList.contains("collapsed");
      toggle.textContent = isCollapsed ? "篩選 ▶" : "◀";
      toggle.setAttribute("aria-label", isCollapsed ? "展開篩選面板" : "折疊篩選面板");
      if (collapseBtn) {
        collapseBtn.textContent = isCollapsed ? "展開" : "收起";
      }
    }
  }

  function createCountryPills() {
    const regionGroups = {
      northeast: ["goryeo", "joseon", "japan"],
      ryukyu: ["ryukyu_chuzan", "ryukyu_sannan", "ryukyu_hokuzan"],
      "sea-mainland": ["siam", "annam", "champa", "cambodia"],
      "sea-island": ["java", "java_east", "java_west", "srivijaya", "brunei", "xiyang", "soli", "fulin", "lambri", "timor", "pahang", "baihua", "jawa", "samudra"],
    };

    Object.entries(regionGroups).forEach(([region, ids]) => {
      const container = document.getElementById(`pills-${region}`);
      if (!container) return;
      ids.forEach((id) => {
        const country = COUNTRIES[id];
        if (!country) return;
        const count = TRIBUTE_DATA.filter((record) => record.countryId === id).length;
        if (count === 0) return;
        const pill = createPill(country.name, count, () => {
          toggleSetValue(filterState.countries, id, pill);
          updateBadge("countries");
          onFilterChange();
        });
        if (filterState.countries.has(id)) {
          pill.classList.add("active");
        }
        container.appendChild(pill);
      });
    });
  }

  function createCategoryPills(containerId, categories, stateKey, matcher, badgeKey = stateKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    Object.entries(categories).forEach(([category, keywords]) => {
      const count = TRIBUTE_DATA.filter((record) => matcher(record, keywords)).length;
      const pill = createPill(category, count, () => {
        toggleSetValue(filterState[stateKey], category, pill);
        updateBadge(badgeKey);
        onFilterChange();
      });
      if (filterState[stateKey].has(category)) {
        pill.classList.add("active");
      }
      container.appendChild(pill);
    });
  }

  function initFilterPanel() {
    loadStoredFilterState();
    createCountryPills();
    createCategoryPills("pills-tribute", TRIBUTE_CATEGORIES, "tribute", (record, keywords) => global.matchesCategory(record.tributeRaw, keywords));
    createCategoryPills("pills-gifts", GIFT_CATEGORIES, "gifts", (record, keywords) => global.matchesCategory(record.giftsRaw, keywords));
    createCategoryPills("pills-purpose", PURPOSE_CATEGORIES, "purpose", (record, keywords) => global.matchesCategory(record.purpose, keywords));
    initHeatmap();
    ["countries", "tribute", "gifts", "purpose"].forEach(updateBadge);
    onFilterChange();
  }

  global.filterState = filterState;
  global.getFilteredRecords = getFilteredRecords;
  global.getFilteredCountryIds = getFilteredCountryIds;
  global.onFilterChange = onFilterChange;
  global.clearAllFilters = clearAllFilters;
  global.setFilterPeriod = setFilterPeriod;
  global.toggleFilterSection = toggleFilterSection;
  global.togglePanel = togglePanel;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFilterPanel);
  } else {
    initFilterPanel();
  }
})(window);
