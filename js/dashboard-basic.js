// 先檢查 cookie
const account = getCookie("account");
const region = getCookie("region");

if (!account || !region) {
  window.location.href = "login.html";
}

const apiUrl =
  "https://script.google.com/macros/s/AKfycbwNWgPsLK_ldHUIvoIg5a9k3PNIlmjvJeTgbCZ5CZsvKFQ7e1DoxbMsAawi4nI3Rea4DA/exec";

document.addEventListener("DOMContentLoaded", async function () {
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
      return;
    }
  } catch (error) {
    alert("Network error, please try again later.");
    return;
  }

  // 對應 id 填入資料
  document.getElementById("brand-name").textContent = apiData["品牌"] || "";
  document.getElementById("bio").textContent = apiData["品牌簡介"] || "";
  document.getElementById("role").textContent = apiData["身份類別"] || "";
  document.getElementById("category").textContent = apiData["作品類別"] || "";
  document.getElementById("nationality").textContent = region || "";

  document.getElementById("visa-requirement").textContent =
    apiData["簽證需求"] || "";

  document.getElementById("contact-person").textContent =
    apiData["代表人"] || "";
  document.getElementById("contact-email").textContent = apiData["Email"] || "";
  document.getElementById("contact-phone").textContent =
    apiData["聯絡電話"] || "";

  document.getElementById("website").textContent = apiData["Website"] || "None";
  document.getElementById("instagram").textContent =
    apiData["Instagram"] || "None";
  document.getElementById("facebook").textContent =
    apiData["Facebook"] || "None";
  document.getElementById("whatsapp").textContent =
    apiData["WhatsApp"] || "None";

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

  // ======= 國籍與簽證需求判斷，合併到這裡 =======
  const nat = document.getElementById("nationality");
  const visa = document.getElementById("visa-requirement");
  if (nat && visa) {
    const value = nat.textContent.trim().toUpperCase();

    if (value === "TW") {
      visa.innerHTML = "Not Require";
    } else if (value === "CN") {
      visa.innerHTML = `<a href="download/requirement-form-cn.pdf" target="_blank" style="color:blue;text-decoration:underline;">Download the requirement form</a>`;
    } else {
      visa.innerHTML = `
        <a href="https://visawebapp.boca.gov.tw/BOCA_EVISA/MRV01FORM.do" target="_blank" style="color:blue;text-decoration:underline;">
          Apply for Taiwan eVisa
        </a>
        <br>
        <a href="download/visa-info.pdf" target="_blank" style="color:blue;text-decoration:underline;">
          Download visa information
        </a>
      `;
    }
  }
});
