/*
 * 台北藝術書展 - 日曆系統使用說明
 * ======================================
 *
 * 這個系統會從 Google Calendar 讀取活動資料，並支援兩種顯示模式：
 * 1. 卡片模式：顯示從今天開始的即將到來的活動
 * 2. 時間軸模式：以甘特圖方式顯示前後各6個月的所有活動
 *
 * 活動描述格式說明：
 * 在 Google Calendar 的活動描述中，請使用以下格式：
 *
 * SIGNUP: https://example.com/signup
 * IMAGE: https://example.com/image.jpg
 * DESCRIPTION: 這是一個精彩的講座，將分享最新的藝術趨勢
 * TYPE: TALK
 *
 * 支援的活動類型 (TYPE)：
 * - TALK: 講座 (洋紅色點)
 * - WORKSHOP: 工作坊 (藍色點)
 * - PERFORMANCE: 表演 (黃色點)
 * - EXHIBITION: 展覽 (橙色點)
 * - 注意：沒有寫 TYPE 的活動在卡片模式中不會顯示
 *
 * 注意事項：
 * - 所有欄位都是可選的，如果沒有填寫會使用預設值
 * - 圖片連結必須是完整的 URL
 * - 報名連結會自動變成可點擊的按鈕
 * - 跨天數的活動會自動調整點的寬度
 *
 * 系統設定：
 * - 預設顯示 4 個活動
 * - 支援觸控滑動
 * - 自動排序（按開始時間）
 * - 響應式設計（支援不同螢幕尺寸）
 */

// 把下面兩個換成你的
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

// 計算不同模式的時間範圍
const now = new Date();

// 卡片模式：從今天開始的即將到來的活動
const upcomingUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
  calendarId
)}/events?key=${apiKey}&singleEvents=true&orderBy=startTime&timeMin=${now.toISOString()}`;

// 時間軸模式：只顯示 2024/11/21-2024/11/23 的活動
const eventStartDate = new Date(2025, 10, 21); // 2024年11月21日 (月份是0-based)
const eventEndDate = new Date(2025, 10, 23); // 2024年11月24日 (包含23日整天)
const timelineUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
  calendarId
)}/events?key=${apiKey}&singleEvents=true&orderBy=startTime&timeMin=${eventStartDate.toISOString()}&timeMax=${eventEndDate.toISOString()}`;

// 預設使用卡片模式的 URL（保持向後兼容）
const url = upcomingUrl;

// DOM 元素引用
let timelineCalendar = null;
let eventsTimeline = null;
let calendarData = null;

// 初始化 DOM 元素
document.addEventListener("DOMContentLoaded", function () {
  timelineCalendar = document.getElementById("timelineCalendar");
  eventsTimeline = document.getElementById("eventsTimeline");
  
  console.log("DOM 元素初始化完成");
  console.log("timelineCalendar:", timelineCalendar);
  console.log("eventsTimeline:", eventsTimeline);
});

/**
 * 渲染時間軸模式 - 以甘特圖方式顯示活動
 */
function renderTimelineMode() {
  if (!timelineCalendar) return;

  // 為時間軸模式獲取前後六個月的資料
  fetchTimelineData();
}

/**
 * 獲取時間軸模式專用的資料（前後六個月）
 */
function fetchTimelineData() {
  console.log("正在獲取時間軸資料...");

  fetch(timelineUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log("時間軸資料獲取成功:", data.items?.length || 0, "個活動");
      renderTimelineWithData(data.items || []);
    })
    .catch((err) => {
      console.error("獲取時間軸資料時出錯:", err);
      timelineCalendar.innerHTML =
        "<p style='text-align: center; padding: 20px;'>Oh No!! Its an error! Refresh the page!</p>";
    });
}

/**
 * 使用資料渲染時間軸
 */
