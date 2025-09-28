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

// 計算不同模式的時間範圍
const now = new Date();

// 卡片模式：從今天開始的即將到來的活動
const upcomingUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
  calendarId
)}/events?key=${apiKey}&singleEvents=true&orderBy=startTime&timeMin=${now.toISOString()}`;

// 時間軸模式：前後六個月的所有活動
const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
const sixMonthsLater = new Date(now.getFullYear(), now.getMonth() + 6, 31);
const timelineUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
  calendarId
)}/events?key=${apiKey}&singleEvents=true&orderBy=startTime&timeMin=${sixMonthsAgo.toISOString()}&timeMax=${sixMonthsLater.toISOString()}`;

// 預設使用卡片模式的 URL（保持向後兼容）
const url = upcomingUrl;

// DOM 元素引用
const eventsTimeline = document.getElementById("eventsTimeline");
const calenderScroll = document.getElementById("calenderScroll");
const timelineScroll = document.getElementById("timelineScroll");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const cardModeBtn = document.getElementById("cardMode");
const timelineModeBtn = document.getElementById("timelineMode");
const cardModeContainer = document.getElementById("cardModeContainer");
const timelineModeContainer = document.getElementById("timelineModeContainer");
const timelineCalendar = document.getElementById("timelineCalendar");

// 系統變數
let maxEvents = 4; // 預設顯示4個活動
let calendarData = null; // 儲存從 Google Calendar 獲取的資料
let currentSlide = 0; // 當前滑動位置
let totalSlides = 0; // 總滑動數量
let currentMode = "card"; // 當前顯示模式：card 或 timeline

/**
 * 模式切換功能
 * @param {string} mode - 要切換的模式：'card' 或 'timeline'
 */
function switchMode(mode) {
  console.log("切換模式到:", mode);
  currentMode = mode;

  // 更新按鈕狀態
  cardModeBtn.classList.toggle("active", mode === "card");
  timelineModeBtn.classList.toggle("active", mode === "timeline");

  // 切換容器顯示
  if (mode === "card") {
    console.log("顯示卡片模式，隱藏時間軸模式");
    cardModeContainer.style.display = "block";
    timelineModeContainer.style.display = "none";
    cardModeContainer.classList.remove("hidden");
    timelineModeContainer.classList.add("hidden");
  } else {
    console.log("顯示時間軸模式，隱藏卡片模式");
    cardModeContainer.style.display = "none";
    timelineModeContainer.style.display = "block";
    cardModeContainer.classList.add("hidden");
    timelineModeContainer.classList.remove("hidden");
    renderTimelineMode(); // 渲染時間軸模式
  }

  // 調試信息
  console.log("卡片模式容器顯示狀態:", cardModeContainer.style.display);
  console.log("時間軸模式容器顯示狀態:", timelineModeContainer.style.display);
}

// 綁定模式切換事件
cardModeBtn.addEventListener("click", () => {
  console.log("點擊卡片模式按鈕");
  switchMode("card");
});

timelineModeBtn.addEventListener("click", () => {
  console.log("點擊時間軸模式按鈕");
  switchMode("timeline");
});

// 確保初始狀態正確
document.addEventListener("DOMContentLoaded", () => {
  console.log("頁面載入完成，設置初始狀態");

  // 檢查元素是否存在
  console.log("卡片模式容器:", cardModeContainer);
  console.log("時間軸模式容器:", timelineModeContainer);
  console.log("卡片模式按鈕:", cardModeBtn);
  console.log("時間軸模式按鈕:", timelineModeBtn);

  // 檢查初始類
  console.log("卡片模式容器類:", cardModeContainer.className);
  console.log("時間軸模式容器類:", timelineModeContainer.className);

  // 確保卡片模式是預設顯示的
  cardModeContainer.classList.remove("hidden");
  timelineModeContainer.classList.add("hidden");
  currentMode = "card";

  console.log("初始狀態設置完成，當前模式:", currentMode);
});

/**
 * 滑動功能 - 根據當前模式選擇目標容器
 * @param {number} index - 要滑動到的索引位置
 */
function scrollToSlide(index) {
  if (currentMode === "card") {
    // 卡片模式：滑動到指定卡片
    const slideWidth = 350 + 32; // 項目寬度 + gap
    const scrollPosition = index * slideWidth;
    calenderScroll.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });
  } else {
    // 時間軸模式：滑動到指定月份
    // 由於每個月份寬度不同，需要計算累積位置
    const monthElements = document.querySelectorAll(".timeline-month");
    if (monthElements[index]) {
      const targetElement = monthElements[index];
      const scrollPosition = targetElement.offsetLeft;
      timelineScroll.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }
}

