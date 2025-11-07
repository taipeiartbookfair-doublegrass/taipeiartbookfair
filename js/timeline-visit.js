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
// 使用台灣時區的日期時間，避免時區轉換問題
// 台灣時間 2025-11-21 00:00:00 (UTC+8) = UTC 2025-11-20 16:00:00
// 所以需要明確指定台灣時區的日期
const eventStartDate = new Date('2025-11-21T00:00:00+08:00'); // 台灣時間 2025年11月21日 00:00:00
const eventEndDate = new Date('2025-11-24T00:00:00+08:00'); // 台灣時間 2025年11月24日 00:00:00 (包含23日整天)
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

  // 添加CORS模式和錯誤處理
  fetch(timelineUrl, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
    }
  })
    .then((response) => {
      console.log("API響應狀態:", response.status, response.statusText);
      console.log("響應頭:", response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("時間軸資料獲取成功:", data.items?.length || 0, "個活動");
      console.log("所有活動:", data.items);
      
      if (data.items && data.items.length > 0) {
        renderTimelineWithData(data.items);
      } else {
        console.log("沒有找到活動數據");
        if (timelineCalendar) {
          timelineCalendar.innerHTML = `
            <div class="timeline-empty-state">
              <h3>時間軸</h3>
              <p>目前沒有活動安排</p>
              <p>請稍後再查看</p>
            </div>
          `;
        }
      }
    })
    .catch((err) => {
      console.error("獲取時間軸資料時出錯:", err);
      if (timelineCalendar) {
        timelineCalendar.innerHTML = `
          <div class="timeline-error-state">
            <h3>時間軸載入錯誤</h3>
            <button onclick="location.reload()" class="timeline-reload-btn">重新載入</button>
          </div>
        `;
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
  const timelineHeight = hoursInDay * 60; // 780px（增加間距讓內容更清楚）

  // 只顯示 2025/11/21-2025/11/23 這三天
  const eventDays = [
    { year: 2025, month: 10, day: 21 }, // 11月21日
    { year: 2025, month: 10, day: 22 }, // 11月22日
    { year: 2025, month: 10, day: 23 }  // 11月23日
  ];

  // 創建主容器 - 包含時間軸和預覽區
  const mainContainer = document.createElement("div");
  mainContainer.className = "timeline-main-container dynamic-height";
  mainContainer.style.height = `${timelineHeight + 100}px`; // 保留動態高度設定

  // 創建時間軸區域（縱軸是時間，橫軸是日期）
  const timelineArea = document.createElement("div");
  timelineArea.className = "timeline-area dynamic-height";
  timelineArea.style.height = `${timelineHeight + 100}px`; // 保留動態高度設定
  
  // 計算可用寬度，確保不超出容器
  const availableWidth = timelineArea.offsetWidth || 1200; // 預設1200px如果無法獲取
  const dayWidth = Math.floor((availableWidth - 60) / eventDays.length); // 減少邊距，更緊湊的布局
  
  // 將可用寬度存儲到全局變量，供事件定位使用
  window.timelineAvailableWidth = availableWidth;
  window.timelineDayWidth = dayWidth;

  // 創建預覽容器
  const previewContainer = document.createElement("div");
  previewContainer.className = "timeline-right-container dynamic dynamic-height";
  previewContainer.style.height = `${timelineHeight + 100}px`; // 保留動態高度設定

  // 預覽區域的默認內容 - 顯示提示並預載隨機 workshop
  const workshopEvents = timelineData.filter(event => {
    const fields = parseDescription(event.description);
    return fields.TYPE && fields.TYPE.toUpperCase() === 'WORKSHOP';
  });
  
  // 隨機選擇一個 workshop，如果有的話
  const randomWorkshop = workshopEvents.length > 0 
    ? workshopEvents[Math.floor(Math.random() * workshopEvents.length)]
    : null;

  if (randomWorkshop) {
    const fields = parseDescription(randomWorkshop.description);
    const startTime = new Date(randomWorkshop.start.dateTime || randomWorkshop.start.date);
    const endTime = new Date(randomWorkshop.end.dateTime || randomWorkshop.end.date);
    
    const taiwanStartStr = startTime.toLocaleString("sv-SE", {timeZone: "Asia/Taipei"});
    const taiwanEndStr = endTime.toLocaleString("sv-SE", {timeZone: "Asia/Taipei"});
    const taiwanStartTime = new Date(taiwanStartStr);
    const taiwanEndTime = new Date(taiwanEndStr);
    
    const startTimeStr = taiwanStartTime.toLocaleTimeString("en-US", { 
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Taipei"
    });
    const endTimeStr = taiwanEndTime.toLocaleTimeString("en-US", { 
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Taipei"
    });
    
    const dateStr = taiwanStartTime.toLocaleDateString("en-US", { 
      weekday: "short",
      month: "numeric", 
      day: "numeric",
      timeZone: "Asia/Taipei"
    });
    
    const timeStr = `${startTimeStr} - ${endTimeStr}`;
    const dateTimeStr = `${dateStr} | ${timeStr}`;
    const eventTypeTag = `#WORKSHOP`;
    
    previewContainer.innerHTML = `
      <div class="timeline-preview-default">
        <p data-zh="點擊左側活動查看詳情" data-en="Click on the left events to view details">點擊左側活動查看詳情</p>
      </div>
      <div class="timeline-preview-content">
        ${fields.IMAGE ? `<img src="image/programIMG/${fields.IMAGE}" class="timeline-preview-image" alt="活動圖片" onerror="this.style.display='none';">` : ''}
      </div>
      <div class="timeline-preview-type-tag workshop">
        ${eventTypeTag}
      </div>
      <div class="timeline-preview-date-time">
        ${dateTimeStr}
      </div>
        <div class="timeline-preview-event-title">
        ${randomWorkshop.summary || "未命名活動"}
        </div>
        <div class="timeline-preview-description">
          ${fields.DESCRIPTION || randomWorkshop.description || "暫無詳細描述"}
        </div>
        ${fields.SIGNUP ? `<div class="timeline-preview-signup"><a href="${fields.SIGNUP}" target="_blank" class="timeline-preview-signup-btn">SIGN UP</a></div>` : ''}
    `;
  }

  // 創建時間標記（縱軸時間）- 固定位置，24小時
  const timelineStartY = 100; // 上邊距
  
  // 繪製時間格線（縱軸）- 從9:00到22:00，每小時60px（增加間距）
  for (let hour = startHour; hour < endHour; hour++) {
    const yPosition = timelineStartY + ((hour - startHour) * 60);
    
    const timeLine = document.createElement("div");
    timeLine.className = "timeline-time-line dynamic";
    timeLine.style.top = `${yPosition}px`;

    const timeLabel = document.createElement("div");
    timeLabel.className = "timeline-time-label dynamic";
    timeLabel.style.top = `${yPosition}px`;
    timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;

    timelineArea.appendChild(timeLine);
    timelineArea.appendChild(timeLabel);
  }

  // 創建日期區域分隔線
  eventDays.forEach(({ year, month, day }, dayIndex) => {
    const columnStartX = 30 + (dayIndex * dayWidth);
    
    // 左邊界線（除了第一個區域）
    if (dayIndex > 0) {
      const leftBorder = document.createElement("div");
      leftBorder.className = "timeline-zone-border dynamic";
      leftBorder.style.left = `${columnStartX}px`;
      leftBorder.style.top = `${timelineStartY}px`;
      leftBorder.style.height = `${timelineHeight}px`;
      timelineArea.appendChild(leftBorder);
    }
    
    // 右邊界線（最後一個區域）
    if (dayIndex === eventDays.length - 1) {
      const rightBorder = document.createElement("div");
      rightBorder.className = "timeline-zone-border dynamic";
      rightBorder.style.left = `${columnStartX + dayWidth}px`;
      rightBorder.style.top = `${timelineStartY}px`;
      rightBorder.style.height = `${timelineHeight}px`;
      timelineArea.appendChild(rightBorder);
    }
  });

  // 創建日期標記（橫軸日期）- 分離的日期區域
  const dateColumns = [];
  eventDays.forEach(({ year, month, day }, dayIndex) => {
    // 每個日期區域的中心位置，確保分離
    const columnStartX = 30 + (dayIndex * dayWidth); // 減少左邊距，更緊湊
    const columnCenterX = columnStartX + (dayWidth / 2); // 區域中心
    
    const dateColumn = document.createElement("div");
    dateColumn.className = "timeline-date-column dynamic";
    dateColumn.style.left = `${columnStartX}px`; // 日期標記在區域起始位置
    dateColumn.style.width = `${dayWidth}px`; // 設置區域寬度
    
    // 使用明確的台灣時區日期，固定顯示 21-23 日，不受使用者系統時區影響
    // 月份需要 +1 因為 ISO 格式是 1-based，而 month 變數是 0-based
    const date = new Date(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00+08:00`);
    // 使用英文格式顯示日期
    const weekday = date.toLocaleDateString("en-US", { 
      weekday: "short",
      timeZone: "Asia/Taipei"
    });
    const monthDay = date.toLocaleDateString("en-US", { 
      month: "numeric", 
      day: "numeric",
      timeZone: "Asia/Taipei"
    });
    dateColumn.textContent = `${weekday} ${monthDay}`;

    // 創建日期分隔線（垂直線）- 對齊到日期列中心
    const dateLine = document.createElement("div");
    dateLine.className = "timeline-date-line dynamic";
    dateLine.style.left = `${columnCenterX}px`; // 分隔線在日期列中心
    dateLine.style.top = `${timelineStartY}px`;
    dateLine.style.height = `${timelineHeight}px`;

    timelineArea.appendChild(dateColumn);
    timelineArea.appendChild(dateLine);
    dateColumns.push({ column: dateColumn, line: dateLine, day, centerX: columnCenterX });
  });

  // 創建事件類型篩選按鈕
  const filterContainer = document.createElement("div");
  filterContainer.className = "timeline-filter-container";
  
  // 事件類型按鈕
  const eventTypes = [
    { key: "all", label: "ALL", color: "black" },
    { key: "talk", label: "TALK", color: "orangered" },
    { key: "workshop", label: "WORKSHOP", color: "blue" },
    { key: "performance", label: "PERFORMANCE", color: "violet" }
  ];
  
  eventTypes.forEach(eventType => {
    const button = document.createElement("button");
    button.className = `timeline-filter-btn ${eventType.key}`;
    button.textContent = eventType.label;
    button.dataset.filter = eventType.key;
    
    // 默認選中"All"
    if (eventType.key === "all") {
      button.style.backgroundColor = "#333";
      button.style.color = "#fff";
    }
    
    // 點擊事件
    button.addEventListener("click", () => {
      // 重置所有按鈕樣式
      filterContainer.querySelectorAll(".timeline-filter-btn").forEach(btn => {
        const btnType = btn.dataset.filter;
        btn.className = `timeline-filter-btn ${btnType}`;
      });
      
      // 設置當前按鈕為選中狀態
      button.className = `timeline-filter-btn ${eventType.key}`;
      
      // 篩選事件
      filterEventsByType(eventType.key);
    });
    filterContainer.appendChild(button);
  });
  timelineArea.appendChild(filterContainer);
  
  // 存儲所有事件元素用於篩選
  const allEventElements = [];
  
  // 篩選事件函數
  const filterEventsByType = (filterType) => {
    allEventElements.forEach(eventElement => {
      const eventType = eventElement.dataset.eventType || "default";
      
      if (filterType === "all" || eventType === filterType) {
        eventElement.className = `timeline-event-bar dynamic ${eventType} visible`;
      } else {
        eventElement.className = `timeline-event-bar dynamic ${eventType} hidden`;
      }
    });
  };
  
  const eventsByDay = {};
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
    
    console.log("活動原始時間:", eventDate);
    console.log("活動台灣日期:", taiwanYear, taiwanMonth, taiwanDay);
    
    // 只顯示這三天的活動
    const dayIndex = eventDays.findIndex(({ year, month, day }) => 
      taiwanYear === year && 
      taiwanMonth === month && 
      taiwanDay === day
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

    // 根據類型設置不同的文字顏色（與篩選按鈕顏色一致）
    switch (eventType.toUpperCase()) {
      case "TALK":
        eventBar.className = "timeline-event-bar dynamic talk";
        break;
      case "WORKSHOP":
        eventBar.className = "timeline-event-bar dynamic workshop";
        break;
      case "PERFORMANCE":
        eventBar.className = "timeline-event-bar dynamic performance";
        break;
      default:
        eventBar.className = "timeline-event-bar dynamic default";
    }
    
    // 設置事件類型數據屬性用於篩選
    eventBar.dataset.eventType = eventType.toLowerCase();
    
    // 添加到篩選數組
    allEventElements.push(eventBar);

    // 計算活動的開始和結束時間 - 確保使用台灣時區
    const eventStartTime = new Date(event.start.dateTime || event.start.date);
    const eventEndTime = new Date(event.end.dateTime || event.end.date);
    
    // 使用 Intl.DateTimeFormat 獲取台灣時區的小時和分鐘，避免時區轉換問題
    const taiwanFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Taipei",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    
    const startParts = taiwanFormatter.formatToParts(eventStartTime);
    const endParts = taiwanFormatter.formatToParts(eventEndTime);
    
    const startHourNum = parseInt(startParts.find(p => p.type === 'hour').value);
    const startMinuteNum = parseInt(startParts.find(p => p.type === 'minute').value);
    const endHourNum = parseInt(endParts.find(p => p.type === 'hour').value);
    const endMinuteNum = parseInt(endParts.find(p => p.type === 'minute').value);

    // 創建台灣時區的日期物件 - 使用已經獲得的台灣時區的年、月、日和時間
    const taiwanEventDate = new Date(taiwanYear, taiwanMonth, taiwanDay, startHourNum, startMinuteNum);

    // 計算活動長條位置 - 精確到分鐘
    const timelineStartHour = 9; // 時間軸開始時間
    let startTimeY = timelineStartY + ((startHourNum - timelineStartHour) * 60) + (startMinuteNum * 1); // 每分鐘1px，每小時60px
    const barHeight = 30; // 固定高度

    // 將活動添加到對應的日期
    if (!eventsByDay[dayIndex]) {
      eventsByDay[dayIndex] = [];
    }
    
    eventsByDay[dayIndex].push({
      event,
      eventBar,
      eventFields,
      dayIndex,
      startTimeY,
      barHeight,
      taiwanEventDate,
      startHourNum,
      startMinuteNum,
      endHourNum,
      endMinuteNum
    });
  });

  // 渲染每個日期的活動，使用改進的防重疊定位系統
  Object.keys(eventsByDay).forEach(dayKey => {
    const eventsInDay = eventsByDay[dayKey];
    const dayIndex = parseInt(dayKey);
    
    // 按時間排序
    eventsInDay.sort((a, b) => a.startTimeY - b.startTimeY);
    
    // 分離的日期區域定位系統
    const columnStartX = 30 + (dayIndex * dayWidth); // 區域起始位置
    const columnCenterX = columnStartX + (dayWidth / 2); // 區域中心
    
    // 追蹤已放置的活動位置
    const placedEvents = [];
    
    // 為每個活動計算最佳位置
    eventsInDay.forEach((eventData, index) => {
      let { event, eventBar, eventFields, startTimeY, barHeight, taiwanEventDate, startHourNum, startMinuteNum, endHourNum, endMinuteNum } = eventData;
      
      // 創建活動內容以獲取實際寬度
      const eventContent = document.createElement("div");
      eventContent.className = "timeline-event-content";
      
      // 格式化時間顯示
      const startTimeStr = `${startHourNum.toString().padStart(2, '0')}:${startMinuteNum.toString().padStart(2, '0')}`;
      const endTimeStr = `${endHourNum.toString().padStart(2, '0')}:${endMinuteNum.toString().padStart(2, '0')}`;
      
      // 創建標題（活動名稱）- 統一字體大小，使用省略號
      const eventTitle = document.createElement("div");
      const titleText = event.summary || "未命名活動";
      
      // 統一字體大小，不再根據長度調整
      const fontSize = "14px";
      const maxWidth = "200px";
      
      eventTitle.className = `timeline-event-title ${fontSize === "10px" ? "small" : fontSize === "12px" ? "medium" : "large"}`;
      eventTitle.style.maxWidth = maxWidth; // 保留動態寬度設定
      eventTitle.textContent = titleText;
      
      // 創建時間信息（小灰字）
      const eventTime = document.createElement("div");
      eventTime.className = "timeline-event-time";
      eventTime.textContent = `${startTimeStr} - ${endTimeStr}`;
      
      eventContent.appendChild(eventTitle);
      eventContent.appendChild(eventTime);
      eventBar.appendChild(eventContent);
      
      // 先添加到DOM以測量寬度
      timelineArea.appendChild(eventBar);
      
      // 獲取實際寬度
      const actualWidth = eventBar.offsetWidth;
      
      // 使用不同寬度創建zigzag效果，但限制最大寬度
      const widthVariations = [0.8, 1.0, 1.2, 0.9, 1.1]; // 不同的寬度倍數
      const widthIndex = index % widthVariations.length;
      let adjustedWidth = actualWidth * widthVariations[widthIndex];
      
      // 限制最大寬度，防止過長的標題造成問題
      let maxAllowedWidth = 225; // 預設最大允許寬度
      
      // 根據標題長度動態調整最大寬度
      if (titleText.length > 30) {
        maxAllowedWidth = 160; // 超長標題限制更嚴格
      } else if (titleText.length > 20) {
        maxAllowedWidth = 200; // 長標題適中限制
      } else if (titleText.length > 15) {
        maxAllowedWidth = 220; // 中等標題較寬限制
      }
      
      // 確保寬度不超過區域寬度
      const availableZoneWidth = dayWidth - 20; // 區域可用寬度，減少邊距
      maxAllowedWidth = Math.min(maxAllowedWidth, availableZoneWidth);
      
      if (adjustedWidth > maxAllowedWidth) {
        adjustedWidth = maxAllowedWidth;
      }
      
      // 設置調整後的寬度
      eventBar.style.width = `${adjustedWidth}px`;
      
      // 定義嚴格的區域邊界
      const strictZoneLeft = columnStartX + 10;
      const strictZoneRight = columnStartX + dayWidth - 10;
      const zoneWidth = strictZoneRight - strictZoneLeft;
      
      // 簡化的定位算法 - 先嘗試水平排列，不行就垂直偏移
      let bestPosition = strictZoneLeft;
      
      // 檢查是否有精確時間重疊的活動（檢查相同時間的事件）
      const sameTimeEvents = placedEvents.filter(placedEvent => {
        // 檢查是否在相同的時間位置（允許5px的誤差）
        return Math.abs(placedEvent.top - startTimeY) <= 5;
      });
      
      // 計算當前事件應該的索引（基於已放置的同時間事件數量）
      const currentEventIndex = sameTimeEvents.length;
      
      console.log(`Event "${titleText}": sameTimeEvents found=${sameTimeEvents.length}, currentEventIndex=${currentEventIndex}, originalTop=${startTimeY}`);
      console.log(`Event "${titleText}": placedEvents count=${placedEvents.length}, placedEvents:`, placedEvents.map(p => ({top: p.top, left: p.left})));
      
      // 強制處理第三個事件
      if (currentEventIndex >= 2) {
        let horizontalOffset, verticalOffset;
        
        // 特殊處理第三個事件：TOP-15, left+100
        if (currentEventIndex === 2) {
          horizontalOffset = 100;
          verticalOffset = -15; // 向上移動15px
          console.log(`Event "${titleText}": SPECIAL CASE - Third event, TOP-15, left+100`);
        } else {
          // 其他事件使用正常偏移
          horizontalOffset = currentEventIndex * 100; 
          verticalOffset = currentEventIndex * 15; 
        }
        
        // 計算新位置
        const newTop = startTimeY + verticalOffset;
        const newLeft = strictZoneLeft + horizontalOffset;
        
        console.log(`Event "${titleText}": APPLYING OFFSET - horizontalOffset=${horizontalOffset}, verticalOffset=${verticalOffset}, newTop=${newTop}, newLeft=${newLeft}`);
        
        // 強制應用偏移，不檢查邊界
        startTimeY = newTop;
        bestPosition = newLeft;
        
      } else if (currentEventIndex > 0) {
        // 處理第二個事件
        const horizontalOffset = currentEventIndex * 100; 
        const verticalOffset = currentEventIndex * 15; 
        
        const newTop = startTimeY + verticalOffset;
        const newLeft = strictZoneLeft + horizontalOffset;
        
        console.log(`Event "${titleText}": Second event offset - horizontalOffset=${horizontalOffset}, verticalOffset=${verticalOffset}`);
        
        startTimeY = newTop;
        bestPosition = newLeft;
      } else {
        console.log(`Event "${titleText}": NO OFFSET APPLIED - first event or no same time events found`);
      }
      
      // 如果還是沒找到位置，使用預設居中
      if (!bestPosition) {
        bestPosition = columnCenterX - adjustedWidth/2;
      }
      
      // 最終邊界檢查 - 使用嚴格邊界
      if (bestPosition < strictZoneLeft) {
        bestPosition = strictZoneLeft;
      } else if (bestPosition + adjustedWidth > strictZoneRight) {
        bestPosition = strictZoneRight - adjustedWidth;
      }
      
      // 調試：確認事件在區域內
      console.log(`Day ${dayIndex + 1} Event "${titleText}": time=${startHourNum}:${startMinuteNum.toString().padStart(2, '0')}, top=${startTimeY}, position=${bestPosition}, width=${adjustedWidth}, sameTimeEvents=${sameTimeEvents.length}, zone=[${strictZoneLeft}, ${strictZoneRight}]`);

      // 設置最終位置
      eventBar.style.height = `${barHeight}px`;
      eventBar.style.left = `${bestPosition}px`;
      eventBar.style.top = `${startTimeY}px`;
      
      // 記錄已放置的活動
      const placedEventData = {
        left: bestPosition,
        top: startTimeY,
        width: adjustedWidth,
        height: barHeight
      };
      placedEvents.push(placedEventData);
      
      console.log(`Event "${titleText}": ADDED TO placedEvents - top=${startTimeY}, left=${bestPosition}, total placedEvents=${placedEvents.length}`);

      // 添加點擊事件 - 顯示活動預覽
      const showEventPreview = () => {
        console.log("顯示活動預覽:", event.summary);
        console.log("活動描述:", event.description);
        console.log("解析後的欄位:", eventFields);
        
        const eventTime = new Date(event.start.dateTime || event.start.date);
        const eventEndTime = new Date(event.end.dateTime || event.end.date);
        
        // 格式化開始和結束時間 - 使用24小時制
        const startTimeStr = eventTime.toLocaleTimeString("en-US", { 
          hour: "2-digit", 
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Taipei"
        });
        
        const endTimeStr = eventEndTime.toLocaleTimeString("en-US", { 
          hour: "2-digit", 
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Taipei"
        });
        
        // 格式化日期 - 使用英文格式
        const dateStr = taiwanEventDate.toLocaleDateString("en-US", { 
          weekday: "short",
          month: "numeric", 
          day: "numeric",
          timeZone: "Asia/Taipei"
        });
        
        const timeStr = `${startTimeStr} - ${endTimeStr}`;
        const dateTimeStr = `${dateStr} | ${timeStr}`;
        
        // 獲取活動類型標籤 - 重新解析事件類型
        const currentEventType = eventFields.TYPE || "DEFAULT";
        const eventTypeTag = `#${currentEventType.toUpperCase()}`;
        
        console.log("預覽時間顯示:", timeStr, "開始時間:", eventTime, "結束時間:", eventEndTime);
        
        previewContainer.innerHTML = `
          <div class="timeline-preview-content">
            ${eventFields.IMAGE ? `<img src="image/programIMG/${eventFields.IMAGE}" class="timeline-preview-image" alt="活動圖片" onerror="this.style.display='none'; console.log('時間軸圖片載入失敗:', 'image/programIMG/${eventFields.IMAGE}');" onload="console.log('時間軸圖片載入成功:', 'image/programIMG/${eventFields.IMAGE}');">` : ''}
          </div>
          <div class="timeline-preview-type-tag ${currentEventType.toLowerCase()}">
            ${eventTypeTag}
          </div>
          <div class="timeline-preview-date-time">
            ${dateTimeStr}
          </div>
          <div class="timeline-preview-event-title">
            ${event.summary || "未命名活動"}
          </div>
          <div class="timeline-preview-description">
            ${eventFields.DESCRIPTION || event.description || "暫無詳細描述"}
          </div>
          ${eventFields.SIGNUP ? `<div class="timeline-preview-signup"><a href="${eventFields.SIGNUP}" target="_blank" class="timeline-preview-signup-btn">報名參加</a></div>` : ''}
        `;
        
        // 手機版：自動滾動到最右邊以顯示預覽區
        const scrollContainer = document.getElementById("timelineScroll");
        if (scrollContainer) {
          // 檢查是否為手機版（寬度小於768px）
          const isMobile = window.innerWidth <= 768;
          if (isMobile) {
            // 滾動到最右邊（預覽區）
            setTimeout(() => {
              scrollContainer.scrollTo({
                left: scrollContainer.scrollWidth - scrollContainer.clientWidth,
                behavior: 'smooth'
              });
            }, 100); // 稍微延遲確保內容已更新
          }
        }
      };

      eventBar.addEventListener("click", showEventPreview);

      timelineArea.appendChild(eventBar);
    });
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
      timelineModeContainer.className = "timeline-mode-container visible";
      console.log("時間軸容器已設置為顯示");
      
      // 渲染時間軸模式
      renderTimelineMode();
      console.log("時間軸模式已渲染");
    }
  }, 1000); // 延遲1秒執行
});
