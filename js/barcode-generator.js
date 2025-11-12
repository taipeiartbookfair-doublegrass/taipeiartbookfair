// 條碼生成器
// 當 application-number 更新時，自動生成條碼

(function() {
  // 等待 JsBarcode 庫載入
  function waitForJsBarcode(callback) {
    if (typeof JsBarcode !== "undefined") {
      callback();
    } else {
      setTimeout(function() {
        waitForJsBarcode(callback);
      }, 100);
    }
  }

  function generateBarcode() {
    const applicationNumberEl = document.getElementById("application-number");
    const barcodeCanvas = document.getElementById("barcode-canvas");

    if (!applicationNumberEl) {
      console.warn("找不到 application-number 元素");
      return;
    }

    if (!barcodeCanvas) {
      console.warn("找不到 barcode-canvas 元素");
      return;
    }

    const applicationNumber = applicationNumberEl.textContent.trim();

    if (!applicationNumber) {
      console.warn("application-number 為空");
      return;
    }

    if (typeof JsBarcode === "undefined") {
      console.warn("JsBarcode 庫尚未載入");
      return;
    }

    try {
      // 使用 CODE128 格式生成條碼（支援字母和數字）
      JsBarcode(barcodeCanvas, applicationNumber, {
        format: "CODE128",
        width: 2,
        height: 80,
        displayValue: false, // 不顯示文字
        fontSize: 16,
        margin: 0, // 移除邊距以充分利用空間
        background: "transparent", // 背景透明
        lineColor: "#000000",
      });
      
      // 生成後確保 canvas 寬度填滿容器
      barcodeCanvas.style.width = "100%";
      barcodeCanvas.style.height = "auto";
      
      console.log("條碼生成成功:", applicationNumber);
    } catch (error) {
      console.error("條碼生成失敗:", error);
    }
  }

  // 初始化條碼生成器
  function initBarcodeGenerator() {
    waitForJsBarcode(function() {
      // 等待 DOM 載入
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
          setTimeout(generateBarcode, 500);
        });
      } else {
        setTimeout(generateBarcode, 500);
      }

      // 監聽 application-number 的變化
      function setupObserver() {
        const applicationNumberEl = document.getElementById("application-number");
        if (applicationNumberEl) {
          const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
              if (mutation.type === "childList" || mutation.type === "characterData") {
                setTimeout(generateBarcode, 100);
              }
            });
          });

          observer.observe(applicationNumberEl, {
            childList: true,
            characterData: true,
            subtree: true,
          });
        } else {
          setTimeout(setupObserver, 100);
        }
      }

      setupObserver();

      // 導出函數供其他腳本使用
      window.generateBarcode = generateBarcode;
    });
  }

  // 開始初始化
  initBarcodeGenerator();
})();

