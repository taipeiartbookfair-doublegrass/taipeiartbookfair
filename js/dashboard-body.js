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
      "sidebar-open-call",
      "sidebar-consignment",
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
      // 還原帳號管理顏色；已被標為 disabled (darkgray) 的不覆蓋
      if (id === "sidebar-account") {
        p.style.backgroundColor = "blueviolet";
        p.style.color = "ghostwhite";
      } else if (p.style.color !== "darkgray") {
        p.style.backgroundColor = "";
        p.style.color = "";
      }
    });

    // 只給目前選到的加 <mark>
    if (section === "dashboard" || section === "open-call" || section === "consignment" || section === "contact" || section === "faq") {
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

  const OPEN_CALL_IFRAME_LOCAL = "localapplication.html?embed=1";
  const OPEN_CALL_IFRAME_OVERSEA = "overseaapplication.html?embed=1";

  /** 若 HTML 仍為舊檔名（如 *_20251218_invite.html），強制改為目前申請頁，避免 iframe 404 */
  function ensureOpenCallIframeSrc() {
    const localFrame = document.getElementById("opencall-frame-local");
    const overseaFrame = document.getElementById("opencall-frame-oversea");
    if (!localFrame || !overseaFrame) return;
    const base = document.baseURI || window.location.href;
    const fix = (el, rel) => {
      const want = new URL(rel, base).href;
      let cur = "";
      try {
        cur = new URL(el.getAttribute("src") || "", base).href;
      } catch (e) {
        cur = "";
      }
      if (cur !== want) el.setAttribute("src", rel);
    };
    fix(localFrame, OPEN_CALL_IFRAME_LOCAL);
    fix(overseaFrame, OPEN_CALL_IFRAME_OVERSEA);
  }

  function syncOpenCallIframeByRegion() {
    ensureOpenCallIframeSrc();
    const localFrame = document.getElementById("opencall-frame-local");
    const overseaFrame = document.getElementById("opencall-frame-oversea");
    if (!localFrame || !overseaFrame) return;
    const r =
      typeof getCookie === "function" ? getCookie("region") || "" : "";
    const isTW = r.trim().toUpperCase() === "TW";
    localFrame.classList.toggle("opencall-dashboard-iframe--hidden", !isTW);
    overseaFrame.classList.toggle("opencall-dashboard-iframe--hidden", isTW);
  }
  window.syncOpenCallIframeByRegion = syncOpenCallIframeByRegion;

  window.openEditPage = function openEditPage() {
    const editPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const account = document.querySelector(".account");
    const editAccountPage = document.getElementById("edit-account-page");
    const faq = document.getElementById("faq");
    const contact = document.getElementById("contact-method");
    const openCallGated = document.getElementById("open-call-gated");
    const consignmentForm = document.getElementById("consignment-form");
    const allSections = [mid, right, account, editAccountPage, faq, contact, openCallGated, consignmentForm];
    
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
      ["brand-name-original", "brandName-original-edit"],
      ["bio", "bio-edit"],
      ["bio-en", "bio-edit-en"],
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

    // 初始化字數計數器
    const bioEdit = document.getElementById("bio-edit");
    const bioCounter = document.getElementById("bio-edit-counter");
    const BIO_ZH_MAX = 80;
    const BIO_EN_MAX = 100;
    if (bioEdit && bioCounter) {
      bioCounter.textContent = bioEdit.value.length;
      bioEdit.addEventListener("input", () => {
        bioCounter.textContent = bioEdit.value.length;
        bioCounter.style.color =
          bioEdit.value.length >= BIO_ZH_MAX ? "#c00" : "#888";
      });
    }
    const bioEditEn = document.getElementById("bio-edit-en");
    const bioCounterEn = document.getElementById("bio-edit-en-counter");
    if (bioEditEn && bioCounterEn) {
      bioCounterEn.textContent = bioEditEn.value.length;
      bioEditEn.addEventListener("input", () => {
        bioCounterEn.textContent = bioEditEn.value.length;
        bioCounterEn.style.color =
          bioEditEn.value.length >= BIO_EN_MAX ? "#c00" : "#888";
      });
    }

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
    const openCallForm = document.getElementById("open-call-form");
    const openCallGated = document.getElementById("open-call-gated");
    const consignmentForm = document.getElementById("consignment-form");
    const allSections = [editBrandPage, mid, right, editPage, account, faq, contact, openCallForm, openCallGated, consignmentForm];
    
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
    const openCallForm = document.getElementById("open-call-form");
    const openCallGated = document.getElementById("open-call-gated");
    const consignmentForm = document.getElementById("consignment-form");
    const allSections = [editBrandPage, mid, right, editPage, account, faq, contact, openCallForm, openCallGated, consignmentForm];
    
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
    const openCallForm = document.getElementById("open-call-form");
    const openCallGated = document.getElementById("open-call-gated");
    const consignmentForm = document.getElementById("consignment-form");
    const allSections = [editBrandPage, mid, right, editPage, account, faq, contact, openCallForm, openCallGated, consignmentForm];
    
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

  window.showOpenCallForm = function showOpenCallForm() {
    const editBrandPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const editPage = document.getElementById("edit-account-page");
    const account = document.querySelector(".account");
    const faq = document.getElementById("faq");
    const contact = document.getElementById("contact-method");
    const openCallForm = document.getElementById("open-call-form");
    const openCallGated = document.getElementById("open-call-gated");
    const consignmentForm = document.getElementById("consignment-form");
    const allSections = [editBrandPage, mid, right, editPage, account, faq, contact, openCallGated, consignmentForm];
    
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
    
    syncOpenCallIframeByRegion();
    // 顯示 OPEN CALL 表單
    if (openCallForm) {
      if (isMobile) {
        openCallForm.classList.add("mobile-active");
      } else {
        openCallForm.style.display = "table-cell";
      }
    }
  };

  window.showOpenCallGated = function showOpenCallGated() {
    const editBrandPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const editPage = document.getElementById("edit-account-page");
    const account = document.querySelector(".account");
    const faq = document.getElementById("faq");
    const contact = document.getElementById("contact-method");
    const openCallForm = document.getElementById("open-call-form");
    const openCallGated = document.getElementById("open-call-gated");
    const consignmentForm = document.getElementById("consignment-form");
    const allSections = [editBrandPage, mid, right, editPage, account, faq, contact, openCallForm, consignmentForm];

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

    if (openCallGated) {
      if (isMobile) {
        openCallGated.classList.add("mobile-active");
      } else {
        openCallGated.style.display = "table-cell";
      }
    }
  };

  window.showConsignmentForm = function showConsignmentForm() {
    const editBrandPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const editPage = document.getElementById("edit-account-page");
    const account = document.querySelector(".account");
    const faq = document.getElementById("faq");
    const contact = document.getElementById("contact-method");
    const openCallForm = document.getElementById("open-call-form");
    const openCallGated = document.getElementById("open-call-gated");
    const consignmentForm = document.getElementById("consignment-form");
    const allSections = [editBrandPage, mid, right, editPage, account, faq, contact, openCallForm, openCallGated];

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

    if (consignmentForm) {
      if (isMobile) {
        consignmentForm.classList.add("mobile-active");
      } else {
        consignmentForm.style.display = "table-cell";
      }
    }

    // Send user data to the consignment iframe
    const csIframe = document.getElementById("consignment-iframe");
    if (csIframe && csIframe.contentWindow) {
      const name  = (document.getElementById("contact-person") || {}).textContent?.trim() || "";
      const email = (document.getElementById("email") || {}).textContent?.trim() || "";
      try { csIframe.contentWindow.postMessage({ type: "cs-user-data", name, email }, "*"); } catch (e) {}
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
    const openCallForm = document.getElementById("open-call-form");
    const openCallGated = document.getElementById("open-call-gated");
    const consignmentForm = document.getElementById("consignment-form");
    const allSections = [editBrandPage, editPage, account, faq, contact, openCallForm, openCallGated, consignmentForm];
    
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
      document.getElementById("contact-method"),
      document.getElementById("open-call-gated"),
      document.getElementById("consignment-form"),
    ];
    allSections.forEach(el => {
      if (el) {
        el.classList.remove("mobile-active");
      }
    });
  }
  syncOpenCallIframeByRegion();
});

