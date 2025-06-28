document.addEventListener("DOMContentLoaded", function () {
  // 重設 loading 遮罩
  const loadingMask = document.getElementById("loading-mask");
  const loadingPercent = document.getElementById("loading-percent");
  if (loadingMask) loadingMask.style.display = "flex";
  if (loadingPercent) loadingPercent.textContent = "0%";

  // 這裡啟動你的 fake loading 動畫
  if (window.startFakeLoading) {
    window.startFakeLoading();
  }

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
  window.openEditPage = function openEditPage() {
    const editPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const account = document.querySelector(".account");
    if (editPage) editPage.style.display = "table-cell";
    if (mid) mid.style.display = "none";
    if (right) right.style.display = "none";
    if (account) account.style.display = "none";

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
    if (editBrandPage) editBrandPage.style.display = "none";
    if (mid) mid.style.display = "none";
    if (right) right.style.display = "none";
    if (editPage) editPage.style.display = "none";
    if (account) account.style.display = "none";
    if (faq) faq.style.display = "table-cell";
    if (contact) contact.style.display = "none";
  };
  window.showContactSection = function showContactSection() {
    const editBrandPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const editPage = document.getElementById("edit-account-page");
    const account = document.querySelector(".account");
    const faq = document.getElementById("faq");
    const contact = document.getElementById("contact-method");
    if (editBrandPage) editBrandPage.style.display = "none";
    if (mid) mid.style.display = "none";
    if (right) right.style.display = "none";
    if (editPage) editPage.style.display = "none";
    if (account) account.style.display = "none";
    if (faq) faq.style.display = "none";
    if (contact) contact.style.display = "table-cell";
  };
  window.showAccountSection = function showAccountSection() {
    const editBrandPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const editPage = document.getElementById("edit-account-page");
    const account = document.getElementById("account");
    const faq = document.getElementById("faq");
    const contact = document.getElementById("contact-method");
    if (editBrandPage) editBrandPage.style.display = "none";
    if (mid) mid.style.display = "none";
    if (right) right.style.display = "none";
    if (editPage) editPage.style.display = "none";
    if (account) account.style.display = "table-cell";
    if (faq) faq.style.display = "none";
    if (contact) contact.style.display = "none";
  };

  window.showDashboardSection = function showDashboardSection() {
    const editBrandPage = document.getElementById("edit-brand-page");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    const editPage = document.getElementById("edit-account-page");
    const account = document.querySelector(".account");
    const faq = document.getElementById("faq");
    const contact = document.getElementById("contact-method");
    if (editBrandPage) editBrandPage.style.display = "none";
    if (mid) mid.style.display = "table-cell";
    if (right) right.style.display = "table-cell";
    if (editPage) editPage.style.display = "none";
    if (account) account.style.display = "none";
    if (faq) faq.style.display = "none";
    if (contact) contact.style.display = "none";
  };

  window.openAccountEditPage = function openAccountEditPage() {
    const editAccountPage = document.getElementById("edit-account-page");
    const account = document.getElementById("account");
    const mid = document.querySelector(".mid");
    const right = document.querySelector(".right");
    if (editAccountPage) editAccountPage.style.display = "table-cell";
    if (account) account.style.display = "none";
    if (mid) mid.style.display = "none";
    if (right) right.style.display = "none";

    // 自動填入現有資料
    const fields = [
      ["contact-person", "contact-person-edit"],
      ["phone", "phone-edit"],
      ["nationality2", "nationality-edit"],
    ];
    fields.forEach(([from, to]) => {
      const fromEl = document.getElementById(from);
      const toEl = document.getElementById(to);
      if (fromEl && toEl) {
        if (to === "nationality-edit" && toEl.tagName === "SELECT") {
          toEl.value = fromEl.textContent.trim();
        } else {
          toEl.value = fromEl.textContent.trim();
        }
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    // ...原本的程式...

    // 手機自動顯示草地遮罩
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setTimeout(showGrassMask, 300); // 頁面載入後自動出現
    }
  });

  // 草地遮罩小遊戲
  function showGrassMask() {
    const mask = document.getElementById("grass-mask");
    const canvas = document.getElementById("grass-canvas");
    const progress = document.getElementById("grass-progress");
    mask.style.display = "flex";
    // 設定 canvas 尺寸
    canvas.width = window.innerWidth;
    canvas.height = Math.floor(window.innerHeight * 0.6);

    const ctx = canvas.getContext("2d");
    const grassCount = 60;
    let grassArr = [];
    let erased = 0;

    // 隨機生成草
    for (let i = 0; i < grassCount; i++) {
      grassArr.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        erased: false,
      });
    }

    function drawGrass() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "32px serif";
      grassArr.forEach((g) => {
        if (!g.erased) ctx.fillText("🌱", g.x, g.y);
      });
    }

    drawGrass();

    // 鋤草
    function eraseGrass(x, y) {
      let changed = false;
      grassArr.forEach((g) => {
        if (!g.erased && Math.hypot(g.x - x, g.y - y) < 32) {
          g.erased = true;
          erased++;
          changed = true;
        }
      });
      if (changed) drawGrass();
      progress.textContent = `已鋤草 ${erased}/${grassCount}`;
      if (erased === grassCount) {
        progress.textContent = "全部鋤完啦！";
        setTimeout(() => {
          mask.style.display = "none";
        }, 1200);
      }
    }

    // 支援滑鼠與觸控
    function handle(e) {
      let x, y;
      if (e.touches) {
        for (let t of e.touches) {
          x = t.clientX;
          y = t.clientY;
          eraseGrass(x, y);
        }
      } else {
        x = e.clientX;
        y = e.clientY;
        eraseGrass(x, y);
      }
    }
    canvas.addEventListener("mousemove", handle);
    canvas.addEventListener("touchmove", handle);

    // 初始進度
    progress.textContent = `已鋤草 0/${grassCount}`;
  }
});
