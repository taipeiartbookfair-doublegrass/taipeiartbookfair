// 先檢查 cookie
const account = getCookie("account");
const region = getCookie("region");

if (!account || !region) {
  window.location.href = "login.html";
}

const apiUrl =
  "https://script.google.com/macros/s/AKfycbwNWgPsLK_ldHUIvoIg5a9k3PNIlmjvJeTgbCZ5CZsvKFQ7e1DoxbMsAawi4nI3Rea4DA/exec";
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

  document.getElementById("application-number").textContent =
    apiData["報名編號"] || "";

  // 取得報名編號與 boothType
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
  const applicationNumber = document
    .getElementById("application-number")
    .textContent.trim();
  const boothType = getBoothTypeFromNumber(applicationNumber);
  const boothTypeEl = document.getElementById("booth-type");
  if (boothType) {
    boothTypeEl.textContent = boothType;
    if (/^[A-Za-z\s]+$/.test(boothType)) {
      boothTypeEl.classList.add("booth-type-en");
    } else {
      boothTypeEl.classList.remove("booth-type-en");
    }
  }

  // 錄取狀態顯示
  function getApplicationResultText(raw, boothType) {
    const isEnglishBooth =
      boothType === "One Regular Booth" ||
      boothType === "Two Regular Booth" ||
      boothType === "Curation Booth";
    if (!raw) return "";
    if (isEnglishBooth) {
      if (raw === "4-是-條件式錄取") return "Conditionally Accepted";
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
      if (raw === "4-是-條件式錄取") return "條件式錄取";
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

  // 控制條碼顯示
  const barcodeRow = document.getElementById("barcode-row");
  const shouldShowBarcode = hasExhibitionQualification(resultText);
  
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
          "– 工作證 ×2",
          "– 草率簿 ×1<small> (含露出一面)</small>",
        ];
        break;
      case "創作商品攤":
        price = "8,000 元 <small>(含稅)</small>";
        equipment = [
          "– 桌面<small>(120×60cm)</small> ×1",
          "– 椅子 ×2",
          "– 工作證 ×2",
          "– 草率簿 ×1<small> (含露出一面)</small>",
        ];
        break;
      case "裝置攤":
        price = "10,000 元 <small>(含稅)</small>";
        equipment = [
          "– 1.5M × 1.5M 空地",
          "– 工作證 ×2",
          "– 草率簿 ×1<small> (含露出一面)</small>",
        ];
        break;
      case "食物酒水攤":
        price = "13,000 元 <small>(含稅)</small>";
        equipment = [
          "– 桌面<small>(180×60cm)</small> ×1",
          "– 椅子 ×2",
          "– 工作證 ×2",
          "– 草率簿 ×1<small> (含露出一面)</small>",
        ];
        break;
      case "One Regular Booth":
        price = 'USD$165 <span style="font-size:1.3rem;">incl. tax</span>';
        equipment = [
          "– Table<small>(120×60cm)</small> ×1",
          "– Chairs ×2",
          "– Passes ×2",
          "– TPABF Catalog ×1 <small>(one page featured)</small>",
        ];
        break;
      case "Two Regular Booth":
        price = 'USD$330 <span style="font-size:1.3rem;">incl. tax</span>';
        equipment = [
          "– Table<small>(120×60cm)</small> ×2",
          "– Chairs ×4",
          "– Passes ×4",
          "– TPABF Catalog ×1 <small>(one page featured)</small>",
        ];
        break;
      case "Curation Booth":
        price = 'USD$780 <span style="font-size:1.3rem;">incl. tax</span>';
        equipment = [
          "– 3M × 3M space",
          "– Table<small>(120×60cm)</small> ×2",
          "– Chairs ×4",
          "– Passes ×3",
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
      if (el) el.innerHTML = equipment[idx] || "";
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

    // 方案一價錢顯示，方案二自動加錢
    if (price1) {
      document.getElementById("billing1-price").innerHTML =
        price1 + "元 <small>(含稅)</small>";
      const price2 = (
        parseInt(price1.replace(/,/g, "")) + 500
      ).toLocaleString();
      document.getElementById("billing2-price").innerHTML =
        price2 + "元 <small>(含稅)</small>";
    } else if (
      boothType === "One Regular Booth" ||
      boothType === "Two Regular Booth" ||
      boothType === "Curation Booth"
    ) {
      let usd1 = 0;
      if (boothType === "One Regular Booth") usd1 = 165;
      if (boothType === "Two Regular Booth") usd1 = 330;
      if (boothType === "Curation Booth") usd1 = 780;
      document.getElementById(
        "billing1-price"
      ).innerHTML = `USD$${usd1} <span style="font-size:1.3rem;">incl. tax</span>`;
      document.getElementById("billing2-price").innerHTML = `USD$${
        usd1 + 20
      } <span style="font-size:1.3rem;">incl. tax</span>`;
    }

    // 商品名稱與金額
    let productName1 = "",
      productName2 = "",
      amount1 = "",
      amount2 = "";
    const isOversea =
      boothType === "One Regular Booth" ||
      boothType === "Two Regular Booth" ||
      boothType === "Curation Booth";
    if (isOversea) {
      if (boothType === "One Regular Booth") {
        productName1 = "Basic Fee";
        productName2 = "Basic Fee + Extra Pass";
        amount1 = "165";
        amount2 = "185";
      } else if (boothType === "Two Regular Booth") {
        productName1 = "Basic Fee";
        productName2 = "Basic Fee + Extra Pass";
        amount1 = "330";
        amount2 = "350";
      } else if (boothType === "Curation Booth") {
        productName1 = "Basic Fee";
        productName2 = "Basic Fee + Extra Pass";
        amount1 = "780";
        amount2 = "800";
      }
    } else {
      if (boothType === "書攤") {
        productName1 = "基礎攤費";
        productName2 = "基礎攤費-工作證一張";
      } else if (boothType === "創作商品攤") {
        productName1 = "基礎攤費";
        productName2 = "基礎攤費-工作證一張";
      } else if (boothType === "裝置攤") {
        productName1 = "基礎攤費";
        productName2 = "基礎攤費-工作證一張";
      } else if (boothType === "食物酒水攤") {
        productName1 = "基礎攤費";
        productName2 = "基礎攤費-工作證一張";
      }
    }

    // 產生連結
    let payLink1 = "#",
      payLink2 = "#";
    if (isOversea) {
      payLink1 = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=hooroo@double-grass.com&item_name=${encodeURIComponent(
        applicationNumber + " - " + productName1
      )}&amount=${amount1}&currency_code=USD&custom=${applicationNumber}`;
      payLink2 = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=hooroo@double-grass.com&item_name=${encodeURIComponent(
        applicationNumber + " - " + productName2
      )}&amount=${amount2}&currency_code=USD&custom=${applicationNumber}`;
    } else {
      payLink1 = toProductUrl(applicationNumber, productName1);
      payLink2 = toProductUrl(applicationNumber, productName2);
    }

    // 分別設定 pay1/pay2 按鈕
    const payBtn1 = document.getElementById("pay1");
    const payBtn2 = document.getElementById("pay2");
    if (payBtn1) {
      payBtn1.onclick = () => window.open(payLink1, "_blank");
      payBtn1.textContent = isOversea ? "Pay (Plan 1)" : "付款（方案一）";
    }
    if (payBtn2) {
      payBtn2.onclick = () => window.open(payLink2, "_blank");
      payBtn2.textContent = isOversea ? "Pay (Plan 2)" : "付款（方案二）";
    }

    // 產生產品連結
    function toProductUrl(applicationNumber, productName) {
      return (
        "https://nmhw.taipeiartbookfair.com/products/" +
        (applicationNumber + "-" + productName)
          .replace(/\s+/g, "")
          .toLowerCase()
      );
    }

    // 控制電力需求顯示
    const electricityRow = document.getElementById("electricity-row");
    if (electricityRow) {
      if (boothType === "食物酒水攤" || boothType === "裝置攤") {
        electricityRow.style.display = "";
      } else {
        electricityRow.style.display = "none";
      }
    }
    const editElectricityRow = document.getElementById("edit-electricity-row");
    if (editElectricityRow) {
      if (boothType === "食物酒水攤" || boothType === "裝置攤") {
        editElectricityRow.style.display = "";
      } else {
        editElectricityRow.style.display = "none";
      }
    }
  }
  updateBoothInfo(boothType);

  // 設備標題
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

  // 付款方案標題/說明動態切換
  function setBillingInfoLanguage(boothType) {
    const isEnglishBooth =
      boothType === "One Regular Booth" ||
      boothType === "Two Regular Booth" ||
      boothType === "Curation Booth";
    document.querySelector("span[for-billing1-title]").innerHTML =
      isEnglishBooth
        ? "<strong>Plan 1</strong>: Basic Fee"
        : "<strong>方案一</strong>：基礎攤費";
    document.querySelector("span[for-billing1-desc]").innerHTML = isEnglishBooth
      ? "Basic plan only"
      : "僅基礎方案";
    document.querySelector("span[for-billing2-title]").innerHTML =
      isEnglishBooth
        ? "<strong>Plan 2</strong>: Basic Fee + Extra Pass"
        : "<strong>方案二</strong>：基礎攤費+工作證一張";
    document.querySelector("span[for-billing2-desc]").innerHTML = isEnglishBooth
      ? "For those who shift-swaps"
      : "適合有輪班擺攤需求之攤主";
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
      var boothText = boothType.trim();
      if (
        boothText === "One Regular Booth" ||
        boothText === "Two Regular Booth" ||
        boothText === "Curation Booth"
      ) {
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

  // 動態勾勾區塊語言還有攤商編號說明搭便車
  function setYesLanguage(boothType, rawResult) {
    var yesdesc = document.getElementById("registration-status-desc");
    var boothnumberdesc = document.getElementById("booth-number-desc");
    var billingnote1 = document.getElementById("billing-note1");
    var billingnote2 = document.getElementById("billing-note2");

    // 判斷期限
    let deadline = "7 月 13 日";
    let deadlineEn = "July 13, 2025 at 11:59 PM (UTC+8)";
    if (rawResult === "2-是-2波") {
      deadline = "7 月 22 日";
      deadlineEn = "July 22, 2025 at 11:59 PM (UTC+8)";
    }

    if (boothType && yesdesc && boothnumberdesc) {
      var boothText = boothType.trim();
      if (
        boothText === "One Regular Booth" ||
        boothText === "Two Regular Booth" ||
        boothText === "Curation Booth"
      ) {
        yesdesc.innerHTML = `Please complete your payment and upload the signed agreement by <b><mark>${deadlineEn}</mark></b>. Late submissions will be considered a forfeiture of your participation. <br><br>Our team will manually verify all payment and agreement uploads by July 15.<br>If you have already completed the process, please keep a screenshot of your payment or upload confirmation. If your status hasn’t been updated after July 15, feel free to contact us again.`;
        boothnumberdesc.innerHTML =
          "Booth numbers and the floor plan will be announced on <b>November 20</b>, the check-in day.";
        billingnote1.innerHTML = `Payment Deadline: ${deadlineEn}`;
        billingnote2.innerHTML = `Payment Deadline: ${deadlineEn}`;
      } else {
        yesdesc.innerHTML = `請於<b><mark>${deadline}</mark></b>前完成繳費與同意書上傳，逾期將視同放棄參展資格。<br><br>團隊將於 7 月 15 日前 逐一人工確認繳費與同意書的上傳狀態。<br>如您已完成繳交，請先保留相關繳費或上傳截圖；若狀態在 7 月 15 日後仍未更新，請與我們聯繫。`;
        boothnumberdesc.innerHTML =
          "攤位編號與攤位地圖將於報到當天（11/20）公布，屆時請留意公告。";
        billingnote1.innerHTML = `付款期限: ${deadline}`;
        billingnote2.innerHTML = `付款期限: ${deadline}`;
      }
    }
  }
  setYesLanguage(boothType, apiData["錄取"]);

  // 動態Billing Notice 區塊語言
  function setBillingNoticeLanguage(boothType) {
    var billingNoticedesc = document.getElementById("billing-notice");
    if (boothType && billingNoticedesc) {
      var boothText = boothType.trim();
      if (
        boothText === "One Regular Booth" ||
        boothText === "Two Regular Booth" ||
        boothText === "Curation Booth"
      ) {
        billingNoticedesc.innerHTML =
          "<li>Please assess your payment requirements before proceeding. Once payment is made, we will not accept changes to your application options.</li><li>Each booth may purchase only one additional staff badge. If you need more, please purchase a regular ticket for entry.</li><li>Please keep your invoice after payment for your own records.</li><li>Even if the payment link remains accessible, any payment made after the deadline may result in disqualification at the organizer’s discretion, and no refund will be issued.</li>";
      } else {
        billingNoticedesc.innerHTML =
          "<li>請自行評估需求繳費，繳款後我們不再提供更改申請選項。</li><li>每攤<u>限加購 1張工作證</u>，如需更多數量請買當日票入場。</li><li>付款之後請自行留存發票。</li><li>即使付款連結仍可操作，若超過繳費期限付款，主辦單位有權取消資格，並不予退款。</li>";
      }
    }
  }
  setBillingNoticeLanguage(boothType);

  // 動態條件是錄取 區塊語言
  function setConditionalAcceptence(boothType) {
    var tooltip = document.getElementById("tooltip-text");
    if (boothType && tooltip) {
      var boothText = boothType.trim();
      if (
        boothText === "One Regular Booth" ||
        boothText === "Two Regular Booth" ||
        boothText === "Curation Booth"
      ) {
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
      var boothText = boothType.trim();
      if (
        boothText === "One Regular Booth" ||
        boothText === "Two Regular Booth" ||
        boothText === "Curation Booth"
      ) {
        catalogdownloadLink.innerHTML = "Template Download";
        catalogdesc.innerHTML =
          "Each exhibitor is entitled to a one-page feature in this year’s <i>TPABF Catalog</i>. Late submissions will be considered as forfeiting the opportunity.<br /><br />📌 Submission requirements: <br />1. <b>Image file</b>: PDF format, final size <b>120 × 195 mm</b>, with <b>5 mm bleed</b>. Please use <b>black and white</b> only.<br />2. <b>Text content</b>: Please edit and complete the information on the left side of the exhibitor info sheet.<br />";
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
      var boothText = boothType.trim();
      if (
        boothText === "One Regular Booth" ||
        boothText === "Two Regular Booth" ||
        boothText === "Curation Booth"
      ) {
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
      var boothText = boothType.trim();
      if (
        boothText === "One Regular Booth" ||
        boothText === "Two Regular Booth" ||
        boothText === "Curation Booth"
      ) {
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
      var boothText = boothType.trim();
      if (
        boothText === "One Regular Booth" ||
        boothText === "Two Regular Booth" ||
        boothText === "Curation Booth"
      ) {
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

    if (boothType && mediaziplink && mediamaterialdesc) {
      var boothText = boothType.trim();
      if (
        boothText === "One Regular Booth" ||
        boothText === "Two Regular Booth" ||
        boothText === "Curation Booth"
      ) {
        mediaziplink.innerHTML = "Download";
        mediamaterialdesc.innerHTML =
          "<b>Media Kit:</b><br />You're welcome to use the 2025 TPABF key visual assets — click here to download.";
        materialuploaddesc.innerHTML =
          "<b>Social Media Promo Images Upload:</b><br />Please follow the instructions in the asset kit to create your <b>post and story</b> images, then upload them as a zipped file.<br><br>⚠️ Submissions received after the deadline may not be included in our social media promotion—thank you for your understanding ;)";
      } else {
        mediaziplink.innerHTML = "下載";
        mediamaterialdesc.innerHTML =
          "<b>視覺素材包：</b><br />歡迎使用 2025 草率季主視覺素材，點此下載檔案。";
        materialuploaddesc.innerHTML =
          "<b>社群宣傳圖檔上傳：</b><br />請依照素材包內的說明製作，並將製作完成的<b>貼文、限時動態圖檔</b>打包為 zip上傳。<br><br>⚠️ 若未於期限內完成上傳，可能無法安排社群曝光，敬請留意;)";
      }
    }
  }
  setMediaUploadLanguage(boothType);

  // 電力資訊
  function updateElectricityList(boothType) {
    const electricityTitle = document.getElementById("electricity-title");
    const electricityList = document.querySelector("#electricity-title + ul");
    if (!electricityList) return;

    if (boothType === "書攤" || boothType === "創作商品攤") {
      electricityTitle.textContent = "電源配置：";
      electricityList.innerHTML = `
      <li>供應一般電源110v</li>
      <li>不得使用大電器</li>
      <li>非每攤都有，需自備延長線與他人協調</li>
    `;
    } else if (
      boothType === "One Regular Booth" ||
      boothType === "Two Regular Booth" ||
      boothType === "Curation Booth"
    ) {
      electricityTitle.textContent = "Electricity:";
      electricityList.innerHTML = `
      <li>Standard 110v power supply</li>
      <li>No high-power appliances allowed</li>
      <li>Not available for every booth; please bring your own extension cord and coordinate with others</li>
    `;
    } else if (boothType === "裝置攤" || boothType === "食物酒水攤") {
      electricityTitle.textContent = "電源配置：";
      electricityList.innerHTML = `
      <li>供應一般電源110v</li>
      <li>
        9月前需提供<span style="text-decoration: underline; text-decoration-style: dashed; cursor: pointer;" onclick="document.getElementById('electricity-row').scrollIntoView({behavior:'smooth'});">電力需求申請
        </span>，不得於現場臨時申請：
        <ul style="margin: 0.3em 0 0 1.5em; list-style-type: disc;">
          <li>條列使用電器＆瓦數</li>
          <li>220V需以1000元加購，不得使用變壓器</li>
        </ul>
      </li>
    `;
    }
  }
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

    const isEnglishBooth =
      boothType === "One Regular Booth" ||
      boothType === "Two Regular Booth" ||
      boothType === "Curation Booth";
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
    overseavisa.style.display = "none";
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
        boothnumber.style.display = "block";
        // boothappearance.style.display = "block";
      } else {
        registrationStatusEl.textContent = getStatusText(false);
        billinginfo.style.display = "block";
        registrationStatus.style.display = "block";
        boothnumber.style.display = "block";
      }
      if (nationality === "CN") {
        visaCN.style.display = "block";
      } else if (nationality !== "TW" && nationality !== "CN") {
        overseavisa.style.display = "block";
      }
    } else if (rawResult === "0") {
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
        boothnumber.style.display = "block";
        if (nationality === "CN") {
          visaCN.style.display = "block";
        } else if (nationality !== "TW" && nationality !== "CN") {
          overseavisa.style.display = "block";
        }
        // boothappearance.style.display = "block";
      } else {
        registrationStatusEl.textContent = getStatusText(false);
        billinginfo.style.display = "block";
        registrationStatus.style.display = "block";
        boothnumber.style.display = "block";
        if (nationality === "CN") {
          visaCN.style.display = "block";
        } else if (nationality !== "TW" && nationality !== "CN") {
          overseavisa.style.display = "block";
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
          visaCN.style.display = "block";
        } else if (nationality !== "TW" && nationality !== "CN") {
          overseavisa.style.display = "block";
        }
        familyticket.style.display = "block";
        manualBoothappearance.style.display = "block";
        registrationStatus.style.display = "block";
        boothnumber.style.display = "block";
        // boothappearance.style.display = "block";
      } else {
        registrationStatusEl.textContent = getStatusText(false);
        billinginfo.style.display = "block";
        registrationStatus.style.display = "block";
        boothnumber.style.display = "block";
      }
    }
  }
  updateRegistrationStatusAndChecks();

  function extraPass() {
    const paymentChecked = !!apiData["證"];
    const extrapasstxt = document.getElementById("extrapasstxt");

    if (!extrapasstxt) return; // 防呆

    if (paymentChecked) {
      extrapasstxt.style.display = "block"; // ← 這裡要加 .style
      if (
        boothType === "One Regular Booth" ||
        boothType === "Two Regular Booth" ||
        boothType === "Curation Booth"
      ) {
        extrapasstxt.textContent = "- Extra Pass x1";
      } else {
        extrapasstxt.textContent = "- 加購工作證 x1";
      }
    } else {
      extrapasstxt.style.display = "none"; // 沒有加購就隱藏
    }
  }
  extraPass();

  // 社群欄位顯示
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
      const isEnglishBooth =
        boothType === "One Regular Booth" ||
        boothType === "Two Regular Booth" ||
        boothType === "Curation Booth";
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
