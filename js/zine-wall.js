/**
 * Zine Wall 頁面：讀取 API 全部資料、分類／年份篩選、dropup 詳情（圖片輪播、完整資料、上一本/下一本、商店有無）
 */

const ZINE_WALL_API =
  "https://script.google.com/macros/s/AKfycbyWRK0RBVwgvoD6IvPp9cOyJB6zXizkAWrvCJ5qTLOuReah_MFBAoSV8viZvqKZptOR/exec";

// 可能的分類／年份欄位名（試算表表頭）
const CATEGORY_KEYS = ["分類", "類別", "Category", "category", "作品類別", "類型"];
const YEAR_KEYS = ["年份", "年", "Year", "year", "出版年", "出版年份"];

// B 欄／商店有無：試算表打勾表示商店有賣，可能欄位名
const STORE_AVAILABLE_KEYS = ["商店", "商店販售", "有售", "販售", "B", "商店有售", "Store"];

// Dropup 顯示的欄位：{ 顯示標籤: [可能的 key 名，對應試算表表頭] }
const DETAIL_FIELD_MAP = {
  "書名": ["書名", "商品名稱(英)", "商品名稱(中)", "品名", "Title", "書名(英)", "書名(中)"],
  "作者": ["作者", "Author", "作者(英)", "作者(中)"],
  "分類(英) Category": ["分類(英) Category", "分類(英) Catagory", "分類(英)", "Category", "Catagory"],
  "分類(中)（BN）": ["分類(中)（BN）", "分類(中)(BN)", "分類(中)", "BN"],
  "書籍照片＊ Photo": ["書籍照片＊", "書籍照片", "Photo", "照片", "相片*", "相片"],
  "來自(英)": ["來自(英)", "來自 (英)", "From (EN)", "來自"],
  "來自(中)": ["來自(中)", "來自 (中)", "From (中)", "來自(中)"],
  "尺寸＊ Size": ["尺寸＊", "尺寸＊ Size", "尺寸", "Size", "尺寸*"],
  "頁數＊ Pages": ["頁數＊", "頁數＊ Pags", "頁數", "Pages", "Pags", "頁數*"],
  "出版年＊ Year": ["出版年＊", "出版年＊ Year", "出版年", "Year", "年份", "年", "出版年*"],
  "語言(英)＊ Language": ["語言(英)＊", "語言(英)＊ Language", "語言", "Language", "語言(英)", "語言*"],
  "ISBN/ISSN": ["ISBN/ISSN", "ISBN", "ISSN"],
  "內容介紹(英)＊ Intro": ["內容介紹(英)＊", "內容介紹(英)＊ Intro", "內容介紹(英)", "Intro (EN)", "Intro", "內容介紹(英)*"],
  "內容介紹(中)＊ Intro": ["內容介紹(中)＊", "內容介紹(中)＊ Intro", "內容介紹(中)", "Intro (中)", "內容介紹(中)*"],
};

function getFirstMatch(item, keys) {
  for (const k of keys) {
    if (item[k] != null && String(item[k]).trim() !== "") return String(item[k]).trim();
  }
  return "";
}

function getPhoto(item) {
  return (
    item["書籍照片＊"] ||
    item["書籍照片"] ||
    item["照片"] ||
    item["相片*"] ||
    item["相片"] ||
    item["Photo"] ||
    item["photo"] ||
    ""
  );
}

function getTitle(item) {
  return (
    item["書名"] ||
    item["商品名稱(英)"] ||
    item["商品名稱(中)"] ||
    item["品名"] ||
    item["書名"] ||
    "未知標題"
  );
}

/**
 * 從「尺寸」欄位解析後分到四種等級：sm / md / lg / xl
 * 小書不會顯示過小，每級對應實際卡片佔用的格數
 */
function getSizeTier(item) {
  const sizeStr = getFirstMatch(item, ["尺寸＊", "尺寸＊ Size", "尺寸", "Size", "尺寸*"]);
  if (!sizeStr) return "md"; /* 無尺寸時給中等 */
  const match = sizeStr.match(/(\d+(?:\.\d+)?)\s*[x×*X]\s*(\d+(?:\.\d+)?)/);
  if (!match) return "md";
  const w = parseFloat(match[1]);
  const h = parseFloat(match[2]);
  const area = w * h;
  if (area <= 0) return "md";
  /* 依面積分四級：約 <200 sm, <450 md, <800 lg, 以上 xl（可依實際書尺寸微調） */
  if (area < 200) return "sm";
  if (area < 450) return "md";
  if (area < 800) return "lg";
  return "xl";
}

/** 依 index 與 item 產生固定 -15～+15 度旋轉，同一張卡不變 */
function getCardRotation(index, item) {
  const seed = index * 11 + (getTitle(item).length || 0);
  return ((seed % 31) - 15);
}

