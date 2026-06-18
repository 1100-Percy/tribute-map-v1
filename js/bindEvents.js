(function (global) {
  "use strict";

  let resizeTimer = null;

  function renderPeriod(year, month) {
    if (typeof global.setFilterPeriod === "function") {
      global.setFilterPeriod(Number(year), Number(month));
      return;
    }

    if (typeof global.renderTributePoints === "function") {
      global.renderTributePoints(Number(year), Number(month));
    }
    if (typeof global.renderHitLayer === "function") {
      global.renderHitLayer();
    }
    if (typeof global.updateCountryLabels === "function") {
      global.updateCountryLabels(Number(year), Number(month));
    }
  }

  function handleResize() {
    global.clearTimeout(resizeTimer);
    resizeTimer = global.setTimeout(() => {
      if (typeof global.renderAppliedFilters === "function") {
        global.renderAppliedFilters();
      }
    }, 120);
  }

  global.addEventListener("resize", handleResize);

  global.renderTimelineYear = (year) => renderPeriod(year, 1);
  global.renderTimelinePeriod = renderPeriod;
})(window);
