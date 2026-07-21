/*
 * 台北藝術書展 - 日曆系統使用說明（操作手冊）
 * =================================================
 *
 * 快速上手
 * 1. 修改日曆與金鑰
 *    - 把下面的 calendarId 和 apiKey 改為你的 Google Calendar ID 與 API Key。
 *    - Calendar ID：從 Google Calendar → 設定 → 日曆整合 取得「日曆 ID」。
 *    - API Key：到 Google Cloud Console 建立 API Key，啟用 Google Calendar API。
 *
 * 2. 活動描述格式（放在 Google Calendar event 的 description）
 *    - 每個欄位以 "KEY: value" 換行書寫，支援多行欄位（冒號後續行會合併）。
 *    - 範例：
 *        SIGNUP: https://example.com/signup
 *        IMAGE: my-image.jpg
 *        DESCRIPTION: 這是一個精彩的講座，詳情在此
 *        TYPE: TALK
 *
 *    - 支援 KEY：
 *        SIGNUP     -> 報名連結（會變成按鈕）
 *        IMAGE      -> 本地或遠端圖片檔名/路徑（預設載入 image/programIMG/<IMAGE>）
 *        DESCRIPTION-> 活動說明
 *        TYPE       -> 活動類型（影響顏色與是否在卡片中顯示）
 *
 *    - 支援 TYPE 值（區分大小寫不敏感）：
 *        TALK, WORKSHOP, PERFORMANCE, EXHIBITION
 *      （未填 TYPE 的活動會被卡片模式過濾掉）
 *
 * 3. 如何新增活動圖片與資源
 *    - 若在 description 的 IMAGE 欄位使用檔名，請把檔案放到專案的 image/programIMG/ 下，或改程式使用完整 URL。
 *
 * 4. 切換顯示模式與時間範圍
 *    - 卡片模式（預設）：向 API 抓取「過去約一年」至「未來約一年」的活動（upcomingUrl）。
 *      畫面優先顯示「今天起有填 TYPE 的即將舉辦」；若沒有，改顯示「最近 5 筆」已結束或可見的 TYPE 活動，避免區塊空白。
 *    - 時間軸模式：目前程式會以固定三天（範例為 2025/11/21–23）渲染甘特圖。
 *      若要改天數或範圍，修改 eventStartDate / eventEndDate 變數。
 *
 * 5. 時區注意事項
 *    - 程式以「Asia/Taipei」格式化與比較日期，避免時區偏差。
 *    - Google Calendar 回傳的 date/time 仍會根據 event 的 timeZone，請用 Intl.formatToParts 或 toLocaleString 指定時區。
 *
 * 6. 診斷與測試
 *    - console.log 已在多處加入，遇到無法顯示或時間錯誤，打開瀏覽器開發者工具查看 console。
 *    - 若圖片沒有顯示，確認 image/programIMG/<IMAGE> 路徑正確或 description 中使用完整 URL。
 *
 * 7. 部署與安全
 *    - 前端直接放 API Key 會被看到；建議正式環境用後端 proxy 或在伺服器端取得資料後再提供給前端。
 *    - 注意 Google API 使用配額限制，若大量請求請加上快取或伺服器端緩存。
 *
 * 8. 常見改動
 *    - 改變顯示活動數量、卡片樣式或類別顏色：修改 renderEvents / getTypeColor / CSS。
 *    - 要讓沒有 TYPE 的事件也顯示：在 renderEvents -> futureEvents 過濾邏輯移除 hasType 條件。
 *
 * 9. 若需新增欄位解析
 *    - 在 parseDescription 加入對新 KEY 的處理即可（目前會自動解析 KEY: value 格式，多行內容會合併）。
 *
 * 10. 問題回報（最小可復現案例）
 *    - 提供以下資訊會加快定位：
 *      * 失敗的 event JSON（從 Google Calendar API 回傳的 items 中該 event 的物件）
 *      * description 原始內容
 *      * 錯誤的 console.log 訊息
 *
 * 範例：修改位置
 * - calendarId / apiKey 變更在檔案上方常數（請勿直接把正式 key 提交到公開 repo）
 *
 * 最後提醒：若要我把 API Key 改為從伺服器端取得或加入 fetch 的快取邏輯，我可以幫你實作。
 */
 

const calendarId =
  "90527f67fa462c83e184b0c62def10ebc8b00cc8c67a5b83af2afb90a1bdb293@group.calendar.google.com";