/** 從第一筆資料推測「分類」「年份」實際欄位名 */
function detectFieldKeys(records) {
  let categoryKey = null;
  let yearKey = null;
  const keys = records.length ? Object.keys(records[0]) : [];
  for (const k of keys) {
    const n = k.replace(/\s+/g, "").toLowerCase();
    if (!categoryKey && CATEGORY_KEYS.some((c) => n.includes(c.replace(/\s+/g, "").toLowerCase())))
      categoryKey = k;
    if (!yearKey && YEAR_KEYS.some((y) => n.includes(y.replace(/\s+/g, "").toLowerCase())))
      yearKey = k;
  }
  return { categoryKey, yearKey };
}

/** 偵測 B 欄／商店有無的欄位名（打勾＝商店有賣） */
function detectStoreKey(records) {
  if (!records.length) return null;
  const keys = Object.keys(records[0]);
  for (const k of keys) {
    const n = k.replace(/\s+/g, "").toLowerCase();
    if (STORE_AVAILABLE_KEYS.some((s) => n.includes(s.replace(/\s+/g, "").toLowerCase())))
      return k;
  }
  // 若試算表欄位順序固定，B 欄可能是 keys[1]
  if (keys.length >= 2) return keys[1];
  return null;
}

/** 判斷該筆是否「商店有賣」（打勾、true、v、y、yes、1 等） */
function isStoreAvailable(item, storeKey) {
  if (!storeKey) return false;
  const v = item[storeKey];
  if (v === true || v === 1) return true;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "true" || s === "v" || s === "y" || s === "yes" || s === "1" || s === "✓" || s === "✔";
  }
  return false;
}

/** 取得某欄位的所有不重複值（用於篩選選單） */
function getUniqueValues(records, fieldKey) {
  if (!fieldKey) return [];
  const set = new Set();
  for (const r of records) {
    const v = r[fieldKey];
    if (v != null && String(v).trim() !== "") set.add(String(v).trim());
  }
  return Array.from(set).sort();
}

/** 解析 API 回應，回傳 records 陣列 */
function parseApiResponse(response) {
  if (response.success && response.data) {
    if (response.data.records !== undefined) return response.data.records;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && typeof response.data === "object") return response.data;
  }
  if (Array.isArray(response)) return response;
  return [];
}

let allRecords = [];
let categoryKey = null;
let yearKey = null;
let storeKey = null;

const gridEl = document.getElementById("zine-wall-grid");
const loadingEl = document.getElementById("zine-wall-loading");
const emptyEl = document.getElementById("zine-wall-empty");
const statsEl = document.getElementById("zine-filter-stats");
const categorySelect = document.getElementById("zine-filter-category");
const yearSelect = document.getElementById("zine-filter-year");

/** Dropup 狀態：目前顯示的列表與索引 */
let dropupFilteredList = [];
let dropupCurrentIndex = 0;
let dropupImageIndex = 0;

/** 依目前篩選條件過濾 */
function getFilteredRecords() {
  const cat = categorySelect.value.trim();
  const year = yearSelect.value.trim();
  return allRecords.filter((r) => {
    if (cat && categoryKey && String(r[categoryKey] || "").trim() !== cat) return false;
    if (year && yearKey && String(r[yearKey] || "").trim() !== year) return false;
    return true;
  });
}

/** 一個一個跑出來的動畫：依序加上 .visible；點擊開 dropup */
function renderCardsWithStagger(records) {
  gridEl.innerHTML = "";
  emptyEl.style.display = records.length ? "none" : "block";

  records.forEach((item, index) => {
    const card = document.createElement("div");
    const tier = getSizeTier(item);
    const rotate = getCardRotation(index, item);
    card.className = "zine-wall-card zine-wall-card--" + tier;
    card.setAttribute("data-index", index);
    card.style.setProperty("--card-rotate", rotate + "deg");

    const photo = getPhoto(item);
    const title = getTitle(item);

    const inner = document.createElement("div");
    inner.className = "zine-wall-card-inner";
    if (photo) {
      const firstUrl = photo.split("\n")[0].trim();
      inner.style.backgroundImage = firstUrl ? `url(${firstUrl})` : "";
    }

    const titleEl = document.createElement("div");
    titleEl.className = "zine-wall-card-title";
    titleEl.textContent = title || "—";

    const metaParts = [];
    if (categoryKey && item[categoryKey]) metaParts.push(String(item[categoryKey]).trim());
    if (yearKey && item[yearKey]) metaParts.push(String(item[yearKey]).trim());
    const metaEl = document.createElement("div");
    metaEl.className = "zine-wall-card-meta";
    metaEl.textContent = metaParts.join(" · ");

    inner.appendChild(titleEl);
    card.appendChild(inner);
    card.appendChild(metaEl);

    card.addEventListener("click", () => openDropup(index, records));

    gridEl.appendChild(card);

    setTimeout(() => {
      card.classList.add("visible");
    }, 50 * index);
  });

  statsEl.textContent = `共 ${records.length} 筆`;
}

