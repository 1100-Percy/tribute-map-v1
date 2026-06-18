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
  const filterState = {
    years: new Set(),
    months: new Set(),
    countries: new Set(),
    tribute: new Set(),
    gifts: new Set(),
    purpose: new Set(),
  };
  const appliedFilterState = {
    years: new Set(),
    months: new Set(),
    countries: new Set(),
    tribute: new Set(),
    gifts: new Set(),
    purpose: new Set(),
  };
  const filterDimensions = ["years", "months", "countries", "tribute", "gifts", "purpose"];

  let filterSilenceTimer = null;
  let hasAppliedFilters = false;

  function getGregorianYear(year) {
    return Number(year) + 1367;
  }

  function formatGregorianSummary() {
    const years = Array.from(filterState.years).sort((a, b) => a - b);
    if (years.length === 0) return "";
    const gregorianYears = years.map(getGregorianYear);
    if (gregorianYears.length === 1) {
      return `（公元${gregorianYears[0]}年）`;
    }
    if (gregorianYears.length <= 3) {
      return `（公元${gregorianYears.join("、")}年）`;
    }
    return `（公元${gregorianYears[0]}-${gregorianYears[gregorianYears.length - 1]}年）`;
  }

  function getRecordsForState(state) {
    return TRIBUTE_DATA.filter((record) => {
      if (state.years.size > 0 && !state.years.has(record.year)) return false;
      if (state.months.size > 0 && !state.months.has(record.month)) return false;
      if (state.countries.size > 0 && !state.countries.has(record.countryId)) return false;

      if (state.tribute.size > 0 && !getTributeCategories(record).some((cat) => state.tribute.has(cat))) {
        return false;
      }
      if (state.gifts.size > 0 && !getGiftCategories(record).some((cat) => state.gifts.has(cat))) {
        return false;
      }
      if (state.purpose.size > 0 && !getPurposeCategories(record).some((cat) => state.purpose.has(cat))) {
        return false;
      }
      return true;
    });
  }

  function getFilteredRecords() {
    return hasAppliedFilters ? getRecordsForState(appliedFilterState) : [];
  }

  function getDraftFilteredRecords() {
    return getRecordsForState(filterState);
  }

  function getFilteredCountryIds() {
    return new Set(getFilteredRecords().map((record) => record.countryId));
  }

  function copyFilterState(source, target) {
    filterDimensions.forEach((dimension) => {
      target[dimension].clear();
      source[dimension].forEach((value) => target[dimension].add(value));
    });
  }

  function setEquals(left, right) {
    if (left.size !== right.size) return false;
    return Array.from(left).every((value) => right.has(value));
  }

  function hasPendingChanges() {
    if (!hasAppliedFilters) return true;
    return filterDimensions.some((dimension) => !setEquals(filterState[dimension], appliedFilterState[dimension]));
  }

  function scheduleFilteredAnimation(records) {
    global.clearTimeout(filterSilenceTimer);
    filterSilenceTimer = global.setTimeout(() => {
      global.dispatchEvent(new CustomEvent("tribute:silence", { detail: { records } }));
    }, 3000);
  }

  function getStateTags(state) {
    const tags = [];
    if (state.years.size > 0) {
      const years = Array.from(state.years).sort((a, b) => a - b);
      tags.push(years.length <= 2 ? years.map((year) => `洪武${year}年`).join("、") : `已選${years.length}年`);
    }
    if (state.months.size > 0) {
      const months = Array.from(state.months).sort((a, b) => a - b);
      tags.push(months.length <= 2 ? months.map((month) => monthNames[month - 1]).join("、") : `已選${months.length}月`);
    }
    state.countries.forEach((id) => tags.push(COUNTRIES[id]?.name || id));
    state.tribute.forEach((cat) => tags.push(cat));
    state.gifts.forEach((cat) => tags.push(cat));
    state.purpose.forEach((cat) => tags.push(cat));
    return tags;
  }

  function updateResultBar(records, activeCountries) {
    const countEl = document.getElementById("result-count");
    const nationsEl = document.getElementById("result-nations");
    const tagsEl = document.getElementById("result-tags");

    countEl.textContent = String(records.length);
    nationsEl.textContent = String(activeCountries.size);
    const tags = getStateTags(appliedFilterState);
    tagsEl.textContent = hasAppliedFilters ? tags.join(" × ") || "全部記錄" : "請在左側選擇後點擊應用";
  }

  function updateDraftSummary() {
    const draftRecords = getDraftFilteredRecords();
    const draftCountries = new Set(draftRecords.map((record) => record.countryId));
    const readout = document.getElementById("draft-result-count");
    const state = document.getElementById("filter-apply-state");
    const applyBtn = document.getElementById("filter-apply-btn");
    const pending = hasPendingChanges();

    if (readout) {
      readout.textContent = `${draftRecords.length} 條 · ${draftCountries.size} 國`;
    }
    if (state) {
      state.textContent = !hasAppliedFilters ? "選好後點擊應用" : pending ? "有未套用選項" : "已套用目前選項";
    }
    if (applyBtn) {
      applyBtn.classList.toggle("is-pending", pending);
      applyBtn.disabled = !pending;
    }
  }

  function renderAppliedFilters() {
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

  function applyFilters() {
    copyFilterState(filterState, appliedFilterState);
    hasAppliedFilters = true;
    renderAppliedFilters();
    updateDraftSummary();
  }

  function onFilterChange() {
    updateDraftSummary();
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

  function updatePickerLabel(type) {
    const label = document.getElementById(`${type}-label`);
    if (!label) return;

    if (type === "yr") {
      const years = Array.from(filterState.years).sort((a, b) => a - b);
      label.textContent = years.length === 0 ? "選擇年份" : years.length <= 2 ? years.map((year) => `${year}年`).join("、") : `已選 ${years.length} 年`;
      label.classList.toggle("picker-selected", years.length > 0);
      updateGregorianLabel();
      return;
    }

    const months = Array.from(filterState.months).sort((a, b) => a - b);
    label.textContent = months.length === 0 ? "選擇月份" : months.length <= 2 ? months.map((month) => monthNames[month - 1]).join("、") : `已選 ${months.length} 月`;
    label.classList.toggle("picker-selected", months.length > 0);
  }

  function updateGregorianLabel() {
    const label = document.getElementById("time-gregorian-label");
    if (!label) return;
    label.textContent = formatGregorianSummary();
  }

  function updateBadge(dim) {
    const badge = document.getElementById(`badge-${dim}`);
    if (!badge) return;
    const count = filterState[dim].size;
    badge.textContent = String(count);
    badge.style.display = count > 0 ? "inline" : "none";
  }

  function syncYearButtons() {
    document.querySelectorAll(".yr-pill").forEach((btn, index) => {
      btn.classList.toggle("active", filterState.years.has(index + 2));
    });
    updatePickerLabel("yr");
  }

  function syncMonthButtons() {
    document.querySelectorAll(".mo-pill").forEach((btn, index) => {
      btn.classList.toggle("active", filterState.months.has(index + 1));
    });
    updatePickerLabel("mo");
  }

  function clearAllFilters() {
    Object.values(filterState).forEach((set) => set.clear());
    document.querySelectorAll(".filter-pill.active, .yr-pill.active, .mo-pill.active").forEach((el) => el.classList.remove("active"));
    updatePickerLabel("yr");
    updatePickerLabel("mo");
    ["countries", "tribute", "gifts", "purpose"].forEach(updateBadge);
    onFilterChange();
  }

  function setFilterPeriod(year, month) {
    filterState.years.clear();
    filterState.months.clear();
    filterState.years.add(Number(year));
    filterState.months.add(Number(month));
    syncYearButtons();
    syncMonthButtons();
    applyFilters();
  }

  function toggleDrop(type) {
    const drop = document.getElementById(`${type}-drop`);
    const btn = document.getElementById(`${type}-btn`);
    const other = type === "yr" ? "mo" : "yr";
    document.getElementById(`${other}-drop`)?.classList.remove("show");
    document.getElementById(`${other}-btn`)?.classList.remove("open");
    drop?.classList.toggle("show");
    btn?.classList.toggle("open");
  }

  function selectAllYears() {
    const allSelected = filterState.years.size === 30;
    filterState.years.clear();
    if (!allSelected) {
      for (let year = 2; year <= 31; year += 1) filterState.years.add(year);
    }
    syncYearButtons();
    onFilterChange();
  }

  function selectAllMonths() {
    const allSelected = filterState.months.size === 12;
    filterState.months.clear();
    if (!allSelected) {
      for (let month = 1; month <= 12; month += 1) filterState.months.add(month);
    }
    syncMonthButtons();
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

  function createYearButtons() {
    const grid = document.getElementById("yr-grid");
    for (let year = 2; year <= 31; year += 1) {
      const btn = document.createElement("button");
      btn.className = "yr-pill";
      btn.type = "button";
      btn.textContent = `${year}年`;
      btn.addEventListener("click", () => {
        toggleSetValue(filterState.years, year, btn);
        updatePickerLabel("yr");
        onFilterChange();
      });
      grid.appendChild(btn);
    }
  }

  function createMonthButtons() {
    const grid = document.getElementById("mo-grid");
    for (let month = 1; month <= 12; month += 1) {
      const btn = document.createElement("button");
      btn.className = "mo-pill";
      btn.type = "button";
      btn.textContent = monthNames[month - 1];
      btn.addEventListener("click", () => {
        toggleSetValue(filterState.months, month, btn);
        updatePickerLabel("mo");
        onFilterChange();
      });
      grid.appendChild(btn);
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
      container.appendChild(pill);
    });
  }

  function closePickersOnOutsideClick() {
    document.addEventListener("click", (event) => {
      if (event.target.closest(".picker-box")) return;
      document.querySelectorAll(".picker-drop").forEach((drop) => drop.classList.remove("show"));
      document.querySelectorAll(".picker-btn").forEach((btn) => btn.classList.remove("open"));
    });
  }

  function initFilterPanel() {
    createYearButtons();
    createMonthButtons();
    createCountryPills();
    createCategoryPills("pills-tribute", TRIBUTE_CATEGORIES, "tribute", (record, keywords) => global.matchesCategory(record.tributeRaw, keywords));
    createCategoryPills("pills-gifts", GIFT_CATEGORIES, "gifts", (record, keywords) => global.matchesCategory(record.giftsRaw, keywords));
    createCategoryPills("pills-purpose", PURPOSE_CATEGORIES, "purpose", (record, keywords) => global.matchesCategory(record.purpose, keywords));
    closePickersOnOutsideClick();
    copyFilterState(filterState, appliedFilterState);
    renderAppliedFilters();
    updateDraftSummary();
  }

  global.filterState = filterState;
  global.appliedFilterState = appliedFilterState;
  global.getFilteredRecords = getFilteredRecords;
  global.getDraftFilteredRecords = getDraftFilteredRecords;
  global.getFilteredCountryIds = getFilteredCountryIds;
  global.onFilterChange = onFilterChange;
  global.applyFilters = applyFilters;
  global.renderAppliedFilters = renderAppliedFilters;
  global.clearAllFilters = clearAllFilters;
  global.setFilterPeriod = setFilterPeriod;
  global.toggleDrop = toggleDrop;
  global.selectAllYears = selectAllYears;
  global.selectAllMonths = selectAllMonths;
  global.toggleFilterSection = toggleFilterSection;
  global.togglePanel = togglePanel;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFilterPanel);
  } else {
    initFilterPanel();
  }
})(window);
