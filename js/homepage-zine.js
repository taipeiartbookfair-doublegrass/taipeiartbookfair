/**
 * 將英文書名轉換為商店 URL 的函數
 * 
 * 此函數將書籍名稱（如 "The Art Book"）轉換為 URL 友好的格式（如 "the-art-book"）
 * 然後組合成完整的商品頁面連結
 * 
 * @param {string} englishTitle - 英文書名
 * @returns {string|null} - 生成的商店 URL，如果無法生成則返回 null
 */
function generateShopUrl(englishTitle) {
  // 檢查輸入是否有效
  if (!englishTitle || englishTitle.trim() === '') return null;
  
  // 步驟 1: 轉換為小寫（統一格式）
  // 步驟 2: 移除所有非英數字的特殊字符（保留字母、數字和空格）
  // 步驟 3: 將多個空格替換為單個連字符（用於 URL slug）
  // 步驟 4: 清理首尾空白
  const urlSlug = englishTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // 移除特殊字符，只保留字母、數字和空格
    .replace(/\s+/g, '-') // 將一個或多個空格替換為連字符
    .trim();
  
  // 如果處理後的字串為空，無法生成有效的 URL
  if (urlSlug === '') return null;
  
  // 組合成完整的商品頁面 URL
  // 格式：https://nmhw.taipeiartbookfair.com/products/{url-slug}
  return `https://nmhw.taipeiartbookfair.com/products/${urlSlug}`;
}

/**
 * 填充 zine 元素的共用函數
 * 
 * 這個函數負責將書籍資料填充到頁面上的 zine 格子元素中
 * 主要功能包括：
 * 1. 初始化所有格子元素（隱藏、設定樣式）
 * 2. 為每個格子載入書籍資料（圖片、標題、連結等）
 * 3. 設定互動效果（hover、點擊事件）
 * 4. 處理空格子的顯示
 * 
 * @param {Array} booksArray - 書籍資料陣列，每個元素包含書籍資訊（照片、名稱等）
 */