// ========== Dropup ==========
const dropupEl = document.getElementById("zine-dropup");
const dropupBackdrop = document.getElementById("zine-dropup-backdrop");
const dropupImagesEl = document.getElementById("zine-dropup-images");
const dropupDotsEl = document.getElementById("zine-dropup-dots");
const dropupPrevImg = document.getElementById("zine-dropup-prev");
const dropupNextImg = document.getElementById("zine-dropup-next");
const dropupTitleEl = document.getElementById("zine-dropup-title");
const dropupFieldsEl = document.getElementById("zine-dropup-fields");
const dropupStoreBadge = document.getElementById("zine-dropup-store-badge");
const dropupPrevBook = document.getElementById("zine-dropup-prev-book");
const dropupNextBook = document.getElementById("zine-dropup-next-book");
const dropupCounter = document.getElementById("zine-dropup-counter");

function openDropup(index, filteredList) {
  dropupFilteredList = filteredList || getFilteredRecords();
  dropupCurrentIndex = Math.max(0, Math.min(index, dropupFilteredList.length - 1));
  dropupEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = ""; /* 不鎖 body，wall 可照常滑 */
  renderDropupContent();
  updateCardHighlight();
}

function closeDropup() {
  dropupEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  updateCardHighlight(); /* 關閉時移除選中邊框 */
}

/** 依目前 dropup 顯示的書，在 grid 上標出選中卡片（lime 1px border） */
function updateCardHighlight() {
  const cards = document.querySelectorAll(".zine-wall-card");
  cards.forEach((card) => card.classList.remove("zine-wall-card-selected"));
  if (dropupEl.getAttribute("aria-hidden") === "true") return;
  const selected = document.querySelector(
    `.zine-wall-card[data-index="${dropupCurrentIndex}"]`
  );
  if (selected) selected.classList.add("zine-wall-card-selected");
}

function getCurrentItem() {
  return dropupFilteredList[dropupCurrentIndex] || null;
}

function renderDropupContent() {
  const item = getCurrentItem();
  if (!item) {
    if (dropupTitleEl) dropupTitleEl.textContent = "請從上方選擇一本書";
    if (dropupStoreBadge) dropupStoreBadge.textContent = "";
    if (dropupFieldsEl) dropupFieldsEl.innerHTML = "";
    if (dropupImagesEl) dropupImagesEl.innerHTML = "";
    if (dropupDotsEl) dropupDotsEl.innerHTML = "";
    if (dropupCounter) dropupCounter.textContent = "0 / 0";
    return;
  }

  dropupTitleEl.textContent = getTitle(item);

  // 商店有無（B 欄打勾）
  const hasStore = isStoreAvailable(item, storeKey);
  dropupStoreBadge.textContent = hasStore ? "商店有售 In Store" : "商店無售 Not in Store";
  dropupStoreBadge.className = "zine-dropup-store-badge " + (hasStore ? "has-store" : "no-store");

  // 圖片輪播：書籍照片＊ 可能多張（換行分隔）
  const photoStr = getPhoto(item);
  const imageUrls = photoStr
    ? photoStr
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  dropupImageIndex = 0;

  dropupImagesEl.innerHTML = "";
  dropupDotsEl.innerHTML = "";
  if (dropupDotsEl) dropupDotsEl.style.display = imageUrls.length > 1 ? "flex" : "none";
  if (imageUrls.length === 0) {
    const placeholder = document.createElement("div");
    placeholder.style.cssText = "min-height:120px;display:flex;align-items:center;justify-content:center;color:#666;";
    placeholder.textContent = "無圖片";
    dropupImagesEl.appendChild(placeholder);
  } else {
    imageUrls.forEach((url, i) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      img.loading = "lazy";
      dropupImagesEl.appendChild(img);
      const dot = document.createElement("span");
      dot.setAttribute("data-index", i);
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => {
        dropupImageIndex = i;
        scrollDropupImage(i);
        updateDropupDots();
      });
      dropupDotsEl.appendChild(dot);
    });
  }

  function scrollDropupImage(idx) {
    const imgs = dropupImagesEl.querySelectorAll("img");
    if (imgs[idx]) imgs[idx].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }

  function updateDropupDots() {
    dropupDotsEl.querySelectorAll("span").forEach((s, i) => {
      s.classList.toggle("active", i === dropupImageIndex);
    });
  }

  dropupImagesEl.addEventListener("scroll", () => {
    const imgs = dropupImagesEl.querySelectorAll("img");
    if (!imgs.length) return;
    const scrollLeft = dropupImagesEl.scrollLeft;
    const width = dropupImagesEl.clientWidth;
    const idx = Math.round(scrollLeft / width);
    if (idx !== dropupImageIndex) {
      dropupImageIndex = idx;
      updateDropupDots();
    }
  });

  if (dropupPrevImg) {
    dropupPrevImg.style.display = imageUrls.length > 1 ? "" : "none";
    dropupPrevImg.onclick = () => {
      if (imageUrls.length <= 1) return;
      dropupImageIndex = (dropupImageIndex - 1 + imageUrls.length) % imageUrls.length;
      scrollDropupImage(dropupImageIndex);
      updateDropupDots();
    };
  }
  if (dropupNextImg) {
    dropupNextImg.style.display = imageUrls.length > 1 ? "" : "none";
    dropupNextImg.onclick = () => {
      if (imageUrls.length <= 1) return;
      dropupImageIndex = (dropupImageIndex + 1) % imageUrls.length;
      scrollDropupImage(dropupImageIndex);
      updateDropupDots();
    };
  }

  // 詳細欄位（依 DETAIL_FIELD_MAP，且跳過「書籍照片」僅在輪播顯示）
  dropupFieldsEl.innerHTML = "";
  const skipPhotoLabel = "書籍照片＊ Photo";
  for (const [label, keys] of Object.entries(DETAIL_FIELD_MAP)) {
    if (label === skipPhotoLabel) continue;
    const val = getFirstMatch(item, keys);
    if (!val) continue;
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = val;
    dropupFieldsEl.appendChild(dt);
    dropupFieldsEl.appendChild(dd);
  }

  // 上一本 / 下一本
  if (dropupCounter) dropupCounter.textContent = `${dropupCurrentIndex + 1} / ${dropupFilteredList.length}`;
  if (dropupPrevBook) dropupPrevBook.disabled = dropupCurrentIndex <= 0;
  if (dropupNextBook) dropupNextBook.disabled = dropupCurrentIndex >= dropupFilteredList.length - 1;
}

