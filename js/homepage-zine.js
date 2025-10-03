// 將英文書名轉換為商店 URL 的函數
function generateShopUrl(englishTitle) {
  if (!englishTitle) return null;
  
  // 將書名轉換為小寫，替換空格和特殊字符為連字符
  const urlSlug = englishTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 將空格替換為連字符
    .trim();
  
  return `https://nmhw.taipeiartbookfair.com/products/${urlSlug}`;
}

// 填充 zine 元素的共用函數
function populateZineElements(booksArray) {
  // 直接抓取所有 zine 格子元素
  const zineElements = document.querySelectorAll(
    ".book-item, .right-zine-item, .middle-zine-item, .zine-item, .timeline-zine-item"
  );

  // 預先設定所有元素的 hover 效果並清除舊的事件監聽器
  zineElements.forEach((element) => {
    element.style.transition = "all 0.2s ease";
    
    // 清除舊的事件監聽器（通過設置標記來避免重複綁定）
    if (element.hasAttribute('data-hover-bound')) {
      return; // 已經綁定過，跳過
    }
    element.setAttribute('data-hover-bound', 'true');
  });

  // 為每個 zine 格子填入對應的書籍資料
  booksArray.forEach((item, index) => {
    if (index < zineElements.length) {
      const zineElement = zineElements[index];

      // 設定 data-record 屬性，包含書籍的所有資料
      zineElement.setAttribute("data-record", JSON.stringify(item));

      // 如果有照片欄位，設定為背景圖片
      if (item["照片"]) {
        // 處理多張照片的情況，取第一張
        const imageUrls = item["照片"].split("\n");
        const imageUrl = imageUrls[0].trim();

        console.log(`Zine ${index + 1} 圖片 URL:`, imageUrl);

        if (imageUrl) {
          // 測試圖片是否可載入
          const img = new Image();
          img.onload = function () {
            console.log(`圖片載入成功: ${imageUrl}`);
            zineElement.style.backgroundImage = `url(${imageUrl})`;
            zineElement.style.backgroundSize = "cover";
            zineElement.style.backgroundPosition = "center";
            zineElement.style.backgroundRepeat = "no-repeat";
            zineElement.style.color = "transparent";
            zineElement.style.textShadow = "none";
          };
          img.onerror = function () {
            console.error(`圖片載入失敗: ${imageUrl}`);
            // 如果圖片載入失敗，設定 plum 背景
            zineElement.style.backgroundColor = "transparent";
            zineElement.style.color = "white";
            zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
          };
          img.src = imageUrl;
        } else {
          console.log(`Zine ${index + 1} 沒有有效的圖片 URL`);
          zineElement.style.backgroundColor = "transparent";
          zineElement.style.color = "white";
          zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
        }
      } else {
        console.log(`Zine ${index + 1} 沒有照片欄位`);
        zineElement.style.backgroundColor = "transparent";
        zineElement.style.color = "white";
        zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
      }

      // 添加 hover 效果，顯示標題
      // 優先順序：商品名稱(英) > 商品名稱(中) > 品名 > 未知標題
      const title = item["商品名稱(英)"] || item["商品名稱(中)"] || item["品名"] || "未知標題";
      const englishTitle = item["商品名稱(英)"];
      const shopUrl = generateShopUrl(englishTitle);
      
      console.log(`為第 ${index + 1} 個 zine 綁定 hover 事件，標題: ${title}`);
      console.log(`商店連結: ${shopUrl}`);
      
      // 添加點擊事件，跳轉到商店頁面
      zineElement.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (shopUrl) {
          console.log(`點擊 zine，跳轉到: ${shopUrl}`);
          // 確保在新分頁開啟
          const newWindow = window.open(shopUrl, '_blank', 'noopener,noreferrer');
          if (!newWindow) {
            // 如果彈出視窗被阻擋，嘗試直接跳轉
            window.location.href = shopUrl;
          }
        } else {
          console.log('沒有可用的商店連結');
        }
      });
      
      zineElement.addEventListener("mouseenter", function () {
        console.log(`Hover 事件觸發 - 第 ${index + 1} 個 zine`);
        this.style.color = "black";
        this.style.textShadow = "none";
        this.style.fontSize = "0.8rem";
        this.style.writingMode = "horizontal-tb";
        this.style.textOrientation = "mixed";
        this.style.transform = `rotate(${(Math.random() - 0.5) * 10}deg)`;
        this.style.backgroundColor = "transparent";
        this.style.cursor = shopUrl ? "pointer" : "default";
        this.innerHTML = `<div style="background-color: plum; width: 100%; padding: 4px 0; text-align: center;margin:1px;">${title}</div>`;
      });

      zineElement.addEventListener("mouseleave", function () {
        this.style.backgroundColor = "";
        this.style.color = "transparent";
        this.style.textShadow = "none";
        this.style.cursor = shopUrl ? "pointer" : "default";
        this.textContent = "";
      });
    }
  });

  // 為沒有書籍資料的格子設定 plum 背景
  for (let i = booksArray.length; i < zineElements.length; i++) {
    const zineElement = zineElements[i];
    zineElement.style.backgroundColor = "plum"; // 修正：應該是 plum 不是 transparent
    zineElement.style.color = "white";
    zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
    zineElement.textContent = ""; // 確保空格子沒有文字內容

    // 為空格子也添加 hover 效果 - 使用統一的邏輯
    zineElement.addEventListener("mouseenter", function () {
      this.style.color = "black";
      this.style.textShadow = "none";
      this.style.fontSize = "0.8rem";
      this.style.writingMode = "horizontal-tb";
      this.style.textOrientation = "mixed";
      this.style.transform = `rotate(${(Math.random() - 0.5) * 10}deg)`;
      this.style.backgroundColor = "transparent";
      this.style.cursor = "default";
      this.innerHTML = `<div style="background-color: plum; width: 100%; padding: 4px 0; text-align: center; margin: 1px;">空位</div>`;
    });

    zineElement.addEventListener("mouseleave", function () {
      this.style.backgroundColor = "plum";
      this.style.color = "white";
      this.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
      this.style.cursor = "default";
      this.textContent = "";
    });
  }
}

