// 把下面兩個換成你的
const calendarId =
  "90527f67fa462c83e184b0c62def10ebc8b00cc8c67a5b83af2afb90a1bdb293@group.calendar.google.com";
const apiKey = "AIzaSyCOLToQuZFbB1mULxYrMyQVeTVGnhk8-U4";

// Google Calendar API URL
const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
  calendarId
)}/events?key=${apiKey}&singleEvents=true&orderBy=startTime&timeMin=${new Date().toISOString()}`;

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

// 預設顯示4個活動
let maxEvents = 4;
let calendarData = null;
let currentSlide = 0;
let totalSlides = 0;
let currentMode = "card";

// 模式切換功能
function switchMode(mode) {
  console.log("切換模式到:", mode); // 調試信息
  currentMode = mode;

  // 更新按鈕狀態
  cardModeBtn.classList.toggle("active", mode === "card");
  timelineModeBtn.classList.toggle("active", mode === "timeline");

  // 切換容器顯示
  if (mode === "card") {
    console.log("顯示卡片模式，隱藏時間軸模式"); // 調試信息
    cardModeContainer.style.display = "block";
    timelineModeContainer.style.display = "none";
    cardModeContainer.classList.remove("hidden");
    timelineModeContainer.classList.add("hidden");
  } else {
    console.log("顯示時間軸模式，隱藏卡片模式"); // 調試信息
    cardModeContainer.style.display = "none";
    timelineModeContainer.style.display = "block";
    cardModeContainer.classList.add("hidden");
    timelineModeContainer.classList.remove("hidden");
    renderTimelineMode();
  }

  // 調試信息
  console.log("卡片模式容器顯示狀態:", cardModeContainer.style.display);
  console.log("時間軸模式容器顯示狀態:", timelineModeContainer.style.display);
}

// 綁定模式切換事件
cardModeBtn.addEventListener("click", () => {
  console.log("點擊卡片模式按鈕"); // 調試信息
  switchMode("card");
});

timelineModeBtn.addEventListener("click", () => {
  console.log("點擊時間軸模式按鈕"); // 調試信息
  switchMode("timeline");
});

// 確保初始狀態正確
document.addEventListener("DOMContentLoaded", () => {
  console.log("頁面載入完成，設置初始狀態"); // 調試信息

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

// 滑動功能 - 根據當前模式選擇目標容器
function scrollToSlide(index) {
  if (currentMode === "card") {
    const slideWidth = 350 + 32; // 項目寬度 + gap
    const scrollPosition = index * slideWidth;
    calenderScroll.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });
  } else {
    // 時間軸模式：滑動到指定月份
    const monthWidth = 300 + 32; // 月份寬度 + gap
    const scrollPosition = index * monthWidth;
    timelineScroll.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });
  }
}

// 導航按鈕事件
prevBtn.addEventListener("click", () => {
  if (currentSlide > 0) {
    currentSlide--;
    scrollToSlide(currentSlide);
  }
});

nextBtn.addEventListener("click", () => {
  if (currentSlide < totalSlides - 1) {
    currentSlide++;
    scrollToSlide(currentSlide);
  }
});

// 觸控滑動支援 - 根據當前模式選擇目標容器
let startX = 0;
let startScrollLeft = 0;

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

// 滾動事件監聽器 - 根據當前模式選擇目標容器
function setupScrollListener(container, slideWidth) {
  if (!container) return;

  container.addEventListener("scroll", () => {
    const scrollLeft = container.scrollLeft;
    currentSlide = Math.round(scrollLeft / slideWidth);
  });
}

// 設置兩個容器的滾動監聽
setupScrollListener(calenderScroll, 350 + 32);
setupScrollListener(timelineScroll, 300 + 32);

// 渲染時間軸模式
function renderTimelineMode() {
  if (!calendarData || !timelineCalendar) return;

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

    // 獲取該月的天數
    const daysInMonth = new Date(year, month + 1, 0).getDate();

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
      const dayWidth = 15; // 每個日期點的寬度
      let daySpacing = 0;
      if (daysInMonth > 1) {
        daySpacing = (300 - daysInMonth * dayWidth) / (daysInMonth - 1);
      }
      const dayPosition = (day - 1) * (dayWidth + daySpacing);
      dayElement.style.left = `${dayPosition}px`;
      dayElement.style.position = "absolute";

      console.log(`日期點 ${day}: 位置 ${dayPosition}px, 間距 ${daySpacing}px`); // 調試信息

      daysContainer.appendChild(dayElement);
    }

    // 創建活動區域
    const eventsArea = document.createElement("div");
    eventsArea.className = "timeline-events-area";

    // 查找該月份的活動
    const monthEvents = calendarData.filter((event) => {
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
      const monthWidth = 300; // 月份容器寬度
      const actualDayCount = daysInMonth; // 實際月份天數
      const dayWidth = 15; // 每個日期點的寬度

      // 計算日期點之間的間距（使用 space-between 佈局）
      let daySpacing = 0;
      if (actualDayCount > 1) {
        daySpacing =
          (monthWidth - actualDayCount * dayWidth) / (actualDayCount - 1);
      }

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

      // 設置長條位置和寬度
      eventBar.style.left = `${startPosition}px`;
      eventBar.style.width = `${barWidth}px`;

      console.log(
        `活動: ${event.summary}, 開始日: ${startDay}, 持續: ${duration}天, 位置: ${startPosition}px, 寬度: ${barWidth}px, 間距: ${daySpacing}px, 月份天數: ${actualDayCount}`
      ); // 調試信息

      // 設置長條的垂直位置（堆疊多個活動）
      const verticalPosition = index * 30; // 每個活動間隔30px
      eventBar.style.top = `${verticalPosition}px`;

      // 創建活動內容
      const eventContent = document.createElement("div");
      eventContent.className = "timeline-event-content";

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

  // 自動滾動到當前時間（中心位置）
  setTimeout(() => {
    const centerPosition =
      timelineScroll.scrollWidth / 2 - timelineScroll.clientWidth / 2;
    timelineScroll.scrollTo({
      left: centerPosition,
      behavior: "smooth",
    });
  }, 100);
}

// 渲染事件的函數
function renderEvents(items) {
  if (!eventsTimeline) return;

  if (!items || items.length === 0) {
    eventsTimeline.innerHTML = "<p>沒有即將到來的活動 No upcoming events</p>";
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

  const formatTime24 = (dateObj) => {
    const hh = String(dateObj.getHours()).padStart(2, "0");
    const mm = String(dateObj.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  // 將日期轉換為 YYYY/MM/DD 格式
  const formatDateToSlash = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}/${month}/${day}`;
  };

  sortedItems.forEach((event) => {
    const startISO = event.start.dateTime;
    const endISO = event.end.dateTime;
    const startDate = new Date(startISO);
    const endDate = new Date(endISO);
    const dateFull = formatDateToSlash(startDate); // 使用 YYYY/MM/DD 格式
    const startTime = formatTime24(startDate);
    const endTime = formatTime24(endDate);

    let imageHTML = "";
    if (event.description) {
      const match = event.description.match(
        /https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif)/i
      );
      if (match) {
        const cleanUrl = match[0].replace(/["']/g, "").trim();
        imageHTML = `<img src="${cleanUrl}" alt="活動圖片">`;
      }
    }

    // 一般活動：顯示為卡片項目
    const timelineHTML = `
      <div class="timeline-item">
        <div class="event-header">
          <div class="event-date">${dateFull}</div>
          <div class="event-thumb">${imageHTML}</div>
          <div class="timeline-time">${startTime} - ${endTime}</div>
        </div>
        <div class="event-title">${event.summary || "（無標題）"}</div>
      </div>
    `;

    eventsTimeline.innerHTML += timelineHTML;
  });
}

// 獲取日曆數據
fetch(url)
  .then((res) => res.json())
  .then((data) => {
    calendarData = data.items;
    renderEvents(data.items);
  })
  .catch((err) => console.error("抓取日曆時出錯", err));
