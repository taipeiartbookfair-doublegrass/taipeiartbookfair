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
      visa.innerHTML = `若您被錄取且完成參展資格後，主辦單位將協助中國地區人士辦理來台相關申請。`;
    } else {
      visa.innerHTML = `
        <a href="https://visawebapp.boca.gov.tw/BOCA_EVISA/MRV01FORM.do" target="_blank" style="text-decoration:underline;">
          Taiwan eVisa
        </a>
      `;
    }
  }

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
      if (raw === "4-是-條件式錄取") return "Conditional Acceptance";
      if (raw === "1-是-1波" || raw === "2-是-2波" || raw === "0-邀請")
        return "Accepted";
      if (raw === "3-猶豫") return "Waitlisted";
      if (raw === "5-否") return "Not Selected";
      return raw;
    } else {
      if (raw === "4-是-條件式錄取") return "條件式錄取";
      if (raw === "1-是-1波" || raw === "2-是-2波" || raw === "0-邀請")
        return "錄取";
      if (raw === "3-猶豫") return "備取";
      if (raw === "5-否") return "未錄取";
      return raw;
    }
  }
  function setApplicationResultStyle(el, resultText) {
    el.style.backgroundColor = "";
    el.style.color = "";
    if (resultText === "錄取" || resultText === "Accepted") {
      el.style.backgroundColor = "lime";
    } else if (
      resultText === "條件式錄取" ||
      resultText === "Conditional Acceptance"
    ) {
      el.style.backgroundColor = "rgb(0, 157, 255)";
    } else if (resultText === "備取" || resultText === "Waitlisted") {
      el.style.backgroundColor = "lightgreen";
    } else if (resultText === "未錄取" || resultText === "Not Selected") {
      el.style.backgroundColor = "lightgrey";
      el.style.color = "DarkSlateGrey";
    }
  }
  const applicationResultEl = document.getElementById("application-result");
  const resultText = getApplicationResultText(apiData["錄取"], boothType);
  applicationResultEl.textContent = resultText;
  setApplicationResultStyle(applicationResultEl, resultText);

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
      ).innerHTML = `USD$${usd1} <small>incl. tax</small>`;
      document.getElementById("billing2-price").innerHTML = `USD$${
        usd1 + 30
      } <small>incl. tax</small>`;
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
    }
  }
  setDeclarationLanguage(boothType);

  // 動態勾勾區塊語言還有攤商編號說明搭便車
  function setYesLanguage(boothType) {
    var yesdesc = document.getElementById("registration-status-desc");
    var boothnumberdesc = document.getElementById("booth-number-desc");
    if (boothType && yesdesc && boothnumberdesc) {
      var boothText = boothType.trim();
      if (
        boothText === "One Regular Booth" ||
        boothText === "Two Regular Booth" ||
        boothText === "Curation Booth"
      ) {
        yesdesc.innerHTML =
          "Please complete the payment and upload the signed agreement by <b><mark>July 15</mark></b>; otherwise, you will not be able to participate in the fair. Only after both payment and agreement upload are confirmed will your participation be finalized. The team will verify and update all records on July 15.";
        boothnumberdesc.innerHTML =
          "Booth numbers and the floor plan will be announced on <b>November 20</b>, the check-in day.";
      } else {
        yesdesc.innerHTML =
          "請於<b><mark>7 月 15 日</mark></b>前完成繳費與同意書上傳，否則將無法參展。經確認完成繳費動作＆同意書上傳，才算是取得最終參展資格，團隊將於7 月 15 日核對後進行統一更新。";
        boothnumberdesc.innerHTML =
          "攤位編號與攤位地圖將於報到當天（11/20）公布，屆時請留意公告。";
      }
    }
  }
  setYesLanguage(boothType);

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
          "<li>Please assess your payment requirements before proceeding. Once payment is made, we will not accept changes to your application options.</li><li>Each booth may purchase only one additional staff badge. If you need more, please purchase a regular ticket for entry.</li><li>Please keep your invoice after payment for your own records.</li>";
      } else {
        billingNoticedesc.innerHTML =
          "<li>請自行評估需求繳費，繳款後我們不再提供更改申請選項。</li><li>每攤<u>限加購 1張工作證</u>，如需更多數量請買當日票入場。</li><li>付款之後請自行留存發票。</li>";
      }
    }
  }
  setBillingNoticeLanguage(boothType);

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
          "Once selected to exhibit, your project will be featured on one page in that year’s TPABF Catalog. Please use the template from the Marketing Kit and complete both the upload and any updates to your basic exhibitor info (left-side fields) by the deadline. Late submissions will not be included.<br /><br /> 📌 Specs:<br /> File Format: PDF (Please ensure images are embedded and text is outlined)<br /> Workspace: 140 × 220 mm<br /> Bleed: 5 mm on all sides<br /> Color Mode: Black & White (B&W)";
      } else {
        catalogdownloadLink.innerHTML = "公版下載";
        catalogdesc.innerHTML =
          "單位獲取參展資格即代表可於當年《草率簿 TPABF Catalog》中露出一面，請使用行銷素材包提供的版型製作，並於期限內完成上傳與左側攤商基本資料修改，逾期視同放棄。<br /><br />📌 規格：<br />檔案類型 Format ：PDF（請確認圖片已置入、文字已轉外框）<br />工作區域 Workspace：140×220mm<br />四邊出血 Bleed：5mm<br />色彩 Color Mode: 黑白 B&W";
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
          "Each exhibitor will receive an early bird discount code before the event, allowing them to purchase up to 5 tickets at the special price of $350 each. A total of 800 early bird tickets are available.<br><br />During the event (Nov 21–23), companion tickets will be available for purchase online at the regular price of $400. Ticket holders can still enjoy priority entry without waiting in line.Please enter the following promo code at checkout (each code can only be used once):<br />";
      } else {
        ticketlink.innerHTML = "購票連結";
        familyticketdesc.innerHTML =
          "每位參展者可於活動前獲得早鳥優惠序號，每人限購5張，票價 $350，限量800張。11/21-23活動期間，親友票將以原價 $400 於線上開放購買，持票者仍可免排隊入場。請在付款時填入以下代碼（每個代碼限用一次）：<br />";
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
          "Want to engage with visitors more directly? Propose on-site programs such as short talks, performances, workshops, or DJ sets!";
        liveEventScheduledesc.innerHTML =
          "We will list here the on-site program sessions you have registered to provide. Details of your activities have been sent to your email. Please remember to check in at the designated area 15 minutes before your session.";
      } else {
        liveEventLink.innerHTML = " 報名表單";
        liveEventdesc.innerHTML =
          "想與大家更近距離互動？我們開放以下形式的現場活動徵集：短講、表演、工作坊、DJ等。";
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
          "A complete <b>Exhibitor Manual</b> will be available for download before the event. It includes check-in procedures, setup and teardown schedule, booth layout references, on-site regulations, and the <b>Penalty Handbook</b>. Please read it thoroughly and follow all instructions.<br />";
      } else {
        manualdownloadLink.innerHTML = "下載手冊";
        manualdesc.innerHTML =
          "展前將提供完整《攤主手冊》供您下載，內含報到流程、進撤場時間、攤位樣式參考、現場規範與《罰金手冊》等所有參展須知，請務必詳閱並依說明準備。<br /";
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
          "<b>Media Kit Download:</b><br />If you wish to use official TPABF promotional materials, please download the following ZIP file.";
        materialuploaddesc.innerHTML =
          "<b>Upload:</b><br />Please use the official AI template from the media kit tocreate and upload one image for social media promotion.<br />📌 Specs: JPG, RGB, 150 ppi, 1 image per exhibitor<br />⚠️ Submissions after the deadline may not be included in our social media posts.";
      } else {
        mediaziplink.innerHTML = "下載";
        mediamaterialdesc.innerHTML =
          "<b>下載視覺素材包：</b><br />若您需要使用草率季官方行銷素材，點此下載檔案。";
        materialuploaddesc.innerHTML =
          "<b>上傳：</b><br />請使用素材包內的官方模板（AI檔）製作，並上傳一張符合格式的圖片，我們將安排社群露出。(書攤需有三本書籍圖片上傳）<br />📌 格式：JPG、RGB、150 ppi、每單位限 1 張，zip包上傳<br />⚠️ 未於期限內上傳，將可能無法安排社群曝光。";
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
  const billinginfo = document.getElementById("billing-info");
  const letter = document.getElementById("negative-letter");
  const runnerletter = document.getElementById("runnerup-letter");
  const conditionalyes = document.getElementById("booth-type-tooltip");
  const foreignShipping = document.getElementById("media-section-row2");
  const visaupload = document.getElementById("media-section-row3");
  const overseavisa = document.getElementById("media-section-overseasvisa");
  const familyticket = document.getElementById("media-section-row4");
  const manual = document.getElementById("media-section-row5");
  const boothappearance = document.getElementById("media-section-row6");
  const mediaupload = document.getElementById("media-section");
  const catalogSection = document.getElementById(
    "media-section-catalog-section"
  );
  const liveEventSection = document.getElementById("media-live-event-section");

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
    if (visaupload) visaupload.style.display = "none";
    if (overseavisa) overseavisa.style.display = "none";
    familyticket.style.display = "none";
    manual.style.display = "none";
    // boothappearance.style.display = "none";

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
        if (mediaupload) mediaupload.style.display = "block";
        if (catalogSection) catalogSection.style.display = "block";
        if (liveEventSection) liveEventSection.style.display = "block";
        if (nationality !== "TW") {
          foreignShipping.style.display = "block";
        }
        familyticket.style.display = "block";
        manual.style.display = "block";
        // boothappearance.style.display = "block";
      } else {
        registrationStatusEl.textContent = getStatusText(false);
        billinginfo.style.display = "block";
        // 這裡加上 visaupload/overseavisa 的顯示條件
        if (nationality === "CN") {
          visaupload.style.display = "block";
        } else if (nationality !== "TW" && nationality !== "CN") {
          overseavisa.style.display = "block";
        }
      }
    } else if (rawResult === "0") {
      registrationStatusEl.textContent = "-";
    } else if (rawResult === "4-是-條件式錄取") {
      conditionalyes.style.display = "inline-block";
      if (paymentChecked && declarationChecked) {
        registrationStatusEl.textContent = getStatusText(true);
        if (mediaupload) mediaupload.style.display = "block";
        if (catalogSection) catalogSection.style.display = "block";
        if (liveEventSection) liveEventSection.style.display = "block";
        if (nationality !== "TW") {
          foreignShipping.style.display = "block";
        }
        familyticket.style.display = "block";
        manual.style.display = "block";
        // boothappearance.style.display = "block";
      } else {
        registrationStatusEl.textContent = getStatusText(false);
        billinginfo.style.display = "block";
        if (nationality === "CN") {
          visaupload.style.display = "block";
        } else if (nationality !== "TW" && nationality !== "CN") {
          overseavisa.style.display = "block";
        }
      }
    } else if (rawResult === "3-猶豫") {
      registrationStatusEl.textContent = "-";
      runnerletter.style.display = "block";
    } else {
      if (paymentChecked && declarationChecked) {
        registrationStatusEl.textContent = getStatusText(true);
        if (mediaupload) mediaupload.style.display = "block";
        if (catalogSection) catalogSection.style.display = "block";
        if (liveEventSection) liveEventSection.style.display = "block";
        if (nationality !== "TW") {
          foreignShipping.style.display = "block";
        }
        if (nationality === "CN") {
          visaupload.style.display = "block";
        }
        familyticket.style.display = "block";
        manual.style.display = "block";
        // boothappearance.style.display = "block";
      } else {
        registrationStatusEl.textContent = getStatusText(false);
        billinginfo.style.display = "block";
      }
    }
  }
  updateRegistrationStatusAndChecks();

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

  if (window.setLoading) window.setLoading(1);
  if (window.hideLoading) window.hideLoading();
  if (window.stopFakeLoading) window.stopFakeLoading();
});

// 產生產品連結
function toProductUrl(applicationNumber, productName) {
  return (
    "https://nmhw.taipeiartbookfair.com/products/" +
    (applicationNumber + "-" + productName).replace(/\s+/g, "").toLowerCase()
  );
}