async function getRandomImages(count = 11, retryCount = 0, maxRetries = 3) {
  const url = `https://script.google.com/macros/s/AKfycbyeDDI-trIyGuqQW81NQH6VEDATSbdmqCWG25ll-8kPP33zWzhS5EnTx1qDscb6Y4Py/exec`;
  
  // 增加請求數量以確保有足夠的有照片資料
  const requestCount = Math.max(count * 2, 20); // 至少請求20筆，或count的2倍
  console.log(`正在請求 ${requestCount} 本書籍資料，期望獲得 ${count} 筆有照片的資料... (嘗試 ${retryCount + 1}/${maxRetries + 1})`);
  
  try {
    // 預載入圖片以提升載入速度
    const preloadImages = (imageUrls) => {
      imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    };

    // 設定超時時間 (25秒)
    const timeout = 25000;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('API 請求超時 (25秒)')), timeout)
    );

    const fetchPromise = fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `action=get_random_info&randomCount=${requestCount}`,
    });

    // 使用 Promise.race 來處理超時
    const res = await Promise.race([fetchPromise, timeoutPromise]);
    console.log(`API 回應狀態: ${res.status}`);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const response = await res.json();
    console.log("API 回應:", response);

    // 檢查是否回傳的是預設訊息（表示 doGet 沒有處理 action 參數）
    if (
      response.message === "Hello from taipeiartbookfair!" &&
      Object.keys(response.data).length === 0
    ) {
      populateZineElements([]);
      return;
    }

    // 檢查回應格式，根據你哥的 API 結構處理
    let data = response;
    if (response.success && response.data) {
      // 如果 data 有 records 屬性，使用 records
      if (response.data.records) {
        data = response.data.records;
      } else {
        data = response.data;
      }
    } else if (Array.isArray(response)) {
      data = response;
    } else {
      return;
    }

    // 如果 data 是空物件或空陣列，使用空陣列
    if (
      !data ||
      (Array.isArray(data) && data.length === 0) ||
      (typeof data === "object" && Object.keys(data).length === 0)
    ) {
      data = [];
    }

    // 確保 data 是陣列格式
    const allBooksArray = Array.isArray(data) ? data : [data];
    
    // 過濾出有照片的資料
    const booksWithPhotos = allBooksArray.filter((item) => {
      if (!item["照片"]) return false;
      
      // 檢查照片欄位是否有有效內容
      const photoUrls = item["照片"].split("\n").map(url => url.trim()).filter(url => url);
      return photoUrls.length > 0;
    });
    
    console.log(`原始資料: ${allBooksArray.length} 筆，有照片的資料: ${booksWithPhotos.length} 筆`);
    
    // 如果沒有足夠的有照片資料，嘗試再次請求
    if (booksWithPhotos.length < count && retryCount < maxRetries) {
      console.log(`有照片的資料不足 (${booksWithPhotos.length}/${count})，將重試...`);
      setTimeout(() => {
        getRandomImages(count, retryCount + 1, maxRetries);
      }, (retryCount + 1) * 2000);
      return;
    }
    
    // 只取需要的數量
    const booksArray = booksWithPhotos.slice(0, count);
    console.log(`最終使用 ${booksArray.length} 筆有照片的資料`);

    // 非阻塞預載入圖片
    setTimeout(() => {
      const imageUrls = booksArray
        .map((item) => item["照片"].split("\n")[0].trim())
        .filter((url) => url);

      if (imageUrls.length > 0) {
        preloadImages(imageUrls);
      }
    }, 0);

    // 填充 zine 元素
    console.log("準備填充 zine 元素，書籍資料:", booksArray);
    populateZineElements(booksArray);
    
    // 如果成功獲取資料，重置重試計數
    console.log(`成功獲取 ${booksArray.length} 筆資料`);
    
  } catch (error) {
    console.error("API 調用失敗:", error);
    
    // 重試機制
    if (retryCount < maxRetries) {
      console.log(`將在 ${(retryCount + 1) * 2} 秒後重試...`);
      setTimeout(() => {
        getRandomImages(count, retryCount + 1, maxRetries);
      }, (retryCount + 1) * 2000); // 指數退避：2秒、4秒、6秒
    } else {
      console.log("達到最大重試次數，使用空陣列填充 zine 元素");
      populateZineElements([]);
    }
  }
}

// 等待頁面載入完成後執行
document.addEventListener("DOMContentLoaded", function () {
  getRandomImages(11);
});
