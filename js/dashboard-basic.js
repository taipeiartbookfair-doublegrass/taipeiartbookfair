// 先檢查 cookie
const account = getCookie("account");
const region = getCookie("region");

if (!account || !region) {
  window.location.href = "login.html";
}

const apiUrl =
  "https://script.google.com/macros/s/AKfycbwNWgPsLK_ldHUIvoIg5a9k3PNIlmjvJeTgbCZ5CZsvKFQ7e1DoxbMsAawi4nI3Rea4DA/exec";

document.addEventListener("DOMContentLoaded", async function () {
  let fakeProgress = 0.01; // 一開始就有一點進度
  let progressTimer = null;

  // 自動進度動畫
  function startFakeProgress() {
    progressTimer = setInterval(() => {
      // 最多跑到 82%
      if (fakeProgress < 0.82) {
        fakeProgress += 0.006;
        if (window.updateLoadingProgress) updateLoadingProgress(fakeProgress);
      }
    }, 25); // 每 25ms 跑一次
  }

  function stopFakeProgress() {
    if (progressTimer) clearInterval(progressTimer);
  }

  startFakeProgress();

  // --- loading-grid 填滿並預留右下角空位 ---
  const grid = document.querySelector(".loading-grid");
  const mask = document.getElementById("loading-mask");
  if (grid && mask) {
    const imgSrc = "image/loading1.jpg"; // 你的 loading 圖片
    const imgSize = 70; // px

    // 用 clientWidth/clientHeight 會更精準
    const maskWidth = mask.clientWidth;
    const maskHeight = mask.clientHeight;
    const cols = Math.ceil(maskWidth / imgSize);
    const rows = Math.ceil(maskHeight / imgSize);

    grid.style.gridTemplateColumns = `repeat(${cols}, ${imgSize}px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, ${imgSize}px)`;

    grid.innerHTML = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // 預留右下角一格空位
        if (r === rows - 1 && c === cols - 1) {
          const empty = document.createElement("div");
          empty.style.width = imgSize + "px";
          empty.style.height = imgSize + "px";
          empty.style.background = "transparent";
          grid.appendChild(empty);
        } else {
          const img = document.createElement("img");
          img.src = imgSrc;
          img.alt = "loading";
          img.style.width = imgSize + "px";
          img.style.height = imgSize + "px";
          grid.appendChild(img);
        }
      }
    }
  }

  // 取得 dashboard 資料
  let apiData = {};
  const params = new URLSearchParams({
    action: "get_dashboard_info",
    account: account,
  }).toString();

  try {
    const dashboardRes = await fetch(apiUrl, {
      redirect: "follow",
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: params,
    });

    const data = await dashboardRes.json();

    if (data.success) {
      apiData = data.data;
    } else {
      alert(data.message || "資料取得失敗，請重新登入。");
      setCookie("account", "", -1);
      setCookie("region", "", -1);
      setCookie("login", "", -1);
      window.location.href = "login.html";
      stopFakeProgress();
      if (window.hideLoadingMask) hideLoadingMask();
      return;
    }
  } catch (error) {
    alert("Network error, please try again later.");
    stopFakeProgress();
    if (window.hideLoadingMask) hideLoadingMask();
    return;
  }

  // 對應 id 填入資料
  document.getElementById("brand-name").textContent = apiData["品牌"] || "";
  document.getElementById("bio").textContent = apiData["品牌簡介"] || "";
  document.getElementById("role").textContent = apiData["身份類別"] || "";
  document.getElementById("category").textContent = apiData["作品類別"] || "";
  document.getElementById("nationality").textContent = region || "";

  // 國籍判斷與簽證需求顯示
  const nat = document.getElementById("nationality");
  const visa = document.getElementById("visa-requirement");
  if (nat && visa) {
    const value = nat.textContent.trim().toUpperCase();
    if (value === "TW") {
      visa.innerHTML = "Not Require";
    } else if (value === "CN") {
      visa.innerHTML = `<a href="download/requirement-form-cn.pdf" target="_blank" style="text-decoration:underline;">請下載簽證申請文件包</a>`;
    } else {
      visa.innerHTML = `
        <a href="https://visawebapp.boca.gov.tw/BOCA_EVISA/MRV01FORM.do" target="_blank" style="text-decoration:underline;">
          Apply for Taiwan eVisa
        </a>
        <br>
        <a href="download/visa-info.pdf" target="_blank" style="text-decoration:underline;">
          Download visa information
        </a>
      `;
    }
  }

  document.getElementById("contact-person").textContent =
    apiData["代表人"] || "";
  document.getElementById("contact-email").textContent = apiData["Email"] || "";
  document.getElementById("contact-phone").textContent =
    apiData["聯絡電話"] || apiData["WhatsApp"] || "";

  function setSocialText(id, value) {
    const el = document.getElementById(id);
    if (!value || value === "None") {
      el.textContent = "None";
      el.style.color = "lightgrey";
      el.style.fontStyle = "italic";
    } else {
      el.textContent = value;
      el.style.color = "";
      el.style.fontStyle = "";
    }
  }

  setSocialText("website", apiData["Website"]);
  setSocialText("instagram", apiData["Instagram"]);
  setSocialText("facebook", apiData["Facebook"]);
  setSocialText("whatsapp", apiData["WhatsApp"]);

  document.getElementById("application-number").textContent =
    apiData["報名編號"] || "";
  document.getElementById("application-result").textContent =
    apiData["錄取"] || "";
  document.getElementById("registration-status").textContent =
    apiData["報名狀態"] || "";

  //document.getElementById("booth-type").textContent = apiData["攤種"] || "";
  // document.getElementById("equipment-table").textContent =
  //   apiData["設備-桌子"] || "– 桌面(120×60cm) ×1";
  // document.getElementById("equipment-chair").textContent =
  //   apiData["設備-椅子"] || "– 椅子 ×2";
  // document.getElementById("equipment-badge").textContent =
  //   apiData["設備-工作證"] || "– 工作證 ×2";
  // document.getElementById("equipment-book").textContent =
  //   apiData["設備-草率簿"] || "– 草率簿 ×1 (含露出一面)";

  // document.getElementById("billing1-price").textContent =
  //   apiData["方案一金額"] || "8,000 NTD";
  // document.getElementById("billing1-note").innerHTML =
  //   apiData["方案一備註"] ||
  //   "！請在付款時務必填入以下資料：<br />Email: email@gmail.com<br />備註欄位: 25-BC001<br /><br />如因填寫其他錯誤資料造成對帳問題，將導致報名失敗。";
  // document.getElementById("billing2-price").textContent =
  //   apiData["方案二金額"] || "13,000 NTD";
  // document.getElementById("billing2-note").innerHTML =
  //   apiData["方案二備註"] ||
  //   "！請在付款時務必填入以下資料：<br />Email: email@gmail.com<br />備註欄位: 25-BC001<br /><br />如因填寫其他錯誤資料造成對帳問題，將導致報名失敗。";

  function getApplicationResultText(raw) {
    if (!raw) return "";
    // 條件式錄取
    if (
      raw === "4-換攤-創作商品" ||
      raw === "4-換攤-食物酒水" ||
      raw === "4-換攤-書攤" ||
      raw === "換攤-創作商品" ||
      raw === "換攤-食物酒水" ||
      raw === "換攤-書攤"
    ) {
      return "條件式錄取";
    }
    // 錄取
    if (raw === "1-是-1波" || raw === "是" || raw === "1是") {
      return "錄取";
    }
    // 備取
    if (raw === "2-是-2波" || raw === "2是") {
      return "備取";
    }
    // 邀請
    if (raw === "0-邀請" || raw === "0") {
      return "邀請";
    }
    // 未錄取
    if (raw === "3-猶豫" || raw === "5-否" || raw === "否" || raw === "猶豫") {
      return "未錄取";
    }
    return raw; // fallback: 顯示原始內容
  }

  function setApplicationResultStyle(el, resultText) {
    el.style.backgroundColor = "";
    el.style.color = "";
    if (resultText === "錄取" || resultText === "條件式錄取") {
      el.style.backgroundColor = "lime";
      el.style.color = "";
    } else if (resultText === "備取") {
      el.style.backgroundColor = "lightgreen";
      el.style.color = "";
    } else if (resultText === "未錄取") {
      el.style.backgroundColor = "lightgrey";
      el.style.color = "DarkSlateGrey";
    } else if (resultText === "邀請") {
      el.style.color = "palegreen";
      el.style.background =
        "repeating-linear-gradient(150deg, olive, olive 4px, darkolivegreen 3px, #6b4ca5 7px)";
    }
  }

  const applicationResultEl = document.getElementById("application-result");
  const resultText = getApplicationResultText(apiData["錄取"]);
  applicationResultEl.textContent = resultText;
  setApplicationResultStyle(applicationResultEl, resultText);

  const registrationStatusEl = document.getElementById("registration-status");
  if (apiData["已匯款"]) {
    registrationStatusEl.textContent = "已完成報名";
  } else {
    registrationStatusEl.textContent = "未完成報名";
  }

  function getBoothTypeFromNumber(applicationNumber) {
    if (applicationNumber.includes("LB")) return "書攤";
    if (applicationNumber.includes("LM")) return "創作商品攤";
    if (applicationNumber.includes("LI")) return "裝置攤";
    if (applicationNumber.includes("LF")) return "食物酒水攤";
    if (applicationNumber.includes("IO")) return "One Regular Booth";
    if (applicationNumber.includes("IT")) return "Two Regular Booth";
    if (applicationNumber.includes("IC")) return "Curation Booth";
    return "";
  }

  // 報名編號填好後再執行這段
  const applicationNumber = document
    .getElementById("application-number")
    .textContent.trim();
  const boothType = getBoothTypeFromNumber(applicationNumber);
  const boothTypeEl = document.getElementById("booth-type");
  if (boothType) {
    boothTypeEl.textContent = boothType;
    // 判斷是否為全英文（含空白）
    if (/^[A-Za-z\s]+$/.test(boothType)) {
      boothTypeEl.classList.add("booth-type-en");
    } else {
      boothTypeEl.classList.remove("booth-type-en");
    }
  }

  function updateBoothInfo(boothType) {
    // 設定預設值
    let price = "";
    let equipment = [];
    let payLink = "#";
    let payText = "付款 Pay";
    let note = "";

    switch (boothType) {
      case "書攤":
        price = "5,000 元 <small>(含稅)</small>";
        equipment = [
          "– 桌面<small>(120×60cm)</small> ×1",
          "– 椅子 ×2",
          "– 工作證 ×2",
          "– 草率簿 ×1<small> (含露出一面)</small>",
        ];
        payLink = "https://pay.taipeiartbookfair.com/book";
        break;
      case "創作商品攤":
        price = "8,000 元 <small>(含稅)</small>";
        equipment = [
          "– 桌面<small>(120×60cm)</small> ×1",
          "– 椅子 ×2",
          "– 工作證 ×2",
          "– 草率簿 ×1<small> (含露出一面)</small>",
        ];

        payLink = "https://pay.taipeiartbookfair.com/market";
        break;
      case "裝置攤":
        price = "10,000 元 <small>(含稅)</small>";
        equipment = [
          "– 1.5M × 1.5M 空地",
          "– 工作證 ×2",
          "– 草率簿 ×1<small> (含露出一面)</small>",
        ];

        payLink = "https://pay.taipeiartbookfair.com/install";
        break;
      case "食物酒水攤":
        price = "13,000 元 <small>(含稅)</small>";
        equipment = [
          "– 桌面<small>(180×60cm)</small> ×1",
          "– 椅子 ×2",
          "– 工作證 ×2",
          "– 草率簿 ×1<small> (含露出一面)</small>",
        ];

        payLink = "https://pay.taipeiartbookfair.com/food";
        break;
      case "One Regular Booth":
        price = "USD$165 <small>incl. tax</small>";
        equipment = [
          "– Table<small>(180×60cm)</small> ×1",
          "– Chairs ×2",
          "– Passes ×2",
          "– TPABF Catalog ×1 <small>(one page featured)</small>",
        ];
        note = "";
        payLink = "https://pay.taipeiartbookfair.com/one";
        break;
      case "Two Regular Booth":
        price = "USD$330 <small>incl. tax</small>";
        equipment = [
          "– Table<small>(180×60cm)</small> ×2",
          "– Chairs ×4",
          "– Passes ×4",
          "– TPABF Catalog ×1 <small>(one page featured)</small>",
        ];
        note = "";
        payLink = "https://pay.taipeiartbookfair.com/two";
        break;
      case "Curation Booth":
        price = "USD$780 <small>incl. tax</small>";
        equipment = [
          "– 3M × 3M space",
          "– Table<small>(180×60cm)</small> ×2",
          "– Chairs ×4",
          "– Passes ×3",
          "– TPABF Catalog ×1 <small>(one page featured)</small>",
        ];

        payLink = "https://pay.taipeiartbookfair.com/curation";
        break;
      default:
        price = "";
        equipment = [];

        payLink = "#";
    }

    // 更新價錢
    document.getElementById("billing1-price").innerHTML = price;
    // 更新設備
    const eqList = [
      "equipment-table",
      "equipment-chair",
      "equipment-badge",
      "equipment-book",
    ];
    eqList.forEach((id, idx) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = equipment[idx] || "";
    });
    // 更新付款按鈕
    const payBtns = document.querySelectorAll(".pay-button");
    payBtns.forEach((btn) => {
      btn.onclick = () => window.open(payLink, "_blank");
      btn.textContent = payText;
    });

    // 方案一價錢
    let price1 = "";
    switch (boothType) {
      case "書攤":
        price1 = "5,000";
        break;
      case "創作商品攤":
        price1 = "8,000";
        break;
      case "裝置攤":
        price1 = "10,000";
        break;
      case "食物酒水攤":
        price1 = "13,000";
        break;
      default:
        price1 = "";
    }

    // 方案一價錢顯示
    if (price1) {
      // 中文攤種（台幣）
      document.getElementById("billing1-price").innerHTML = price1 + " NTD";
      // 方案二自動加 1,000 元
      const price2 = (
        parseInt(price1.replace(/,/g, "")) + 1000
      ).toLocaleString();
      document.getElementById("billing2-price").innerHTML =
        price2 + " NTD <small>(含稅)</small>";
    } else if (
      boothType === "One Regular Booth" ||
      boothType === "Two Regular Booth" ||
      boothType === "Curation Booth"
    ) {
      // 英文 booth（USD）
      let usd1 = 0;
      if (boothType === "One Regular Booth") usd1 = 165;
      if (boothType === "Two Regular Booth") usd1 = 330;
      if (boothType === "Curation Booth") usd1 = 780;
      document.getElementById(
        "billing1-price"
      ).innerHTML = `USD$${usd1} <small>incl. tax</small>`;
      document.getElementById("billing2-price").innerHTML = `USD$${
        usd1 + 30
      } <small>incl. tax</small>`;
    }

    // Email 與報名編號自動填入（兩個 note 都填）
    document.querySelectorAll("#billing-email").forEach((el) => {
      el.textContent = apiData["Email"] || "";
    });
    document.querySelectorAll("#billing-application-number").forEach((el) => {
      el.textContent = apiData["報名編號"] || "";
    });

    // 付款按鈕可依 boothType 設定不同連結
    // document.getElementById("pay2").onclick = ...;
  }

  // 在 boothType 設定後呼叫
  updateBoothInfo(boothType);

  // 資料抓完，直接跳到 100%
  stopFakeProgress();
  if (window.updateLoadingProgress) updateLoadingProgress(1);

  // 0.5 秒後關掉 loading
  setTimeout(function () {
    if (window.hideLoadingMask) hideLoadingMask();
  }, 500);

  document.getElementById("billing-email").textContent = apiData["Email"] || "";
  document.getElementById("billing-application-number").textContent =
    apiData["報名編號"] || "";

  const equipmentTitleEl = document.getElementById("equipment-title");
  if (
    boothType === "One Regular Booth" ||
    boothType === "Two Regular Booth" ||
    boothType === "Curation Booth"
  ) {
    equipmentTitleEl.textContent = "Equipments:";
  } else {
    equipmentTitleEl.textContent = "基礎設備：";
  }
});
