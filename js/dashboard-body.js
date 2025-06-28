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

  // 手機自動顯示草地遮罩
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    setTimeout(showGrassMask, 100); // 頁面載入後自動出現
  }
});

// 除草戰士

function showGrassMask() {
  const mask = document.getElementById("grass-mask");
  const canvas = document.getElementById("grass-canvas");
  mask.style.display = "flex";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  const ctx = canvas.getContext("2d");
  const grassImg = new window.Image();
  grassImg.src = "image/Moss_of_Bangladesh_2.jpg";
  const grassSize = 65;
  let grassArr = [];
  let deepnessTimer = null;
  let growTimer = null;
  const maxGrass = 400; // 最多草數，可依需求調整

  // 更密集均勻分布
  const rows = 14,
    cols = 16;
  const holeCenterX = canvas.width / 2;
  const holeCenterY = canvas.height * 0.7; // 警語在下方
  const holeRadius = 150; // 缺口半徑

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let x = (canvas.width / cols) * (j + 0.5) + (Math.random() - 0.5);
      let y = (canvas.height / rows) * (i + 0.5) + (Math.random() - 0.5);
      // 中間區域草的生成機率降低
      if (Math.hypot(x - holeCenterX, y - holeCenterY) < holeRadius) {
        if (Math.random() > 0.25) continue; // 只有25%機率生成
      }
      grassArr.push({
        x,
        y,
        erased: false,
        deepness: 0,
      });
    }
  }

  function deepenGrass() {
    grassArr.forEach((g) => {
      if (!g.erased && g.deepness < 2) {
        g.deepness++;
      }
    });
    drawGrass();
  }

  function drawGrass() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grassArr.forEach((g) => {
      if (!g.erased) {
        ctx.save();
        if (g.deepness === 1) {
          ctx.filter = "brightness(0.7) saturate(1.2)";
        } else if (g.deepness === 2) {
          ctx.filter = "brightness(0.5) saturate(1.5)";
        } else {
          ctx.filter = "brightness(1)";
        }
        ctx.globalAlpha = 0.95;
        ctx.drawImage(grassImg, g.x, g.y, grassSize, grassSize);
        ctx.restore();
      }
    });
  }

  function growGrass() {
    if (grassArr.length >= maxGrass) return;
    let x =
      (canvas.width / cols) * (Math.random() * cols) +
      (Math.random() - 0.5) * 8;
    let y =
      (canvas.height / rows) * (Math.random() * rows) +
      (Math.random() - 0.5) * 8;
    grassArr.push({
      x,
      y,
      erased: false,
      deepness: 0,
    });
    drawGrass();
    // 每2~4秒長一根新草
    growTimer = setTimeout(growGrass, 2000 + Math.random() * 2000);
  }

  grassImg.onload = function () {
    drawGrass();
    if (deepnessTimer) clearInterval(deepnessTimer);
    deepnessTimer = setInterval(deepenGrass, 5000);
    if (growTimer) clearTimeout(growTimer);
    growGrass();
  };

  function eraseGrass(x, y) {
    let changed = false;
    grassArr.forEach((g) => {
      if (
        !g.erased &&
        Math.hypot(g.x + grassSize / 2 - x, g.y + grassSize / 2 - y) <
          grassSize * 0.7
      ) {
        if (g.deepness > 0) {
          g.deepness--;
        } else {
          g.erased = true;
        }
        changed = true;
      }
    });
    if (changed) drawGrass();
  }

  function sweepGrass(x, y) {
    let changed = false;
    grassArr.forEach((g) => {
      if (
        !g.erased &&
        Math.hypot(g.x + grassSize / 2 - x, g.y + grassSize / 2 - y) <
          grassSize * 0.7
      ) {
        // 隨機往外推開
        const angle = Math.random() * Math.PI * 2;
        const distance = grassSize * (1.2 + Math.random()); // 推遠一點
        g.x += Math.cos(angle) * distance;
        g.y += Math.sin(angle) * distance;
        // 邊界檢查
        g.x = Math.max(0, Math.min(canvas.width - grassSize, g.x));
        g.y = Math.max(0, Math.min(canvas.height - grassSize, g.y));
        changed = true;
      }
    });
    if (changed) drawGrass();
  }

  function handle(e) {
    let x, y;
    if (e.touches) {
      for (let t of e.touches) {
        x = t.clientX;
        y = t.clientY;
        sweepGrass(x, y);
      }
    } else {
      x = e.clientX;
      y = e.clientY;
      sweepGrass(x, y);
    }
  }
  canvas.addEventListener("mousemove", handle);
  canvas.addEventListener("touchmove", handle);

  // 視窗大小改變時重畫
  window.addEventListener("resize", () => {
    if (mask.style.display === "flex") {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawGrass();
    }
  });

  const grassCursor = document.getElementById("grass-cursor");

  // 滑鼠移動時顯示並跟隨
  canvas.addEventListener("mousemove", function (e) {
    grassCursor.style.display = "block";
    grassCursor.style.left = e.clientX - 18 + "px";
    grassCursor.style.top = e.clientY - 18 + "px";
  });
  canvas.addEventListener("mouseleave", function () {
    grassCursor.style.display = "none";
  });

  // 觸控時也顯示
  canvas.addEventListener("touchmove", function (e) {
    if (e.touches && e.touches.length > 0) {
      grassCursor.style.display = "block";
      grassCursor.style.left = e.touches[0].clientX - 18 + "px";
      grassCursor.style.top = e.touches[0].clientY - 18 + "px";
    }
  });
  canvas.addEventListener("touchend", function () {
    grassCursor.style.display = "none";
  });
}
