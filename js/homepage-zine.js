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
  // 步驟 1: 抓取頁面上所有可能的 zine 格子元素
  // 使用多個選擇器以支援不同頁面的不同 class 名稱
  const zineElements = document.querySelectorAll(
    ".book-item, .right-zine-item, .middle-zine-item, .zine-item, .timeline-zine-item"
  );

  // 步驟 2: 初始化所有格子元素
  // 先隱藏所有元素，然後逐一顯示有資料的元素
  zineElements.forEach((element) => {
    element.style.display = "none"; // 隱藏（稍後只顯示有資料的格子）
    element.style.transition = "all 0.2s ease"; // 設定平滑過渡動畫
    
    // 防止重複綁定事件監聽器
    // 使用 data-hover-bound 屬性作為標記，避免每次調用函數時重複綁定事件
    if (element.hasAttribute('data-hover-bound')) {
      return; // 已經綁定過事件，跳過避免重複綁定
    }
    element.setAttribute('data-hover-bound', 'true'); // 標記已綁定
  });

  // 步驟 3: 為每個書籍資料填充對應的格子元素
  booksArray.forEach((item, index) => {
    // 確保不會超出可用的格子數量
    if (index < zineElements.length) {
      const zineElement = zineElements[index];
      
      // 3.1: 顯示這個有資料的格子
      zineElement.style.display = "block";

      // 3.2: 將完整的書籍資料以 JSON 格式存儲在元素上
      // 這樣可以在需要時取得完整的書籍資訊
      zineElement.setAttribute("data-record", JSON.stringify(item));

      // 3.3: 處理書籍圖片
      // 優先使用照片欄位作為背景圖片，如果沒有則使用黑色背景
      if (item["照片"]) {
        // 處理多張照片的情況（用換行符分隔），只取第一張
        const imageUrls = item["照片"].split("\n");
        const imageUrl = imageUrls[0].trim();

        console.log(`Zine ${index + 1} 圖片 URL:`, imageUrl);

        if (imageUrl) {
          // 使用 Image 物件預先載入圖片，檢查是否能成功載入
          // 這樣可以避免直接在背景圖片上使用無效的 URL
          const img = new Image();
          
          // 圖片載入成功的處理
          img.onload = function () {
            console.log(`圖片載入成功: ${imageUrl}`);
            // 設定為背景圖片，並使用 cover 模式讓圖片填滿整個格子
            zineElement.style.backgroundImage = `url(${imageUrl})`;
            zineElement.style.backgroundSize = "cover"; // 填滿格子，保持比例
            zineElement.style.backgroundPosition = "center"; // 居中顯示
            zineElement.style.backgroundRepeat = "no-repeat"; // 不重複
            zineElement.style.color = "transparent"; // 隱藏文字（因為有圖片）
            zineElement.style.textShadow = "none";
          };
          
          // 圖片載入失敗的處理
          img.onerror = function () {
            console.error(`圖片載入失敗: ${imageUrl}`);
            // 如果圖片載入失敗，改用黑色背景並顯示白色文字
            zineElement.style.backgroundColor = "black";
            zineElement.style.color = "white";
            zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)"; // 文字陰影提升可讀性
          };
          
          // 開始載入圖片（觸發 onload 或 onerror）
          img.src = imageUrl;
        } else {
          // 圖片 URL 為空字串的情況
          console.log(`Zine ${index + 1} 沒有有效的圖片 URL`);
          zineElement.style.backgroundColor = "black";
          zineElement.style.color = "white";
          zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
        }
      } else {
        // 完全沒有照片欄位的情況
        console.log(`Zine ${index + 1} 沒有照片欄位`);
        zineElement.style.backgroundColor = "black";
        zineElement.style.color = "white";
        zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
      }

      // 3.4: 提取書籍標題（用於 hover 時顯示）
      // 按照優先順序嘗試多個可能的標題欄位
      // 優先順序：商品名稱(英) > 商品名稱(中) > 品名 > 書名 > 任一欄位
      let title = item["商品名稱(英)"] || item["商品名稱(中)"] || item["品名"] || item["書名"] || "未知標題";
      
      // 如果所有常見標題欄位都沒有值，從所有欄位中找第一個非空字串作為後備標題
      if (title === "未知標題") {
        for (const key in item) {
          if (item[key] && typeof item[key] === "string" && item[key].trim() !== "") {
            title = item[key];
            console.log(`使用後備標題: ${key} = ${title}`);
            break; // 找到第一個有值的欄位就停止
          }
        }
      }
      
      // 3.5: 生成商店連結 URL
      // 嘗試多個可能的英文書名欄位（用於生成 URL slug）
      const englishTitle = item["商品名稱(英)"] || item["書名"] || item["品名"] || item["商品名稱(中)"];
      const shopUrl = generateShopUrl(englishTitle); // 將書名轉換為商品頁面 URL
      
      // 3.6: 將標題和商店 URL 存儲在元素的 data 屬性中
      // 這樣在 hover 和點擊事件中可以直接取得，不需要重新計算
      zineElement.setAttribute("data-title", title);
      zineElement.setAttribute("data-shop-url", shopUrl || "");
      
      // 調試日誌：輸出綁定資訊
      console.log(`為第 ${index + 1} 個 zine 綁定 hover 事件，標題: ${title}`);
      console.log(`英文書名: ${englishTitle}`);
      console.log(`商店連結: ${shopUrl}`);
      console.log(`完整資料:`, item);
      
      // 3.7: 添加點擊事件 - 跳轉到商店頁面
      zineElement.addEventListener("click", function (e) {
        e.preventDefault(); // 阻止預設行為
        e.stopPropagation(); // 阻止事件冒泡
        
        // 從 data 屬性取得商店 URL
        const elementShopUrl = this.getAttribute("data-shop-url");
        
        if (elementShopUrl) {
          // 如果有特定商品連結，開啟該商品的頁面
          console.log(`點擊 zine，跳轉到: ${elementShopUrl}`);
          // 使用 window.open 在新分頁開啟，避免離開當前頁面
          // noopener 和 noreferrer 是安全設定，防止新頁面存取原頁面
          window.open(elementShopUrl, '_blank', 'noopener,noreferrer');
        } else {
          // 如果沒有特定商品連結，跳轉到主商店首頁
          console.log('沒有可用的商店連結，跳轉到主商店頁面');
          const mainStoreUrl = 'https://nmhw.taipeiartbookfair.com';
          window.open(mainStoreUrl, '_blank', 'noopener,noreferrer');
        }
      });
      
      // 3.8: 添加滑鼠移入 (hover) 效果 - 顯示書籍標題
      zineElement.addEventListener("mouseenter", function () {
        // 取得儲存的標題和商店連結
        const displayTitle = this.getAttribute("data-title") || "未知標題";
        const elementShopUrl = this.getAttribute("data-shop-url");
        
        console.log(`Hover 事件觸發 - 第 ${index + 1} 個 zine`);
        
        // 設定樣式：白色文字、無陰影、較小字體
        this.style.color = "white";
        this.style.textShadow = "none";
        this.style.fontSize = "0.8rem";
        
        // 將垂直文字改為水平（如果有設定垂直文字的話）
        this.style.writingMode = "horizontal-tb";
        this.style.textOrientation = "mixed";
        
        // 添加隨機旋轉效果（-5 到 +5 度），讓視覺更生動
        this.style.transform = `rotate(${(Math.random() - 0.5) * 10}deg)`;
        
        // 背景設為透明，讓原來的圖片/背景顯示
        this.style.backgroundColor = "transparent";
        
        // 如果有商店連結，顯示指標游標；否則顯示預設游標
        this.style.cursor = elementShopUrl ? "pointer" : "default";
        
        // 在格子內顯示黑色背景的標題區塊
        this.innerHTML = `<div style="background-color: BLACK; color: white; width: 100%; padding: 4px 0; text-align: center;margin:1px;">${displayTitle}</div>`;
      });

      // 3.9: 添加滑鼠移出效果 - 恢復原始狀態
      zineElement.addEventListener("mouseleave", function () {
        const elementShopUrl = this.getAttribute("data-shop-url");
        
        // 清除背景色（恢復為圖片背景或黑色背景）
        this.style.backgroundColor = "";
        this.style.color = "white";
        this.style.textShadow = "none";
        
        // 根據是否有連結設定游標樣式
        this.style.cursor = elementShopUrl ? "pointer" : "default";
        
        // 清空內容，恢復為原始狀態（不顯示標題）
        this.textContent = "";
      });
    }
  });

  // 步驟 4: 處理沒有資料的空格子（當書籍數量少於格子數量時）
  // 從最後一個有資料的格子之後開始，處理剩餘的空格子
  for (let i = booksArray.length; i < zineElements.length; i++) {
    const zineElement = zineElements[i];
    
    // 設定空格子的預設樣式：透明背景、白色文字、文字陰影
    zineElement.style.backgroundColor = "transparent"; 
    zineElement.style.color = "white";
    zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
    zineElement.textContent = ""; // 確保空格子沒有文字內容

    // 為空格子也添加 hover 效果（與有資料的格子類似，但使用統一的樣式）
    // 注意：空格子不會有點擊事件，因為沒有商店連結
    zineElement.addEventListener("mouseenter", function () {
      // Hover 時的樣式設定（類似有資料的格子）
      this.style.color = "smokewhite";
      this.style.textShadow = "none";
      this.style.fontSize = "0.8rem";
      this.style.writingMode = "horizontal-tb";
      this.style.textOrientation = "mixed";
      this.style.transform = `rotate(${(Math.random() - 0.5) * 10}deg)`; // 隨機旋轉
      this.style.backgroundColor = "transparent";
      this.style.cursor = "default"; // 空格子不顯示指標游標（因為不可點擊）
      // 顯示空的黑色區塊（視覺效果與有資料的格子一致）
      this.innerHTML = `<div style="background-color: black; color:smokewhite; width: 100%; padding: 4px 0; text-align: center; margin: 1px;"></div>`;
    });

    zineElement.addEventListener("mouseleave", function () {
      // 恢復空格子的預設樣式
      this.style.backgroundColor = "black";
      this.style.color = "smokewhite";
      this.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
      this.style.cursor = "default";
      this.textContent = ""; // 清空內容
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
  const url = `https://script.google.com/macros/s/AKfycbzSMjKyOh--yUfioAhICP-rFGawWL1rW61NEr1SkYiOhC1vwCHJZ1s-rd2aXiwuWKy_/exec`;
  
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
      body: `action=get_random_info&randomCount=${requestCount}`,
    });

    // 使用 Promise.race 來實現超時機制
    // 哪個 Promise 先完成（成功或失敗）就使用哪個結果
    // 如果 timeoutPromise 先完成，就會拋出超時錯誤
    const res = await Promise.race([fetchPromise, timeoutPromise]);
    console.log(`API 回應狀態: ${res.status}`);

    // 檢查 HTTP 回應狀態
    // res.ok 為 true 表示狀態碼在 200-299 之間
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // 解析 JSON 回應
    const response = await res.json();
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

    // 處理 API 回應的不同格式
    // 由於 API 可能有不同的回應結構，需要處理多種情況
    let data = response;
    console.log("處理前的 data:", data);
    
    if (response.success && response.data) {
      // 格式 1: { success: true, data: { records: [...] } } 或 { success: true, data: [...] }
      if (response.data.records) {
        // 如果 data 有 records 屬性，使用 records（巢狀結構）
        data = response.data.records;
        console.log("使用 response.data.records");
      } else {
        // 如果 data 直接是陣列，使用 data
        data = response.data;
        console.log("使用 response.data");
      }
    } else if (Array.isArray(response)) {
      // 格式 2: 直接是陣列 [...]
      data = response;
      console.log("直接使用 response 陣列");
    } else {
      // 無法識別的格式
      console.log("無法識別的回應格式");
      populateZineElements([]); // 填充空的陣列
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
    
    // 篩選有圖片的書籍項目
    // 只保留照片欄位有值且不是空字串的書籍（因為沒有圖片的書籍顯示效果不佳）
    const booksWithPhotos = allBooksArray.filter(book => {
      return book["照片"] && book["照片"].trim() !== "";
    });
    
    console.log(`獲取到 ${allBooksArray.length} 筆資料`);
    console.log(`篩選後有圖片的資料: ${booksWithPhotos.length} 筆`);
    
    // 資料數量檢查與重試機制
    // 如果有圖片的資料少於 5 筆（可能不夠填滿頁面），且還沒達到最大重試次數，則重試
    // 使用指數退避策略：第 1 次重試等 3 秒，第 2 次等 6 秒，第 3 次等 9 秒
    if (booksWithPhotos.length < 5 && retryCount < maxRetries) {
      console.log(`有圖片的資料不足 (${booksWithPhotos.length}筆)，將重試...`);
      setTimeout(() => {
        getNMHWInfo(count, retryCount + 1, maxRetries); // 遞增重試計數
      }, (retryCount + 1) * 3000); // 等待時間 = (重試次數 + 1) * 3000 毫秒
      return; // 停止當前執行，等待重試
    }
    
    // 使用所有有圖片的資料，不限制數量
    // 這樣可以盡可能填滿頁面上的所有格子
    const booksArray = booksWithPhotos;
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
        .filter((item) => item["照片"]) // 只處理有照片的項目
        .map((item) => item["照片"].split("\n")[0].trim()) // 取第一張照片
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