function goPrevBook() {
  if (dropupCurrentIndex <= 0) return;
  dropupCurrentIndex--;
  renderDropupContent();
  updateCardHighlight();
}

function goNextBook() {
  if (dropupCurrentIndex >= dropupFilteredList.length - 1) return;
  dropupCurrentIndex++;
  renderDropupContent();
  updateCardHighlight();
}

/* 不綁關閉：dropup 常駐不消失，僅在無資料時隱藏 */
if (dropupPrevBook) dropupPrevBook.addEventListener("click", goPrevBook);
if (dropupNextBook) dropupNextBook.addEventListener("click", goNextBook);

function applyFilters() {
  const filtered = getFilteredRecords();
  renderCardsWithStagger(filtered);
  /* 有資料時常駐顯示，並自動選第一本；無資料時隱藏 panel */
  if (filtered.length > 0) {
    openDropup(0, filtered);
  } else {
    closeDropup();
  }
}

/** 載入全部資料並初始化篩選選單 */
async function loadAll() {
  if (!loadingEl || !gridEl) return;

  loadingEl.style.display = "block";
  gridEl.innerHTML = "";
  emptyEl.style.display = "none";

  try {
    const res = await fetch(ZINE_WALL_API, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "action=all",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.text();
    let response;
    try {
      response = JSON.parse(raw);
    } catch (_) {
      throw new Error("API 回應不是有效 JSON");
    }

    const records = parseApiResponse(response);
    allRecords = Array.isArray(records) ? records : [];

    const { categoryKey: ck, yearKey: yk } = detectFieldKeys(allRecords);
    categoryKey = ck;
    yearKey = yk;
    storeKey = detectStoreKey(allRecords);

    // 分類選單
    const categories = getUniqueValues(allRecords, categoryKey);
    categorySelect.innerHTML = '<option value="">全部 All</option>';
    categories.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      categorySelect.appendChild(opt);
    });

    // 年份選單（由大到小）
    const years = getUniqueValues(allRecords, yearKey).sort((a, b) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (!isNaN(na) && !isNaN(nb)) return nb - na;
      return String(b).localeCompare(String(a));
    });
    yearSelect.innerHTML = '<option value="">全部 All</option>';
    years.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      yearSelect.appendChild(opt);
    });

    loadingEl.style.display = "none";
    applyFilters();
  } catch (err) {
    loadingEl.textContent = "載入失敗：" + (err.message || "請稍後再試");
    loadingEl.style.display = "block";
    gridEl.innerHTML = "";
  }
}

// 篩選變更時重繪
categorySelect.addEventListener("change", applyFilters);
yearSelect.addEventListener("change", applyFilters);

// 回到頂部（與 ticketvisit 一致）
const backToTop = document.getElementById("backToTop");
if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", loadAll);
