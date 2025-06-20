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
  const billinginfo = document.getElementById("billing-info");
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
    const declarationChecked = !!apiData["同意書"];
    const checkPayment = document.getElementById("check-payment");
    const checkDeclaration = document.getElementById("check-declaration");

    // 勾選資格勾勾
    if (checkPayment) checkPayment.checked = paymentChecked;
    if (checkDeclaration) checkDeclaration.checked = declarationChecked;

    // 狀態顯示
    function getStatusText(confirmed) {
      if (isEnglishBooth) {
        return confirmed ? "Confirmed" : "Unfulfilled";
      } else {
        return confirmed ? "成立" : "未完成";
      }
    }

    // 預設全部隱藏
    billinginfo.style.display = "none";
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
        billinginfo.style.display = "block";
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
        billinginfo.style.display = "block";
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
        billinginfo.style.display = "block";
      }
    }
  }

  // 報名編號填好後再執行這段
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
  const englishBoothTypes = [
    "One Regular Booth",
    "Two Regular Booth",
    "Curation Booth",
  ];
  const isEnglishBooth = englishBoothTypes.includes(boothType);

  if (boothType) {
    boothTypeEl.textContent = boothType;
    if (isEnglishBooth) {
      boothTypeEl.classList.add("booth-type-en");
    } else {
      boothTypeEl.classList.remove("booth-type-en");
    }
  }

  // 只呼叫一次
  updateRegistrationStatusAndChecks();
});