// 導航按鈕事件（如果按鈕存在的話）
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    if (currentSlide > 0) {
      currentSlide--;
      scrollToSlide(currentSlide);
    }
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
      scrollToSlide(currentSlide);
    }
  });
}

// 觸控滑動支援 - 根據當前模式選擇目標容器
let startX = 0;
let startScrollLeft = 0;

/**
 * 設置觸控滑動功能
 * @param {HTMLElement} container - 要添加觸控滑動的容器
 */
function setupTouchScroll(container) {
  if (!container) return;

  container.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    startScrollLeft = container.scrollLeft;
  });

  container.addEventListener("touchmove", (e) => {
    if (!startX) return;

    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    container.scrollLeft = startScrollLeft + diff;
  });

  container.addEventListener("touchend", (e) => {
    if (!startX) return;

    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    const threshold = 50; // 滑動閾值

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentSlide < totalSlides - 1) {
        // 向左滑動，下一張
        currentSlide++;
      } else if (diff < 0 && currentSlide > 0) {
        // 向右滑動，上一張
        currentSlide--;
      }
      scrollToSlide(currentSlide);
    }

    startX = 0;
  });
}

// 設置兩個容器的觸控滑動
setupTouchScroll(calenderScroll);
setupTouchScroll(timelineScroll);

/**
 * 滾動事件監聽器 - 根據當前模式選擇目標容器
 * @param {HTMLElement} container - 要監聽滾動的容器
 * @param {number} slideWidth - 每個滑動項目的寬度
 */
function setupScrollListener(container, slideWidth) {
  if (!container) return;

  container.addEventListener("scroll", () => {
    const scrollLeft = container.scrollLeft;
    currentSlide = Math.round(scrollLeft / slideWidth);
  });
}

