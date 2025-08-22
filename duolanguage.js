// Render API URL
const API_URL = "https://duo-language.onrender.com";

// 存資料
let translations = {};

// 定義需要翻譯的文字元素
const translatableElements = {
  // 搜尋功能
  "search-label": { zh: "輸入關鍵字", en: "Enter keywords" },
  "search-button": { zh: "搜尋", en: "Search" },
  "search-link": { zh: "搜尋", en: "Search" },

  // 攤商名單區塊
  "exhibitors-title": { zh: "攤商名單", en: "Exhibitors" },
  "exhibitors-description": {
    zh: "探索來自各地的創意攤商與藝術家",
    en: "Discover creative vendors and artists from around the world",
  },
  "location-title": { zh: "活動地點", en: "Event Location" },
  "exhibitor-info-title": { zh: "攤商資訊", en: "Exhibitors" },

  // 活動資訊區塊
  "program-title": { zh: "活動資訊", en: "Program Information" },

  // 關於我們區塊
  "about-title": { zh: "關於草率季", en: "About Taipei Art Book Fair" },

  "about-main-text": {
    zh: "草率季是一個結合藝術創作與互動手作的年度展覽活動，歡迎所有參與者探索與創造。我們致力於為藝術家、創作者與觀眾搭建交流平台，讓創意在此綻放。",
    en: "Taipei Art Book Fair is an annual exhibition event combining artistic creation and interactive handcraft, welcoming all participants to explore and create. We are committed to building a communication platform for artists, creators and audiences, letting creativity bloom here.",
  },

  // 聯絡我們區塊
  "contact-title": { zh: "聯絡我們", en: "Contact Us" },
  "phone-label": { zh: "電話:", en: "Phone:" },
  "address-label": { zh: "地址:", en: "Address:" },
  "address-value": {
    zh: "台北市信義區信義路五段7號",
    en: "No. 7, Sec. 5, Xinyi Rd., Xinyi Dist., Taipei City",
  },
};

// 抓資料
fetch(API_URL)
  .then((res) => res.json())
  .then((data) => {
    // 假設 API 回傳 [{zh: "...", en: "..."}, ...]
    // 我們這裡簡單拿第一筆資料示範
    translations = data[0];
    updateText("zh"); // 預設中文
  })
  .catch((err) => {
    console.error("抓 API 失敗", err);
    // 如果 API 失敗，使用本地翻譯
    translations = data[0] || translatableElements;
    updateText("zh");
  });

// 切換文字
function updateText(lang) {
  // 更新所有可翻譯的元素
  Object.keys(translatableElements).forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      if (lang === "zh") {
        element.innerHTML = translatableElements[id].zh;
      } else {
        element.innerHTML = translatableElements[id].en;
      }
    }
  });

  // 更新頁面語言屬性
  document.documentElement.lang = lang === "zh" ? "zh-TW" : "en";

  // 觸發自定義事件，通知其他腳本語言已更新
  window.dispatchEvent(
    new CustomEvent("languageChanged", { detail: { language: lang } })
  );
}

// 等待 DOM 加載完成後初始化
document.addEventListener("DOMContentLoaded", function () {
  // 初始化頁面語言
  updateText("zh");
});
