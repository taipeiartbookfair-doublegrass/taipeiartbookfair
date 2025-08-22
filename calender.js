// 把下面兩個換成你的
const calendarId =
  "90527f67fa462c83e184b0c62def10ebc8b00cc8c67a5b83af2afb90a1bdb293@group.calendar.google.com";
const apiKey = "AIzaSyCOLToQuZFbB1mULxYrMyQVeTVGnhk8-U4";

// Google Calendar API URL
const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
  calendarId
)}/events?key=${apiKey}&singleEvents=true&orderBy=startTime&timeMin=${new Date().toISOString()}`;

const eventsTimeline = document.getElementById("eventsTimeline");

// 預設顯示4個活動
let maxEvents = 4;
let calendarData = null;

// 渲染事件的函數
function renderEvents(items) {
  if (!eventsTimeline) return;

  if (!items || items.length === 0) {
    eventsTimeline.innerHTML = "<p>沒有即將到來的活動</p>";
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

  let lastDateKey = "";

  const formatTime24 = (dateObj) => {
    const hh = String(dateObj.getHours()).padStart(2, "0");
    const mm = String(dateObj.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  sortedItems.forEach((event) => {
    const startISO = event.start.dateTime;
    const d = new Date(startISO);
    const dateFull = d.toLocaleDateString("zh-TW", { dateStyle: "medium" });
    const timeOnly = formatTime24(d);

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

    // 時間軸視圖：依日期分組標題
    const dateKey = d.toISOString().slice(0, 10);
    if (dateKey !== lastDateKey) {
      const dayLabel = d.toLocaleDateString("zh-TW", { dateStyle: "medium" });
      lastDateKey = dateKey;
    }

    // 一般活動：顯示為時間軸項目
    const timelineHTML = `
      <div class="timeline-item">
        <div class="event-thumb">${imageHTML}</div>
        <div class="timeline-content">
          <div class="timeline-main">
          <span class="event-date">${dateFull}</span>
            ${
              dateKey !== lastDateKey
                ? `<div class="timeline-day">${dayLabel}</div>`
                : ""
            }
            <div class="event-title">${event.summary || "（無標題）"}</div>
            <div class="event-meta">
This is going to be the description of the events. This is going to be the description of the events. This is going to be the description of the events.This is going to be the description of the events.This is going to be the description of the events.This is going to be the description of the events.This is going to be the description of the events.This is going to be the description of the events.VThis is going to be the description of the events.This is going to be the description of the events.This is going to be the description of the events.vThis is going to be the description of the events.This is going to be the description of the events.This is going to be the description of the events.s
            </div>
          </div>
          <div class="timeline-time">${timeOnly}</div>
        </div>
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
