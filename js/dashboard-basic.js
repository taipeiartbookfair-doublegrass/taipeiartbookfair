// 先檢查 cookie
const account = getCookie("account");
const region = getCookie("region");

if (!account || !region) {
  window.location.href = "login.html";
}

const apiUrl =
  "https://script.google.com/macros/s/AKfycbwNWgPsLK_ldHUIvoIg5a9k3PNIlmjvJeTgbCZ5CZsvKFQ7e1DoxbMsAawi4nI3Rea4DA/exec";

document.addEventListener("DOMContentLoaded", async function () {
  if (window.startFakeLoading) window.startFakeLoading();
  // 等待 window.setLoading 可用
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

  try {
    console.log("userData", userData);
    const userParams = new URLSearchParams({
      action: "get_account_info",
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
  } catch (error) {
    // 可以顯示錯誤或略過
  }

  // 對應 id 填入資料
  document.getElementById("brand-name").textContent = apiData["品牌"] || "";
  document.getElementById("bio").textContent = apiData["品牌簡介"] || "";
  document.getElementById("role").textContent = apiData["身份類別"] || "";
  document.getElementById("category").textContent = apiData["作品類別"] || "";
  document.getElementById("nationality").textContent = region || "";
  document.getElementById("baselocation").textContent =
    apiData["主要創作據點"] || "";
  setSocialText("attendedYears", apiData["參與年份"]);
  setSocialText("website", apiData["website"]);
  setSocialText("instagram", apiData["IG帳號"]);
  setSocialText("facebook", apiData["facebook"]);
  setSocialText("baselocation", apiData["baselocation"]);
  setSocialText("yearlyanswer", apiData["當屆問答"]);
  setSocialText("electricity-answer", apiData["電力需求"]);

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

  document.getElementById("application-number").textContent =
    apiData["報名編號"] || "";

  document.getElementById("application-result").innerHTML =
    getApplicationResultText(apiData["錄取"]);
  function getApplicationResultText(raw) {
    if (!raw) return "";
    // 條件式錄取
    if (raw === "4-是-條件式錄取") {
      return "條件式錄取";
    }
    // 錄取
    if (raw === "1-是-1波" || raw === "2-是-2波" || raw === "0-邀請") {
      return "錄取";
    }
    // 備取
    if (raw === "3-猶豫") {
      return "備取";
    }
    // 未錄取
    if (raw === "5-否") {
      return "未錄取";
    }
    return raw; // fallback: 顯示原始內容
  }

  function setApplicationResultStyle(el, resultText) {
    el.style.backgroundColor = "";
    el.style.color = "";
    if (resultText === "錄取") {
      el.style.backgroundColor = "lime";
      el.style.color = "";
    } else if (resultText === "條件式錄取") {
      el.style.backgroundColor = "rgb(0, 157, 255)";
      el.style.color = "";
    } else if (resultText === "備取") {
      el.style.backgroundColor = "lightgreen";
      el.style.color = "";
    } else if (resultText === "未錄取") {
      el.style.backgroundColor = "lightgrey";
      el.style.color = "DarkSlateGrey";
    }
  }
  const applicationResultEl = document.getElementById("application-result");
  const resultText = getApplicationResultText(apiData["錄取"]);
  applicationResultEl.textContent = resultText;
  setApplicationResultStyle(applicationResultEl, resultText);

  const registrationStatusEl = document.getElementById("registration-status");
  const equipmentinfo = document.getElementById("equipmentinfo");
  const letter = document.getElementById("negative-letter");
  const runnerletter = document.getElementById("runnerup-letter");
  const conditionalyes = document.getElementById("booth-type-tooltip");
  const mediaupload = document.getElementById("media-section");
  const foreignShipping = document.getElementById("media-section-row2");
  const visaupload = document.getElementById("media-section-row3");
  const familyticket = document.getElementById("media-section-row4");
  const manual = document.getElementById("media-section-row5");
  const boothappearance = document.getElementById("media-section-row6");

  const rawResult = apiData["錄取"];
  const nationality = (region || "").trim().toUpperCase();

  // 依錄取結果決定報名狀態顯示與資格勾勾
  function updateRegistrationStatusAndChecks() {
    const paymentChecked = !!apiData["已匯款"];
    const declarationChecked = !!apiData["切結書"];
    const checkPayment = document.getElementById("check-payment");
    const checkDeclaration = document.getElementById("check-declaration");

    // 勾選資格勾勾
    if (checkPayment) checkPayment.checked = paymentChecked;
    if (checkDeclaration) checkDeclaration.checked = declarationChecked;

    // 判斷攤位語言（英文攤位用英文，中文攤位用中文）
    const boothType = apiData["攤位類型"] || "";
    const isEnglishBooth =
      boothType === "One Regular Booth" ||
      boothType === "Two Regular Booth" ||
      boothType === "Curation Booth";

    // 狀態顯示
    function getStatusText(confirmed) {
      if (isEnglishBooth) {
        return confirmed ? "Confirmed" : "Unfulfilled";
      } else {
        return confirmed ? "成立" : "未完成";
      }
    }

    // 預設全部隱藏
    equipmentinfo.style.display = "none";
    letter.style.display = "none";
    runnerletter.style.display = "none";
    conditionalyes.style.display = "none";
    mediaupload.style.display = "none";
    foreignShipping.style.display = "none";
    visaupload.style.display = "none";
    familyticket.style.display = "none";
    manual.style.display = "none";
    boothappearance.style.display = "none";

    if (rawResult === "5-否") {
      registrationStatusEl.textContent = "-";
      letter.style.display = "block";
    } else if (
      rawResult === "1-是-1波" ||
      rawResult === "2-是-2波" ||
      rawResult === "0-邀請"
    ) {
      if (paymentChecked && declarationChecked) {
        registrationStatusEl.textContent = getStatusText(true);
        mediaupload.style.display = "block";
        // 國籍條件顯示
        if (nationality !== "TW") {
          foreignShipping.style.display = "block";
        }
        if (nationality === "CN") {
          visaupload.style.display = "block";
        }
        familyticket.style.display = "block";
        manual.style.display = "block";
        boothappearance.style.display = "block";
      } else {
        registrationStatusEl.textContent = getStatusText(false);
        equipmentinfo.style.display = "block";
      }
    } else if (rawResult === "0") {
      registrationStatusEl.textContent = "-";
    } else if (rawResult === "4-是-條件式錄取") {
      conditionalyes.style.display = "inline-block";
      if (paymentChecked && declarationChecked) {
        registrationStatusEl.textContent = getStatusText(true);
        mediaupload.style.display = "block";
        if (nationality !== "TW") {
          foreignShipping.style.display = "block";
        }
        if (nationality === "CN") {
          visaupload.style.display = "block";
        }
        familyticket.style.display = "block";
        manual.style.display = "block";
        boothappearance.style.display = "block";
      } else {
        registrationStatusEl.textContent = getStatusText(false);
        equipmentinfo.style.display = "block";
      }
    } else if (rawResult === "3-猶豫") {
      registrationStatusEl.textContent = "-";
      runnerletter.style.display = "block";
    } else {
      if (paymentChecked && declarationChecked) {
        registrationStatusEl.textContent = getStatusText(true);
        mediaupload.style.display = "block";
        if (nationality !== "TW") {
          foreignShipping.style.display = "block";
        }
        if (nationality === "CN") {
          visaupload.style.display = "block";
        }
        familyticket.style.display = "block";
        manual.style.display = "block";
        boothappearance.style.display = "block";
      } else {
        registrationStatusEl.textContent = getStatusText(false);
        equipmentinfo.style.display = "block";
      }
    }
  }

  // 呼叫一次
  updateRegistrationStatusAndChecks();

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
        price = "USD$165 <small>incl. tax</small>";
        equipment = [
          "– Table<small>(180×60cm)</small> ×1",
          "– Chairs ×2",
          "– Passes ×2",
          "– TPABF Catalog ×1 <small>(one page featured)</small>",
        ];
        break;
      case "Two Regular Booth":
        price = "USD$330 <small>incl. tax</small>";
        equipment = [
          "– Table<small>(180×60cm)</small> ×2",
          "– Chairs ×4",
          "– Passes ×4",
          "– TPABF Catalog ×1 <small>(one page featured)</small>",
        ];
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
        break;
      default:
        price = "";
        equipment = [];
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
      btn.onclick = () => window.open(payLink1, "_blank");
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

    // 方案一價錢顯示，方案二自動加錢
    if (price1) {
      // 中文攤種（台幣）
      document.getElementById("billing1-price").innerHTML =
        price1 + "元 <small>(含稅)</small>";
      // 方案二自動加 1,000 元
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

    // 取得報名編號
    const applicationNumber = document
      .getElementById("application-number")
      .textContent.trim();

    // 判斷是否海外攤
    const isOversea =
      boothType === "One Regular Booth" ||
      boothType === "Two Regular Booth" ||
      boothType === "Curation Booth";

    // 商品名稱與金額
    let productName1 = "",
      productName2 = "",
      amount1 = "",
      amount2 = "";
    if (isOversea) {
      if (boothType === "One Regular Booth") {
        productName1 = "Basic Fee";
        productName2 = "Basic Fee + Extra Pass";
        amount1 = "165";
        amount2 = "195";
      } else if (boothType === "Two Regular Booth") {
        productName1 = "Basic Fee";
        productName2 = "Basic Fee + Extra Pass";
        amount1 = "330";
        amount2 = "360";
      } else if (boothType === "Curation Booth") {
        productName1 = "Basic Fee";
        productName2 = "Basic Fee + Extra Pass";
        amount1 = "780";
        amount2 = "810";
      }
    } else {
      if (boothType === "書攤") {
        productName1 = "基礎攤費";
        productName2 = "基礎攤費 + 工作證一張";
      } else if (boothType === "創作商品攤") {
        productName1 = "基礎攤費";
        productName2 = "基礎攤費 + 工作證一張";
      } else if (boothType === "裝置攤") {
        productName1 = "基礎攤費";
        productName2 = "基礎攤費 + 工作證一張";
      } else if (boothType === "食物酒水攤") {
        productName1 = "基礎攤費";
        productName2 = "基礎攤費 + 工作證一張";
      }
    }

    // 產生連結
    let payLink1 = "#",
      payLink2 = "#";
    if (isOversea) {
      payLink1 = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=xraypink@gmail.com&item_name=${encodeURIComponent(
        applicationNumber + " - " + productName1
      )}&amount=${amount1}&currency_code=USD&custom=${applicationNumber}`;
      payLink2 = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=xraypink@gmail.com&item_name=${encodeURIComponent(
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

    // 控制電力需求顯示
    const electricityRow = document.getElementById("electricity-row");
    if (electricityRow) {
      if (boothType === "食物酒水攤" || boothType === "裝置攤") {
        electricityRow.style.display = "";
      } else {
        electricityRow.style.display = "none";
      }
    }

    // 控制編輯頁電力需求顯示
    const editElectricityRow = document.getElementById("edit-electricity-row");
    if (editElectricityRow) {
      if (boothType === "食物酒水攤" || boothType === "裝置攤") {
        editElectricityRow.style.display = "";
      } else {
        editElectricityRow.style.display = "none";
      }
    }
  }

  // 在 boothType 設定後呼叫
  updateBoothInfo(boothType);

  // loading 動畫結束
  if (window.setLoading) window.setLoading(1);
  if (window.hideLoading) window.hideLoading();

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

  function setBillingInfoLanguage(boothType) {
    const isEnglishBooth =
      boothType === "One Regular Booth" ||
      boothType === "Two Regular Booth" ||
      boothType === "Curation Booth";

    // 方案一
    document.querySelector("span[for-billing1-title]").innerHTML =
      isEnglishBooth
        ? "<strong>Plan 1</strong>: Basic Fee"
        : "<strong>方案一</strong>：基礎攤費";
    document.querySelector("span[for-billing1-desc]").innerHTML = isEnglishBooth
      ? "Basic plan only"
      : "僅基礎方案";

    // 方案二
    document.querySelector("span[for-billing2-title]").innerHTML =
      isEnglishBooth
        ? "<strong>Plan 2</strong>: Basic Fee + Extra Pass"
        : "<strong>方案二</strong>：基礎攤費+工作證一張";
    document.querySelector("span[for-billing2-desc]").innerHTML = isEnglishBooth
      ? "For those who shift-swaps"
      : "適合有輪班擺攤需求之攤主";
  }

  // 呼叫時機：boothType 設定好後
  setBillingInfoLanguage(boothType);

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
  if (window.stopFakeLoading) window.stopFakeLoading();
});

// 產生產品連結
function toProductUrl(applicationNumber, productName) {
  // 全部小寫、去掉空白、dash 連接
  return (
    "https://nmhw.taipeiartbookfair.com/products/" +
    (applicationNumber + "-" + productName)
      .replace(/\s+/g, "") // 去掉所有空白
      .toLowerCase()
  );
}
