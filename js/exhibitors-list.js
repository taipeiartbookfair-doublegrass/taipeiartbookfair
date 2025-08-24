// 攤商名單基本功能
class ExhibitorsList {
  constructor() {
    this.exhibitorsData = [];
    this.publishApiUrl =
      "https://script.google.com/macros/s/AKfycbxJkcTqW6xJfhCSVFdI-Mk9SFSGTdQnCB2-_-8sluqgTHul2wjNS6jV9wJZMPtIdSy3Pw/exec";
  }

  // 初始化攤商名單
  async init() {
    try {
      await this.loadExhibitorsData();
      this.renderExhibitors();
    } catch (error) {
      console.error("攤商名單載入失敗:", error);
      this.showErrorMessage();
    }
  }

  // 從試算表載入攤商數據
  async loadExhibitorsData() {
    try {
      console.log("正在從試算表載入攤商數據...");
      const response = await fetch(this.publishApiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("從試算表獲取的原始數據:", data);

      // 嘗試多種可能的數據結構
      let exhibitors = null;

      if (data.success && data.exhibitors) {
        exhibitors = data.exhibitors;
      } else if (data.exhibitors) {
        exhibitors = data.exhibitors;
      } else if (data.data && Array.isArray(data.data)) {
        exhibitors = data.data;
      } else if (data.vendors && Array.isArray(data.vendors)) {
        exhibitors = data.vendors;
      } else if (data.participants && Array.isArray(data.participants)) {
        exhibitors = data.participants;
      } else if (data.booths && Array.isArray(data.booths)) {
        exhibitors = data.booths;
      } else if (Array.isArray(data)) {
        exhibitors = data;
      }

      if (exhibitors && Array.isArray(exhibitors) && exhibitors.length > 0) {
        this.exhibitorsData = exhibitors
          .filter((item) => item && (item.name || item.nameEn || item.id))
          .map((item) => this.normalizeExhibitorData(item));

        console.log(`成功載入 ${this.exhibitorsData.length} 個攤商數據`);
      } else {
        console.warn("試算表數據格式不正確或為空，使用示例數據");
        this.exhibitorsData = this.getSampleData();
      }
    } catch (error) {
      console.error("無法從試算表載入數據:", error);
      this.exhibitorsData = this.getSampleData();
    }
  }

  // 標準化攤商數據格式
  normalizeExhibitorData(item) {
    return {
      id: item.id || item.ID || item.編號 || item["攤商編號"] || "未知",
      name:
        item.name ||
        item.Name ||
        item.名稱 ||
        item["攤商名稱"] ||
        item["品牌"] ||
        "",
      nameEn:
        item.nameEn ||
        item.NameEn ||
        item.英文名稱 ||
        item["攤商英文名稱"] ||
        item["品牌英文"] ||
        "",
      category:
        item.category ||
        item.Category ||
        item.類別 ||
        item["攤位類別"] ||
        item["身份類別"] ||
        "",
      booth:
        item.booth ||
        item.Booth ||
        item.攤位 ||
        item["攤位編號"] ||
        item["攤位號碼"] ||
        item.id ||
        "",
      image:
        item.image ||
        item.Image ||
        item.圖片 ||
        item["攤商圖片"] ||
        item["品牌圖片"] ||
        "image/horizental/hori1.jpg",
    };
  }

  // 獲取示例數據
  getSampleData() {
    return [
      {
        id: "LB001",
        name: "攤商名稱",
        nameEn: "TPABF Press",
        category: "書攤",
        booth: "A-01",
        image: "image/horizental/hori1.jpg",
      },
    ];
  }

  // 渲染攤商列表
  renderExhibitors() {
    const container = document.querySelector(".exhibitors-grid");
    if (!container) return;

    container.innerHTML = "";

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

    container.appendChild(flowContainer);
  }

  // 創建攤商條列項目
  createExhibitorItem(exhibitor, index) {
    const item = document.createElement("div");
    item.className = "exhibitor-item";

    // 根據攤位類型添加對應的CSS類別
    const category = exhibitor.category || exhibitor.categoryEn || "";
    if (category.includes("書攤") || category.includes("Book")) {
      item.classList.add("book-booth");
    } else if (category.includes("創作商品") || category.includes("Creative")) {
      item.classList.add("creative-booth");
    } else if (category.includes("裝置") || category.includes("Installation")) {
      item.classList.add("installation-booth");
    } else if (category.includes("食物") || category.includes("Food")) {
      item.classList.add("food-booth");
    } else if (
      category.includes("International") ||
      category.includes("國際")
    ) {
      item.classList.add("international-booth");
    }

    item.innerHTML = `
      <span class="exhibitor-name">${
        exhibitor.name || exhibitor.nameEn || "Unknown"
      }</span>
      <span class="exhibitor-booth">${
        exhibitor.booth || exhibitor.id || "-"
      }</span>
    `;

    return item;
  }

  // 顯示錯誤訊息
  showErrorMessage() {
    const container = document.querySelector(".exhibitors-grid");
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <p>攤商名單載入中，請稍候...</p>
        </div>
      `;
    }
  }
}

// 當頁面載入完成後初始化
document.addEventListener("DOMContentLoaded", function () {
  const exhibitorsList = new ExhibitorsList();
  exhibitorsList.init();
});
