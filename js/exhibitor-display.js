// 攤商顯示功能
class ExhibitorDisplay {
  constructor() {
    this.exhibitorsData = [];
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
      this.showAllExhibitors();
    } catch (error) {
      console.error("攤商顯示初始化失敗:", error);
      this.exhibitorsData = [];
      this.showEmptyState();
    }
  }

  // 從 API 載入所有攤商數據
  async loadExhibitorsData() {
    try {
      console.log("正在載入所有攤商數據...");

      // 使用更短的 timeout，快速失敗
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒 timeout

      const params = new URLSearchParams({
        action: "get_all_booths",
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

      // 解析新的 API 數據格式
      if (data.success && data.data) {
        // 假設新 API 直接返回攤商陣列或包含 booths 欄位
        let booths = data.data;
        if (data.data.booths && Array.isArray(data.data.booths)) {
          booths = data.data.booths;
        } else if (!Array.isArray(data.data)) {
          throw new Error("API 數據格式不正確");
        }

        this.exhibitorsData = booths.map((item) => ({
          // 品牌名稱
          brand: item["品牌"] || item.brand || item.name || "",
          // 攤商編號
          boothNumber: item["攤商編號"] || item.boothNumber || item.booth || "",
          // 品牌簡介
          brandDescription: item["品牌簡介"] || item.brandDescription || item.description || "",
          // Facebook 連結
          facebook: item["facebook"] || item.facebook || "",
          // Instagram 連結
          instagram: item["instagram"] || item.instagram || "",
          // Website 連結
          website: item["website"] || item.website || "",
          // 國籍
          nationality: item["國籍"] || item.nationality || item.region || "TW",
          // 保留舊欄位以備用
          id: item["報名編號"] || item.id || "",
          name: item["品牌"] || item.name || "",
          booth: item["攤商編號"] || item.booth || "",
          description: item["品牌簡介"] || item.description || "",
          region: item["國籍"] || item.region || "TW",
          sourceSheet: item["_source_sheet"] || "",
        }));

        console.log(`成功載入 ${this.exhibitorsData.length} 個攤商數據`);
      } else {
        throw new Error("API 數據格式不正確");
      }
    } catch (error) {
      console.error("無法載入攤商數據:", error);
      this.exhibitorsData = [];
      this.showEmptyState();
    }
  }

  // 顯示載入狀態
  showLoadingState() {
    const container = document.getElementById("exhibitorDisplayContainer");
    if (!container) return;

    container.innerHTML = `
      <div class="exhibitor-item-display">
        <span class="exhibitor-booth-number"></span>
        <span class="exhibitor-name">Loading exhibitor data...🏃‍♀️</span>
        <span class="exhibitor-region">...</span>
      </div>
    `;
  }

  // 顯示空狀態
  showEmptyState() {
    const container = document.getElementById("exhibitorDisplayContainer");
    if (!container) return;

    container.innerHTML = `
      <div class="exhibitor-item-display">
        <span class="exhibitor-booth-number"></span>
        <span class="exhibitor-name">No exhibitor data available</span>
        <span class="exhibitor-region">-</span>
      </div>
    `;
  }

  // 設置事件監聽器
  setupEventListeners() {
    const expandBtnOuter = document.getElementById("exhibitorExpandBtnOuter");
    const expandBtnInner = document.getElementById("exhibitorExpandBtn");
    const fullList = document.getElementById("exhibitorFullList");

    if (expandBtnOuter) {
      expandBtnOuter.addEventListener("click", () => this.toggleFullList());
    }

    if (expandBtnInner) {
      expandBtnInner.addEventListener("click", () => this.toggleFullList());
    }

    if (fullList) {
      fullList.addEventListener("click", (e) => {
        if (e.target === fullList) {
          this.toggleFullList();
        }
      });
    }
  }

  // 切換完整名單顯示
  toggleFullList() {
    const eventInfo = document.querySelector(".event-info");
    const fullList = document.getElementById("exhibitorFullList");
    const expandBtnOuter = document.getElementById("exhibitorExpandBtnOuter");
    const expandBtnInner = document.getElementById("exhibitorExpandBtn");
    
    if (eventInfo && fullList) {
      const isExpanded = eventInfo.classList.contains("expanded");
      
      if (isExpanded) {
        // 關閉
        eventInfo.classList.remove("expanded");
        fullList.classList.remove("expanded");
        
        // 更新兩個按鈕的箭頭
        if (expandBtnOuter) {
          const arrowOuter = expandBtnOuter.querySelector(".expand-arrow");
          if (arrowOuter) arrowOuter.textContent = "↓";
        }
        if (expandBtnInner) {
          const arrowInner = expandBtnInner.querySelector(".expand-arrow");
          if (arrowInner) arrowInner.textContent = "↓";
        }
      } else {
        // 展開
        eventInfo.classList.add("expanded");
        fullList.classList.add("expanded");
        
        // 更新兩個按鈕的箭頭
        if (expandBtnOuter) {
          const arrowOuter = expandBtnOuter.querySelector(".expand-arrow");
          if (arrowOuter) arrowOuter.textContent = "↑";
        }
        if (expandBtnInner) {
          const arrowInner = expandBtnInner.querySelector(".expand-arrow");
          if (arrowInner) arrowInner.textContent = "↑";
        }
        
        this.initFullList();
      }
    }
  }


  // 顯示所有攤商（網格佈局）
  showAllExhibitors() {
    const container = document.getElementById("exhibitorDisplayContainer");
    if (!container) return;

    // 清空容器
    container.innerHTML = "";

    // 創建網格容器
    const gridContainer = document.createElement("div");
    gridContainer.className = "exhibitors-grid-main";
    
    // 顯示所有攤商
    this.exhibitorsData.forEach((exhibitor, index) => {
      const card = this.createExhibitorCard(exhibitor, index);
      gridContainer.appendChild(card);
    });

    container.appendChild(gridContainer);
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

    // 重新顯示靜態攤商列表
    this.showAllExhibitors();
  }

  // 初始化完整名單
  initFullList() {
    const grid = document.querySelector(".exhibitors-grid");
    if (!grid) return;

    grid.innerHTML = "";

    // 創建左欄和右欄
    const leftColumn = document.createElement("div");
    leftColumn.className = "exhibitor-column-left";
    
    const rightColumn = document.createElement("div");
    rightColumn.className = "exhibitor-column-right";

    // 將攤商分配到兩欄
    this.exhibitorsData.forEach((exhibitor, index) => {
      const card = this.createExhibitorCard(exhibitor, index);
      
      if (index % 2 === 0) {
        // 偶數索引放到左欄
        leftColumn.appendChild(card);
      } else {
        // 奇數索引放到右欄
        rightColumn.appendChild(card);
      }
    });

    grid.appendChild(leftColumn);
    grid.appendChild(rightColumn);

    // 初始化排序按鈕
    this.initSortButtons();
  }

  // 初始化排序按鈕
  initSortButtons() {
    const sortButtons = document.querySelectorAll(".sort-button");
    
    sortButtons.forEach(button => {
      button.addEventListener("click", () => {
        // 移除所有按鈕的 active 狀態
        sortButtons.forEach(btn => btn.classList.remove("active"));
        
        // 添加當前按鈕的 active 狀態
        button.classList.add("active");
        
        // 應用排序
        const sortType = button.getAttribute("data-sort");
        this.applySorting(sortType);
      });
    });

  }

  // 應用排序
  applySorting(sortType) {
    let sortedData = [...this.exhibitorsData];

    switch (sortType) {
      case "country":
        // 按國籍排序（字母順序）
        sortedData.sort((a, b) => {
          const countryA = a.nationality || "ZZZ"; // 空值排最後
          const countryB = b.nationality || "ZZZ";
          return countryA.localeCompare(countryB);
        });
        break;
        
      case "zone":
        // 按攤位分區排序（字母順序）
        sortedData.sort((a, b) => {
          const zoneA = (a.boothNumber || "").charAt(0) || "ZZZ";
          const zoneB = (b.boothNumber || "").charAt(0) || "ZZZ";
          return zoneA.localeCompare(zoneB);
        });
        break;
        
      case "name":
        // 按名字排序（字母順序）
        sortedData.sort((a, b) => {
          const nameA = a.brand || a.name || "ZZZ";
          const nameB = b.brand || b.name || "ZZZ";
          return nameA.localeCompare(nameB);
        });
        break;
    }

    // 重新渲染
    this.renderSortedExhibitors(sortedData);
  }

  // 渲染排序後的攤商
  renderSortedExhibitors(sortedData) {
    const grid = document.querySelector(".exhibitors-grid");
    if (!grid) return;

    grid.innerHTML = "";

    // 創建左欄和右欄
    const leftColumn = document.createElement("div");
    leftColumn.className = "exhibitor-column-left";
    
    const rightColumn = document.createElement("div");
    rightColumn.className = "exhibitor-column-right";

    // 將排序後的攤商分配到兩欄
    sortedData.forEach((exhibitor, index) => {
      const card = this.createExhibitorCard(exhibitor, index);
      
      if (index % 2 === 0) {
        // 偶數索引放到左欄
        leftColumn.appendChild(card);
      } else {
        // 奇數索引放到右欄
        rightColumn.appendChild(card);
      }
    });

    grid.appendChild(leftColumn);
    grid.appendChild(rightColumn);
  }

  // 創建攤商卡片
  createExhibitorCard(exhibitor, index) {
    const card = document.createElement("div");
    card.className = "exhibitor-card-main";

    // 使用新的資料欄位
    const brandName = exhibitor.brand || exhibitor.name || "Unknown";
    const boothNumber = exhibitor.boothNumber || "-";
    const nationality = exhibitor.nationality || "TW";
    const brandDescription = exhibitor.brandDescription || exhibitor.description || "暫無簡介";

    // 基本資訊區域（顯示名稱、國籍、攤位編號）
    const basicInfo = document.createElement("div");
    basicInfo.className = "exhibitor-basic-info";
    
    // 品牌名稱（可點擊）
    const brandDisplay = document.createElement("div");
    brandDisplay.className = "exhibitor-brand-display";
    brandDisplay.textContent = brandName;

    // 攤商編號和國籍（一行顯示）
    const metaInfo = document.createElement("div");
    metaInfo.className = "exhibitor-meta-info";
    
    const boothDisplay = document.createElement("span");
    boothDisplay.className = "exhibitor-booth-display";
    boothDisplay.textContent = boothNumber;

    const nationalityDisplay = document.createElement("span");
    nationalityDisplay.className = "exhibitor-nationality-display";
    nationalityDisplay.textContent = nationality;

    metaInfo.appendChild(boothDisplay);
    metaInfo.appendChild(nationalityDisplay);

    basicInfo.appendChild(brandDisplay);
    basicInfo.appendChild(metaInfo);

    // 創建詳細資訊下拉區域
    const details = document.createElement("div");
    details.className = "exhibitor-details";

    const detailsContent = document.createElement("div");
    detailsContent.className = "exhibitor-details-content";

    // 品牌簡介
    const description = document.createElement("div");
    description.className = "exhibitor-description";
    description.textContent = brandDescription;

    detailsContent.appendChild(description);

    // 社交連結區域
    const socialLinks = document.createElement("div");
    socialLinks.className = "exhibitor-social-links";

    // Facebook 連結
    if (exhibitor.facebook) {
      const facebookLink = document.createElement("a");
      facebookLink.href = exhibitor.facebook;
      facebookLink.target = "_blank";
      facebookLink.className = "exhibitor-social-link facebook";
      facebookLink.textContent = "Facebook";
      socialLinks.appendChild(facebookLink);
    }

    // Instagram 連結
    if (exhibitor.instagram) {
      const instagramLink = document.createElement("a");
      instagramLink.href = exhibitor.instagram;
      instagramLink.target = "_blank";
      instagramLink.className = "exhibitor-social-link instagram";
      instagramLink.textContent = "Instagram";
      socialLinks.appendChild(instagramLink);
    }

    // Website 連結
    if (exhibitor.website) {
      const websiteLink = document.createElement("a");
      websiteLink.href = exhibitor.website;
      websiteLink.target = "_blank";
      websiteLink.className = "exhibitor-social-link website";
      websiteLink.textContent = "Website";
      socialLinks.appendChild(websiteLink);
    }

    details.appendChild(detailsContent);
    details.appendChild(socialLinks);

    // 組裝卡片
    card.appendChild(basicInfo);
    card.appendChild(details);

    // 添加點擊事件來展開/收合詳細資訊
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = details.classList.contains("expanded");
      
      // 關閉其他已展開的卡片
      document.querySelectorAll(".exhibitor-details.expanded").forEach(detail => {
        if (detail !== details) {
          detail.classList.remove("expanded");
        }
      });

      // 切換當前卡片的展開狀態
      if (isExpanded) {
        details.classList.remove("expanded");
      } else {
        details.classList.add("expanded");
      }
    });

    return card;
  }
}

// 當頁面載入完成後初始化
document.addEventListener("DOMContentLoaded", function () {
  new ExhibitorDisplay();
});
