// 將英文書名轉換為商店 URL 的函數
function generateShopUrl(englishTitle) {
  if (!englishTitle || englishTitle.trim() === '') return null;
  
  // 將書名轉換為小寫，替換空格和特殊字符為連字符
  const urlSlug = englishTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 將空格替換為連字符
    .trim();
  
  // 如果處理後的字串為空，返回 null
  if (urlSlug === '') return null;
  
  // 嘗試不同的URL結構
  return `https://nmhw.taipeiartbookfair.com/products/${urlSlug}`;
}

// 填充 zine 元素的共用函數
function populateZineElements(booksArray) {
  // 直接抓取所有 zine 格子元素
  const zineElements = document.querySelectorAll(
    ".book-item, .right-zine-item, .middle-zine-item, .zine-item, .timeline-zine-item"
  );

  // 先隱藏所有 zine 元素
  zineElements.forEach((element) => {
    element.style.display = "none";
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
      
      // 顯示這個 zine 元素
      zineElement.style.display = "block";

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
            // 如果圖片載入失敗，設定 black 背景
            zineElement.style.backgroundColor = "black";
            zineElement.style.color = "white";
            zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
          };
          img.src = imageUrl;
        } else {
          console.log(`Zine ${index + 1} 沒有有效的圖片 URL`);
          zineElement.style.backgroundColor = "black";
          zineElement.style.color = "white";
          zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
        }
      } else {
        console.log(`Zine ${index + 1} 沒有照片欄位`);
        zineElement.style.backgroundColor = "black";
        zineElement.style.color = "white";
        zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
      }

      // 添加 hover 效果，顯示標題
      // 優先順序：商品名稱(英) > 商品名稱(中) > 品名 > 未知標題
      const title = item["商品名稱(英)"] || item["商品名稱(中)"] || item["品名"] || item["書名"] || "未知標題";
      // 嘗試多個可能的英文書名欄位
      const englishTitle = item["商品名稱(英)"] || item["書名"] || item["品名"] || item["商品名稱(中)"];
      const shopUrl = generateShopUrl(englishTitle);
      
      console.log(`為第 ${index + 1} 個 zine 綁定 hover 事件，標題: ${title}`);
      console.log(`英文書名: ${englishTitle}`);
      console.log(`商店連結: ${shopUrl}`);
      console.log(`完整資料:`, item);
      
      // 添加點擊事件，跳轉到商店頁面
      zineElement.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (shopUrl) {
          console.log(`點擊 zine，跳轉到: ${shopUrl}`);
          // 絕對在新分頁開啟，不允許當前頁面跳轉
          const newWindow = window.open(shopUrl, '_blank', 'noopener,noreferrer');
          if (!newWindow) {
            // 如果彈出視窗被阻擋，顯示提示訊息而不是跳轉當前頁面
            alert('請允許彈出視窗以開啟商店頁面，或手動前往: ' + shopUrl);
          }
        } else {
          console.log('沒有可用的商店連結，跳轉到主商店頁面');
          // 如果沒有特定商品連結，跳轉到主商店頁面
          const mainStoreUrl = 'https://nmhw.taipeiartbookfair.com';
          const newWindow = window.open(mainStoreUrl, '_blank', 'noopener,noreferrer');
          if (!newWindow) {
            // 如果彈出視窗被阻擋，顯示提示訊息而不是跳轉當前頁面
            alert('請允許彈出視窗以開啟商店頁面，或手動前往: ' + mainStoreUrl);
          }
        }
      });
      
      zineElement.addEventListener("mouseenter", function () {
        console.log(`Hover 事件觸發 - 第 ${index + 1} 個 zine`);
        this.style.color = "white";
        this.style.textShadow = "none";
        this.style.fontSize = "0.8rem";
        this.style.writingMode = "horizontal-tb";
        this.style.textOrientation = "mixed";
        this.style.transform = `rotate(${(Math.random() - 0.5) * 10}deg)`;
        this.style.backgroundColor = "transparent";
        this.style.cursor = shopUrl ? "pointer" : "default";
        this.innerHTML = `<div style="background-color: BLACK; color: white; width: 100%; padding: 4px 0; text-align: center;margin:1px;">${title}</div>`;
      });

      zineElement.addEventListener("mouseleave", function () {
        this.style.backgroundColor = "";
        this.style.color = "white";
        this.style.textShadow = "none";
        this.style.cursor = shopUrl ? "pointer" : "default";
        this.textContent = "";
      });
    }
  });

  for (let i = booksArray.length; i < zineElements.length; i++) {
    const zineElement = zineElements[i];
    zineElement.style.backgroundColor = "transparent"; 
    zineElement.style.color = "white";
    zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
    zineElement.textContent = ""; // 確保空格子沒有文字內容

    // 為空格子也添加 hover 效果 - 使用統一的邏輯
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

async function getNMHWInfo(count = 100, retryCount = 0, maxRetries = 3) {
  const url = `https://script.google.com/macros/s/AKfycbzSMjKyOh--yUfioAhICP-rFGawWL1rW61NEr1SkYiOhC1vwCHJZ1s-rd2aXiwuWKy_/exec`;
  
  // 請求指定數量的資料
  const requestCount = count;
  console.log(`正在請求 ${requestCount} 本書籍資料... (嘗試 ${retryCount + 1}/${maxRetries + 1})`);
  
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
    console.log("API 回應類型:", typeof response);
    console.log("API 回應是否為陣列:", Array.isArray(response));

    // 檢查是否回傳的是預設訊息（表示 doGet 沒有處理 action 參數）
    if (
      response.message === "Hello from taipeiartbookfair!" &&
      response.data && Object.keys(response.data).length === 0
    ) {
      console.log("API 回傳預設訊息，沒有資料");
      populateZineElements([]);
      return;
    }

    // 檢查回應格式，根據你哥的 API 結構處理
    let data = response;
    console.log("處理前的 data:", data);
    
    if (response.success && response.data) {
      // 如果 data 有 records 屬性，使用 records
      if (response.data.records) {
        data = response.data.records;
        console.log("使用 response.data.records");
      } else {
        data = response.data;
        console.log("使用 response.data");
      }
    } else if (Array.isArray(response)) {
      data = response;
      console.log("直接使用 response 陣列");
    } else {
      console.log("無法識別的回應格式");
      populateZineElements([]);
      return;
    }
    
    console.log("處理後的 data:", data);

    // 如果 data 是空物件或空陣列，使用示例資料
    if (
      !data ||
      (Array.isArray(data) && data.length === 0) ||
      (typeof data === "object" && Object.keys(data).length === 0)
    ) {
      console.log("資料為空");
      populateZineElements([]);
      return;
    }

    // 確保 data 是陣列格式
    const allBooksArray = Array.isArray(data) ? data : [data];
    
    // 篩選有圖片的項目
    const booksWithPhotos = allBooksArray.filter(book => {
      return book["照片"] && book["照片"].trim() !== "";
    });
    
    console.log(`獲取到 ${allBooksArray.length} 筆資料`);
    console.log(`篩選後有圖片的資料: ${booksWithPhotos.length} 筆`);
    
    // 如果沒有足夠的資料，嘗試再次請求
    if (booksWithPhotos.length < 5 && retryCount < maxRetries) {
      console.log(`有圖片的資料不足 (${booksWithPhotos.length}筆)，將重試...`);
      setTimeout(() => {
        getNMHWInfo(count, retryCount + 1, maxRetries);
      }, (retryCount + 1) * 2000);
      return;
    }
    
    // 使用所有有圖片的資料，不限制數量
    const booksArray = booksWithPhotos;
    console.log(`最終使用 ${booksArray.length} 筆資料`);

    // 非阻塞預載入圖片
    setTimeout(() => {
      const imageUrls = booksArray
        .filter((item) => item["照片"]) // 只處理有照片的項目
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
        getNMHWInfo(count, retryCount + 1, maxRetries);
      }, (retryCount + 1) * 2000); // 指數退避：2秒、4秒、6秒
    } else {
      console.log("達到最大重試次數，API 無法使用");
      populateZineElements([]);
    }
  }
}

// 等待頁面載入完成後執行
document.addEventListener("DOMContentLoaded", function () {
  getNMHWInfo(100);
});
