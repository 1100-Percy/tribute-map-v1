(function (global) {
  "use strict";

  const { COUNTRIES } = global;
  const hitLayer = document.getElementById("hit-layer");

  function renderHitLayer() {
    // Country navigation lives on text labels so overlapping island dots remain unambiguous.
    hitLayer.textContent = "";
  }

  function updateCountryLabels(year, month) {
    const counts = global.getRecordCountsByCountry(year, month);
    document.querySelectorAll(".country-label[data-country-id]").forEach((label) => {
      const countryId = label.dataset.countryId;
      const baseName = COUNTRIES[countryId].name;
      const count = counts[countryId] || 0;
      label.classList.toggle("is-active", count > 0);
      label.textContent = baseName;
      if (count > 0) {
        const badge = document.createElement("span");
        badge.className = "record-count";
        badge.textContent = `${count}次`;
        label.appendChild(badge);
      }
    });
  }

  global.renderHitLayer = renderHitLayer;
  global.updateCountryLabels = updateCountryLabels;
})(window);
