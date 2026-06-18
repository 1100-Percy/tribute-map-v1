(function (global) {
  "use strict";

  const yearSlider = document.getElementById("year-slider");
  const monthSlider = document.getElementById("month-slider");
  const currentYearLabel = document.getElementById("current-year-label");
  const currentMonthLabel = document.getElementById("current-month-label");
  const gregorianYearLabel = document.getElementById("gregorian-year-label");
  const activeCountryCount = document.getElementById("active-country-count");
  const activeCountryList = document.getElementById("active-country-list");

  let currentYear = Number(yearSlider.value);
  let currentMonth = Number(monthSlider.value);
  let silenceTimer = null;

  const chineseNumbers = {
    1: "一",
    2: "二",
    3: "三",
    4: "四",
    5: "五",
    6: "六",
    7: "七",
    8: "八",
    9: "九",
    10: "十",
    11: "十一",
    12: "十二",
    13: "十三",
    14: "十四",
    15: "十五",
    16: "十六",
    17: "十七",
    18: "十八",
    19: "十九",
    20: "二十",
    21: "二十一",
    22: "二十二",
    23: "二十三",
    24: "二十四",
    25: "二十五",
    26: "二十六",
    27: "二十七",
    28: "二十八",
    29: "二十九",
    30: "三十",
    31: "三十一",
  };

  function scheduleSilenceTimer() {
    global.clearTimeout(silenceTimer);
    silenceTimer = global.setTimeout(() => {
      global.dispatchEvent(new CustomEvent("tribute:silence", { detail: { year: currentYear, month: currentMonth } }));
    }, 3000);
  }

  function interruptAnimation() {
    global.dispatchEvent(new CustomEvent("tribute:interrupt", { detail: { year: currentYear, month: currentMonth } }));
  }

  function updateReadout(year, month) {
    const records = global.getRecordsByPeriod(year, month);
    const activeIds = global.getActiveCountryIds(year, month);
    const countryNames = Array.from(activeIds).map((id) => global.COUNTRIES[id].name);

    currentYearLabel.textContent = `洪武${chineseNumbers[year]}年`;
    currentMonthLabel.textContent = `${chineseNumbers[month]}月`;
    gregorianYearLabel.textContent = `${year + 1367}年`;
    activeCountryCount.textContent = `${activeIds.size}國遣使`;
    activeCountryList.textContent = countryNames.length ? countryNames.join("、") : "本月無遣使記錄";
    activeCountryList.title = `${records.length}條記錄：${countryNames.join("、")}`;
  }

  function renderPeriod(year, month) {
    currentYear = Number(year);
    currentMonth = Number(month);
    yearSlider.value = String(currentYear);
    monthSlider.value = String(currentMonth);
    updateReadout(currentYear, currentMonth);
    global.renderTributePoints(currentYear, currentMonth);
    global.renderHitLayer();
    global.updateCountryLabels(currentYear, currentMonth);
    scheduleSilenceTimer();
  }

  function handleResize() {
    global.clearTimeout(silenceTimer);
    global.setTimeout(() => renderPeriod(currentYear, currentMonth), 120);
  }

  function initTimeline() {
    yearSlider.addEventListener("input", (event) => {
      interruptAnimation();
      renderPeriod(Number(event.target.value), currentMonth);
    });
    monthSlider.addEventListener("input", (event) => {
      interruptAnimation();
      renderPeriod(currentYear, Number(event.target.value));
    });
    global.addEventListener("resize", handleResize);
    renderPeriod(currentYear, currentMonth);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTimeline);
  } else {
    initTimeline();
  }

  global.renderTimelineYear = (year) => renderPeriod(year, currentMonth);
  global.renderTimelinePeriod = renderPeriod;
})(window);
