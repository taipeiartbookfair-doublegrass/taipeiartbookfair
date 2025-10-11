/*
 * 台北藝術書展 - 購票參觀頁面專用時間軸系統
 * ===========================================
 * 
 * 這個文件專門為 ticketvisit.html 設計，避免與 mainpage.html 的卡片模式產生衝突
 * 只包含時間軸模式的功能，不包含卡片模式相關代碼
 */

// 日曆設定
const calendarId = "90527f67fa462c83e184b0c62def10ebc8b00cc8c67a5b83af2afb90a1bdb293@group.calendar.google.com";
const apiKey = "AIzaSyCOLToQuZFbB1mULxYrMyQVeTVGnhk8-U4";

// 時間軸模式專用 URL - 只顯示 2025/11/21-2025/11/23 的活動
const eventStartDate = new Date(2025, 10, 21); // 2025年11月21日 (月份是0-based)
const eventEndDate = new Date(2025, 10, 24); // 2025年11月24日 (包含23日整天)
const timelineUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
  calendarId
)}/events?key=${apiKey}&singleEvents=true&orderBy=startTime&timeMin=${eventStartDate.toISOString()}&timeMax=${eventEndDate.toISOString()}`;

// DOM 元素引用
let timelineCalendar = null;

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

/**
 * 獲取時間軸模式專用的資料（2025/11/21-2025/11/23）
 */
function fetchTimelineData() {
  console.log("正在獲取時間軸資料...");
  console.log("API URL:", timelineUrl);
  console.log("時間範圍:", eventStartDate.toISOString(), "到", eventEndDate.toISOString());

  fetch(timelineUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log("時間軸資料獲取成功:", data.items?.length || 0, "個活動");
      console.log("所有活動:", data.items);
      renderTimelineWithData(data.items || []);
    })
    .catch((err) => {
      console.error("獲取時間軸資料時出錯:", err);
      if (timelineCalendar) {
        timelineCalendar.innerHTML =
          "<p style='text-align: center; padding: 20px;'>Oh No!! Its an error! Refresh the page!</p>";
      }
    });
}

/**
 * 使用資料渲染時間軸
 */
function renderTimelineWithData(timelineData) {
  if (!timelineCalendar) return;

  timelineCalendar.innerHTML = "";

  // 固定時間軸高度 - 從9:00到22:00，13小時，每小時40px（更緊湊）
  const startHour = 9; // 9:00開始
  const endHour = 22; // 22:00結束
  const hoursInDay = endHour - startHour; // 13小時
  const timelineHeight = hoursInDay * 40; // 520px（更緊湊）

  // 只顯示 2025/11/21-2025/11/23 這三天
  const eventDays = [
    { year: 2025, month: 10, day: 21 }, // 11月21日
    { year: 2025, month: 10, day: 22 }, // 11月22日
    { year: 2025, month: 10, day: 23 }  // 11月23日
  ];

  // 創建主容器 - 包含時間軸和預覽區
  const mainContainer = document.createElement("div");
  mainContainer.className = "timeline-main-container";
  mainContainer.style.display = "flex";
  mainContainer.style.height = `${timelineHeight + 100}px`; // 更緊湊的高度

  // 創建時間軸區域（縱軸是時間，橫軸是日期）
  const timelineArea = document.createElement("div");
  timelineArea.className = "timeline-area";
  timelineArea.style.height = `${timelineHeight + 100}px`; // 更緊湊的高度
  timelineArea.style.width = `${200 + (eventDays.length * 400) + 200}px`; // 調整總寬度以容納新的對齊方式
  timelineArea.style.flex = "1";

  // 創建預覽容器
  const previewContainer = document.createElement("div");
  previewContainer.className = "timeline-right-container";
  previewContainer.style.width = "300px";
  previewContainer.style.height = `${timelineHeight + 100}px`; // 更緊湊的高度
  previewContainer.style.padding = "var(--spacing-md)";
  previewContainer.style.background = "var(--bg-primary)";
  previewContainer.style.borderLeft = "2px solid var(--border-light)";
  previewContainer.style.overflowY = "auto";

  // 預覽區域的默認內容
  previewContainer.innerHTML = `
    <div style="text-align: center; color: #666; font-size: 1rem;">
      <p>點擊左側活動查看詳情</p>
    </div>
  `;

  // 創建時間標記（縱軸時間）- 固定位置，24小時
  const timelineStartY = 100; // 上邊距
  
  // 繪製時間格線（縱軸）- 從9:00到22:00，每小時40px（更緊湊）
  for (let hour = startHour; hour < endHour; hour++) {
    const yPosition = timelineStartY + ((hour - startHour) * 40);
    
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

  // 創建日期標記（橫軸日期）- 統一對齊基準
  const dateColumns = [];
  eventDays.forEach(({ year, month, day }, dayIndex) => {
    // 統一的對齊基準：每個日期列的中心位置
    const columnCenterX = 200 + (dayIndex * 400); // 日期列中心位置
    
    const dateColumn = document.createElement("div");
    dateColumn.className = "timeline-date-column";
    dateColumn.style.left = `${columnCenterX - 50}px`; // 日期標記左對齊
    dateColumn.style.textAlign = "center";
    dateColumn.style.width = "100px";
    
    const date = new Date(year, month, day);
    // 確保星期日能正確顯示
    const weekday = date.toLocaleDateString("zh-TW", { 
      weekday: "short",
      timeZone: "Asia/Taipei"
    });
    const monthDay = date.toLocaleDateString("zh-TW", { 
      month: "long", 
      day: "numeric",
      timeZone: "Asia/Taipei"
    });
    dateColumn.textContent = `${weekday} ${monthDay}`;

    // 創建日期分隔線（垂直線）- 對齊到日期列中心
    const dateLine = document.createElement("div");
    dateLine.className = "timeline-date-line";
    dateLine.style.left = `${columnCenterX}px`; // 分隔線在日期列中心
    dateLine.style.top = `${timelineStartY}px`;
    dateLine.style.height = `${timelineHeight}px`;

    timelineArea.appendChild(dateColumn);
    timelineArea.appendChild(dateLine);
    dateColumns.push({ column: dateColumn, line: dateLine, day, centerX: columnCenterX });
  });

  // 渲染所有活動
  timelineData.forEach((event) => {
    const eventDate = new Date(event.start.dateTime || event.start.date);
    
    // 轉換為台灣時間進行日期比較
    const taiwanEventStr = eventDate.toLocaleString("sv-SE", {timeZone: "Asia/Taipei"});
    const taiwanEventDate = new Date(taiwanEventStr);
    
    console.log("活動原始時間:", eventDate);
    console.log("活動台灣時間:", taiwanEventDate);
    console.log("活動日期:", taiwanEventDate.getFullYear(), taiwanEventDate.getMonth(), taiwanEventDate.getDate());
    
    // 只顯示這三天的活動
    const dayIndex = eventDays.findIndex(({ year, month, day }) => 
      taiwanEventDate.getFullYear() === year && 
      taiwanEventDate.getMonth() === month && 
      taiwanEventDate.getDate() === day
    );

    console.log("日期匹配結果:", dayIndex, "for event:", event.summary);
    
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
    
    // 使用 toLocaleString 轉換為台灣時間，然後重新解析
    const taiwanStartStr = eventStartTime.toLocaleString("sv-SE", {timeZone: "Asia/Taipei"});
    const taiwanEndStr = eventEndTime.toLocaleString("sv-SE", {timeZone: "Asia/Taipei"});
    
    const taiwanStartTime = new Date(taiwanStartStr);
    const taiwanEndTime = new Date(taiwanEndStr);
    
    const startHour = taiwanStartTime.getHours();
    const startMinute = taiwanStartTime.getMinutes();
    const endHour = taiwanEndTime.getHours();
    const endMinute = taiwanEndTime.getMinutes();

    // 固定計算活動長條位置 - 基於9:00-22:00，使用更緊湊的間距
    const startTimeY = timelineStartY + ((startHour - 9) * 40) + (startMinute * 0.67); // 每分鐘0.67px
    const endTimeY = timelineStartY + ((endHour - 9) * 40) + (endMinute * 0.67);
    const barHeight = Math.max(endTimeY - startTimeY, 20); // 最小高度20px

    // 固定日期位置（橫軸），對齊到日期列中心
    const columnCenterX = 200 + (dayIndex * 400); // 與日期標記使用相同的中心位置
    const barWidth = 300; // 活動長條寬度

    eventBar.style.width = `${barWidth}px`;
    eventBar.style.height = `${barHeight}px`;
    eventBar.style.left = `${columnCenterX - barWidth/2}px`; // 活動長條居中對齊
    eventBar.style.top = `${startTimeY}px`;

    // 創建活動內容
    const eventContent = document.createElement("div");
    eventContent.className = "timeline-event-content";
    eventContent.textContent = event.summary || "未命名活動";

    eventBar.appendChild(eventContent);

    // 添加點擊事件 - 顯示活動預覽
    const showEventPreview = () => {
      console.log("顯示活動預覽:", event.summary);
      console.log("活動描述:", event.description);
      console.log("解析後的欄位:", eventFields);
      
      const eventTime = new Date(event.start.dateTime || event.start.date);
      // 轉換為台灣時間
      const taiwanEventStr = eventTime.toLocaleString("sv-SE", {timeZone: "Asia/Taipei"});
      const taiwanEventTime = new Date(taiwanEventStr);
      const timeStr = taiwanEventTime.toLocaleTimeString("zh-TW", { 
        hour: "2-digit", 
        minute: "2-digit",
        timeZone: "Asia/Taipei"
      });
      
      previewContainer.innerHTML = `
        <div style="text-align: center;">
          ${eventFields.IMAGE ? `<img src="${eventFields.IMAGE}" style="width: 100%; max-width: 200px; height: auto; border-radius: 8px; margin-bottom: 15px;" alt="活動圖片" onerror="this.style.display='none'; console.log('時間軸圖片載入失敗:', '${eventFields.IMAGE}');" onload="console.log('時間軸圖片載入成功:', '${eventFields.IMAGE}');">` : ''}
        </div>
        <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 10px; text-transform: uppercase;">
          ${taiwanEventDate.toLocaleDateString("zh-TW", { 
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
        ${eventFields.SIGNUP ? `<div style="margin-top: 15px;"><a href="${eventFields.SIGNUP}" target="_blank" style="display: inline-block; padding: 8px 16px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; font-size: 0.9rem;">報名參加</a></div>` : ''}
      `;
    };

    eventBar.addEventListener("click", showEventPreview);

    timelineArea.appendChild(eventBar);
  });

  mainContainer.appendChild(timelineArea);
  mainContainer.appendChild(previewContainer);
  timelineCalendar.appendChild(mainContainer);
}

/**
 * 渲染時間軸模式 - 以甘特圖方式顯示活動
 */
function renderTimelineMode() {
  if (!timelineCalendar) return;

  // 為時間軸模式獲取2025/11/21-2025/11/23的資料
  fetchTimelineData();
}

// 初始化 DOM 元素
document.addEventListener("DOMContentLoaded", function () {
  timelineCalendar = document.getElementById("timelineCalendar");
  
  console.log("購票參觀頁面時間軸系統初始化完成");
  console.log("timelineCalendar:", timelineCalendar);
  
  // 延遲執行，確保 DOM 完全載入
  setTimeout(function () {
    console.log("強制顯示時間軸模式");
    
    // 確保時間軸容器顯示
    const timelineModeContainer = document.getElementById("timelineModeContainer");
    if (timelineModeContainer) {
      timelineModeContainer.style.display = "block";
      timelineModeContainer.classList.remove("hidden");
      console.log("時間軸容器已設置為顯示");
      
      // 渲染時間軸模式
      renderTimelineMode();
      console.log("時間軸模式已渲染");
    }
  }, 1000); // 延遲1秒執行
});
