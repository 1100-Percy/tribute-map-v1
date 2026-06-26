(function (global) {
  "use strict";

  const STORAGE_KEY = "hongwu-tribute-map-font-size-v1";
  const SIZE_OPTIONS = {
    small: { label: "小", scale: 0.9 },
    medium: { label: "中", scale: 1 },
    large: { label: "大", scale: 1.18 },
  };
  const FONT_BASE_SIZES = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 28, 30, 34, 46];

  let currentSize = "medium";

  function readStoredSize() {
    try {
      const stored = global.localStorage?.getItem(STORAGE_KEY);
      return Object.prototype.hasOwnProperty.call(SIZE_OPTIONS, stored) ? stored : "medium";
    } catch (_error) {
      return "medium";
    }
  }

  function storeSize(size) {
    try {
      global.localStorage?.setItem(STORAGE_KEY, size);
    } catch (_error) {
      // Storage can be unavailable in private or local file contexts.
    }
  }

  function roundedPx(value) {
    return `${Math.round(value * 10) / 10}px`;
  }

  function applyFontVariables(scale) {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--font-scale", String(scale));
    FONT_BASE_SIZES.forEach((size) => {
      rootStyle.setProperty(`--fs-${size}`, roundedPx(size * scale));
    });
  }

  function refreshControls() {
    document.querySelectorAll("[data-font-size-option]").forEach((button) => {
      const isActive = button.dataset.fontSizeOption === currentSize;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function applyFontSize(size, shouldStore = true) {
    currentSize = Object.prototype.hasOwnProperty.call(SIZE_OPTIONS, size) ? size : "medium";
    const scale = SIZE_OPTIONS[currentSize].scale;

    document.documentElement.dataset.fontSize = currentSize;
    applyFontVariables(scale);
    refreshControls();

    if (shouldStore) {
      storeSize(currentSize);
    }

    global.dispatchEvent(new CustomEvent("fontSizeChange", { detail: { size: currentSize, scale } }));
  }

  function injectAnalysisOverrides() {
    if (!global.location.pathname.includes("/analysis/")) return;
    document.documentElement.classList.add("analysis-font-page");

    if (document.getElementById("font-size-analysis-overrides")) return;
    const style = document.createElement("style");
    style.id = "font-size-analysis-overrides";
    style.textContent = `
      html.analysis-font-page .back-link { font-size: var(--fs-14, 14px); }
      html.analysis-font-page h1 { font-size: clamp(var(--fs-30, 30px), 5vw, var(--fs-46, 46px)); overflow-wrap: anywhere; }
      html.analysis-font-page h2 { font-size: var(--fs-21, 21px); }
      html.analysis-font-page h3 { font-size: var(--fs-17, 17px); }
      html.analysis-font-page .subtitle { font-size: var(--fs-15, 15px); }
      html.analysis-font-page .note,
      html.analysis-font-page .control-label,
      html.analysis-font-page .legend,
      html.analysis-font-page .field,
      html.analysis-font-page .tooltip,
      html.analysis-font-page .metric-note,
      html.analysis-font-page .axis-note { font-size: var(--fs-13, 13px); }
      html.analysis-font-page button,
      html.analysis-font-page select,
      html.analysis-font-page output,
      html.analysis-font-page .mode-btn { font-size: var(--fs-14, 14px); min-height: calc(34px + (var(--font-scale, 1) - 1) * 14px); }
      html.analysis-font-page .rank-card,
      html.analysis-font-page .badge,
      html.analysis-font-page .legend-item,
      html.analysis-font-page .stat-card,
      html.analysis-font-page .country-card,
      html.analysis-font-page .period-card,
      html.analysis-font-page .phase-card,
      html.analysis-font-page .insight-card { font-size: var(--fs-13, 13px); }
      html.analysis-font-page .section-head,
      html.analysis-font-page .toolbar,
      html.analysis-font-page .period-grid,
      html.analysis-font-page .summary-grid,
      html.analysis-font-page .card-grid,
      html.analysis-font-page .ranking { align-items: stretch; }
      @media (max-width: 760px) {
        html.analysis-font-page .section-head,
        html.analysis-font-page .toolbar { display: flex; flex-direction: column; align-items: flex-start; }
      }
    `;
    document.head.appendChild(style);
  }

  function initFontControls() {
    injectAnalysisOverrides();
    document.querySelectorAll("[data-font-size-option]").forEach((button) => {
      button.addEventListener("click", () => applyFontSize(button.dataset.fontSizeOption));
    });
    refreshControls();
  }

  currentSize = readStoredSize();
  applyFontSize(currentSize, false);

  global.getFontScale = function () {
    return SIZE_OPTIONS[currentSize].scale;
  };
  global.getFontSizeChoice = function () {
    return currentSize;
  };
  global.setFontSizeChoice = applyFontSize;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFontControls);
  } else {
    initFontControls();
  }
})(window);
