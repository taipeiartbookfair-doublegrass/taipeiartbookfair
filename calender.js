// 把下面兩個換成你的
const calendarId =
  "90527f67fa462c83e184b0c62def10ebc8b00cc8c67a5b83af2afb90a1bdb293@group.calendar.google.com";
const apiKey = "AIzaSyCOLToQuZFbB1mULxYrMyQVeTVGnhk8-U4";

// Google Calendar API URL

const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
  calendarId
)}/events?key=${apiKey}&singleEvents=true&orderBy=startTime&timeMin=${new Date().toISOString()}`;

const eventsTimeline = document.getElementById("eventsTimeline");

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    if (!eventsTimeline) return;

    if (!data.items || data.items.length === 0) {
      eventsTimeline.innerHTML = "<p>沒有即將到來的活動</p>";
      return;
    }

    // 依開始時間排序，並處理整日事件
    const items = [...data.items].sort((a, b) => {
      const sa = a.start.dateTime || a.start.date || "";
      const sb = b.start.dateTime || b.start.date || "";
      return new Date(sa) - new Date(sb);
    });

    let lastDateKey = "";

    // 蒐集含有整日活動的日期
    const datesWithAllDay = new Set();
    items.forEach((ev) => {
      const dk =
        ev.start.date ||
        (ev.start.dateTime ? ev.start.dateTime.slice(0, 10) : "");
      if (ev.start.date && !ev.start.dateTime) {
        datesWithAllDay.add(dk);
      }
    });

    const formatTime24 = (dateObj) => {
      const hh = String(dateObj.getHours()).padStart(2, "0");
      const mm = String(dateObj.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    };

    items.forEach((event) => {
      const isAllDay = !!event.start.date && !event.start.dateTime;
      const startISO = event.start.dateTime || event.start.date + "T00:00:00";
      const d = new Date(startISO);
      // 日期僅顯示日期，時間一律用 24h 的 timeOnly 呈現，避免重複與 12h 顯示
      const dateFull = d.toLocaleDateString("zh-TW", { dateStyle: "medium" });
      const timeOnly = isAllDay ? "ALL DAY" : formatTime24(d);

      let imageHTML = "";
      if (event.description) {
        const match = event.description.match(
          /https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif)/i
        );
        if (match) {
          const cleanUrl = match[0].replace(/["']/g, "").trim();
          imageHTML = `<img src="${cleanUrl}" alt="活動圖片" style="max-width:100%; margin-top:8px; border:1px solid #111;">`;
        }
      }

      // 時間軸視圖：依日期分組標題
      const dateKey = event.start.date || d.toISOString().slice(0, 10);
      if (dateKey !== lastDateKey) {
        const dayLabel = d.toLocaleDateString("zh-TW", { dateStyle: "medium" });
        const hasAllDay = datesWithAllDay.has(dateKey);
        eventsTimeline.innerHTML += `<div class="timeline-day">${
          hasAllDay ? '<span class="all-day-bar"></span>' : ""
        }${dayLabel}</div>`;
        lastDateKey = dateKey;
      }

      const timelineHTML = `
        <div class="timeline-item">
          <div class="timeline-time">${timeOnly}</div>
          <div class="timeline-content">
            <div class="timeline-main">
              <div class="event-title">${event.summary || "（無標題）"}</div>
              <div class="event-meta">
                <span class="event-date">${dateFull}</span>
                ${
                  event.location
                    ? `<span class="event-location">${event.location}</span>`
                    : ""
                }
              </div>
            </div>
            ${imageHTML ? `<div class=\"event-thumb\">${imageHTML}</div>` : ""}
          </div>
        </div>
      `;
      eventsTimeline.innerHTML += timelineHTML;
    });
  })
  .catch((err) => console.error("抓取日曆時出錯", err));
