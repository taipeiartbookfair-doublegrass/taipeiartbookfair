class ExhibitorsList {
  constructor() {
    this.exhibitorsData = [];
    this.publishApiUrl =
      "https://script.google.com/macros/s/AKfycbxF5VwhrcUjTegd3e-j7Ar7-iD8I0rhvnZNgYmXMZrApQloiqJEhXvp9XzdC1vhntJ8Cw/exec";
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

      // 構建請求參數
      const params = new URLSearchParams({
        action: "get_accepted_booths",
      }).toString();

      const response = await fetch(this.publishApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("從試算表獲取的原始數據:", data);

      // 根據哥哥的 API 響應格式解析數據
      let exhibitors = null;

      // 檢查 API 是否成功響應
      if (data.success && data.data) {
        // 哥哥的 API 返回格式：{ success: true, data: { total_count: 數字, booths: [攤商數據] } }
        if (data.data.booths && Array.isArray(data.data.booths)) {
          exhibitors = data.data.booths;
          console.log(
            `API 返回 ${data.data.total_count} 個攤商，實際載入 ${exhibitors.length} 個攤商數據`
          );
        }
      }

      // 如果沒有找到數據，嘗試其他可能的字段（向後兼容）
      if (!exhibitors) {
        if (data.data && Array.isArray(data.data)) {
          exhibitors = data.data;
        } else if (data.exhibitors && Array.isArray(data.exhibitors)) {
          exhibitors = data.exhibitors;
        } else if (data.booths && Array.isArray(data.booths)) {
          exhibitors = data.booths;
        } else if (Array.isArray(data)) {
          exhibitors = data;
        }
      }

      if (exhibitors && Array.isArray(exhibitors) && exhibitors.length > 0) {
        this.exhibitorsData = exhibitors
          .filter((item) => item && (item.name || item.nameEn || item.id))
          .map((item) => this.normalizeExhibitorData(item));

        console.log(`成功載入 ${this.exhibitorsData.length} 個攤商數據`);
      } else {
        console.warn("試算表數據格式不正確或為空");
        this.exhibitorsData = [];
      }
    } catch (error) {
      console.error("無法從試算表載入數據:", error);
      this.exhibitorsData = [];
    }
  }

  // 標準化攤商數據格式
  normalizeExhibitorData(item) {
    return {
      id:
        item["報名編號"] ||
        item.id ||
        item.ID ||
        item.編號 ||
        item["攤商編號"] ||
        "未知",
      name:
        item["品牌"] ||
        item.name ||
        item.Name ||
        item.名稱 ||
        item["攤商名稱"] ||
        "",
      nameEn:
        item["品牌簡介"] ||
        item.nameEn ||
        item.NameEn ||
        item.英文名稱 ||
        item["攤商英文名稱"] ||
        "",
      category:
        item["身份類別"] ||
        item.category ||
        item.Category ||
        item.類別 ||
        item["攤位類別"] ||
        "",
      booth:
        item["報名編號"] ||
        item.booth ||
        item.Booth ||
        item.攤位 ||
        item["攤位編號"] ||
        item["攤位號碼"] ||
        "",
      region:
        item.region || item.Region || item.地區 || item["國家/地區"] || "",
      applicationNumber: item["報名編號"] || "",
      accepted: item["錄取"] || "",
      paid: item["已匯款"] || false,
      agreement: item["同意書"] || false,
      image:
        item.image ||
        item.Image ||
        item.圖片 ||
        item["攤商圖片"] ||
        item["品牌圖片"] ||
        "image/horizental/hori1.jpg",
    };
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
    const category = exhibitor.category || "";
    const applicationNumber = exhibitor.applicationNumber || "";

    // 根據報名編號判斷攤位類型
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
    } else if (category.includes("書攤") || category.includes("Book")) {
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

    // 顯示攤商名稱和報名編號
    const displayName = exhibitor.name || exhibitor.nameEn || "Unknown";
    const displayBooth =
      applicationNumber || exhibitor.booth || exhibitor.id || "-";

    item.innerHTML = `
      <span class="exhibitor-name">${displayName}</span>
      <span class="exhibitor-booth">${displayBooth}</span>
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
