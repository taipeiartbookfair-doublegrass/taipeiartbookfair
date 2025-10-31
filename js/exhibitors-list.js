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
      // 品牌名稱
      brand: item["品牌"] || item.brand || item.Brand || item.name || "",
      
      // 攤商編號
      boothNumber: item["攤商編號"] || item.boothNumber || item.BoothNumber || item["報名編號"] || item.booth || "",
      
      // 品牌簡介
      brandDescription: item["品牌簡介"] || item.brandDescription || item.BrandDescription || item.description || "",
      
      // Facebook 連結
      facebook: item.facebook || item.Facebook || item["Facebook"] || "",
      
      // Instagram 連結
      instagram: item.instagram || item.Instagram || item["Instagram"] || "",
      
      // Website 連結
      website: item.website || item.Website || item["Website"] || "",
      
      // 保留一些舊欄位以備用
      id: item["報名編號"] || item.id || "",
      name: item["品牌"] || item.name || "",
      nameEn: item["品牌簡介"] || item.nameEn || "",
      image: item.image || item["品牌圖片"] || "image/horizental/hori1.jpg",
    };
  }

  // 渲染攤商列表
  renderExhibitors() {
    const container = document.querySelector(".exhibitors-grid");
    if (!container) {
      console.error("找不到 .exhibitors-grid 容器");
      return;
    }

    console.log("開始渲染攤商列表，共", this.exhibitorsData.length, "個攤商");
    container.innerHTML = "";

    // 添加攤商項目 - 使用新的卡片佈局
    this.exhibitorsData.forEach((exhibitor, index) => {
      const card = this.createExhibitorCard(exhibitor, index);
      container.appendChild(card);
    });

    console.log("攤商列表渲染完成");
  }

  // 創建攤商卡片
  createExhibitorCard(exhibitor, index) {
    const card = document.createElement("div");
    card.className = "exhibitor-card";

    // 使用新的資料欄位
    const brandName = exhibitor.brand || exhibitor.name || "Unknown";
    const boothNumber = exhibitor.boothNumber || "-";
    const brandDescription = exhibitor.brandDescription || "暫無簡介";

    // 創建兩行佈局的基本資訊區域
    const basicInfo = document.createElement("div");
    basicInfo.className = "exhibitor-basic-info";
    
    // 第一行：品牌名稱（可點擊）
    const brandDisplay = document.createElement("div");
    brandDisplay.className = "exhibitor-brand-display";
    brandDisplay.textContent = brandName;

    // 第二行：攤商編號
    const boothDisplay = document.createElement("div");
    boothDisplay.className = "exhibitor-booth-display";
    boothDisplay.textContent = boothNumber;

    basicInfo.appendChild(brandDisplay);
    basicInfo.appendChild(boothDisplay);

    // 創建詳細資訊下拉區域
    const details = document.createElement("div");
    details.className = "exhibitor-details";

    const detailsContent = document.createElement("div");
    detailsContent.className = "exhibitor-details-content";

    // 攤商照片
    const photo = document.createElement("div");
    photo.className = "exhibitor-photo";
    const photoImg = document.createElement("img");
    photoImg.src = exhibitor.image || "image/horizental/hori1.jpg";
    photoImg.alt = brandName;
    photoImg.onerror = function() {
      this.src = "image/horizental/hori1.jpg";
    };
    photo.appendChild(photoImg);

    // 品牌簡介
    const description = document.createElement("div");
    description.className = "exhibitor-description";
    description.textContent = brandDescription;

    detailsContent.appendChild(photo);
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
    brandDisplay.addEventListener("click", (e) => {
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
