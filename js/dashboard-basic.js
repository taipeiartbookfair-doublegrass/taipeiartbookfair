// 先檢查 cookie
const account = getCookie("account");
const region = getCookie("region");

if (!account || !region) {
  window.location.href = "login.html";
}

const apiUrl =
  "https://script.google.com/macros/s/AKfycbxOxo-ZzjkkDlkIyCNlmFgYfPhpLOHQr3278Mv36PJrM_jdb_RsaG42hwM23Cp7b7onBw/exec";
const publishApiUrl =
  "https://script.google.com/macros/s/AKfycbxJkcTqW6xJfhCSVFdI-Mk9SFSGTdQnCB2-_-8sluqgTHul2wjNS6jV9wJZMPtIdSy3Pw/exec";

document.addEventListener("DOMContentLoaded", async function () {
  if (window.startFakeLoading) window.startFakeLoading();
  // --- Loading mask setup ---
  const loadingMask = document.getElementById("loading-mask");
  const loadingGrid = loadingMask.querySelector(".loading-grid");
  const loadingPercent = document.getElementById("loading-percent");
  const imgSrc = ""; // 不用先 load
  const imgActiveSrc = "image/Moss_of_Bangladesh_2.jpg";
  const imgSize = 70; // px，和 CSS 一致

  // 取得 loading-mask 寬高ㄅ
  const maskWidth = loadingMask.clientWidth;
  const maskHeight = loadingMask.clientHeight;
  const cols = Math.ceil(maskWidth / imgSize);
  const rows = Math.ceil(maskHeight / imgSize);

  // 設定 grid 樣式
  loadingGrid.style.gridTemplateColumns = `repeat(${cols}, ${imgSize}px)`;
  loadingGrid.style.gridTemplateRows = `repeat(${rows}, ${imgSize}px)`;

  // 產生圖片，全部格子都放圖片（不設 src）
  loadingGrid.innerHTML = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const img = document.createElement("img");
      // img.src = imgSrc; // 不設 src
      img.className = "loading-img";
      img.style.width = imgSize + "px";
      img.style.height = imgSize + "px";
      loadingGrid.appendChild(img);
    }
  }

  // 更新進度函式
  window.updateLoadingProgress = function (percent) {
    const imgs = loadingGrid.querySelectorAll("img");
    const total = imgs.length;
    const progress = Math.floor(percent * total);
    for (let i = 0; i < total; i++) {
      if (i < progress) {
        imgs[i].src = imgActiveSrc;
      } else {
        imgs[i].removeAttribute("src"); // 這樣才會隱藏
      }
    }
    // 更新右下角百分比
    if (loadingPercent) {
      const pct = Math.round(percent * 100);
      loadingPercent.textContent = pct + "%";
    }
  };

  let fakeLoadingInterval = null;
  let fakeLoadingPercent = 0;

  window.startFakeLoading = function () {
    fakeLoadingPercent = 0;
    window.setLoading(0);
    fakeLoadingInterval = setInterval(() => {
      if (fakeLoadingPercent < 0.99) {
        fakeLoadingPercent += 0.01 + Math.random() * 0.01;
        window.setLoading(fakeLoadingPercent);
      }
    }, 400); // 每 40ms 跑一格
  };

  window.stopFakeLoading = function () {
    if (fakeLoadingInterval) clearInterval(fakeLoadingInterval);
    window.setLoading(1); // 直接跳到 100%
    setTimeout(() => {
      document.getElementById("loading-mask").style.display = "none";
    }, 10); // 給一點緩衝
  };

  window.setLoading = function (percent) {
    const imgs = loadingGrid.querySelectorAll("img");
    const total = imgs.length;
    const progress = Math.floor(percent * total);
    for (let i = 0; i < total; i++) {
      if (i < progress) {
        imgs[i].src = imgActiveSrc;
      } else {
        imgs[i].removeAttribute("src");
      }
    }
    if (loadingPercent) {
      loadingPercent.textContent = Math.round(percent * 100) + "%";
    }
  };

  // 資料抓取完成時呼叫
  window.hideLoadingMask = function () {
    loadingMask.style.display = "none";
  };

  window.hideLoading = function () {
    loadingMask.style.display = "none";
  };
  // fake loading end

  if (window.startFakeLoading) window.startFakeLoading();
  if (window.setLoading) window.setLoading(0.1);

  // 取得 dashboard 資料
  let apiData = {};
  const params = new URLSearchParams({
    action: "get_dashboard_info",
    account: account,
  }).toString();

  try {
    if (window.setLoading) window.setLoading(0.3);

    const dashboardRes = await fetch(apiUrl, {
      redirect: "follow",
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: params,
    });

    if (window.setLoading) window.setLoading(0.7);

    const data = await dashboardRes.json();

    if (data.success) {
      apiData = data.data;
    } else {
      alert(data.message || "資料取得失敗，請重新登入。");
      setCookie("account", "", -1);
      setCookie("region", "", -1);
      setCookie("login", "", -1);
      window.location.href = "login.html";
      return;
    }
  } catch (error) {
    alert("Network error, please try again later.");
    return;
  }
  if (window.setLoading) window.setLoading(0.9);

  // 取得 userData
  try {
    const userParams = new URLSearchParams({
      action: "get_user_info",
      account: account,
    }).toString();

    const userRes = await fetch(apiUrl, {
      redirect: "follow",
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: userParams,
    });

    const userData = await userRes.json();

    if (userData.success) {
      document.getElementById("contact-person").textContent =
        userData.data["name"] || "";
      document.getElementById("email").textContent =
        userData.data["account"] || "";
      document.getElementById("phone").textContent =
        userData.data["phone"] || "";
      document.getElementById("nationality2").textContent =
        userData.data["region"] || "";
    }
  } catch (error) {}

  // 對應 id 填入資料
  document.getElementById("brand-name").textContent = apiData["品牌"] || "";
  document.getElementById("bio").textContent = apiData["品牌簡介"] || "";
  document.getElementById("role").textContent = apiData["身份類別"] || "";
  document.getElementById("live-event-schedule-reminder").textContent =
    apiData["活動場次資訊"] || "";
  document.getElementById("nationality").textContent = region || "";
  setSocialText("baselocation", apiData["主要創作據點"]);
  setSocialText("attendedYears", apiData["參與年份"]);
  setSocialText("website", apiData["website"]);
  setSocialText("instagram", apiData["IG帳號"]);
  setSocialText("facebook", apiData["facebook"]);
  setSocialText("yearlyanswer", apiData["當屆問答"]);
  setSocialText("electricity-answer", apiData["電力需求"]);

  const applicationNumberEl = document.getElementById("application-number");
  if (applicationNumberEl) {
    applicationNumberEl.textContent = apiData["報名編號"] || "";
  }
  const paymentStatusEl = document.getElementById("payment-status");
  if (paymentStatusEl) {
    paymentStatusEl.textContent = apiData["匯款備註"] || "（人工審核塞車中）";
  }
  const declarationStatusEl = document.getElementById("declaration-status");
  if (declarationStatusEl) {
    declarationStatusEl.textContent = apiData["同意書狀態"] || "（人工審核塞車中）";
  }
  // 取得報名編號與 boothType
  function getBoothTypeFromNumber(applicationNumber) {
    const map = {
      LB: "書攤",
      LM: "創作商品攤",
      LF: "食物酒水攤",
      LI: "裝置攤",
      LC: "策展攤",
      IB: "Regular Book Booth",
      IN: "Regular Non-Book Booth",
      II: "Installation Booth",
      IC: "Curation Booth",
    };
    
    for (const [code, type] of Object.entries(map)) {
      if (applicationNumber.includes(code)) {
        return type;
      }
    }
    return "";
  }
  const applicationNumber = applicationNumberEl ? applicationNumberEl.textContent.trim() : "";
  const boothType = getBoothTypeFromNumber(applicationNumber);
  const boothTypeEl = document.getElementById("booth-type");
  if (boothType && boothTypeEl) {
    boothTypeEl.textContent = boothType;
    if (/^[A-Za-z\s]+$/.test(boothType)) {
      boothTypeEl.classList.add("booth-type-en");
    } else {
      boothTypeEl.classList.remove("booth-type-en");
    }
  }

  // 判斷是否為英文攤位
  function isEnglishBoothType(boothType) {
    return (
      boothType === "Regular Book Booth" ||
      boothType === "Regular Non-Book Booth" ||
      boothType === "Installation Booth" ||
      boothType === "Curation Booth"
    );
  }

  // 錄取狀態顯示
  function getApplicationResultText(raw, boothType) {
    const isEnglishBooth = isEnglishBoothType(boothType);
    if (!raw) return "";
    if (isEnglishBooth) {
      if (raw.includes("條件式錄取")) return "Conditionally Accepted";
      if (
        raw === "1-是-1波" ||
        raw === "2-是-2波" ||
        raw === "0-邀請" ||
        raw === "0-是-邀請"
      )
        return "Accepted";
      if (raw === "6-NGO" || raw === "6-是-NGO") return "NGO";
      if (raw === "3-猶豫") return "Waitlisted";
      if (raw === "5-否" || raw === "9-重複") return "Not Selected";
      if (raw === "6-1-繳費後取消-已退費" || raw === "6-2-繳費後取消-無退費")
        return "Cancelled";
      return raw;
    } else {
      if (raw.includes("條件式錄取")) return "條件式錄取";
      if (
        raw === "1-是-1波" ||
        raw === "2-是-2波" ||
        raw === "0-邀請" ||
        raw === "0-是-邀請"
      )
        return "錄取";
      if (raw === "6-NGO" || raw === "6-是-NGO") return "NGO";
      if (raw === "3-猶豫") return "備取";
      if (raw === "6-1-繳費後取消-已退費" || raw === "6-2-繳費後取消-無退費")
        return "已取消";
      if (raw === "5-否" || raw === "9-重複") return "未錄取";
      return raw;
    }
  }
  function setApplicationResultStyle(el, resultText) {
    const applicationResultWrapper = document.getElementById(
      "application-result-wrapper"
    );
    el.style.backgroundColor = "";
    el.style.color = "";
    if (applicationResultWrapper)
      applicationResultWrapper.style.fontSize = "2.7rem";
    el.style.fontSize = "2rem";
    if (resultText === "錄取" || resultText === "Accepted") {
      el.style.backgroundColor = "lime";
    } else if (resultText === "條件式錄取") {
      el.style.backgroundColor = "rgb(0, 157, 255)";
    } else if (resultText === "Conditionally Accepted") {
      el.style.backgroundColor = "rgb(0, 157, 255)";
      if (applicationResultWrapper)
        applicationResultWrapper.style.fontSize = "1.7rem";
      el.style.fontSize = "1.6rem";
      el.style.padding = "0px";
    } else if (resultText === "NGO") {
      el.style.backgroundColor = "ForestGreen";
    } else if (resultText === "備取" || resultText === "Waitlisted") {
      el.style.backgroundColor = "lightgreen";
    } else if (
      resultText === "未錄取" ||
      resultText === "Not Selected" ||
      resultText === "已取消" ||
      resultText === "Cancelled"
    ) {
      el.style.backgroundColor = "lightgrey";
      el.style.color = "DarkSlateGrey";
      if (applicationResultWrapper)
        applicationResultWrapper.style.fontSize = "2.7rem";
      el.style.fontSize = "2rem";
      el.style.padding = "0px";
    }
  }
  const applicationResultEl = document.getElementById("application-result");

  const resultText = getApplicationResultText(apiData["錄取"], boothType);
  applicationResultEl.textContent = resultText;
  setApplicationResultStyle(applicationResultEl, resultText);

  // 判斷是否有參展資格（顯示條碼的條件）
  function hasExhibitionQualification(resultText) {
    // 參展資格成立的情況
    const qualifiedStatuses = [
      "錄取",
      "Accepted",
      "條件式錄取",
      "Conditionally Accepted",
      "NGO"
    ];
    return qualifiedStatuses.includes(resultText);
  }

  // 控制條碼顯示（需要錄取狀態、匯款和同意書都完成）
  const barcodeRow = document.getElementById("barcode-row");
  const hasQualifiedStatus = hasExhibitionQualification(resultText);
  const paymentChecked = !!apiData["已匯款"];
  const declarationChecked = !!apiData["同意書"];
  const shouldShowBarcode = hasQualifiedStatus && paymentChecked && declarationChecked;
  
  if (barcodeRow) {
    if (shouldShowBarcode) {
      // 顯示條碼行
      const isMobile = window.innerWidth <= 600;
      barcodeRow.style.display = isMobile ? "block" : "table-row";
      // 生成條碼
      if (window.generateBarcode) {
        setTimeout(() => {
          window.generateBarcode();
        }, 100);
      }
    } else {
      barcodeRow.style.display = "none";
    }
  }

  // boothType 設備、價錢、付款、電力、付款連結產生
  function updateBoothInfo(boothType) {
    let price = "";
    let equipment = [];

    switch (boothType) {
      case "書攤":
        price = "5,000 元 <small>(含稅)</small>";
        equipment = [
          "– 桌面<small>(120×60cm)</small> ×1",
          "– 椅子 ×2",
          "– 通行憑證 ×2",
          "– 草率簿 ×1<small> (含露出一面)</small>",
        ];
        break;
      case "創作商品攤":
        price = "8,000 元 <small>(含稅)</small>";
        equipment = [
          "– 桌面<small>(120×60cm)</small> ×1",
          "– 椅子 ×2",
          "– 通行憑證 ×2",
          "– 草率簿 ×1<small> (含露出一面)</small>",
        ];
        break;
      case "裝置攤":
        price = "10,000 元 <small>(含稅)</small>";
        equipment = [
          "– 1.5M × 1.5M 空地",
          "", // 保留空位，讓通行憑證對應到 equipment-badge（避免重複顯示）
          "– 通行憑證 ×2",
          "– 草率簿 ×1<small> (含露出一面)</small>",
        ];
        break;
      case "食物酒水攤":
        price = "13,000 元 <small>(含稅)</small>";
        equipment = [
          "– 桌面<small>(180×60cm)</small> ×1",
          "– 椅子 ×2",
          "– 通行憑證 ×2",
          "– 草率簿 ×1<small> (含露出一面)</small>",
        ];
        break;
      case "策展攤":
        price = "50,000 元 <small>(含稅)</small>";
        equipment = [
          "– 3M × 3M 空間",
          "– 桌面<small>(120×60cm)</small> ×2",
          "– 通行憑證 ×6",
          "– 草率簿 ×1<small> (含露出一面)</small>",
        ];
        break;
      case "Regular Book Booth":
        price = 'NTD$5,000 <span style="font-size:1.3rem;">incl. tax</span>';
        equipment = [
          "– Table<small>(120×60cm)</small> ×1",
          "– Chairs ×2",
          "– Access Pass ×2",
          "– TPABF Catalog ×1 <small>(one page featured)</small>",
        ];
        break;
      case "Regular Non-Book Booth":
        price = 'NTD$8,000 <span style="font-size:1.3rem;">incl. tax</span>';
        equipment = [
          "– Table<small>(120×60cm)</small> ×1",
          "– Chairs ×2",
          "– Access Pass ×2",
          "– TPABF Catalog ×1 <small>(one page featured)</small>",
        ];
        break;
      case "Installation Booth":
        price = 'NTD$10,000 <span style="font-size:1.3rem;">incl. tax</span>';
        equipment = [
          "– 3M × 3M space",
          "",
          "– Access Pass ×2",
          "– TPABF Catalog ×1 <small>(one page featured)</small>",
        ];
        break;
      case "Curation Booth":
        price = 'NTD$50,000 <span style="font-size:1.3rem;">incl. tax</span>';
        equipment = [
          "– 3M × 3M space",
          "– Table<small>(120×60cm)</small> ×2",
          "– Access Pass ×6",
          "– TPABF Catalog ×1 <small>(one page featured)</small>",
        ];
        break;
      default:
        price = "";
        equipment = [];
    }

    document.getElementById("billing1-price").innerHTML = price;
    const eqList = [
      "equipment-table",
      "equipment-chair",
      "equipment-badge",
      "equipment-book",
    ];
    eqList.forEach((id, idx) => {
      const el = document.getElementById(id);
      const content = equipment[idx] || "";
      if (!el) return;
      if (String(content).trim() === "") {
        // 隱藏沒有內容的 li，避免出現空行
        el.style.display = "none";
        el.innerHTML = "";
      } else {
        el.style.display = "";
        el.innerHTML = content;
      }
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
      case "策展攤":
        price1 = "50,000";
        break;
      case "Regular Book Booth":
        price1 = "5,000";
        break;
      case "Regular Non-Book Booth":
        price1 = "8,000";
        break;
      case "Installation Booth":
        price1 = "10,000";
        break;
      case "Curation Booth":
        price1 = "50,000";
        break;
      default:
        price1 = "";
    }

    // 價錢顯示
    if (price1) {
      if (isEnglishBoothType(boothType)) {
        document.getElementById("billing1-price").innerHTML =
          `NTD$${price1} <span style="font-size:1.3rem;">incl. tax</span>`;
      } else {
        document.getElementById("billing1-price").innerHTML =
          price1 + "元 <small>(含稅)</small>";
      }
    }

    // 產生連結（現在所有攤種都用台灣付款方式）
    let payLink1 = toProductUrl(applicationNumber);

    // 設定 pay1 按鈕
    const payBtn1 = document.getElementById("pay1");
    if (payBtn1) {
      payBtn1.onclick = () => window.open(payLink1, "_blank");
      payBtn1.textContent = "付款 Pay";
    }

    // 產生產品連結
    function toProductUrl(applicationNumber) {
      // 格式：25-{applicationNumber}-booth-fee2026
      return (
        "https://nmhw.taipeiartbookfair.com/products/" +
        applicationNumber.toLowerCase() +
        "-booth-fee2026"
      );
    }

    // 控制電力需求顯示
    const electricityRow = document.getElementById("electricity-row");
    if (electricityRow) {
      if (boothType === "食物酒水攤" || boothType === "裝置攤" || boothType === "策展攤") {
        electricityRow.style.display = "";
      } else {
        electricityRow.style.display = "none";
      }
    }
    const editElectricityRow = document.getElementById("edit-electricity-row");
    if (editElectricityRow) {
      if (boothType === "食物酒水攤" || boothType === "裝置攤" || boothType === "策展攤") {
        editElectricityRow.style.display = "";
      } else {
        editElectricityRow.style.display = "none";
      }
    }
  }
  updateBoothInfo(boothType);

  // 設備標題
  const equipmentTitleEl = document.getElementById("equipment-title");
  if (isEnglishBoothType(boothType)) {
    equipmentTitleEl.textContent = "Equipments:";
  } else {
    equipmentTitleEl.textContent = "基礎設備：";
  }

  // 付款方案標題/說明動態切換
  function setBillingInfoLanguage(boothType) {
    const isEnglishBooth = isEnglishBoothType(boothType);
    document.querySelector("span[for-billing1-title]").innerHTML =
      isEnglishBooth
        ? "<strong>Basic Fee</strong>"
        : "<strong>基礎攤費</strong>";
    const billing1Desc = document.querySelector("div[for-billing1-desc]") || document.querySelector("span[for-billing1-desc]");
    if (billing1Desc) {
      billing1Desc.innerHTML = isEnglishBooth
        ? `<strong>Invoice: </strong> For overseas exhibitors who require an invoice, please fill out <a href=https://docs.google.com/forms/d/e/1FAIpQLScuHHfn3zhWd4RVrOCPLY72xf9XiNAf1Sb8De4WJaOCAHovDQ/viewform?usp=header" target="_blank">this form</a>. Once submitted, we will send the invoice to your email as soon as possible.<br><br>
<strong>Refund: </strong> Cancel by <u>January 15</u> for a refund (10% handling fee). Requests after this date <u>will not be accepted</u>.<br><br>
<strong>Additional Purchase Instructions:</strong><br>
&nbsp;&nbsp;a. Number of Tables: Each booth may select 1–2 tables, with 2 access passes included per table (excluding Installation or Curation booths).<br>
&nbsp;&nbsp;b. Access Passes:<br>
&nbsp;&nbsp;&nbsp;&nbsp;• Provided in the form of temporary tattoo stickers; 1 pass is valid for all three days (each tattoo sticker may only be used by one person per day).<br>
&nbsp;&nbsp;&nbsp;&nbsp;• Each booth may purchase up to 1 additional access pass (allowing 1 extra person per day).<br>
&nbsp;&nbsp;&nbsp;&nbsp;• If the number of people attending on a single day exceeds the available access passes, please purchase additional admission tickets according to the actual number of days and attendees. (Pre-sale friend & family tickets will be available Jan 26 – Feb 8; for additional tickets, please follow our IG posts.)<br><br>
&nbsp;&nbsp;c. <strong>This is the only period for additional purchase applications. Once payment is completed, no changes will be accepted.</strong><br>
&nbsp;&nbsp;d. Not sure what to add on? Enter your booth type, tables, and attendees—<a href=https://docs.google.com/spreadsheets/d/1A33pr06kXFJKgvln3-ie_YdIw-BeYaRm9ckBdDQZtyc/edit?usp=sharing" target="_blank">we’ll calculate it for you</a>.`
         : `<strong>發票：</strong>台灣訂單網站將自動開立電子發票，請確認報名時所填Email。海外單位如需開立發票需填寫<a href=https://docs.google.com/forms/d/e/1FAIpQLScuHHfn3zhWd4RVrOCPLY72xf9XiNAf1Sb8De4WJaOCAHovDQ/viewform?usp=header" target="_blank">此表單</a>，提交後，我們將盡快寄送發票至您的電子郵件信箱。<br><br>
<strong>退款：</strong>若因不可抗因素需放棄參展，請於<u> 1/15（四）前 </u>通知主辦單位，並辦理退款（將酌收10%手續費）。逾期恕不受理退款。<br><br>
<strong>加購説明：</strong><br>
&nbsp;&nbsp;a. 桌子數量：每攤位可選擇 1–2 桌，每桌皆附贈 2份 通行憑證。（裝置攤／策展攤除外）<br>
&nbsp;&nbsp;b. 通行憑證：<br>
&nbsp;&nbsp;&nbsp;&nbsp;• 為刺青貼紙形式，1份為三天量。（每張刺青貼紙同一天僅限一人使用）<br>
&nbsp;&nbsp;&nbsp;&nbsp;• 每攤位最多可加購 1份 通行憑證（每天可增加 1人 通行）。<br>
&nbsp;&nbsp;&nbsp;&nbsp;• 若單日進場人數超過通行憑證可使用數量，請依實際活動天數與人數，另行購買入場票券（親友預售票將於 01/26–02/08 販售，更多入場票券請持續關注我們的 IG 貼文喔）。<br><br>
&nbsp;&nbsp;c. <strong>本階段為唯一的加購申請時段，完成繳費後恕不接受任何變更。</strong><br>
&nbsp;&nbsp;d. 不知道怎麼加購？填寫攤位類型、桌數與進場人數，<a href=https://docs.google.com/spreadsheets/d/1A33pr06kXFJKgvln3-ie_YdIw-BeYaRm9ckBdDQZtyc/edit?usp=sharing" target="_blank">我們幫你算</a>。`;
    }
  }
  setBillingInfoLanguage(boothType);

  // 動態切換同意書區塊語言
  function setDeclarationLanguage(boothType) {
    var declardownloadLink = document.getElementById(
      "declaration-download-link"
    );
    var declarationdesc = document.getElementById("declaration-desc");
    console.log("boothType:", boothType);
    console.log("declarationdesc:", declarationdesc);
    if (boothType && declardownloadLink && declarationdesc) {
      if (isEnglishBoothType(boothType)) {
        declardownloadLink.innerHTML = "Download Exhibitor Declaration";
        declarationdesc.innerHTML =
          "Please download and sign the exhibitor declaration, then upload the signed file below.";
      } else {
        declardownloadLink.innerHTML = "下載參展同意書";
        declarationdesc.innerHTML = "請下載並簽署參展同意書，完成後請上傳。";
      }
      console.log("desc after set:", declarationdesc.innerHTML);
    }
  }
  setDeclarationLanguage(boothType);

    // 動態Billing Notice 區塊語言
    function setBillingNoticeLanguage(boothType) {
      var billingNoticedesc = document.getElementById("billing-notice");
      if (boothType && billingNoticedesc) {
        if (isEnglishBoothType(boothType)) {
          billingNoticedesc.innerHTML =
            "-  Please complete all payments in accordance with the instructions above. If payment is incorrect, late, or made via non-designated methods, the Organizer reserves the right to <b>cancel participation without refund.</b><br>- For all matters related to registration, payment, and participation, <b>TPABF reserves the final right of review, adjustment, and interpretation.</b><br>- In the event of cancellation due to force majeure (including natural disasters, pandemics, or policy changes), the Organizer will announce further arrangements separately.";
        } else {
          billingNoticedesc.innerHTML =
            "- 請務必依繳費說明完成付款流程。如未依規定完成付款（如繳納錯誤金額、超過期限、未依指定方式匯款等），主辦單位將不保留參展資格，亦不提供退款。- 所有報名、繳費及參展相關事宜，草率季保留最終審核、調整及解釋之權利。<br>- 若因不可抗力（如天災、疫情、政策變動等）導致活動取消，主辦單位將另行公告後續處理方式。";
        }
      }
    }
    setBillingNoticeLanguage(boothType);

  // 動態勾勾區塊語言還有攤商編號說明搭便車
  function setYesLanguage(boothType, rawResult) {
    var yesdesc = document.getElementById("registration-status-desc");
    var billingnote1 = document.getElementById("billing-note1");

    // 判斷期限
    let deadline = "12 月 31 日";
    let deadlineEn = "December 31, 2025 at 11:59 PM (UTC+8)";
    if (rawResult === "2-是-2波") {
      deadline = "12 月 31 日";
      deadlineEn = "December 31, 2025 at 11:59 PM (UTC+8)";
    }

    if (boothType && yesdesc) {
      if (isEnglishBoothType(boothType)) {
        yesdesc.innerHTML = `Please complete your payment and upload the signed agreement by <b><mark>${deadlineEn}</mark></b>. Late submissions will be considered a forfeiture of your participation. Our team will manually verify all payment and agreement uploads by <mark>January 5</mark>. If you have already completed the process, please keep a screenshot of your payment or upload confirmation. If your status hasn't been updated after <mark>January 5</mark>, feel free to contact us again.`;
        if (billingnote1) {
          billingnote1.innerHTML = `Payment Deadline: ${deadlineEn}`;
        }
      } else {
        yesdesc.innerHTML = `請於<b><mark>${deadline}</mark></b>前完成繳費與同意書上傳，逾期將視同放棄參展資格。團隊將於<mark> 1月5日前 </mark>逐一人工確認繳費與同意書的上傳狀態。如您已完成繳交，請先保留相關繳費或上傳截圖；若狀態在 <mark>1月5日</mark> 後仍未更新，請與我們聯繫。`;
        if (billingnote1) {
          billingnote1.innerHTML = `付款期限: ${deadline}`;
        }
      }
    }
  }
  setYesLanguage(boothType, apiData["錄取"]);

  // 動態條件是錄取 區塊語言
  function setConditionalAcceptence(boothType) {
    var tooltip = document.getElementById("tooltip-text");
    if (boothType && tooltip) {
      if (isEnglishBoothType(boothType)) {
        tooltip.innerHTML =
          "Your application did not fully meet the criteria for your originally selected booth type. However, we truly appreciate your work and proposal, and hope to see you at the fair. If you are willing to accept an adjustment to your booth category, we will be happy to reserve your participation.";
      } else {
        tooltip.innerHTML =
          "您原先在表單中選擇的攤位類型，經由草率季工作團隊審核後，可能與我們對該類別的定義略有不符。不過，我們仍然非常欣賞您的創作與提案，並希望能與您在草率季中相遇。若您願意接受攤種類別的調整，我們將非常樂意為您保留參與資格。";
      }
    }
  }
  setConditionalAcceptence(boothType);

  // 動態切換草率簿區塊語言
  function setCatalogLanguage(boothType) {
    var catalogdownloadLink = document.getElementById("catalog-download-link");
    var catalogdesc = document.getElementById("catalog-desc");
    if (boothType && catalogdownloadLink && catalogdesc) {
      if (isEnglishBoothType(boothType)) {
        catalogdownloadLink.innerHTML = "Template Download";
        catalogdesc.innerHTML =
          "Each exhibitor is entitled to a one-page feature in this year's <i>TPABF Catalog</i>. Late submissions will be considered as forfeiting the opportunity.<br /><br />📌 Submission requirements: <br />1. <b>Image file</b>: PDF format, final size <b>120 × 195 mm</b>, with <b>5 mm bleed</b>. Please use <b>black and white</b> only.<br />2. <b>Text content</b>: Please edit and complete the information on the left side of the exhibitor info sheet.<br />";
      } else {
        catalogdownloadLink.innerHTML = "公版下載";
        catalogdesc.innerHTML =
          "每個參展單位可於本屆《草率簿 TPABF Catalog》中獲得一面頁面露出，逾期未繳交者將視同放棄刊登權益。<br /><br />📌 繳交內容如下：<br />1. <b>圖檔</b>：PDF 格式，完稿尺寸 120 × 195 mm，需包含 5 mm 出血，色彩請設為黑白。<br />2. <b>文字資料</b>：請依左方參展資訊進行修改與補充。<br />";
      }
    }
  }
  setCatalogLanguage(boothType);

  // 動態切換親友票區塊語言
  function setTicketLanguage(boothType) {
    var ticketlink = document.getElementById("ticket-link");
    var familyticketdesc = document.getElementById("familyticket-desc");
    if (boothType && ticketlink && familyticketdesc) {
      if (isEnglishBoothType(boothType)) {
        ticketlink.innerHTML = "Ticket Link";
        familyticketdesc.innerHTML =
          "◆ Friends & Family Pre-sale Ticket ｜ Starts 9/8 ｜ NT$350 ｜ Limited to 800 tickets<br>◆ Friends & Family Fast Track Ticket ｜ 11/21 – 11/23 ｜ NT$400<br>(For detailed instructions, please refer to the ticketing website.)<br><br>Your exclusive discount code:<br>";
      } else {
        ticketlink.innerHTML = "購票連結";
        familyticketdesc.innerHTML =
          "◆ 親友預售票｜9/8 起開賣｜NT$350｜限量 800 張 <br>◆ 親友快速通關票｜11/21 – 11/23｜NT$400｜無限量<br>(詳細使用說明請見售票網頁)<br><br>您的專屬優惠序號：<br>";
      }
    }
  }
  setTicketLanguage(boothType);

  // 動態切換現場活動區塊語言
  function setLiveEventLanguage(boothType) {
    var liveEventLink = document.getElementById("live-event-signup-link");
    var liveEventdesc = document.getElementById("live-event-desc");
    var liveEventScheduledesc = document.getElementById(
      "live-event-schedule-desc"
    );
    if (boothType && liveEventLink && liveEventdesc) {
      if (isEnglishBoothType(boothType)) {
        liveEventLink.innerHTML = "Sign Up Form";
        liveEventdesc.innerHTML =
          "Want to engage with visitors more directly? Propose on-site programs such as short talks, performances, or workshops!";
        liveEventScheduledesc.innerHTML =
          "Your registered on-site program sessions will be listed here. Details have been emailed to you. Please check in at the designated area 15 minutes before your session.";
      } else {
        liveEventLink.innerHTML = " 報名表單";
        liveEventdesc.innerHTML =
          "想與大家更近距離互動？我們開放以下形式的現場活動徵集：短講、表演、工作坊等。";
        liveEventScheduledesc.innerHTML =
          "我們將會在此列出你所報名現場提供的活動服務場次資訊，相關活動內容已寄到你的信箱，不要忘了提早15分鐘到相對應的區域報到喔。";
      }
    }
  }
  setLiveEventLanguage(boothType);

  // 動態切換攤主手冊區塊語言
  function setManualLanguage(boothType) {
    var manualdownloadLink = document.getElementById("manual-link");
    var manualdesc = document.getElementById("manual-desc");
    if (boothType && manualdownloadLink && manualdesc) {
      if (isEnglishBoothType(boothType)) {
        manualdownloadLink.innerHTML = "Download Manual";
        manualdesc.innerHTML =
          "Please read it thoroughly and follow all instructions. It includes fair schedule, exhibitor regulations, and booth specifications, and the Venue Violation Handling and Penalty Manual. <br />";
      } else {
        manualdownloadLink.innerHTML = "下載手冊";
        manualdesc.innerHTML =
          "請務必詳閱並依說明準備。內含展會流程、細節、注意事項與攤位樣式、現場規範與《場地違規處理與罰則手冊》等所有參展須知。<br /";
      }
    }
  }
  setManualLanguage(boothType);

  // 動態切換媒體上傳區塊語言
  function setMediaUploadLanguage(boothType) {
    var mediaziplink = document.getElementById("media-zip-link");
    var mediamaterialdesc = document.getElementById("material-download-desc");
    var materialuploaddesc = document.getElementById("material-upload-desc");

    if (!mediaziplink || !mediamaterialdesc || !materialuploaddesc) return;

    if (isEnglishBoothType(boothType)) {
      mediaziplink.innerHTML = "Download";
      mediamaterialdesc.innerHTML =
        "Media Kit<br>You're welcome to use the 2026 TPABF key visual assets — click here to download.";
      materialuploaddesc.innerHTML = `<strong>Marketing Material Upload</strong><br>
Please follow the instructions below to create your materials, and upload the completed images/text as a ZIP file.<br><br>
📌 The ZIP file should include:<br>
1. Image for social media post: JPG × 1<br>
2. Image for Stories: JPG × 1<br>
3. Threads introduction images: JPG / PNG × 5<br>
4. Threads introduction text: DOCX / TXT × 1<br><br>
<strong>Deadline：</strong>1/23（Fri.）（GMT+8 24:00）<br><br>
⚠️ Late submissions will not be accepted. Please do not send files via email.<br>
*If materials are not submitted by the deadline, social media exposure may not be arranged. Thank you ;)`;
    } else {
      mediaziplink.innerHTML = "下載";
      mediamaterialdesc.innerHTML =
        "視覺素材包<br>歡迎使用 2026 草率季主視覺素材，點此下載檔案。";
      materialuploaddesc.innerHTML = `<strong>行銷素材檔案上傳</strong><br>
請依照以下製作說明，並將製作完成的圖／文打包為 zip上傳。<br><br>
📌壓縮檔需包含：<br>
1. 社群貼文用圖：JPG × 1<br>
2. 限時動態用圖：JPG × 1<br>
3. Threads 介紹圖：JPG / PNG × 5<br>
4. Threads 介紹文：DOCX / TXT × 1<br><br>
截止日期：1/23（五）（GMT+8 24:00）<br>
⚠️逾期不接受補交，請勿將檔案傳至email<br>
*若未於期限內可能無法安排社群曝光，敬請留意;)`;
    }
  }
  setMediaUploadLanguage(boothType);

  // 電力資訊（single source of truth）
  function updateElectricityList(boothType) {
    const electricityTitle = document.getElementById("electricity-title");
    const electricityList = document.querySelector("#electricity-title + ul");
    const regulationEl = document.getElementById("electricity-regulation");
    if (!electricityList || !electricityTitle || !regulationEl) return;

    const isForeign = (region || "").trim().toUpperCase() !== "TW";
    const isInstallation =
      boothType === "裝置攤" || boothType === "Installation Booth" || boothType === "策展攤" || boothType === "Curation Booth";
    const isFood =
      boothType === "食物酒水攤" ||
      boothType === "Food & Beverage" ||
      boothType === "食物酒水";

    // 基本三行（中 / 英）
    const basicCN = `
      <li>供應一般電源110v</li>
      <li>不得使用大電器</li>
      <li>非每攤皆有插座，需自備延長線與他人協調</li>
    `;
    const basicEN = `
      <li>Standard 110v power supply</li>
      <li>Do not use large appliances</li>
      <li>Not every booth has sockets; please bring an extension cord & coordinate with neighbors</li>
    `;

    // 設定上方「電源配置」
    if (isForeign) {
      if (isInstallation) {
        electricityTitle.textContent = "Electricity:";
        electricityList.innerHTML = `
          <li>Standard 110v power supply</li>
          <li>Submit electricity request by <strong>Jan 9 (Fri)</strong>:</li>
          <li style="margin-left:1em">List equipment name & wattage</li>
          <li style="margin-left:1em">On-site last-minute requests will NOT be accepted</li>
          <li style="margin-left:1em">Do not use transformers; 220v requires an add-on fee of NT$1000</li>
        `;
      } else {
        electricityTitle.textContent = "Electricity:";
        electricityList.innerHTML = basicEN;
      }
    } else {
      // 國內
      if (isInstallation || isFood) {
        electricityTitle.textContent = "電源配置：";
        electricityList.innerHTML = `
          <li>供應一般電源110v</li>
          <li><mark>1/9（五）</mark>前需提供電力需求申請：</li>
          <li style="margin-left:1em">條列使用電器設備＆瓦數</li>
          <li style="margin-left:1em">不接受現場臨時申請</li>
          <li style="margin-left:1em">不得使用變壓器，220v 需以 NT$1000 加購</li>
        `;
      } else {
        electricityTitle.textContent = "電源配置：";
        electricityList.innerHTML = basicCN;
      }
    }

    // 設定下方「電力需求」文字（單一來源）
    let regulationHtml = "";
    if (isForeign && isInstallation) {
      regulationHtml = `
        Edit via the <strong>Edit</strong> button (top-right). Please list equipment name & wattage in detail. Example:<br />
        Microwave / 1100W / 1 unit<br />
        Electric kettle / 1500W / 1 unit<br />
        Electric fan / 65W / 1 unit<br /><br />
        📌 Unregistered appliances are NOT permitted on site. Repeated violations will be subject to fines as specified in the Exhibitor’s Manual.<br />
        📌 If 220v is required, an additional fee of NT$1000 will be charged — please state this in the form.<br />
        📌 For safety, do not use transformers; the Organizer does not provide voltage conversion services.
      `;
    } else if (isForeign) {
      // 其他國外攤位：簡短英文提示
      regulationHtml = `
        Please refer to the event guidelines. If you have electricity needs, bring an extension cord and coordinate with neighbors.
      `;
    } else {
      // 國內（中文）
      regulationHtml = `
        於右上角 <strong>編輯 Edit</strong> 做修改。請務必詳列設備名稱與瓦數，範例如下：<br />
        微波爐／1100W／1個<br />
        熱水壺／1500W／1個<br />
        電扇／65W／1個<br /><br />
        📌 未事先申報之電器不得於現場使用，如於現場發現並屢勸不聽，將依《攤主手冊》規定處以罰款。<br />
        📌 如需使用 220v 電壓，將收取費用 NT$1000，並請於表單中註明。<br />
        📌 為維護安全，請勿使用變壓器，主辦單位不提供電壓轉換服務。
      `;
    }
    regulationEl.innerHTML = regulationHtml;

    // 統一控制該 row 的顯示（single place）
    const electricityRow = document.getElementById("electricity-row");
    const editElectricityRow = document.getElementById("edit-electricity-row");
    const showForRow =
      (!isForeign && (isFood || isInstallation)) ||
      (isForeign && isInstallation);
    if (electricityRow) electricityRow.style.display = showForRow ? "" : "none";
    if (editElectricityRow) editElectricityRow.style.display = showForRow ? "" : "none";
  }
  // initial call
  updateElectricityList(boothType);

  // 狀態與欄位顯示
  const registrationStatusEl = document.getElementById("registration-status");
  const liveEventTime = document.getElementById("live-event-schedule-row");
  const billinginfo = document.getElementById("billing-info");
  const agreementsection = document.getElementById("agreement-section");
  const billingsection = document.getElementById("billing-section");
  const letter = document.getElementById("negative-letter");
  const runnerletter = document.getElementById("runnerup-letter");
  const registrationStatus = document.getElementById("registration-status-row");
  const boothnumber = document.getElementById("booth-number-row");
  const conditionalyes = document.getElementById("booth-type-tooltip");
  const foreignShipping = document.getElementById("foreign-shipping");
  const visaCN = document.getElementById("visaCN");
  const overseavisa = document.getElementById("overseasvisa");
  const familyticket = document.getElementById("familyticket");
  const manualBoothappearance = document.getElementById(
    "manual-boothappearance"
  );
  const mediaupload = document.getElementById("media-section");
  const catalogSection = document.getElementById("catalog-section");
  const liveEventSection = document.getElementById("media-live-event-section");
  const opencallschedule = document.getElementById("open-call-schedule");

  const rawResult = apiData["錄取"];
  const nationality = (region || "").trim().toUpperCase();

  function updateRegistrationStatusAndChecks() {
    const paymentChecked = !!apiData["已匯款"];
    const declarationChecked = !!apiData["同意書"];
    const checkPayment = document.getElementById("check-payment");
    const checkDeclaration = document.getElementById("check-declaration");

    if (checkPayment) checkPayment.checked = paymentChecked;
    if (checkDeclaration) checkDeclaration.checked = declarationChecked;

    const isEnglishBooth = isEnglishBoothType(boothType);
    function getStatusText(confirmed) {
      if (isEnglishBooth) {
        return confirmed ? "Confirmed" : "Unfulfilled";
      } else {
        return confirmed ? "成立" : "未完成";
      }
    }

    billinginfo.style.display = "none";
    letter.style.display = "none";
    runnerletter.style.display = "none";
    conditionalyes.style.display = "none";
    if (mediaupload) mediaupload.style.display = "none";
    if (catalogSection) catalogSection.style.display = "none";
    if (liveEventSection) liveEventSection.style.display = "none";
    foreignShipping.style.display = "none";
    if (visaCN) visaCN.style.display = "none";
    if (overseavisa) overseavisa.style.display = "none";
    familyticket.style.display = "none";
    manualBoothappearance.style.display = "none";
    registrationStatus.style.display = "none";
    boothnumber.style.display = "none";
    liveEventTime.style.display = "none";
    // boothappearance.style.display = "none";

    //勾勾區的鐵門
    if (declarationChecked) {
      agreementsection.style.position = "relative";
      agreementsection.style.overflow = "hidden";
      agreementsection.style.pointerEvents = "none";

      let oldOverlay = agreementsection.querySelector(".overlay-completed");
      if (!oldOverlay) {
        let overlay = document.createElement("div");
        overlay.className = "overlay-completed";
        overlay.textContent = "Completed";
        agreementsection.appendChild(overlay);
        setTimeout(() => overlay.classList.add("active"), 10);
      }
    }

    if (paymentChecked) {
      billingsection.style.position = "relative";
      billingsection.style.overflow = "hidden";
      billingsection.style.pointerEvents = "none";

      let oldOverlay = billingsection.querySelector(".overlay-completed");
      if (!oldOverlay) {
        let overlay = document.createElement("div");
        overlay.className = "overlay-completed";
        overlay.textContent = "Completed";
        billingsection.appendChild(overlay);
        setTimeout(() => overlay.classList.add("active"), 10);
      }
    }

    if (rawResult === "5-否" || rawResult === "9-重複") {
      letter.style.display = "block";
    } else if (
      rawResult === "1-是-1波" ||
      rawResult === "2-是-2波" ||
      rawResult === "0-邀請" ||
      rawResult === "6-NGO" ||
      rawResult === "6-是-NGO" ||
      rawResult === "0-是-邀請"
    ) {
      if (paymentChecked && declarationChecked) {
        registrationStatusEl.textContent = getStatusText(true);
        if (mediaupload) mediaupload.style.display = "block";
        if (catalogSection) catalogSection.style.display = "block";
        if (liveEventSection) liveEventSection.style.display = "block";
        if (liveEventTime) liveEventTime.style.display = "table-row";
        if (nationality !== "TW") {
          foreignShipping.style.display = "block";
        }
        familyticket.style.display = "block";
        manualBoothappearance.style.display = "block";
        registrationStatus.style.display = "block";
        // 正確顯示 tr，避免 Safari 重算錯誤
        boothnumber.style.display = "table-row";
        // boothappearance.style.display = "block";
      } else {
        registrationStatusEl.textContent = getStatusText(false);
        billinginfo.style.display = "block";
        registrationStatus.style.display = "block";
        boothnumber.style.display = "table-row";
      }

      // Visa logic:
      // - nationality CN => show visaCN
      // - other non-TW nationalities => show overseavisa ONLY for English booth types
      if (nationality === "CN") {
        if (visaCN) visaCN.style.display = "block";
      } else if (nationality !== "TW" && isEnglishBooth) {
        if (overseavisa) overseavisa.style.display = "block";
      }
    } else if (!rawResult || rawResult === "" || rawResult === "0") {
      // 錄取結果為空時，右側內容都隱藏
      registrationStatusEl.textContent = "-";
    } else if (
      rawResult === "6-1-繳費後取消-已退費" ||
      rawResult === "6-2-繳費後取消-無退費"
    ) {
      opencallschedule.style.display = "none";
    } else if (rawResult === "4-是-條件式錄取") {
      conditionalyes.style.display = "inline-block";
      if (paymentChecked && declarationChecked) {
        registrationStatusEl.textContent = getStatusText(true);
        if (mediaupload) mediaupload.style.display = "block";
        if (catalogSection) catalogSection.style.display = "block";
        if (liveEventSection) liveEventSection.style.display = "block";
        if (liveEventTime) liveEventTime.style.display = "table-row";
        if (nationality !== "TW") {
          foreignShipping.style.display = "block";
        }
        familyticket.style.display = "block";
        manualBoothappearance.style.display = "block";
        registrationStatus.style.display = "block";
        boothnumber.style.display = "table";
        if (nationality === "CN") {
          if (visaCN) visaCN.style.display = "block";
        } else if (nationality !== "TW" && isEnglishBooth) {
          if (overseavisa) overseavisa.style.display = "block";
        }
        // boothappearance.style.display = "block";
      } else {
        registrationStatusEl.textContent = getStatusText(false);
        billinginfo.style.display = "block";
        registrationStatus.style.display = "block";
        boothnumber.style.display = "table-row";
        if (nationality === "CN") {
          if (visaCN) visaCN.style.display = "block";
        } else if (nationality !== "TW" && isEnglishBooth) {
          if (overseavisa) overseavisa.style.display = "block";
        }
      }
    } else if (rawResult === "3-猶豫") {
      runnerletter.style.display = "block";
    } else {
      if (paymentChecked && declarationChecked) {
        registrationStatusEl.textContent = getStatusText(true);
        if (mediaupload) mediaupload.style.display = "block";
        if (catalogSection) catalogSection.style.display = "block";
        if (liveEventSection) liveEventSection.style.display = "block";
        if (liveEventTime) liveEventTime.style.display = "table-row";
        if (nationality !== "TW") {
          foreignShipping.style.display = "block";
        }
        if (nationality === "CN") {
          if (visaCN) visaCN.style.display = "block";
        } else if (nationality !== "TW" && isEnglishBooth) {
          if (overseavisa) overseavisa.style.display = "block";
        }
        familyticket.style.display = "block";
        manualBoothappearance.style.display = "block";
        registrationStatus.style.display = "block";
        boothnumber.style.display = "table";
        // boothappearance.style.display = "block";
      } else {
        registrationStatusEl.textContent = getStatusText(false);
        billinginfo.style.display = "block";
        registrationStatus.style.display = "block";
        boothnumber.style.display = "table-row";
      }
    }
  }
  updateRegistrationStatusAndChecks();


  // 動態更新桌子數量
  function extraTable() {
    const tableCount = apiData["桌"];
    const equipmentTable = document.getElementById("equipment-table");

    if (!equipmentTable) return; // 防呆

    // 如果沒有加購桌子，保持原本的顯示
    if (!tableCount || tableCount === "" || tableCount === "None") {
      return;
    }

    // 將 tableCount 轉換為數字
    let count = null;
    const tableCountStr = String(tableCount).trim();
    
    // 檢查中文數字
    if (tableCountStr.includes("一") || tableCountStr === "1") {
      count = 1;
    } else if (tableCountStr.includes("二") || tableCountStr === "2") {
      count = 2;
    } else {
     // 嘗試解析為數字
      count = parseInt(tableCountStr, 10);
    }
    
    // 如果無法解析為有效數字，保持原本的顯示
    if (!count || isNaN(count) || count < 1) {
      return;
    }

    // 獲取現有的內容
    let currentContent = equipmentTable.innerHTML;

    // 提取桌面尺寸資訊（例如：120×60cm 或 180×60cm）
    // 匹配格式：桌面<small>(120×60cm)</small> 或 Table<small>(120×60cm)</small>
    const sizeMatch = currentContent.match(/<small>\(([^)]+)\)<\/small>/);
    const size = sizeMatch ? sizeMatch[1] : "";

    // 判斷是否為英文攤位
    const isEnglishBooth =
      isEnglishBoothType(boothType);

    // 構建新的內容
    let newContent = "";
    if (isEnglishBooth) {
      // 英文格式：– Table<small>(120×60cm)</small> ×{count}
      newContent = `– Table${size ? `<small>(${size})</small>` : ""} ×${count}`;
    } else {
      // 中文格式：– 桌面<small>(120×60cm)</small> ×{count}
      newContent = `– 桌面${size ? `<small>(${size})</small>` : ""} ×${count}`;
    }

    // 更新內容
    equipmentTable.innerHTML = newContent;

    // 如果數量是 2，設置顏色為紅色
    if (count === 2) {
      equipmentTable.style.color = "red";
    } else {
      equipmentTable.style.color = ""; // 恢復預設顏色
    }
  }
  extraTable();

  // 動態更新通行憑證顯示（基礎數量 + 加購顯示）
  function updateBadgeCount() {
    const equipmentBadge = document.getElementById("equipment-badge");
    const extrapasstxt = document.getElementById("extrapasstxt");
    
    if (!equipmentBadge) return; // 防呆

    // 基礎通行憑證數量（不含加購）
    let baseBadgeCount = 2;
    
    // 判斷是否為英文攤位
    const isEnglishBooth = isEnglishBoothType(boothType);

    // 根據不同攤位類型設定基礎數量
    switch (boothType) {
      case "策展攤":
        baseBadgeCount = 6;
        break;
      case "Curation Booth":
        baseBadgeCount = 6;
        break;
      case "書攤":
      case "創作商品攤":
      case "裝置攤":
      case "食物酒水攤":
      case "Regular Book Booth":
      case "Regular Non-Book Booth":
      case "Installation Booth":
      default:
        baseBadgeCount = 2;
        break;
    }

    // 只顯示基礎數量
    if (isEnglishBooth) {
      equipmentBadge.innerHTML = `– Access Pass ×${baseBadgeCount}`;
    } else {
      equipmentBadge.innerHTML = `– 通行憑證 ×${baseBadgeCount}`;
    }

    // 檢查加購情況並顯示加購的通行憑證
    const tableCount = apiData["桌"];
    const passCount = apiData["證"];
    
    let additionalBadges = 0;
    
    // 解析桌子數量（apiData["桌"] 返回的是總桌子數量）
    // 基礎已有1張桌子，只有當總數為2時才加通行憑證
    if (tableCount && tableCount !== "" && tableCount !== "None") {
      const tableCountStr = String(tableCount).trim();
      let tableNum = 0;
      
      if (tableCountStr.includes("一") || tableCountStr === "1") {
        tableNum = 1;
      } else if (tableCountStr.includes("二") || tableCountStr === "2") {
        tableNum = 2;
      } else {
        tableNum = parseInt(tableCountStr, 10) || 0;
      }
      
      // 只有當總桌子數量為2時（基礎1張+加購1張），才加2張通行憑證
      if (tableNum === 2) {
        additionalBadges += 2;
      }
    }
    
    // 檢查是否加購通行憑證
    if (passCount && passCount !== "" && passCount !== "None") {
      // 加購1張通行憑證 +1
      additionalBadges += 1;
    }
    
    // 如果有加購，顯示加購的通行憑證
    if (extrapasstxt) {
      if (additionalBadges > 0) {
        extrapasstxt.style.display = "block";
        if (isEnglishBooth) {
          extrapasstxt.textContent = `- Access Pass Add-on +${additionalBadges}`;
        } else {
          extrapasstxt.textContent = `- 加購通行憑證 +${additionalBadges}`;
        }
      } else {
        extrapasstxt.style.display = "none";
      }
    }
  }
  updateBadgeCount();

  // 社群欄位顯示
  function setSocialText(id, value) {
    const el = document.getElementById(id);
    if (!el) return; // 如果元素不存在，直接返回
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

  // 產生優惠碼區塊
  function setDiscountCodes(codes) {
    const container = document.getElementById("ticket-discountcode");
    if (!container) return;
    container.innerHTML = "";
    if (!codes || codes === "None") {
      container.textContent = "None";
      return;
    }

    // 分割折扣碼（用逗號分隔），每個碼都有自己的複製按鈕
    const codeList = codes
      .split(",")
      .map((code) => code.trim())
      .filter((code) => code);

    codeList.forEach((code, index) => {
      // 建立折扣碼文字
      const span = document.createElement("span");
      span.textContent = code;
      span.style.fontWeight = "bold";
      container.appendChild(span);

      // 建立複製按鈕
      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.title = "Copy Discount Code";
      btn.style.marginLeft = "5px";
      btn.style.fontSize = "1em";
      btn.textContent = "📋";
      btn.onclick = () => {
        navigator.clipboard.writeText(code);
        btn.textContent = "✅";
        setTimeout(() => (btn.textContent = "📋"), 1000);
      };
      container.appendChild(btn);

      // 如果不是最後一個，加上逗號和空格
      if (index < codeList.length - 1) {
        const comma = document.createElement("span");
        comma.textContent = ", ";
        comma.style.marginRight = "0.5em";
        container.appendChild(comma);
      }
    });
  }
  setDiscountCodes(apiData["親友票"]);

  let publishTimes = {};
  try {
    const publishRes = await fetch(publishApiUrl);
    publishTimes = await publishRes.json();
    console.log("publishTimes", publishTimes);
  } catch (e) {
    console.warn("Failed to load publish times:", e);
  }

  // 假設 publishTimes 物件 key = section id, value = {descId, publishTime, deadline, preMessage}
  Object.entries(publishTimes).forEach(([sectionId, info]) => {
    let section = document.getElementById(sectionId);
    let desc = document.getElementById(info.descId);
    if (!section || !desc) return;

    // 預設用 deadline
    let deadline = info.deadline;
    if (
      (sectionId === "billing-section" || sectionId === "agreement-section") &&
      apiData["錄取"] === "2-是-2波" &&
      info.backupDeadline
    ) {
      deadline = info.backupDeadline;
    }
    const deadlineTime = deadline ? new Date(deadline) : null;

    // 填入 ddl-區塊id
    const ddlDiv = document.getElementById("ddl-" + sectionId);
    if (ddlDiv && deadline) {
      // 判斷語言
      const isEnglishBooth = isEnglishBoothType(boothType);
      // 格式化日期
      const deadlineStr = deadlineTime
        ? `${deadlineTime.getFullYear()}-${(deadlineTime.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${deadlineTime
            .getDate()
            .toString()
            .padStart(2, "0")} ${deadlineTime
            .getHours()
            .toString()
            .padStart(2, "0")}:${deadlineTime
            .getMinutes()
            .toString()
            .padStart(2, "0")}`
        : deadline;
      ddlDiv.textContent = isEnglishBooth
        ? `Deadline: ${deadlineStr}`
        : `截止日期：${deadlineStr}`;
    }

    // 預設用 deadline
    // let deadline = info.deadline;
    // 如果是備取，且有 backupDeadline 就用它
    // if (
    //   (sectionId === "billing-section" || sectionId === "agreement-section") &&
    //   apiData["錄取"] === "2-是-2波" &&
    //   info.backupDeadline
    // ) {
    //   deadline = info.backupDeadline;
    // }

    // 解析時間
    const now = new Date();
    const publishTime = info.publishTime ? new Date(info.publishTime) : null;
    // 先確保 section 有 position: relative
    section.style.position = "relative";
    section.style.overflow = "hidden";

    // 未公布前
    if (publishTime && now < publishTime) {
      desc.innerHTML = "";
      let banner = document.createElement("div");
      banner.className = "pre-banner";
      banner.style.color = "darkgrey";
      banner.style.fontSize = "1em";
      banner.style.marginTop = "0.5em";
      banner.textContent = info.preMessage || "Not available yet.";
      desc.appendChild(banner);

      section.classList.add("disabled");
      // 移除舊遮罩
      let oldOverlay = section.querySelector(".overlay-closed");
      if (oldOverlay) oldOverlay.remove();
    }
    // 截止後
    else if (deadlineTime && now > deadlineTime) {
      section.style.pointerEvents = "none";
      // 加遮罩
      let overlay = document.createElement("div");
      overlay.className = "overlay-closed";
      overlay.textContent = "Close";
      section.appendChild(overlay);
      setTimeout(() => overlay.classList.add("active"), 10);

      section.classList.add("disabled");
      section.style.opacity = 1;
    }
    // 公布期間
    else {
      section.classList.remove("disabled");
      section.style.opacity = "";
      // 移除舊遮罩
      section.style.pointerEvents = "";
      let oldOverlay = section.querySelector(".overlay-closed");
      if (oldOverlay) oldOverlay.remove();
    }
  });


  if (window.setLoading) window.setLoading(1);
  if (window.hideLoading) window.hideLoading();
  if (window.stopFakeLoading) window.stopFakeLoading();
});
