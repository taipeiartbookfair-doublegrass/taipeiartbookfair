(function () {
  // ===== 共用設定 =====
  const BASE_API =
    "https://script.google.com/macros/s/AKfycbzj0helq04_cDIwtASoLNwQIvTjC5Jt8KBgtD5yUmdj8wkqLnsgwTWx52qub4LKsklj/exec";

  // 依目前 <html lang> 判斷是否為英文
  function isEnglish() {
    return (
      document.documentElement.lang &&
      document.documentElement.lang.toLowerCase().startsWith("en")
    );
  }

  // 在 cfg[id] 裡，依語系取 zh/en，其中一個沒有就 fallback 另一個
  function pickLocale(cfgItem) {
    if (!cfgItem) return "";
    const en = cfgItem.en || "";
    const zh = cfgItem.zh || "";
    return isEnglish() ? en || zh : zh || en;
  }

  // 把字串裡的 \n 換成 <br>
  function withBr(text) {
    return String(text || "").replace(/\n/g, "<br>");
  }

  // ===== 1. General Info / Info Log：從 pageconfig 讀 =====
  function loadPageConfig() {
    const CONFIG_API = BASE_API + "?type=pageconfig";

    fetch(CONFIG_API)
      .then((r) => r.json())
      .then((cfg) => {
        // 1-1. 主視覺影片 hero-video
        const heroCfg = cfg["hero-video"];
        if (heroCfg && heroCfg.zh) {
          const iframe = document.querySelector(".hero-poster-section iframe");
          if (iframe) {
            iframe.src = heroCfg.zh; // 目前一律用 zh 欄位放影片網址
          }
        }

        // 1-2. 展出日期時間（多行 time-list）
        const timeCfg = cfg["time-list"];
        if (timeCfg && timeCfg.zh) {
          const listEl = document.querySelector(".time-list");
          if (listEl) {
            const lines = String(timeCfg.zh)
              .split("\n")
              .map((t) => t.trim())
              .filter(Boolean);
            listEl.innerHTML = lines
              .map((line) => "<li>" + line + "</li>")
              .join("");
          }
        }

        // 1-3. 活動名稱 exhibition-title
        const titleCfg = cfg["exhibition-title"];
        if (titleCfg) {
          const titleEl = document.querySelector(".exhibition-title");
          if (titleEl) {
            titleEl.setAttribute("data-zh", titleCfg.zh || "");
            titleEl.setAttribute("data-en", titleCfg.en || titleCfg.zh || "");
            titleEl.textContent = pickLocale(titleCfg);
          }
        }

        // 1-4. 當屆主題 subtitle exhibition-subtitle
        const subCfg = cfg["exhibition-subtitle"];
        if (subCfg) {
          const subEl = document.getElementById("exhibition-subtitle");
          if (subEl) {
            subEl.setAttribute("data-zh", subCfg.zh || "");
            subEl.setAttribute("data-en", subCfg.en || subCfg.zh || "");
            subEl.textContent = pickLocale(subCfg);
          }
        }

        // 1-5. 當屆文字 poem exhibition-poem（允許多行）
        const poemCfg = cfg["exhibition-poem"];
        if (poemCfg) {
          const poemEl = document.getElementById("exhibition-poem");
          if (poemEl) {
            const zhPoem = withBr(poemCfg.zh);
            const enPoem = withBr(poemCfg.en);
            poemEl.setAttribute("data-zh", zhPoem);
            poemEl.setAttribute("data-en", enPoem || zhPoem);
            poemEl.innerHTML = isEnglish() ? enPoem || zhPoem : zhPoem || enPoem;
          }
        }

        // 1-6. 活動地點文字 + 連結 href（location + location_link）
        const locCfg = cfg["location"];
        const locLinkCfg = cfg["location_link"];
        if (locCfg) {
          const locEl = document.getElementById("location");
          if (locEl) {
            const zhLoc = withBr(locCfg.zh);
            const enLoc = withBr(locCfg.en);
            locEl.setAttribute("data-zh", zhLoc);
            locEl.setAttribute("data-en", enLoc || zhLoc);
            locEl.innerHTML = isEnglish() ? enLoc || zhLoc : zhLoc || enLoc;

            if (locLinkCfg) {
              const url =
                isEnglish()
                  ? locLinkCfg.en || locLinkCfg.zh
                  : locLinkCfg.zh || locLinkCfg.en || locEl.href;
              if (url) locEl.href = url;
            }
          }
        }

        // 1-7. Google Map iframe src（googlemap）
        const mapCfg = cfg["googlemap"];
        if (mapCfg) {
          const mapContainer = document.getElementById("googlemap");
          if (mapContainer) {
            const mapIframe = mapContainer.querySelector("iframe");
            if (mapIframe) {
              const mapUrl = pickLocale(mapCfg);
              if (mapUrl) mapIframe.src = mapUrl;
            }
          }
        }

        // 1-8. 捷運 / 公車 / 自行開車 / YouBike 資訊
        const mrtCfg = cfg["mrt-info"];
        if (mrtCfg) {
          const mrtEl = document.getElementById("mrt-info");
          if (mrtEl) {
            const zh = withBr(mrtCfg.zh);
            const en = withBr(mrtCfg.en);
            mrtEl.setAttribute("data-zh", zh);
            mrtEl.setAttribute("data-en", en || zh);
            mrtEl.innerHTML = isEnglish() ? en || zh : zh || en;
          }
        }

        const busCfg = cfg["bus-info"];
        if (busCfg) {
          const busEl = document.getElementById("bus-info");
          if (busEl) {
            const zh = withBr(busCfg.zh);
            const en = withBr(busCfg.en);
            busEl.setAttribute("data-zh", zh);
            busEl.setAttribute("data-en", en || zh);
            busEl.innerHTML = isEnglish() ? en || zh : zh || en;
          }
        }

        const carCfg = cfg["by-car-info"];
        if (carCfg) {
          const carEl = document.getElementById("by-car-info");
          if (carEl) {
            const zh = withBr(carCfg.zh);
            const en = withBr(carCfg.en);
            carEl.setAttribute("data-zh", zh);
            carEl.setAttribute("data-en", en || zh);
            carEl.innerHTML = isEnglish() ? en || zh : zh || en;
          }
        }

        const youbikeCfg = cfg["youbike-info"];
        if (youbikeCfg) {
          const ybEl = document.getElementById("youbike-info");
          if (ybEl) {
            const zh = withBr(youbikeCfg.zh);
            const en = withBr(youbikeCfg.en);
            ybEl.setAttribute("data-zh", zh);
            ybEl.setAttribute("data-en", en || zh);
            ybEl.innerHTML = isEnglish() ? en || zh : zh || en;
          }
        }

        // 1-9. Info Log
        const infoCfg = cfg["info-log"] || { zh: "", en: "" };
        const rawText = pickLocale(infoCfg);

        const infoEl = document.getElementById("info-log");
        if (infoEl && rawText) {
          let formatted = String(rawText)
            // **粗體**
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            // *斜體*
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            // ~~刪除線~~
            .replace(/~~(.*?)~~/g, "<del>$1</del>")
            // {顏色}文字
            .replace(/\{(.*?)\}(.*?)(?=\n|\r|$)/g, function (
              _match,
              color,
              text
            ) {
              return '<span style="color: ' + color + '">' + text + "</span>";
            })
            // {small}小字{small}
            .replace(/\{small\}(.*?)\{small\}/g, "<small>$1</small>")
            // 換行
            .replace(/\n/g, "<br />");

          infoEl.innerHTML = formatted;
        }
      })
      .catch(function (err) {
        console.warn("[pageconfig] fetch error", err);
        const infoEl = document.getElementById("info-log");
        if (infoEl && infoEl.textContent.indexOf("🚧") !== -1) {
          infoEl.textContent = "讀取失敗：" + err.message;
        }
      });
  }

  // ===== 2. FAQ：從 VisitFAQ sheet 讀 =====
  function loadFAQ() {
    const FAQ_API = BASE_API + "?type=faq";

    fetch(FAQ_API)
      .then((r) => r.json())
      .then((data) => {
        if (!data || !Array.isArray(data.items)) return;

        // 找到右邊 FAQ 欄位底下的 .faq-container
        let faqColumn = document.querySelector(
          ".two-column-section#tickets .column:nth-child(2)"
        );
        if (!faqColumn) {
          faqColumn = document.querySelector(
            "#tickets .two-column-container > .column:nth-child(2)"
          );
        }
        if (!faqColumn) return;

        const faqContainer =
          faqColumn.querySelector(".faq-container") || faqColumn;

        // 清空舊內容（保留 <h2> 標題在 column 裡，不在 container 裡）
        faqContainer.innerHTML = "";

        data.items.forEach(function (item) {
          const qText = isEnglish()
            ? item.q_en || item.q_zh || ""
            : item.q_zh || item.q_en || "";
          const aText = isEnglish()
            ? item.a_en || item.a_zh || ""
            : item.a_zh || item.a_en || "";

          if (!qText && !aText) return;

          const faqItem = document.createElement("div");
          faqItem.className = "faq-item";

          const qDiv = document.createElement("div");
          qDiv.className = "faq-question";
          qDiv.textContent = qText;

          const aDiv = document.createElement("div");
          aDiv.className = "faq-answer";
          aDiv.textContent = aText;

          faqItem.appendChild(qDiv);
          faqItem.appendChild(aDiv);

          faqContainer.appendChild(faqItem);
        });
      })
      .catch(function (err) {
        console.warn("[faq] fetch error", err);
      });
  }

  // ===== 初始化 =====
  loadPageConfig();
  loadFAQ();
})();