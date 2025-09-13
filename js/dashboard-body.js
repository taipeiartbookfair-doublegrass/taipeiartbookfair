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

  // 手機自動顯示草地遮罩
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    setTimeout(showGrassMask, 100); // 頁面載入後自動出現
  }
});

// 除草戰士主程式
function showGrassMask() {
  const mask = document.getElementById("grass-mask");
  const canvas = document.getElementById("grass-canvas");

  // 設定 canvas 寬高為螢幕的 1.1 倍，並偏移，確保不會有白邊
  const vw = Math.round(window.innerWidth * 1.1);
  const vh = Math.round(window.innerHeight * 1.1);
  mask.style.display = "block";
  canvas.width = vw;
  canvas.height = vh;
  canvas.style.width = "105vw";
  canvas.style.height = "105vh";
  canvas.style.left = "-1.5vw";
  canvas.style.top = "-1.5vh";

  const ctx = canvas.getContext("2d");
  const grassImg = new window.Image();
  grassImg.src = "../image/moss2.jpg"; // 草的圖片
  const grassSize = 60; // 每根草的大小
  let grassArr = []; // 草的資料陣列
  let deepnessTimer = null; // 草變深的 timer
  let growTimer = null; // 草長出來的 timer
  const maxGrass = 400; // 最多草數

  // 產生初始草（均勻分布，中央區域較稀疏）
  const rows = 14,
    cols = 16;
  const holeCenterX = canvas.width / 2;
  const holeCenterY = canvas.height * 0.7; // 警語在下方
  const holeRadiusX = 180; // 橫向半徑
  const holeRadiusY = 130; // 縱向半徑

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // 均勻分布加一點亂數
      let x = (canvas.width / cols) * (j + 0.4) + (Math.random() - 0.4);
      let y = (canvas.height / rows) * (i + 0.4) + (Math.random() - 0.4);
      // 中間橢圓區域草的生成機率降低
      if (
        Math.pow((x - holeCenterX) / holeRadiusX, 2) +
          Math.pow((y - holeCenterY) / holeRadiusY, 2) <
        1
      ) {
        if (Math.random() > 0.2) continue; // 只有 20% 機率生成
      }
      grassArr.push({
        x,
        y,
        erased: false, // 是否已被掃掉
        deepness: 0, // 0=淺色, 1=中, 2=深
      });
    }
  }

  // 草慢慢變深色（每次只讓一小部分草變深）
  function deepenGrass() {
    // 找出所有還沒最深的草
    const candidates = grassArr.filter((g) => !g.erased && g.deepness < 2);
    // 每次只讓 1/6 的草變深
    const count = Math.ceil(candidates.length / 6);
    for (let i = 0; i < count; i++) {
      if (candidates.length === 0) break;
      const idx = Math.floor(Math.random() * candidates.length);
      candidates[idx].deepness++;
      candidates.splice(idx, 1); // 避免重複
    }
    drawGrass();
  }

  // 畫出所有草
  function drawGrass() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grassArr.forEach((g) => {
      if (!g.erased) {
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.drawImage(grassImg, g.x, g.y, grassSize, grassSize);

        // 疊加 riso 綠色
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#00a95c";
        ctx.fillRect(g.x, g.y, grassSize, grassSize);

        // 疊加深色（模擬變深）
        if (g.deepness === 1) {
          ctx.globalAlpha = 0.18;
          ctx.fillStyle = "#000";
          ctx.fillRect(g.x, g.y, grassSize, grassSize);
        } else if (g.deepness === 2) {
          ctx.globalAlpha = 0.33;
          ctx.fillStyle = "#000";
          ctx.fillRect(g.x, g.y, grassSize, grassSize);
        }

        // 還原畫布狀態
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    });
  }

  // 慢慢長出新草（隨機分布，不限中間區域）
  function growGrass() {
    if (grassArr.length >= maxGrass) return;
    // 隨機產生新草的位置
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
    // 每 2~4 秒長一根新草
    growTimer = setTimeout(growGrass, 2000 + Math.random() * 2000);
  }

  // 草圖載入後啟動變深與長草
  grassImg.onload = function () {
    drawGrass();
    if (deepnessTimer) clearInterval(deepnessTimer);
    deepnessTimer = setInterval(deepenGrass, 9000); // 每 9 秒變深
    if (growTimer) clearTimeout(growTimer);
    growGrass();
  };

  // 掃地功能：讓草被掃把推開而不是消失
  function sweepGrass(x, y) {
    let changed = false;
    grassArr.forEach((g) => {
      // 判斷滑鼠/手指是否碰到這根草
      if (
        !g.erased &&
        Math.hypot(g.x + grassSize / 2 - x, g.y + grassSize / 2 - y) <
          grassSize * 0.7 // 距離小於草半徑的0.7倍就算碰到
      ) {
        // 隨機產生一個方向（角度）
        const angle = Math.random() * Math.PI * 2;
        // 隨機產生一個距離（1.2~2.2倍草的大小）
        const distance = grassSize * (1.2 + Math.random());
        // 根據角度和距離，計算新的 x/y，讓草往外推開
        g.x += Math.cos(angle) * distance;
        g.y += Math.sin(angle) * distance;
        changed = true; // 有草被推動就標記
      }
    });
    // 如果有任何草被推動，重畫畫面
    if (changed) drawGrass();
  }

  // 處理滑鼠或觸控事件，呼叫掃地功能
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

  // 視窗大小改變時，canvas 跟著調整並重畫草
  window.addEventListener("resize", () => {
    const vw = Math.round(window.innerWidth * 1.1);
    const vh = Math.round(window.innerHeight * 1.1);
    canvas.width = vw;
    canvas.height = vh;
    canvas.style.width = "110vw";
    canvas.style.height = "110vh";
    canvas.style.left = "-2.5vw";
    canvas.style.top = "-2.5vh";
    drawGrass();
  });

  // 掃把 emoji 游標跟隨滑鼠或手指
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