const apiKey = "AIzaSyCOLToQuZFbB1mULxYrMyQVeTVGnhk8-U4";

/**
 * 解析活動描述文字，提取各種欄位
 * @param {string} description - 活動描述文字
 * @returns {Object} 解析後的欄位物件
 */
const parseDescription = (description) => {
  if (!description) {
    console.log("parseDescription: 沒有描述內容");
    return {};
  }

  console.log("parseDescription: 開始解析描述:", description);

  // 清理 HTML 標籤並轉換為純文字
  let cleanDescription = description
    // 將 <br> 轉換為換行符
    .replace(/<br\s*\/?>/gi, "\n")
    // 移除所有 HTML 標籤，但保留內容
    .replace(/<[^>]*>/g, "")
    // 將 HTML 實體轉換回正常字符
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    // 清理多餘的空白，但保留換行符
    .replace(/[ \t]+/g, " ") // 只清理空格和tab，保留換行符
    .replace(/\n\s+/g, "\n") // 清理換行符後的空白
    .replace(/\s+\n/g, "\n") // 清理換行符前的空白
    .trim();

  console.log("parseDescription: 清理後的描述:", cleanDescription);

  const fields = {};
  const lines = cleanDescription.split("\n");
  console.log("parseDescription: 分割後的行數:", lines.length, lines);

  let currentKey = null;
  let currentValue = "";

  lines.forEach((line, index) => {
    line = line.trim(); // 清理每行的空白
    console.log(`parseDescription: 處理第${index + 1}行: "${line}"`);

    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      // 如果前面有未完成的欄位，先儲存它
      if (currentKey) {
        fields[currentKey] = currentValue.trim();
        console.log(
          `parseDescription: 儲存多行欄位 "${currentKey}" = "${currentValue.trim()}"`
        );
      }

      // 開始新的欄位
      currentKey = line.substring(0, colonIndex).trim();
      currentValue = line.substring(colonIndex + 1).trim();
      console.log(
        `parseDescription: 找到欄位 "${currentKey}" = "${currentValue}"`
      );
    } else if (currentKey && line) {
      // 如果這行沒有冒號但有內容，且我們正在處理一個欄位，則將其加到當前值
      currentValue += " " + line;
      console.log(
        `parseDescription: 繼續多行欄位 "${currentKey}"，新增內容: "${line}"`
      );
    } else {
      console.log(`parseDescription: 第${index + 1}行沒有冒號或格式不正確`);
    }
  });

  // 儲存最後一個欄位
  if (currentKey) {
    fields[currentKey] = currentValue.trim();
    console.log(
      `parseDescription: 儲存最後欄位 "${currentKey}" = "${currentValue.trim()}"`
    );
  }

  // 處理特殊格式：將 "SIGN UP" 對應到 "SIGNUP"
  if (fields["SIGN UP"]) {
    fields["SIGNUP"] = fields["SIGN UP"];
    console.log("parseDescription: 將 'SIGN UP' 對應到 'SIGNUP':", fields["SIGNUP"]);
  }

  console.log("parseDescription: 最終解析結果:", fields);
  return fields;
};