function populateZineElements(booksArray) {
  const zineElements = document.querySelectorAll(
    ".book-item, .right-zine-item, .middle-zine-item, .zine-item, .timeline-zine-item"
  );

  zineElements.forEach((element) => {
    element.style.display = "none";
    element.style.transition = "all 0.2s ease";
    if (element.hasAttribute('data-hover-bound')) return;
    element.setAttribute('data-hover-bound', 'true');
  });

  booksArray.forEach((item, index) => {
    if (index < zineElements.length) {
      const zineElement = zineElements[index];
      zineElement.style.display = "block";
      zineElement.setAttribute("data-record", JSON.stringify(item));

      // --------- 照片欄位改成同時支援 "照片" 和 "相片*" ---------
      const photoField = item["照片"] || item["相片*"];
      if (photoField) {
        const imageUrls = photoField.split("\n");
        const imageUrl = imageUrls[0].trim();

        console.log(`Zine ${index + 1} 圖片 URL:`, imageUrl);

        if (imageUrl) {
          const img = new Image();
          img.onload = function () {
            zineElement.style.backgroundImage = `url(${imageUrl})`;
            zineElement.style.backgroundSize = "cover";
            zineElement.style.backgroundPosition = "center";
            zineElement.style.backgroundRepeat = "no-repeat";
            zineElement.style.color = "transparent";
            zineElement.style.textShadow = "none";
          };
          img.onerror = function () {
            console.error(`圖片載入失敗: ${imageUrl}`);
            zineElement.style.backgroundColor = "black";
            zineElement.style.color = "white";
            zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
          };
          img.src = imageUrl;
        } else {
          zineElement.style.backgroundColor = "black";
          zineElement.style.color = "white";
          zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
        }
      } else {
        zineElement.style.backgroundColor = "black";
        zineElement.style.color = "white";
        zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
      }

      let title = item["商品名稱(英)"] || item["商品名稱(中)"] || item["品名"] || item["書名"] || "未知標題";
      if (title === "未知標題") {
        for (const key in item) {
          if (item[key] && typeof item[key] === "string" && item[key].trim() !== "") {
            title = item[key];
            break;
          }
        }
      }

      const englishTitle = item["商品名稱(英)"] || item["書名"] || item["品名"] || item["商品名稱(中)"];
      const shopUrl = generateShopUrl(englishTitle);

      zineElement.setAttribute("data-title", title);
      zineElement.setAttribute("data-shop-url", shopUrl || "");

      zineElement.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const elementShopUrl = this.getAttribute("data-shop-url");
        if (elementShopUrl) {
          window.open(elementShopUrl, '_blank', 'noopener,noreferrer');
        } else {
          window.open('https://nmhw.taipeiartbookfair.com', '_blank', 'noopener,noreferrer');
        }
      });

      zineElement.addEventListener("mouseenter", function () {
        const displayTitle = this.getAttribute("data-title") || "未知標題";
        const elementShopUrl = this.getAttribute("data-shop-url");
        this.style.color = "white";
        this.style.textShadow = "none";
        this.style.fontSize = "0.8rem";
        this.style.writingMode = "horizontal-tb";
        this.style.textOrientation = "mixed";
        this.style.transform = `rotate(${(Math.random() - 0.5) * 10}deg)`;
        this.style.backgroundColor = "transparent";
        this.style.cursor = elementShopUrl ? "pointer" : "default";
        this.innerHTML = `<div style="background-color: BLACK; color: white; width: 100%; padding: 4px 0; text-align: center;margin:1px;">${displayTitle}</div>`;
      });

      zineElement.addEventListener("mouseleave", function () {
        const elementShopUrl = this.getAttribute("data-shop-url");
        this.style.backgroundColor = "";
        this.style.color = "white";
        this.style.textShadow = "none";
        this.style.cursor = elementShopUrl ? "pointer" : "default";
        this.textContent = "";
      });
    }
  });

  for (let i = booksArray.length; i < zineElements.length; i++) {
    const zineElement = zineElements[i];
    zineElement.style.backgroundColor = "transparent"; 
    zineElement.style.color = "white";
    zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
    zineElement.textContent = "";
    zineElement.addEventListener("mouseenter", function () {
      this.style.color = "smokewhite";
      this.style.textShadow = "none";
      this.style.fontSize = "0.8rem";
      this.style.writingMode = "horizontal-tb";
      this.style.textOrientation = "mixed";
      this.style.transform = `rotate(${(Math.random() - 0.5) * 10}deg)`;
      this.style.backgroundColor = "transparent";
      this.style.cursor = "default";
      this.innerHTML = `<div style="background-color: black; color:smokewhite; width: 100%; padding: 4px 0; text-align: center; margin: 1px;"></div>`;
    });
    zineElement.addEventListener("mouseleave", function () {
      this.style.backgroundColor = "black";
      this.style.color = "smokewhite";
      this.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
      this.style.cursor = "default";
      this.textContent = "";
    });
  }
}


/**
 * 從 Google Apps Script API 獲取書籍資料
 * 
 * 這個函數負責：
 * 1. 向 API 發送請求獲取隨機書籍資料
 * 2. 處理 API 回應（多種可能的格式）
 * 3. 篩選有圖片的書籍
 * 4. 實現重試機制（當資料不足或請求失敗時）
 * 5. 預載入圖片以提升使用者體驗
 * 
 * @param {number} count - 請求的書籍數量（預設 100）
 * @param {number} retryCount - 當前重試次數（內部使用，預設 0）
 * @param {number} maxRetries - 最大重試次數（預設 3 次）
 */