function renderTimelineWithData(timelineData) {
  if (!timelineCalendar) return;

  timelineCalendar.innerHTML = "";

  // 固定時間軸高度 - 從9:00到22:00，13小時，每小時60px
  const startHour = 9; // 9:00開始
  const endHour = 22; // 22:00結束
  const hoursInDay = endHour - startHour; // 13小時
  const timelineHeight = hoursInDay * 60; // 780px
  const containerHeight = timelineHeight + 200; // 980px

  // 創建主容器 - 固定像素寬度，對應24小時高度
  const mainContainer = document.createElement("div");
  mainContainer.className = "timeline-main-container";
  mainContainer.style.height = `${containerHeight}px`; // 動態高度

  // 左側時間軸容器 - 固定像素寬度
  const timelineContainer = document.createElement("div");
  timelineContainer.className = "timeline-left-container";
  timelineContainer.style.height = `${containerHeight}px`; // 動態高度

  // 右側預覽容器 - 固定像素寬度
  const previewContainer = document.createElement("div");
  previewContainer.className = "timeline-right-container";
  previewContainer.style.height = `${containerHeight}px`; // 動態高度

  // 預覽區域的默認內容
  previewContainer.innerHTML = `
    <div style="text-align: center; color: #666; font-size: 1rem;">
      <p>點擊左側活動查看詳情</p>
    </div>
  `;

  // 只顯示 2025/11/21-2025/11/23 這三天
  const eventDays = [
    { year: 2025, month: 10, day: 21 }, // 11月21日
    { year: 2025, month: 10, day: 22 }, // 11月22日
    { year: 2025, month: 10, day: 23 }  // 11月23日
  ];

  // 創建時間軸區域（縱軸是時間，橫軸是日期）
  const timelineArea = document.createElement("div");
  timelineArea.className = "timeline-area";
  timelineArea.style.height = `${timelineHeight + 150}px`; // 動態高度

  // 創建時間標記（縱軸時間）- 固定位置，24小時
  const timelineStartY = 100; // 上邊距
  
  // 繪製時間格線（縱軸）- 從6:00到23:00，每小時60px
  for (let hour = startHour; hour < endHour; hour++) {
    const yPosition = timelineStartY + ((hour - startHour) * 60);
    
    const timeLine = document.createElement("div");
    timeLine.className = "timeline-time-line";
    timeLine.style.top = `${yPosition}px`;

    const timeLabel = document.createElement("div");
    timeLabel.className = "timeline-time-label";
    timeLabel.style.top = `${yPosition}px`;
    timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;

    timelineArea.appendChild(timeLine);
    timelineArea.appendChild(timeLabel);
  }

  // 創建日期標記（橫軸日期）- 固定位置
  const dateColumns = [];
  eventDays.forEach(({ year, month, day }, dayIndex) => {
    const xPosition = 120 + (dayIndex * 250); // 每個日期間隔250px，固定位置
    
    const dateColumn = document.createElement("div");
    dateColumn.className = "timeline-date-column";
    dateColumn.style.left = `${xPosition}px`;
    
    const date = new Date(year, month, day);
    const dayName = date.toLocaleDateString("zh-TW", { 
      month: "long", 
      day: "numeric",
      weekday: "short",
      timeZone: "Asia/Taipei"
    });
    dateColumn.textContent = `${dayName}`;

    // 創建日期分隔線（垂直線）
    const dateLine = document.createElement("div");
    dateLine.className = "timeline-date-line";
    dateLine.style.left = `${xPosition + 100}px`; // 居中
    dateLine.style.top = `${timelineStartY}px`;
    dateLine.style.height = `${timelineHeight}px`;

    timelineArea.appendChild(dateColumn);
    timelineArea.appendChild(dateLine);
    dateColumns.push({ column: dateColumn, line: dateLine, day });
  });

  // 渲染所有活動
  timelineData.forEach((event) => {
    const eventDate = new Date(event.start.dateTime || event.start.date);
    
    // 使用台灣時區獲取年、月、日進行日期比較
    const taiwanDateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "numeric",
      day: "numeric"
    });
    
    const dateParts = taiwanDateFormatter.formatToParts(eventDate);
    const taiwanYear = parseInt(dateParts.find(p => p.type === 'year').value);
    const taiwanMonth = parseInt(dateParts.find(p => p.type === 'month').value) - 1; // JavaScript月份是0-based
    const taiwanDay = parseInt(dateParts.find(p => p.type === 'day').value);
    
    // 只顯示這三天的活動
    const dayIndex = eventDays.findIndex(({ year, month, day }) => 
      taiwanYear === year && 
      taiwanMonth === month && 
      taiwanDay === day
    );

    if (dayIndex === -1) return;

    // 創建活動長條
    const eventBar = document.createElement("div");
    eventBar.className = "timeline-event-bar";

    // 解析活動描述
    const eventFields = parseDescription(event.description);
    console.log("活動解析結果:", eventFields);
    const eventType = eventFields.TYPE || "DEFAULT";

    // 根據類型設置不同的 CSS 類別
    switch (eventType.toUpperCase()) {
      case "TALK":
        eventBar.classList.add("talk");
        break;
      case "WORKSHOP":
        eventBar.classList.add("workshop");
        break;
      case "PERFORMANCE":
        eventBar.classList.add("performance");
        break;
      case "EXHIBITION":
        eventBar.classList.add("exhibition");
        break;
      default:
        eventBar.classList.add("default");
    }

    // 計算活動的開始和結束時間 - 轉換為台灣時間
    const eventStartTime = new Date(event.start.dateTime || event.start.date);
    const eventEndTime = new Date(event.end.dateTime || event.end.date);
    
    // 使用 Intl.DateTimeFormat 獲取台灣時區的小時和分鐘，避免時區轉換問題
    const taiwanFormatter = new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    
    const startParts = taiwanFormatter.formatToParts(eventStartTime);
    const endParts = taiwanFormatter.formatToParts(eventEndTime);
    
    const startHour = parseInt(startParts.find(p => p.type === 'hour').value);
    const startMinute = parseInt(startParts.find(p => p.type === 'minute').value);
    const endHour = parseInt(endParts.find(p => p.type === 'hour').value);
    const endMinute = parseInt(endParts.find(p => p.type === 'minute').value);

    // 固定計算活動長條位置 - 基於9:00-22:00
    const startTimeY = timelineStartY + ((startHour - 9) * 60) + (startMinute * 1); // 每分鐘1px
    const endTimeY = timelineStartY + ((endHour - 9) * 60) + (endMinute * 1);
    const barHeight = Math.max(endTimeY - startTimeY, 20); // 最小高度20px

    // 固定日期位置（橫軸）
    const dateX = 120 + (dayIndex * 250) + 100; // 居中在日期列
    const barWidth = 150; // 固定寬度

    eventBar.style.width = `${barWidth}px`;
    eventBar.style.height = `${barHeight}px`;
    eventBar.style.left = `${dateX - barWidth/2}px`; // 居中
    eventBar.style.top = `${startTimeY}px`;

    // 創建活動內容
    const eventContent = document.createElement("div");
    eventContent.className = "timeline-event-content";
    eventContent.textContent = event.summary || "未命名活動";

    eventBar.appendChild(eventContent);

    // 添加點擊事件
    const showEventPreview = () => {
      console.log("顯示活動預覽:", event.summary);
      console.log("活動描述:", event.description);
      console.log("解析後的欄位:", eventFields);
      
      const eventTime = new Date(event.start.dateTime || event.start.date);
      // 直接格式化為台灣時間，避免時區問題
      const timeStr = eventTime.toLocaleTimeString("zh-TW", { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Taipei"
      });
      
      previewContainer.innerHTML = `
        <div style="text-align: center;">
          ${eventFields.IMAGE ? `<img src="image/programIMG/${eventFields.IMAGE}" style="width: 100%; max-width: 200px; height: auto; border-radius: 8px; margin-bottom: 15px;" alt="活動圖片" onerror="this.style.display='none'; console.log('時間軸圖片載入失敗:', 'image/programIMG/${eventFields.IMAGE}');" onload="console.log('時間軸圖片載入成功:', 'image/programIMG/${eventFields.IMAGE}');">` : ''}
        </div>
        <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 10px; text-transform: uppercase;">
          ${eventDate.toLocaleDateString("zh-TW", { 
            month: "long", 
            day: "numeric",
            weekday: "short",
            timeZone: "Asia/Taipei"
          })}
        </div>
        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">
          ${timeStr}
        </div>
        <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 15px; text-transform: uppercase;">
          ${event.summary || "未命名活動"}
        </div>
        <div style="font-size: 0.9rem; line-height: 1.4; color: #666;">
          ${eventFields.DESCRIPTION || event.description || "暫無詳細描述"}
        </div>
        ${eventFields.SIGNUP ? `<div style="margin-top: 15px;"><a href="${eventFields.SIGNUP}" target="_blank" style="display: inline-block; padding: 8px 16px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; font-size: 0.9rem;">SIGN UP</a></div>` : ''}
      `;
    };

    eventBar.addEventListener("click", showEventPreview);

    // 添加 hover 效果
    // Hover 效果現在由 CSS 處理

    timelineArea.appendChild(eventBar);
  });

  timelineContainer.appendChild(timelineArea);
  mainContainer.appendChild(timelineContainer);
  mainContainer.appendChild(previewContainer);
  timelineCalendar.appendChild(mainContainer);
}

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

  // 過濾出今天之後的活動（使用台灣時區）
  const now = new Date();
  // 獲取台灣時區今天的開始時間（00:00:00）
  const taiwanTodayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  });
  const todayParts = taiwanTodayFormatter.formatToParts(now);
  const taiwanTodayYear = parseInt(todayParts.find(p => p.type === 'year').value);
  const taiwanTodayMonth = parseInt(todayParts.find(p => p.type === 'month').value) - 1;
  const taiwanTodayDay = parseInt(todayParts.find(p => p.type === 'day').value);
  // 創建台灣時區今天開始的 Date 物件（UTC時間）
  const taiwanToday = new Date(Date.UTC(taiwanTodayYear, taiwanTodayMonth, taiwanTodayDay, 0, 0, 0));
  
  const futureEvents = items.filter((item) => {
    const eventDate = new Date(item.start.dateTime || item.start.date);
    const eventFields = parseDescription(item.description);
    const hasType = eventFields.TYPE && eventFields.TYPE.trim() !== "";
    
    // 獲取活動在台灣時區的日期
    const eventDateParts = taiwanTodayFormatter.formatToParts(eventDate);
    const eventYear = parseInt(eventDateParts.find(p => p.type === 'year').value);
    const eventMonth = parseInt(eventDateParts.find(p => p.type === 'month').value) - 1;
    const eventDay = parseInt(eventDateParts.find(p => p.type === 'day').value);
    const eventTaiwanDate = new Date(Date.UTC(eventYear, eventMonth, eventDay, 0, 0, 0));
    
    return eventTaiwanDate >= taiwanToday && hasType;
  });

  // 按時間排序
  futureEvents.sort((a, b) => {
    const dateA = new Date(a.start.dateTime || a.start.date);
    const dateB = new Date(b.start.dateTime || b.start.date);
    return dateA - dateB;
  });

  console.log(`找到 ${futureEvents.length} 個有 TYPE 的未來活動`);
  
  eventsTimeline.innerHTML = "";

  futureEvents.forEach((item) => {
    // 解析活動描述
    const eventFields = parseDescription(item.description);
    console.log("活動解析結果:", eventFields);
    
    const eventCard = document.createElement("div");
    eventCard.className = "event-card";

    // 活動圖片
    if (eventFields.IMAGE) {
      const eventImage = document.createElement("img");
      eventImage.className = "event-image";
      // 從本地資料夾載入圖片
      eventImage.src = `image/programIMG/${eventFields.IMAGE}`;
      
      // 添加圖片載入錯誤處理
      eventImage.onerror = function() {
        console.log("圖片載入失敗:", `image/programIMG/${eventFields.IMAGE}`);
        this.style.display = "none";
      };
      
      // 添加圖片載入成功處理
      eventImage.onload = function() {
        console.log("圖片載入成功:", `image/programIMG/${eventFields.IMAGE}`);
      };
      
      eventCard.appendChild(eventImage);
    }

    // 內容區域
    const eventContent = document.createElement("div");
    eventContent.className = "event-content";

    // 活動時間 - 轉換為台灣時間，24小時制，不顯示秒數
    const startTime = new Date(item.start.dateTime || item.start.date);
    const endTime = new Date(item.end.dateTime || item.end.date);
    
    // 直接格式化為台灣時間字符串，不再創建新的 Date 對象（避免時區問題）
    const dateStr = startTime.toLocaleDateString("zh-TW", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    
    // 格式化時間 - 24小時制，不顯示秒數，強制使用台灣時區
    const startTimeStr = startTime.toLocaleTimeString("zh-TW", {
      timeZone: "Asia/Taipei",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    
    const endTimeStr = endTime.toLocaleTimeString("zh-TW", {
      timeZone: "Asia/Taipei",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    
    const timeStr = `${startTimeStr} - ${endTimeStr}`;
    
    // 時間資訊區域 - 放在標題上面
    const eventTimeInfo = document.createElement("div");
    eventTimeInfo.className = "event-time-info";
    
    // 報名按鈕區域 - 放在最前面
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
    
    // 時間資訊容器
    const timeInfoContainer = document.createElement("div");
    timeInfoContainer.className = "time-info-container";
    
    // 日期
    const eventDate = document.createElement("div");
    eventDate.className = "event-date";
    eventDate.textContent = dateStr;
    timeInfoContainer.appendChild(eventDate);
    
    // 時間
    const eventTime = document.createElement("div");
    eventTime.className = "event-time";
    eventTime.textContent = timeStr;
    timeInfoContainer.appendChild(eventTime);
    
    eventTimeInfo.appendChild(timeInfoContainer);
    
    eventContent.appendChild(eventTimeInfo);

    // 活動標題
    const eventTitle = document.createElement("div");
    eventTitle.className = "event-title";
    eventTitle.textContent = item.summary || "未命名活動";
    eventContent.appendChild(eventTitle);

    // 活動描述和類型標籤
    if (eventFields.DESCRIPTION || eventFields.TYPE) {
      const eventDescription = document.createElement("p");
      eventDescription.className = "event-description";
      
      if (eventFields.DESCRIPTION) {
        eventDescription.textContent = eventFields.DESCRIPTION;
      }
      
      // 活動類型標籤 - 添加到同一個段落中
      if (eventFields.TYPE) {
        const eventTypeTag = document.createElement("span");
        eventTypeTag.className = "event-type-tag";
        eventTypeTag.textContent = ` #${eventFields.TYPE.toLowerCase()}`;
        
        // 根據類型設置顏色
        switch (eventFields.TYPE.toUpperCase()) {
          case "TALK":
            eventTypeTag.style.color = "#FF4500"; // orangered
            break;
          case "WORKSHOP":
            eventTypeTag.style.color = "#0066CC"; // blue
            break;
          case "PERFORMANCE":
            eventTypeTag.style.color = "blueviolet"; // blueviolet
            break;
          case "EXHIBITION":
            eventTypeTag.style.color = "#000000"; // black
            break;
          default:
            eventTypeTag.style.color = "#666"; // gray
        }
        
        eventDescription.appendChild(eventTypeTag);
      }
      
      eventContent.appendChild(eventDescription);
    }

    eventCard.appendChild(eventContent);
    eventsTimeline.appendChild(eventCard);
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

// 獲取日曆數據
function fetchCalendarData() {
  console.log("正在獲取日曆數據...");

fetch(url)
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
  
  // 設置篩選器
  setupEventTypeFilter();
  
  // 獲取日曆數據
  fetchCalendarData();
  
  console.log("日曆系統初始化完成");
});