// 接收 open call iframe 的投稿完成訊號
// 仿照 edit-profile.js：等待 Apps Script 寫入完成後再 reload
window.addEventListener("message", function (e) {
  if (!e.data || e.data.type !== "opencall-submitted") return;

  const POLL_DELAY = 2000;   // 第一次等待 2 秒
  const POLL_INTERVAL = 1500; // 每次輪詢間隔
  const POLL_MAX = 6;         // 最多輪詢 6 次（共約 11 秒）

  const accountVal = (typeof getCookie === "function") ? getCookie("account") : "";

  function poll(attempt) {
    if (!accountVal) { window.location.reload(); return; }

    const params = new URLSearchParams({
      action: "get_dashboard_info",
      account: accountVal,
    }).toString();

    fetch(apiUrl, {
      redirect: "follow",
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: params,
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        // 確認報名編號已寫入才 reload
        if (data.success && data.data && data.data["報名編號"]) {
          window.location.reload();
        } else if (attempt < POLL_MAX) {
          setTimeout(function() { poll(attempt + 1); }, POLL_INTERVAL);
        } else {
          // 超時仍 reload，讓使用者看到最新狀態
          window.location.reload();
        }
      })
      .catch(function() {
        window.location.reload();
      });
  }

  setTimeout(function() { poll(1); }, POLL_DELAY);
});