// 卡片模式：抓取過去一年至未來一段期間，供「即將舉辦」與「無資料時顯示最近 5 筆」共用
const calendarFetchStart = new Date();
calendarFetchStart.setDate(calendarFetchStart.getDate() - 365);
const calendarFetchEnd = new Date();
calendarFetchEnd.setFullYear(calendarFetchEnd.getFullYear() + 1);
const upcomingUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
  calendarId
)}/events?key=${apiKey}&singleEvents=true&orderBy=startTime&timeMin=${calendarFetchStart.toISOString()}&timeMax=${calendarFetchEnd.toISOString()}&maxResults=250`;

const RECENT_EVENTS_FALLBACK = 5;

const taiwanDayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

function taiwanCalendarDayStart(d) {
  const parts = taiwanDayFormatter.formatToParts(d);
  const y = parseInt(parts.find((p) => p.type === "year").value, 10);
  const m = parseInt(parts.find((p) => p.type === "month").value, 10) - 1;
  const day = parseInt(parts.find((p) => p.type === "day").value, 10);
  return new Date(Date.UTC(y, m, day, 0, 0, 0));
}

/**
 * 有 TYPE 的活動：優先顯示今天起（含）的未來場次；若沒有，改顯示最近 RECENT_EVENTS_FALLBACK 筆（可含已結束）
 * @param {Array} items - API 回傳的 events
 * @returns {{ events: Array, isRecentFallback: boolean }}
 */
function selectEventsForTimeline(items) {
  if (!items || !items.length) {
    return { events: [], isRecentFallback: false };
  }

  const now = new Date();
  const taiwanToday = taiwanCalendarDayStart(now);

  const typed = [];
  for (const item of items) {
    const eventFields = parseDescription(item.description);
    if (!eventFields.TYPE || !String(eventFields.TYPE).trim()) continue;
    const start = new Date(item.start.dateTime || item.start.date);
    const dayStart = taiwanCalendarDayStart(start);
    typed.push({ item, startMs: start.getTime(), dayStart });
  }

  const upcoming = typed
    .filter((x) => x.dayStart >= taiwanToday)
    .sort((a, b) => a.startMs - b.startMs)
    .map((x) => x.item);

  if (upcoming.length > 0) {
    console.log(`即將舉辦（有 TYPE）：${upcoming.length} 筆`);
    return { events: upcoming, isRecentFallback: false };
  }

  const recent = typed
    .filter((x) => x.dayStart < taiwanToday)
    .sort((a, b) => b.startMs - a.startMs)
    .slice(0, RECENT_EVENTS_FALLBACK)
    .map((x) => x.item);

  console.log(`無即將舉辦項目，改顯示最近 ${recent.length} 筆（最多 ${RECENT_EVENTS_FALLBACK}）`);
  return { events: recent, isRecentFallback: recent.length > 0 };
}

function createEventCard(item) {
  const eventFields = parseDescription(item.description);

  const eventCard = document.createElement("div");
  eventCard.className = "event-card";

  if (eventFields.IMAGE) {
    const eventImage = document.createElement("img");
    eventImage.className = "event-image";
    eventImage.src = `image/programIMG/${eventFields.IMAGE}`;
    eventImage.onerror = function () {
      this.style.display = "none";
    };
    eventCard.appendChild(eventImage);
  }

  const eventContent = document.createElement("div");
  eventContent.className = "event-content";

  const startTime = new Date(item.start.dateTime || item.start.date);
  const endTime = new Date(item.end.dateTime || item.end.date);

  const dateStr = startTime.toLocaleDateString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const startTimeStr = startTime.toLocaleTimeString("zh-TW", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const endTimeStr = endTime.toLocaleTimeString("zh-TW", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const timeStr = `${startTimeStr} - ${endTimeStr}`;

  const eventTimeInfo = document.createElement("div");
  eventTimeInfo.className = "event-time-info";

  if (eventFields.SIGNUP) {
    const signupContainer = document.createElement("div");
    signupContainer.className = "signup-container";
    const signupButton = document.createElement("a");
    signupButton.href = eventFields.SIGNUP;
    signupButton.target = "_blank";
    signupButton.textContent = "SIGN UP";
    signupButton.className = "signup-button";
    signupContainer.appendChild(signupButton);
    eventTimeInfo.appendChild(signupContainer);
  }

  const timeInfoContainer = document.createElement("div");
  timeInfoContainer.className = "time-info-container";

  const eventDateEl = document.createElement("div");
  eventDateEl.className = "event-date";
  eventDateEl.textContent = dateStr;
  timeInfoContainer.appendChild(eventDateEl);

  const eventTime = document.createElement("div");
  eventTime.className = "event-time";
  eventTime.textContent = timeStr;
  timeInfoContainer.appendChild(eventTime);

  eventTimeInfo.appendChild(timeInfoContainer);
  eventContent.appendChild(eventTimeInfo);

  const eventTitle = document.createElement("div");
  eventTitle.className = "event-title";
  eventTitle.textContent = item.summary || "未命名活動";
  eventContent.appendChild(eventTitle);

  if (eventFields.DESCRIPTION || eventFields.TYPE) {
    const eventDescription = document.createElement("p");
    eventDescription.className = "event-description";

    if (eventFields.DESCRIPTION) {
      eventDescription.textContent = eventFields.DESCRIPTION;
    }

    if (eventFields.TYPE) {
      const eventTypeTag = document.createElement("span");
      eventTypeTag.className = "event-type-tag";
      eventTypeTag.textContent = ` #${eventFields.TYPE.toLowerCase()}`;

      switch (eventFields.TYPE.toUpperCase()) {
        case "TALK":
          eventTypeTag.style.color = "#FF4500";
          break;
        case "WORKSHOP":
          eventTypeTag.style.color = "#0066CC";
          break;
        case "PERFORMANCE":
          eventTypeTag.style.color = "blueviolet";
          break;
        case "EXHIBITION":
          eventTypeTag.style.color = "#000000";
          break;
        case "NEWS":
          eventTypeTag.style.color = "plum";
          break;
        default:
          eventTypeTag.style.color = "#666";
      }

      eventDescription.appendChild(eventTypeTag);
    }

    eventContent.appendChild(eventDescription);
  }

  eventCard.appendChild(eventContent);
  return eventCard;
}

