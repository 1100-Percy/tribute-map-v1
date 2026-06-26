(function () {
  "use strict";

  function initAnalysisMenu() {
    const toggle = document.getElementById("analysis-menu-toggle");
    const list = document.getElementById("analysis-menu-list");
    const entries = document.querySelectorAll(".analysis-entry");

    if (!toggle || !list) return;

    function setMenuOpen(isOpen) {
      list.hidden = !isOpen;
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "收起分析入口" : "展開分析入口");
    }

    toggle.addEventListener("click", () => {
      setMenuOpen(list.hidden);
    });

    entries.forEach((entry) => {
      entry.addEventListener("click", () => {
        const target = entry.dataset.src;
        if (target) {
          window.location.assign(target);
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnalysisMenu);
  } else {
    initAnalysisMenu();
  }
})();