// 設置兩個容器的滾動監聽
setupScrollListener(calenderScroll, 350 + 32);
// 時間軸模式由於每個月份寬度不同，暫時不使用自動滾動檢測

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

  // 計算時間範圍（當前時間前後各6個月）
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // 生成月份列表（前後各6個月）
  const months = [];
  for (let i = -6; i <= 6; i++) {
    const monthOffset = currentMonth + i;
    const year = currentYear + Math.floor(monthOffset / 12);
    const month = ((monthOffset % 12) + 12) % 12;
    months.push({ year, month });
  }

  // 渲染每個月份
  months.forEach(({ year, month }) => {
    const monthContainer = document.createElement("div");
    monthContainer.className = "timeline-month";

    const monthHeader = document.createElement("div");
    monthHeader.className = "timeline-month-header";
    const monthName = new Date(year, month).toLocaleDateString("en-US", {
      month: "short",
    });
    monthHeader.textContent = `${monthName} ${year}`;

    const daysContainer = document.createElement("div");
    daysContainer.className = "timeline-days";

    // 獲取該月的天數並動態設定寬度
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayWidth = 19.2; // 1.2rem = 19.2px
    const minSpacing = 4; // 最小間距
    const monthWidth = daysInMonth * dayWidth + (daysInMonth - 1) * minSpacing;

    // 動態設定月份容器和日期容器的寬度
    const containerMargin = 16; // 左右各8px的padding
    monthContainer.style.minWidth = `${monthWidth + containerMargin}px`;
    daysContainer.style.width = `${monthWidth}px`;
    daysContainer.style.marginLeft = `${containerMargin / 2}px`; // 左邊padding，讓第一個日期點離分隔線遠一點
    daysContainer.style.marginRight = `${containerMargin / 2}px`; // 右邊padding，平衡左右

    // 創建日期點
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement("div");
      dayElement.className = "timeline-day";
      dayElement.textContent = day;

      // 檢查是否為今天
      if (
        year === now.getFullYear() &&
        month === now.getMonth() &&
        day === now.getDate()
      ) {
        dayElement.classList.add("today");
      }

      // 計算日期點的精確位置
      const dayWidth = 19.2; // 每個日期點的寬度（1.2rem = 19.2px）
      const minSpacing = 4; // 最小間距 4px
      const monthWidth =
        daysInMonth * dayWidth + (daysInMonth - 1) * minSpacing; // 動態計算月份寬度

      let daySpacing = minSpacing;
      if (daysInMonth > 1) {
        daySpacing = minSpacing; // 使用固定的最小間距
      }
      const dayPosition = (day - 1) * (dayWidth + daySpacing);
      dayElement.style.left = `${dayPosition}px`;
      dayElement.style.position = "absolute";

      console.log(`日期點 ${day}: 位置 ${dayPosition}px, 間距 ${daySpacing}px`);

      // 添加 hover 事件監聽器
      dayElement.addEventListener("mouseenter", () => {
        // 為該天的所有活動添加 hover 效果
        const monthContainer = dayElement.closest(".timeline-month");
        const eventsInThisDay = monthContainer.querySelectorAll(
          `.timeline-event-bar[data-day="${day}"]`
        );
        eventsInThisDay.forEach((eventBar) => {
          eventBar.classList.add("event-hovered");
        });
      });

      dayElement.addEventListener("mouseleave", () => {
        // 移除該天所有活動的 hover 效果
        const monthContainer = dayElement.closest(".timeline-month");
        const eventsInThisDay = monthContainer.querySelectorAll(
          `.timeline-event-bar[data-day="${day}"]`
        );
        eventsInThisDay.forEach((eventBar) => {
          eventBar.classList.remove("event-hovered");
        });
      });

      daysContainer.appendChild(dayElement);
    }

    // 創建活動區域
    const eventsArea = document.createElement("div");
    eventsArea.className = "timeline-events-area";
    eventsArea.style.paddingLeft = `${containerMargin / 2}px`; // 與日期容器同樣的左邊距

    // 查找該月份的活動
    const monthEvents = timelineData.filter((event) => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });

    // 為每個活動創建黑色長條
    monthEvents.forEach((event, index) => {
      const eventBar = document.createElement("div");
      eventBar.className = "timeline-event-bar";

      // 檢查是否為全天活動
      const isAllDay = !event.start.dateTime;
      if (isAllDay) {
        eventBar.classList.add("all-day");
      }

      // 計算活動的開始日期和持續時間
      const startDate = new Date(event.start.dateTime || event.start.date);
      const endDate = new Date(event.end.dateTime || event.end.date);
      const startDay = startDate.getDate();
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      // 計算長條的位置和寬度
      const dayWidth = 19.2; // 每個日期點的寬度（1.2rem = 19.2px）
      const minSpacing = 4; // 最小間距 4px
      const actualDayCount = daysInMonth; // 實際月份天數
      const monthWidth =
        actualDayCount * dayWidth + (actualDayCount - 1) * minSpacing; // 動態計算月份寬度

      // 使用固定間距
      let daySpacing = minSpacing;

      // 計算第一個日期點的位置（考慮 space-between 佈局）
      const firstDayPosition = 0; // 第一個日期點從左邊開始

      // 計算精確位置 - 對準新的日期點佈局
      const startPosition =
        firstDayPosition + (startDay - 1) * (dayWidth + daySpacing);

      // 計算長條寬度，確保與日期點對準
      let barWidth;
      if (duration === 1) {
        // 單日活動：寬度等於日期點寬度
        barWidth = dayWidth;
      } else {
        // 多日活動：寬度 = 開始日期點 + 中間的間距 + 結束日期點
        barWidth = duration * dayWidth + (duration - 1) * daySpacing;
      }

      // 設置長條位置和寬度（不需要額外調整，因為活動區域已有 padding）
      eventBar.style.left = `${startPosition}px`;
      eventBar.style.width = `${barWidth}px`;

      // 添加隨機旋轉 ±15度
      const randomRotation = (Math.random() - 0.5) * 25; // -12.5 到 +12.5 度
      eventBar.style.transform = `translateX(-2px) rotate(${randomRotation}deg)`;
      eventBar.style.transformOrigin = "center center";

      // 添加 data-day 屬性，標記這個活動屬於哪一天
      eventBar.setAttribute("data-day", startDay);

      // 為活動本身添加 hover 事件監聽器
      eventBar.addEventListener("mouseenter", () => {
        // 為同一天的所有活動添加 hover 效果
        const monthContainer = eventBar.closest(".timeline-month");
        const eventsInThisDay = monthContainer.querySelectorAll(
          `.timeline-event-bar[data-day="${startDay}"]`
        );
        eventsInThisDay.forEach((bar) => {
          bar.classList.add("event-hovered");
        });
      });

      eventBar.addEventListener("mouseleave", () => {
        // 移除同一天所有活動的 hover 效果
        const monthContainer = eventBar.closest(".timeline-month");
        const eventsInThisDay = monthContainer.querySelectorAll(
          `.timeline-event-bar[data-day="${startDay}"]`
        );
        eventsInThisDay.forEach((bar) => {
          bar.classList.remove("event-hovered");
        });
      });

      console.log(
        `活動: ${event.summary}, 開始日: ${startDay}, 持續: ${duration}天, 位置: ${startPosition}px, 寬度: ${barWidth}px, 間距: ${daySpacing}px, 月份天數: ${actualDayCount}`
      );

      // 設置長條的垂直位置（堆疊多個活動）
      const verticalPosition = index * 30; // 每個活動間隔30px
      eventBar.style.top = `${verticalPosition}px`;

      // 解析描述欄位
      const eventFields = parseDescription(event.description);
      const eventType = eventFields.TYPE || "DEFAULT";

      // 根據類型添加對應的樣式類別
      eventBar.classList.add(`timeline-${eventType.toLowerCase()}`);

      // 創建活動內容
      const eventContent = document.createElement("div");
      eventContent.className = "timeline-event-content";

      // 創建帶有顏色的點
      const eventDot = document.createElement("span");
      eventDot.className = "timeline-event-dot";

      // 根據類型設置不同的顏色
      let eventColor;
      switch (eventType.toUpperCase()) {
        case "TALK":
          eventColor = "rgb(255, 0, 255)"; // 洋紅色
          break;
        case "WORKSHOP":
          eventColor = "rgb(54, 162, 235)"; // 藍色
          break;
        case "PERFORMANCE":
          eventColor = "rgb(255, 255, 0)"; // 黃色
          break;
        case "EXHIBITION":
          eventColor = "rgb(255, 165, 0)"; // 橙色
          break;
        default:
          eventColor = "rgb(0, 128, 0)"; // 綠色
      }

      eventDot.style.backgroundColor = eventColor;

      // 根據活動持續時間調整點的樣式
      if (duration === 1) {
        // 單日活動：圓形點
        eventDot.style.width = "6px";
        eventDot.style.height = "6px";
        eventDot.style.borderRadius = "50%";
      } else {
        // 跨天數活動：橢圓形點，寬度根據持續天數調整
        const dotWidth = Math.max(6, duration * 3); // 每多一天增加3px寬度
        eventDot.style.width = `${dotWidth}px`;
        eventDot.style.height = "6px";
        eventDot.style.borderRadius = "3px"; // 橢圓形
      }

      eventDot.style.position = "absolute";

      // 調整點的位置，讓點的中心對準活動開始那天的中心
      if (duration === 1) {
        // 單日活動：點的中心對準日期點的中心
        eventDot.style.left = "-0.8rem";
      } else {
        // 跨天數活動：點的左邊緣對準開始日期，但需要調整讓點的中心對準開始日期點的中心
        const dotWidth = Math.max(6, duration * 3);
        const offset = (dotWidth - 6) / 2; // 計算偏移量，讓點的中心對準開始日期點
        eventDot.style.left = `calc(-0.8rem - ${offset}px)`;
      }

      eventDot.style.top = "50%";
      eventDot.style.transform = "translateY(-50%)";
      eventDot.style.zIndex = "3";

      const eventTitle = document.createElement("div");
      eventTitle.className = "timeline-event-title";
      eventTitle.textContent = event.summary || "活動";

      const eventTime = document.createElement("div");
      eventTime.className = "timeline-event-time";

      // 檢查是否為全天活動
      if (event.start.dateTime && event.end.dateTime) {
        // 有具體時間的活動
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        const startHours = String(startTime.getHours()).padStart(2, "0");
        const startMinutes = String(startTime.getMinutes()).padStart(2, "0");
        const endHours = String(endTime.getHours()).padStart(2, "0");
        const endMinutes = String(endTime.getMinutes()).padStart(2, "0");
        eventTime.textContent = `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
      } else {
        // 全天活動 - 不顯示時間
        eventTime.style.display = "none";
      }

      eventContent.appendChild(eventDot);
      eventContent.appendChild(eventTitle);
      eventContent.appendChild(eventTime);
      eventBar.appendChild(eventContent);

      eventsArea.appendChild(eventBar);
    });

    monthContainer.appendChild(monthHeader);
    monthContainer.appendChild(daysContainer);
    monthContainer.appendChild(eventsArea);
    timelineCalendar.appendChild(monthContainer);
  });

  // 更新總滑動數量
  totalSlides = months.length;

  // 自動滾動到當前月份
  setTimeout(() => {
    // 找到當前月份的元素（索引 6，因為是前後各6個月的中心）
    const currentMonthIndex = 6;
    const monthElements = document.querySelectorAll(".timeline-month");
    if (monthElements[currentMonthIndex]) {
      const currentMonthElement = monthElements[currentMonthIndex];
      const scrollPosition =
        currentMonthElement.offsetLeft -
        timelineScroll.clientWidth / 2 +
        currentMonthElement.offsetWidth / 2;
      timelineScroll.scrollTo({
        left: Math.max(0, scrollPosition), // 確保不會滾動到負值
        behavior: "smooth",
      });
    }
  }, 100);
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

  // 清空現有內容
  eventsTimeline.innerHTML = "";

  // 限制顯示的活動數量
  const limitedItems = items.slice(0, maxEvents);

  // 依開始時間排序，並處理整日事件
  const sortedItems = [...limitedItems].sort((a, b) => {
    const sa = a.start.dateTime || a.start.date || "";
    const sb = b.start.dateTime || b.start.date || "";
    return new Date(sa) - new Date(sb);
  });

  totalSlides = sortedItems.length;

  /**
   * 格式化時間為 24 小時制
   * @param {Date} dateObj - 日期物件
   * @returns {string} 格式化後的時間字串 (HH:MM)
   */
  const formatTime24 = (dateObj) => {
    const hh = String(dateObj.getHours()).padStart(2, "0");
    const mm = String(dateObj.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  /**
   * 將日期轉換為 YYYY/MM/DD 格式
   * @param {Date} dateObj - 日期物件
   * @returns {string} 格式化後的日期字串
   */
  const formatDateToSlash = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}/${month}/${day}`;
  };

  /**
   * 根據類型獲取對應的樣式類別
   * @param {string} type - 活動類型
   * @returns {string} CSS 類別名稱
   */
  const getTypeClass = (type) => {
    switch (type?.toUpperCase()) {
      case "TALK":
        return "event-type-talk";
      case "WORKSHOP":
        return "event-type-workshop";
      case "PERFORMANCE":
        return "event-type-performance";
      case "EXHIBITION":
        return "event-type-exhibition";
      default:
        return "event-type-default";
    }
  };

  // 渲染每個活動
  sortedItems.forEach((event) => {
    const startISO = event.start.dateTime;
    const endISO = event.end.dateTime;
    const startDate = new Date(startISO);
    const endDate = new Date(endISO);
    const dateFull = formatDateToSlash(startDate);
    const startTime = formatTime24(startDate);
    const endTime = formatTime24(endDate);

    // 解析描述欄位
    const eventFields = parseDescription(event.description);
    const eventType = eventFields.TYPE || "";
    const eventImage = eventFields.IMAGE || "";
    const eventDescription = eventFields.DESCRIPTION || "";
    const eventSignup = eventFields.SIGNUP || "";

    // 調試日誌
    console.log(`活動: "${event.summary}"`);
    console.log(`原始描述:`, event.description);
    console.log(`解析結果:`, eventFields);
    console.log(
      `TYPE: "${eventType}", IMAGE: "${eventImage}", DESCRIPTION: "${eventDescription}", SIGNUP: "${eventSignup}"`
    );

    // 檢查是否有活動類型，如果沒有則跳過（不在卡片模式中顯示）
    if (!eventType) {
      console.log(`跳過活動 "${event.summary}"：沒有指定 TYPE`);
      return;
    }

    // 根據類型創建不同的 HTML 結構
    let imageHTML = "";
    if (eventImage) {
      // 清理圖片 URL
      const cleanUrl = eventImage.replace(/["']/g, "").trim();
      imageHTML = `<img src="${cleanUrl}" alt="TPABF" class="event-image">`;
    }

    // 創建報名按鈕 HTML
    let signupHTML = "";
    if (eventSignup) {
      signupHTML = `<a href="${eventSignup}" target="_blank" class="event-signup-btn">立即報名</a>`;
    }

    // 創建描述 HTML
    let descriptionHTML = "";
    if (eventDescription) {
      descriptionHTML = `<div class="event-description">${eventDescription}</div>`;
    }

    // 根據類型創建不同的卡片樣式
    const timelineHTML = `
      <div class="timeline-item ${getTypeClass(eventType)}">
        <div class="event-main-content">
          <div class="event-thumb">${imageHTML}</div>
          <div class="event-title-section">
            <div class="event-title">${event.summary || "（無標題）"}</div>
            <div class="event-description-section">
              ${descriptionHTML}
            </div>
          </div>
        </div>
        <div class="event-footer">
          <div class="event-date">${dateFull}</div>
          <div class="event-time">${startTime} - ${endTime}</div>
          ${signupHTML}
        </div>
      </div>
    `;

    eventsTimeline.innerHTML += timelineHTML;
  });
}

/**
 * 解析描述中的欄位
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

  console.log("parseDescription: 最終解析結果:", fields);
  return fields;
};

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
fetch(url)
  .then((res) => res.json())
  .then((data) => {
    calendarData = data.items;
    renderEvents(data.items);
    setupEventTypeFilter(); // 設置篩選器
  })
  .catch((err) => console.error("抓取日曆時出錯", err));