// DOM 元素引用（只保留卡片模式用的 eventsTimeline）
let eventsTimeline = null;
let calendarData = null;

// 初始化 DOM 元素
document.addEventListener("DOMContentLoaded", function () {
  eventsTimeline = document.getElementById("eventsTimeline");
  console.log("DOM 元素初始化完成: eventsTimeline =", eventsTimeline);
});

/**
 * 渲染事件的函數 - 卡片模式
 * @param {Array} items - 從 Google Calendar 獲取的事件陣列
 */
function renderEvents(items) {
  if (!eventsTimeline) return;

  if (!items || items.length === 0) {
    eventsTimeline.innerHTML = "";
    return;
  }

  const { events: eventsToShow} = selectEventsForTimeline(items);

  eventsTimeline.innerHTML = "";

  if (eventsToShow.length === 0) {
    return;
  }

  eventsToShow.forEach((item) => {
    eventsTimeline.appendChild(createEventCard(item));
  });
}

/**
 * 根據類型獲取對應的中文標籤
 * @param {string} type - 活動類型
 * @returns {string} 中文標籤
 */
const getTypeLabel = (type) => {
  switch (type?.toUpperCase()) {
    case "TALK":
      return "講座";
    case "WORKSHOP":
      return "工作坊";
    case "PERFORMANCE":
      return "表演";
    case "EXHIBITION":
      return "展覽";
    case "NEWS":
      return "新聞";
    default:
      return "活動";
  }
};

/**
 * 根據類型獲取對應的顏色
 * @param {string} type - 活動類型
 * @returns {string} 顏色代碼
 */
const getTypeColor = (type) => {
  switch (type?.toUpperCase()) {
    case "TALK":
      return "#ff69b4"; // 洋紅色
    case "WORKSHOP":
      return "#007bff"; // 藍色
    case "PERFORMANCE":
      return "#ffc107"; // 黃色
    case "EXHIBITION":
      return "#fd7e14"; // 橙色
    case "NEWS":
      return "#28a745"; // 綠色
    default:
      return "#6c757d"; // 灰色
  }
};

// Event Type 篩選器功能
function filterEventsByType(events, eventType) {
  if (eventType === "all") {
    return events;
  }

  return events.filter((event) => {
    const eventFields = parseDescription(event.description);
    const type = eventFields.TYPE || "";
    return type.toUpperCase() === eventType.toUpperCase();
  });
}

// 設置 Event Type 篩選器
function setupEventTypeFilter() {
  const eventTypeFilter = document.getElementById("eventTypeFilter");
  if (!eventTypeFilter) return;

  eventTypeFilter.addEventListener("change", (e) => {
    const selectedType = e.target.value;
    console.log("篩選事件類型:", selectedType);

    if (calendarData) {
      const filteredEvents = filterEventsByType(calendarData, selectedType);
      renderEvents(filteredEvents);
    }
  });
}

// 獲取日曆數據（卡片模式）
function fetchCalendarData() {
  console.log("正在獲取日曆數據...");
  fetch(upcomingUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log("日曆數據獲取成功:", data.items?.length || 0, "個活動");
      calendarData = data.items || [];
      renderEvents(calendarData);
    })
    .catch((err) => {
      console.error("獲取日曆數據時出錯:", err);
      if (eventsTimeline) {
        eventsTimeline.innerHTML = "<p>載入活動時發生錯誤</p>";
      }
    });
}

// 初始化
document.addEventListener("DOMContentLoaded", function () {
  console.log("日曆系統初始化開始");
  setupEventTypeFilter();
  fetchCalendarData();
  console.log("日曆系統初始化完成");
});