/**
 * 初始化全域時間格式化器
 * 它會掃描所有帶有 data-time 屬性的元素，並將其內容轉換為用戶本地時區的格式。
 */
export function initTimeFormatter() {
  function formatLocalTimes() {
    const elements = document.querySelectorAll("[data-time]");
    elements.forEach((el) => {
      const time = el.getAttribute("data-time");
      const format = el.getAttribute("data-format");
      if (!time) return;

      const date = new Date(time);
      const lang = navigator.language || "zh-TW";

      if (format === "short") {
        el.textContent = new Intl.DateTimeFormat(lang, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(date);
      } else {
        el.textContent = new Intl.DateTimeFormat(lang, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(date);
      }
    });
  }

  // 初次執行
  formatLocalTimes();

  // 監聽 Astro 頁面切換事件（處理無刷新跳轉）
  document.addEventListener("astro:after-swap", formatLocalTimes);
}