async function getNMHWInfo(count = 100, retryCount = 0, maxRetries = 3) {
  // Google Apps Script Web App 的 URL
  const url = `https://script.google.com/macros/s/AKfycbyWRK0RBVwgvoD6IvPp9cOyJB6zXizkAWrvCJ5qTLOuReah_MFBAoSV8viZvqKZptOR/exec`;
  
  // 請求指定數量的資料
  const requestCount = count;
  console.log(`正在請求 ${requestCount} 本書籍資料... (嘗試 ${retryCount + 1}/${maxRetries + 1})`);
  
  try {
    // 定義圖片預載入函數（提升載入速度）
    // 這會在背景預先載入所有圖片，當使用者 hover 或查看時圖片已經快取好了
    const preloadImages = (imageUrls) => {
      imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url; // 開始載入圖片（瀏覽器會快取）
      });
    };

    // 設定請求超時時間 (30秒)
    // 如果 API 回應時間超過 30 秒，視為超時並拋出錯誤
    const timeout = 30000;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('API 請求超時 (30秒)')), timeout)
    );

    // 建立 API 請求
    // 使用 POST 方法，因為需要傳送參數（action 和 randomCount）
    const fetchPromise = fetch(url, {
      method: "POST",
      mode: "cors", // 允許跨域請求
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      // 請求參數：action 指定要執行的操作，randomCount 指定需要的資料數量
      body: `action=random&count=100`,
    });

    // 使用 Promise.race 來實現超時機制
    // 哪個 Promise 先完成（成功或失敗）就使用哪個結果
    // 如果 timeoutPromise 先完成，就會拋出超時錯誤
    const res = await Promise.race([fetchPromise, timeoutPromise]);
    console.log(`API 回應狀態: ${res.status}`);

    // 檢查 HTTP 回應狀態
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // 先取原始文字，方便除錯（GAS 有時回 HTML 或格式不符）
    const rawText = await res.text();
    console.log("API 原始回應 (前 800 字):", rawText.slice(0, 800));

    let response;
    try {
      response = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("API 回應不是有效 JSON，無法解析:", parseErr);
      console.log("原始內容:", rawText.slice(0, 500));
      populateZineElements([]);
      return;
    }

    console.log("API 回應:", response);
    console.log("API 回應類型:", typeof response);
    console.log("API 回應是否為陣列:", Array.isArray(response));
    
    // 增加緩衝時間，讓資料完整載入
    // 有時候 API 回應雖然回來了，但資料可能還在處理中，等待一下確保資料完整
    await new Promise(resolve => setTimeout(resolve, 500));

    // 檢查是否回傳的是預設訊息（表示 API 沒有正確處理 action 參數）
    // 這可能是 API 沒有正確設定或 action 參數沒有被識別
    if (
      response.message === "Hello from taipeiartbookfair!" &&
      response.data && Object.keys(response.data).length === 0
    ) {
      console.log("API 回傳預設訊息，沒有資料");
      populateZineElements([]); // 填充空的陣列（顯示空格子）
      return;
    }

    // 處理 API 回應的不同格式（相容 GAS 與多種後端）
    let data = response;
    console.log("處理前的 data:", data);

    if (response.success && response.data) {
      if (response.data.records !== undefined) {
        data = response.data.records;
        console.log("使用 response.data.records");
      } else if (Array.isArray(response.data)) {
        data = response.data;
        console.log("使用 response.data (陣列)");
      } else if (response.data && typeof response.data === "object") {
        data = response.data;
        console.log("使用 response.data (物件)");
      } else {
        data = response.data;
        console.log("使用 response.data");
      }
    } else if (Array.isArray(response)) {
      data = response;
      console.log("直接使用 response 陣列");
    } else if (typeof response === "string") {
      try {
        data = JSON.parse(response);
        console.log("response 為字串，已再解析");
      } catch (_) {
        data = null;
      }
    } else {
      console.log("無法識別的回應格式，完整 response:", response);
      populateZineElements([]);
      return;
    }
    
    console.log("處理後的 data:", data);

    // 檢查資料是否為空
    // 處理三種情況：null/undefined、空陣列、空物件
    if (
      !data ||
      (Array.isArray(data) && data.length === 0) ||
      (typeof data === "object" && Object.keys(data).length === 0)
    ) {
      console.log("資料為空");
      populateZineElements([]); // 填充空的陣列
      return;
    }

    // 確保 data 是陣列格式
    // 如果 data 是單一物件，將其轉換為只有一個元素的陣列，方便後續處理
    const allBooksArray = Array.isArray(data) ? data : [data];
    
    // ===== 調試輸出：檢查 API 實際返回的資料 =====
    console.log("========== API 資料詳細檢查 ==========");
    console.log(`總共收到 ${allBooksArray.length} 筆資料`);
    
    // 檢查前 3 筆資料（如果有的話）
    const sampleCount = Math.min(3, allBooksArray.length);
    for (let i = 0; i < sampleCount; i++) {
      const sampleItem = allBooksArray[i];
      console.log(`\n--- 第 ${i + 1} 筆資料 ---`);
      console.log("所有欄位名稱:", Object.keys(sampleItem));
      console.log("完整資料物件:", sampleItem);
      
      // 特別檢查標題相關欄位
      console.log("標題相關欄位值:");
      console.log(`  - "商品名稱(英)":`, sampleItem["商品名稱(英)"] || "(無)");
      console.log(`  - "商品名稱(中)":`, sampleItem["商品名稱(中)"] || "(無)");
      console.log(`  - "品名":`, sampleItem["品名"] || "(無)");
      console.log(`  - "書名":`, sampleItem["書名"] || "(無)");
      
      // 檢查照片欄位
      console.log("照片相關欄位值:");
      console.log(`  - "照片":`, sampleItem["照片"] || "(無)");
      
      // 列出所有包含「名稱」、「標題」、「Title」、「title」的欄位
      const titleRelatedKeys = Object.keys(sampleItem).filter(key => 
        /名稱|標題|title|name/i.test(key)
      );
      if (titleRelatedKeys.length > 0) {
        console.log("所有與標題相關的欄位:", titleRelatedKeys);
        titleRelatedKeys.forEach(key => {
          console.log(`  - "${key}":`, sampleItem[key] || "(無)");
        });
      }
    }
    console.log("=====================================\n");
    
    // 篩選有圖片的書籍項目（試算表可能是「照片」或「相片*」等欄位名）
    const photoKey = (book) => book["照片"] || book["相片*"] || book["相片"] || book["Photo"] || book["photo"];
    const booksWithPhotos = allBooksArray.filter(book => {
      const photo = photoKey(book);
      return photo && String(photo).trim() !== "";
    });
    
    console.log(`獲取到 ${allBooksArray.length} 筆資料`);
    console.log(`篩選後有圖片的資料: ${booksWithPhotos.length} 筆`);

    // 有圖的優先；若完全沒有有圖的但有資料，仍用全部資料顯示（標題＋黑底）
    const booksArray =
      booksWithPhotos.length > 0 ? booksWithPhotos : allBooksArray;

    // 若完全沒資料且未達重試上限才重試
    if (booksArray.length < 5 && retryCount < maxRetries) {
      console.log(`資料不足 (${booksArray.length}筆)，將重試...`);
      setTimeout(() => {
        getNMHWInfo(count, retryCount + 1, maxRetries);
      }, (retryCount + 1) * 3000);
      return;
    }

    console.log(`最終使用 ${booksArray.length} 筆資料`);

    // 非阻塞預載入圖片（在背景執行，不阻塞主流程）
    // 使用 setTimeout(0) 將圖片預載入延遲到下一事件循環，讓填充 zine 元素的操作先完成
    // 這樣使用者可以更快看到內容，而圖片在背景載入
    setTimeout(() => {
      // 從所有書籍中提取圖片 URL
      // 1. 過濾出有照片欄位的項目
      // 2. 提取每本書的第一張照片（多張照片用換行符分隔，取第一張）
      // 3. 移除空白和無效的 URL
      const imageUrls = booksArray
        .filter((item) => item["照片"] || item["相片*"]) // 只處理有照片的項目
        .map((item) => (item["照片"] || item["相片*"]).split("\n")[0].trim()) // 取第一張照片
        .filter((url) => url); // 過濾掉空字串

      // 如果有有效的圖片 URL，開始預載入
      if (imageUrls.length > 0) {
        preloadImages(imageUrls);
      }
    }, 0);

    // 填充 zine 元素（將書籍資料顯示在頁面上）
    console.log("準備填充 zine 元素，書籍資料:", booksArray);
    populateZineElements(booksArray);
    
    // 如果成功獲取資料，輸出成功訊息
    console.log(`成功獲取 ${booksArray.length} 筆資料`);
    
  } catch (error) {
    // 錯誤處理：當 API 請求失敗時
    console.error("API 調用失敗:", error);
    
    // 重試機制：如果還沒達到最大重試次數，則重試
    if (retryCount < maxRetries) {
      const retryDelay = (retryCount + 1) * 3000; // 計算延遲時間
      console.log(`將在 ${retryDelay / 1000} 秒後重試...`);
      setTimeout(() => {
        // 遞增重試計數並重新調用函數
        getNMHWInfo(count, retryCount + 1, maxRetries);
      }, retryDelay); // 指數退避策略：第 1 次等 3 秒，第 2 次等 6 秒，第 3 次等 9 秒
    } else {
      // 達到最大重試次數，放棄請求並顯示空格子
      console.log("達到最大重試次數，API 無法使用");
      populateZineElements([]); // 填充空的陣列（顯示空格子）
    }
  }
}

// ===== 頁面初始化 =====
// 等待頁面 DOM 完全載入後再執行
// 這樣確保所有 HTML 元素都已經存在，不會出現找不到元素的錯誤
document.addEventListener("DOMContentLoaded", function () {
  // 請求 100 本書籍資料（會在函數內部篩選出有圖片的書籍）
  getNMHWInfo(100);
});
