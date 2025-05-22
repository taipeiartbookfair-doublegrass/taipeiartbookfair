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
      // 最多跑到 90%
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

  // 資料抓完，直接跳到 100%
  stopFakeProgress();
  if (window.updateLoadingProgress) updateLoadingProgress(1);

  // 0.5 秒後關掉 loading
  setTimeout(function () {
    if (window.hideLoadingMask) hideLoadingMask();
  }, 500);
});
