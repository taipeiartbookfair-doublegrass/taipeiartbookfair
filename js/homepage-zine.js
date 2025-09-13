// 填充 zine 元素的共用函數
function populateZineElements(booksArray) {
  // 直接抓取所有 zine 格子元素
  const zineElements = document.querySelectorAll(
    ".book-item, .right-zine-item, .middle-zine-item, .zine-item, .timeline-zine-item"
  );

  // 預先設定所有元素的 hover 效果
  zineElements.forEach((element) => {
    element.style.transition = "all 0.2s ease";
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
            zineElement.style.backgroundColor = "plum";
            zineElement.style.color = "white";
            zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
          };
          img.src = imageUrl;
        } else {
          console.log(`Zine ${index + 1} 沒有有效的圖片 URL`);
          zineElement.style.backgroundColor = "plum";
          zineElement.style.color = "white";
          zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
        }
      } else {
        console.log(`Zine ${index + 1} 沒有照片欄位`);
        zineElement.style.backgroundColor = "plum";
        zineElement.style.color = "white";
        zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
      }

      // 添加 hover 效果，顯示標題
      const title = item["品名"] || "未知標題";
      zineElement.addEventListener("mouseenter", function () {
        this.style.color = "black";
        this.style.textShadow = "none";
        this.style.fontSize = "0.8rem";
        this.style.writingMode = "horizontal-tb";
        this.style.textOrientation = "mixed";
        this.style.transform = `rotate(${(Math.random() - 0.5) * 10}deg)`;
        this.style.backgroundColor = "transparent";
        this.innerHTML = `<div style="background-color: plum; width: 100%; padding: 4px 0; text-align: center;margin:1px;">${title}</div>`;
      });

      zineElement.addEventListener("mouseleave", function () {
        this.style.backgroundColor = "";
        this.style.color = "transparent";
        this.style.textShadow = "none";
        this.textContent = "";
      });
    }
  });

  // 為沒有書籍資料的格子設定 plum 背景
  for (let i = booksArray.length; i < zineElements.length; i++) {
    const zineElement = zineElements[i];
    zineElement.style.backgroundColor = "plum";
    zineElement.style.color = "white";
    zineElement.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";

    // 為空格子也添加 hover 效果
    zineElement.addEventListener("mouseenter", function () {
      this.style.color = "black";
      this.style.textShadow = "none";
      this.style.writingMode = "horizontal-tb";
      this.style.textOrientation = "mixed";
      this.style.transform = `rotate(${(Math.random() - 0.5) * 10}deg)`;
      this.innerHTML = `<div style="background-color: plum; width: 100%; padding: 4px 0; border-radius: 2px; text-align: center;">${this.textContent}</div>`;
    });

    zineElement.addEventListener("mouseleave", function () {
      this.style.color = "white";
      this.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
    });
  }
}

async function getRandomImages(count = 14) {
  const url = `https://script.google.com/macros/s/AKfycbyeDDI-trIyGuqQW81NQH6VEDATSbdmqCWG25ll-8kPP33zWzhS5EnTx1qDscb6Y4Py/exec`;
  try {
    // 預載入圖片以提升載入速度
    const preloadImages = (imageUrls) => {
      imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    };

    const res = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `action=get_random_info&randomCount=${count}`,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const response = await res.json();

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
    const booksArray = Array.isArray(data) ? data : [data];

    // 非阻塞預載入圖片
    setTimeout(() => {
      const imageUrls = booksArray
        .filter((item) => item["照片"])
        .map((item) => item["照片"].split("\n")[0].trim())
        .filter((url) => url);

      if (imageUrls.length > 0) {
        preloadImages(imageUrls);
      }
    }, 0);

    // 填充 zine 元素
    populateZineElements(booksArray);
  } catch (error) {
    // 如果 API 呼叫失敗，設定所有格子為 plum 背景
    populateZineElements([]);
  }
}

// 等待頁面載入完成後執行
document.addEventListener("DOMContentLoaded", function () {
  getRandomImages(22);
});
