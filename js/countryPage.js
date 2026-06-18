(function (global) {
  "use strict";

  const { COUNTRIES, TRIBUTE_DATA } = global;
  const params = new URLSearchParams(global.location.search);
  const countryId = params.get("id");
  const country = COUNTRIES[countryId];

  const title = document.getElementById("country-title");
  const subtitle = document.getElementById("country-subtitle");
  const summary = document.getElementById("country-summary");
  const timeline = document.getElementById("tribute-timeline");
  const timelineCount = document.getElementById("timeline-count");

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

  function escapeHtml(value) {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    return String(value).replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[char];
    });
  }

  function formatHongwu(record) {
    const year = chineseNumbers[record.year] || record.year;
    const month = record.month ? `${record.month}月${record.isLeapMonth ? "（閏）" : ""}` : "月次未詳";
    return `洪武${year}年 ${month}`;
  }

  function sortRecords(records) {
    return records.slice().sort((a, b) => a.year - b.year || a.monthSort - b.monthSort || a.sourceRow - b.sourceRow);
  }

  function getCountryRecords() {
    return sortRecords(TRIBUTE_DATA.filter((record) => record.countryId === countryId));
  }

  function renderMissing() {
    title.textContent = "未找到藩國";
    subtitle.textContent = "請返回地圖，從藩國名稱進入。";
    summary.innerHTML = "";
    timeline.innerHTML = '<p class="empty-state">此頁缺少有效的藩國 id。</p>';
    timelineCount.textContent = "";
  }

  function renderSummary(records) {
    const years = records.map((record) => record.year);
    const firstYear = Math.min(...years);
    const lastYear = Math.max(...years);
    const envoyCount = records.filter((record) => record.envoy).length;
    const tributeKinds = new Set(records.flatMap((record) => (record.tributeCategories.length ? record.tributeCategories : ["misc"])));

    summary.innerHTML = `
      <article>
        <span>記錄總數</span>
        <strong>${records.length}</strong>
      </article>
      <article>
        <span>洪武年份</span>
        <strong>${firstYear}-${lastYear}</strong>
      </article>
      <article>
        <span>使者記錄</span>
        <strong>${envoyCount}</strong>
      </article>
      <article>
        <span>貢物類別</span>
        <strong>${tributeKinds.size}</strong>
      </article>
    `;
  }

  function renderTimeline(records) {
    timelineCount.textContent = `${records.length}條記錄`;
    if (!records.length) {
      timeline.innerHTML = '<p class="empty-state">此藩國暫無朝貢記錄。</p>';
      return;
    }

    timeline.innerHTML = records
      .map((record) => {
        return `
          <article class="timeline-entry">
            <div class="timeline-date">
              <strong>${escapeHtml(formatHongwu(record))}</strong>
              <span>${record.gregorianYear}年</span>
            </div>
            <div class="timeline-card">
              ${record.king ? `<p><b>國王</b>${escapeHtml(record.king)}</p>` : ""}
              ${record.envoy ? `<p><b>使者</b>${escapeHtml(record.envoy)}</p>` : ""}
              ${record.purpose ? `<p><b>事由</b>${escapeHtml(record.purpose)}</p>` : ""}
              <p><b>貢物</b>${escapeHtml(record.tributeRaw || "方物")}</p>
              ${record.giftsRaw ? `<p><b>回賜</b>${escapeHtml(record.giftsRaw)}</p>` : ""}
              ${record.source ? `<cite>${escapeHtml(record.source)}</cite>` : ""}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderPage() {
    if (!country) {
      renderMissing();
      return;
    }

    const records = getCountryRecords();
    title.textContent = country.name;
    document.title = `${country.name} · 藩國朝貢記錄`;
    subtitle.textContent = `${country.nameEn || ""}${country.note ? ` · ${country.note}` : ""}`;
    renderSummary(records);
    renderTimeline(records);
  }

  renderPage();

  global.renderCountryTimeline = renderTimeline;
})(window);
