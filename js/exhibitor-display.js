// 攤商顯示和輪播功能
class ExhibitorDisplay {
  constructor() {
    this.exhibitorsData = [];
    this.currentIndex = 0;
    this.rotationInterval = null;
    this.isExpanded = false;
    this.apiUrl =
      "https://script.google.com/macros/s/AKfycbzD7XvMiMP2Yi_asnkdvU1rOhk2YcixUpMrYQ_bDHXbQIkG97E5knPC3SmkGKoe9mvh/exec";

    this.init();
  }

  async init() {
    try {
      this.setupEventListeners();
      this.showLoadingState();
      await this.loadExhibitorsData();
      this.startRotation();
    } catch (error) {
      console.error("攤商顯示初始化失敗:", error);
      this.exhibitorsData = [];
      this.showEmptyState();
    }
  }

  // 從 API 載入攤商數據（簡化版，專門用於輪播顯示）
  async loadExhibitorsData() {
    try {
      console.log("正在載入輪播攤商數據...");

      // 使用更短的 timeout，快速失敗
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒 timeout

      const params = new URLSearchParams({
        action: "get_accepted_booths_by_page_and_page_size",
        page: 1,
        pageSize: 20,
      }).toString();

      const response = await fetch(this.apiUrl, {
        redirect: "follow",
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: params,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API 響應:", data);
      console.log("data.success:", data.success);
      console.log("data.data:", data.data);
      console.log("data.data.booths:", data.data?.booths);

      // 簡化數據解析，只抓取需要的字段
      if (data.success && data.data && data.data.booths) {
        this.exhibitorsData = data.data.booths.map((item) => ({
          id: item["報名編號"] || "",
          name: item["品牌"] || "",
          booth: item["攤商編號"] || "",
          ig: item["IG帳號"] || "",
          description: item["品牌簡介"] || "",
          facebook: item["facebook"] || "",
          instagram: item["instagram"] || "",
          website: item["website"] || "",
          region: item["region"] || "TW",
          sourceSheet: item["_source_sheet"] || "",
        }));

        console.log(`成功載入 ${this.exhibitorsData.length} 個攤商數據`);
      } else {
        throw new Error("API 數據格式不正確");
      }
    } catch (error) {
      console.error("無法載入輪播攤商數據:", error);
      this.exhibitorsData = [];
      this.showLoadingState();
    }
  }

  // 顯示載入狀態
  showLoadingState() {
    const displays = document.querySelectorAll(".exhibitor-item-display");
    if (displays.length !== 2) return;

    displays.forEach((display, index) => {
      const boothNumber = display.querySelector(".exhibitor-booth-number");
      const name = display.querySelector(".exhibitor-name");
      const region = display.querySelector(".exhibitor-region");

      if (boothNumber) boothNumber.textContent = "載入中...";
      if (name) name.textContent = "正在獲取攤商資料";
      if (region) region.textContent = "...";
    });
  }

  // 顯示空狀態
  showEmptyState() {
    const displays = document.querySelectorAll(".exhibitor-item-display");
    if (displays.length !== 2) return;

    displays.forEach((display, index) => {
      const boothNumber = display.querySelector(".exhibitor-booth-number");
      const name = display.querySelector(".exhibitor-name");
      const region = display.querySelector(".exhibitor-region");

      if (boothNumber) boothNumber.textContent = "-";
      if (name) name.textContent = "暫無攤商資料";
      if (region) region.textContent = "-";
    });
  }

  // 設置事件監聽器
  setupEventListeners() {
    const expandBtn = document.getElementById("exhibitorExpandBtn");
    const closeBtn = document.getElementById("closeExhibitorList");
    const fullList = document.getElementById("exhibitorFullList");

    if (expandBtn) {
      expandBtn.addEventListener("click", () => this.expandFullList());
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeFullList());
    }

    if (fullList) {
      fullList.addEventListener("click", (e) => {
        if (e.target === fullList) {
          this.closeFullList();
        }
      });
    }
  }

  // 開始輪播
  startRotation() {
    if (this.exhibitorsData.length === 0) {
      console.log("沒有攤商數據，不啟動輪播");
      return;
    }

    // 從第一個攤商開始
    this.currentIndex = 0;

    // 立即顯示第一組數據
    this.updateDisplay();

    // 設置輪播間隔（每3秒切換一次）
    this.rotationInterval = setInterval(() => {
      this.nextExhibitors();
    }, 3000);
  }

  // 停止輪播
  stopRotation() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
  }

