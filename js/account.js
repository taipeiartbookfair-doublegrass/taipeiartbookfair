// 先檢查 cookie
const account = getCookie("account");
const region = getCookie("region");

console.log("account:", account, "region:", region);

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

  console.log("apiData['代表人'] =", apiData["代表人"]);
  document.getElementById("contact-person").textContent = apiData["name"] || "";

  document.getElementById("email").textContent = apiData["account"] || "";
  document.getElementById("phone").textContent = apiData["phone"];
  document.getElementById("nationality").textContent = region || "";

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

  setSocialText("website", apiData["website"]);
  setSocialText("instagram", apiData["instagram"]);
  setSocialText("facebook", apiData["facebook"]);
  setSocialText("whatsapp", apiData["whatsapp"]);
});
