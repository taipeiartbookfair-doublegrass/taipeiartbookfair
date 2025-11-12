document.addEventListener("DOMContentLoaded", function () {
  // 重設 loading 遮罩
  const loadingMask = document.getElementById("loading-mask");
  const loadingPercent = document.getElementById("loading-percent");
  if (loadingMask) loadingMask.style.display = "flex";
  if (loadingPercent) loadingPercent.textContent = "0%";

  // 這裡啟動你的 fake loading 動畫
  // if (window.startFakeLoading) {
  //   window.startFakeLoading();
  // }

  // Logo rotation logic
  const logo = document.querySelector(".machine-rotate-logo");
  let isHovering = false;

  if (logo) {
    // Mouse tracking for rotation when NOT hovering
    document.addEventListener("mousemove", function (e) {
      if (isHovering) return;
      const rect = logo.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      logo.style.transform = `rotate(${angle + 90}deg)`;
    });

    // On hover: add animation class, remove inline transform
    logo.addEventListener("mouseenter", function () {
      isHovering = true;
      logo.style.transform = "";
      logo.classList.add("machine-rotate-animating");
    });

    // On leave: remove animation class, reset to follow mouse
    logo.addEventListener("mouseleave", function () {
      isHovering = false;
      logo.classList.remove("machine-rotate-animating");
    });
  }

  window.setSidebarActive = function (section) {
    // 定義所有 sidebar id
    const sidebarIds = [
      "sidebar-dashboard",
      "sidebar-contact",
      "sidebar-faq",
      "sidebar-account",
    ];
    sidebarIds.forEach((id) => {
      const a = document.getElementById(id);
      if (!a) return;
      const p = a.querySelector("p");
      // 移除所有 <mark>
      if (p) {
        const html = p.innerHTML.replace(/<mark>([\s\S]*?)<\/mark>/g, "$1");
        p.innerHTML = html;
      }
      // 還原帳號管理顏色
      if (id === "sidebar-account") {
        p.style.backgroundColor = "blueviolet";
        p.style.color = "ghostwhite";
      } else {
        p.style.backgroundColor = "";
        p.style.color = "";
      }
    });

    // 只給目前選到的加 <mark>
    if (section === "dashboard" || section === "contact" || section === "faq") {
      const a = document.getElementById("sidebar-" + section);
      if (a) {
        const p = a.querySelector("p");
        if (p) {
          p.innerHTML = `<mark>${p.innerHTML}</mark>`;
        }
      }
    }
  };

  // 檢測是否為手機版（需要在函數之前定義）
  const isMobile = window.innerWidth <= 600;
  const displayValue = isMobile ? "block" : "table-cell";

  window.openEditPage = function openEditPage() {
    const editPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const account = document.querySelector(".account");
    const editAccountPage = document.getElementById("edit-account-page");
    const faq = document.getElementById("faq");
    const contact = document.getElementById("contact-method");
    const allSections = [mid, right, account, editAccountPage, faq, contact];
    
    // 移除所有 active class 和 inline style
    allSections.forEach(el => {
      if (el) {
        el.classList.remove("mobile-active");
        if (isMobile) {
          el.style.display = "";
        } else {
          el.style.display = "none";
        }
      }
    });
    
    // 顯示編輯頁面
    if (editPage) {
      if (isMobile) {
        editPage.classList.add("mobile-active");
      } else {
        editPage.style.display = "table-cell";
      }
    }

    // 自動填入現有資料
    const fields = [
      ["brand-name", "brandName-edit"],
      ["bio", "bio-edit"],
      ["role", "role-edit"],
      ["category", "category-edit"],
      ["attendedYears", "attendedYears-edit"],
      ["nationality", "nationality-edit"],
      ["baselocation", "baselocation-edit"],
      ["website", "website-edit"],
      ["instagram", "instagram-edit"],
      ["facebook", "facebook-edit"],
      ["yearlyanswer", "yearlyanswer-edit"],
      ["electricity-answer", "electricity-edit"],
    ];
    fields.forEach(([from, to]) => {
      const fromEl = document.getElementById(from);
      const toEl = document.getElementById(to);
      if (fromEl && toEl) {
        toEl.value = fromEl.textContent.trim();
      }
    });

    // 控制編輯頁電力需求顯示
    const boothType = document.getElementById("booth-type")?.textContent.trim();
    const editElectricityRow = document.getElementById("edit-electricity-row");
    if (editElectricityRow) {
      if (boothType === "食物酒水攤" || boothType === "裝置攤") {
        editElectricityRow.style.display = "block";
      } else {
        editElectricityRow.style.display = "none";
      }
    }
  };

  window.showFAQSection = function showFAQSection() {
    const editBrandPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const editPage = document.getElementById("edit-account-page");
    const account = document.querySelector(".account");
    const faq = document.getElementById("faq");
    const contact = document.getElementById("contact-method");
    const allSections = [editBrandPage, mid, right, editPage, account, faq, contact];
    
    // 移除所有 active class 和 inline style
    allSections.forEach(el => {
      if (el) {
        el.classList.remove("mobile-active");
        if (isMobile) {
          el.style.display = "";
        } else {
          el.style.display = "none";
        }
      }
    });
    
    // 顯示選中的區塊
    if (faq) {
      if (isMobile) {
        faq.classList.add("mobile-active");
      } else {
        faq.style.display = "table-cell";
      }
    }
  };
  
  window.showContactSection = function showContactSection() {
    const editBrandPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const editPage = document.getElementById("edit-account-page");
    const account = document.querySelector(".account");
    const faq = document.getElementById("faq");
    const contact = document.getElementById("contact-method");
    const allSections = [editBrandPage, mid, right, editPage, account, faq, contact];
    
    // 移除所有 active class 和 inline style
    allSections.forEach(el => {
      if (el) {
        el.classList.remove("mobile-active");
        if (isMobile) {
          el.style.display = "";
        } else {
          el.style.display = "none";
        }
      }
    });
    
    // 顯示選中的區塊
    if (contact) {
      if (isMobile) {
        contact.classList.add("mobile-active");
      } else {
        contact.style.display = "table-cell";
      }
    }
  };
  
  window.showAccountSection = function showAccountSection() {
    const editBrandPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const editPage = document.getElementById("edit-account-page");
    const account = document.getElementById("account");
    const faq = document.getElementById("faq");
    const contact = document.getElementById("contact-method");
    const allSections = [editBrandPage, mid, right, editPage, account, faq, contact];
    
    // 移除所有 active class 和 inline style
    allSections.forEach(el => {
      if (el) {
        el.classList.remove("mobile-active");
        if (isMobile) {
          el.style.display = "";
        } else {
          el.style.display = "none";
        }
      }
    });
    
    // 顯示選中的區塊
    if (account) {
      if (isMobile) {
        account.classList.add("mobile-active");
      } else {
        account.style.display = "table-cell";
      }
    }
  };

  // 關閉編輯品牌頁面
  window.closeEditBrandPage = function closeEditBrandPage() {
    const editPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const account = document.querySelector(".account");
    
    if (editPage) {
      editPage.classList.remove("mobile-active");
      if (isMobile) {
        editPage.style.display = "";
      } else {
        editPage.style.display = "none";
      }
    }
    
    // 顯示 dashboard
    if (window.showDashboardSection) {
      window.showDashboardSection();
    }
  };

  // 關閉編輯帳戶頁面
  window.closeEditAccountPage = function closeEditAccountPage() {
    const editAccountPage = document.getElementById("edit-account-page");
    const account = document.getElementById("account");
    
    if (editAccountPage) {
      editAccountPage.classList.remove("mobile-active");
      if (isMobile) {
        editAccountPage.style.display = "";
      } else {
        editAccountPage.style.display = "none";
      }
    }
    
    // 顯示 account 區塊
    if (account) {
      if (isMobile) {
        account.classList.add("mobile-active");
      } else {
        account.style.display = "table-cell";
      }
    }
  };

  window.showDashboardSection = function showDashboardSection() {
    const editBrandPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const editPage = document.getElementById("edit-account-page");
    const account = document.querySelector(".account");
    const faq = document.getElementById("faq");
    const contact = document.getElementById("contact-method");
    const allSections = [editBrandPage, editPage, account, faq, contact];
    
    // 移除所有 active class 和 inline style
    allSections.forEach(el => {
      if (el) {
        el.classList.remove("mobile-active");
        if (isMobile) {
          el.style.display = "";
        } else {
          el.style.display = "none";
        }
      }
    });
    
    // 顯示選中的區塊
    if (mid) {
      if (isMobile) {
        mid.classList.add("mobile-active");
      } else {
        mid.style.display = "table-cell";
      }
    }
    if (right) {
      if (isMobile) {
        right.classList.add("mobile-active");
      } else {
        right.style.display = "table-cell";
      }
    }
  };

  window.openAccountEditPage = function openAccountEditPage() {
    const editAccountPage = document.getElementById("edit-account-page");
    const account = document.getElementById("account");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const allSections = [account, mid, right];
    
    // 移除所有 active class 和 inline style
    allSections.forEach(el => {
      if (el) {
        el.classList.remove("mobile-active");
        if (isMobile) {
          el.style.display = "";
        } else {
          el.style.display = "none";
        }
      }
    });
    
    // 顯示選中的區塊
    if (editAccountPage) {
      if (isMobile) {
        editAccountPage.classList.add("mobile-active");
      } else {
        editAccountPage.style.display = "table-cell";
      }
    }

    // 自動填入現有資料
    const fields = [
      ["contact-person", "contact-person-edit"],
      ["phone", "phone-edit"],
      ["nationality2", "nationality-edit2"],
    ];
    // 先填一般欄位
    fields.forEach(([from, to]) => {
      const fromEl = document.getElementById(from);
      const toEl = document.getElementById(to);
      if (fromEl && toEl) {
        toEl.value = fromEl.textContent.trim();
      }
    });
    // 再正確填入國籍 select
    const nationalityVal = document
      .getElementById("nationality2")
      ?.textContent.trim();
    const nationalitySelect = document.getElementById("nationality-edit2");
    if (nationalitySelect && nationalityVal) {
      nationalitySelect.value = nationalityVal;
    }
  };

  // 頁面載入時預設顯示 dashboard
  // 先確保所有區塊都被隱藏（手機版）
  if (isMobile) {
    const allSections = [
      document.getElementById("edit-brand-page"),
      document.querySelector(".mid"),
      document.querySelector(".right"),
      document.getElementById("edit-account-page"),
      document.querySelector(".account"),
      document.getElementById("faq"),
      document.getElementById("contact-method")
    ];
    allSections.forEach(el => {
      if (el) {
        el.classList.remove("mobile-active");
      }
    });
  }
  // 然後顯示 dashboard
  if (window.showDashboardSection) {
    window.showDashboardSection();
  }
});