  // 切換到下一組攤商
  nextExhibitors() {
    if (this.exhibitorsData.length === 0) return;

    // 簡單的順序輪播
    this.currentIndex = (this.currentIndex + 2) % this.exhibitorsData.length;
    this.updateDisplay();
  }

  // 更新顯示
  updateDisplay() {
    const displays = document.querySelectorAll(".exhibitor-item-display");
    if (displays.length !== 2) return;

    // 獲取當前要顯示的兩個攤商
    const exhibitor1 = this.exhibitorsData[this.currentIndex];
    const exhibitor2 =
      this.exhibitorsData[(this.currentIndex + 1) % this.exhibitorsData.length];

    // 更新第一個攤商
    if (exhibitor1) {
      this.updateExhibitorDisplay(displays[0], exhibitor1);
    }

    // 更新第二個攤商
    if (exhibitor2) {
      this.updateExhibitorDisplay(displays[1], exhibitor2);
    }
  }

  // 更新攤商顯示
  updateExhibitorDisplay(display, exhibitor) {
    const boothNumber = display.querySelector(".exhibitor-booth-number");
    const name = display.querySelector(".exhibitor-name");
    const region = display.querySelector(".exhibitor-region");

    if (boothNumber) {
      boothNumber.textContent =
        exhibitor.applicationNumber || exhibitor.id || "-";
    }
    if (name) {
      name.textContent = exhibitor.name || "Unknown";
    }
    if (region) {
      // 顯示國籍/地區
      const regionText = this.getRegionDisplayText(exhibitor.region);
      region.textContent = regionText;
    }
  }

  // 獲取國籍顯示文字
  getRegionDisplayText(region) {
    if (!region) return "GE";

    // 根據地區代碼返回簡化的國籍標識
    const regionMap = {
      TW: "TW",
      JP: "JP",
      KR: "KR",
      CN: "CN",
      US: "US",
      FR: "FR",
      IT: "IT",
      IN: "IN",
      RU: "RU",
      BE: "BE",
    };

    return regionMap[region] || region || "GE";
  }

  // 展開完整名單
  expandFullList() {
    this.isExpanded = true;
    this.stopRotation();

    const fullList = document.getElementById("exhibitorFullList");
    if (fullList) {
      fullList.classList.add("expanded");
      document.body.style.overflow = "hidden";
    }

    // 初始化完整名單
    this.initFullList();
  }

  // 關閉完整名單
  closeFullList() {
    this.isExpanded = false;

    const fullList = document.getElementById("exhibitorFullList");
    if (fullList) {
      fullList.classList.remove("expanded");
      document.body.style.overflow = "";
    }

    // 重新開始輪播（也會隨機選擇起始位置）
    this.startRotation();
  }

  // 初始化完整名單
  initFullList() {
    const grid = document.querySelector(".exhibitors-grid");
    if (!grid) return;

    grid.innerHTML = "";

    // 創建攤商列表容器
    const flowContainer = document.createElement("div");
    flowContainer.className = "exhibitors-flow-container";

    // 重複攤商數據來避免空白，確保滑動時有連續的內容
    const repeatedData = [...this.exhibitorsData, ...this.exhibitorsData];

    // 添加攤商項目
    repeatedData.forEach((exhibitor, index) => {
      const item = this.createExhibitorItem(exhibitor, index);
      flowContainer.appendChild(item);
    });

    grid.appendChild(flowContainer);
  }

  // 創建攤商條列項目
  createExhibitorItem(exhibitor, index) {
    const item = document.createElement("div");
    item.className = "exhibitor-item";

    // 根據報名編號判斷攤位類型
    const applicationNumber = exhibitor.applicationNumber || "";

    if (applicationNumber.includes("LB")) {
      item.classList.add("book-booth");
    } else if (applicationNumber.includes("LM")) {
      item.classList.add("creative-booth");
    } else if (applicationNumber.includes("LI")) {
      item.classList.add("installation-booth");
    } else if (applicationNumber.includes("LF")) {
      item.classList.add("food-booth");
    } else if (
      applicationNumber.includes("IT") ||
      applicationNumber.includes("IC")
    ) {
      item.classList.add("international-booth");
    }

    item.innerHTML = `
      <span class="exhibitor-name">${exhibitor.name || "Unknown"}</span>
      <span class="exhibitor-booth">${
        applicationNumber || exhibitor.id || "-"
      }</span>
    `;

    return item;
  }
}

// 當頁面載入完成後初始化
document.addEventListener("DOMContentLoaded", function () {
  new ExhibitorDisplay();
});
