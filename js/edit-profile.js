document.addEventListener("DOMContentLoaded", function () {
  const apiUrl =
    "https://script.google.com/macros/s/AKfycbwNWgPsLK_ldHUIvoIg5a9k3PNIlmjvJeTgbCZ5CZsvKFQ7e1DoxbMsAawi4nI3Rea4DA/exec";

  // 編輯品牌資料
  const branch_summit_btn = document.getElementById("submit-edit-brand");
  if (branch_summit_btn) {
    branch_summit_btn.addEventListener("click", async function (e) {
      //   e.preventDefault();
      const account = getCookie("account");
      const region = getCookie("region");

      console.log("品牌編輯送出: account", account, "region", region);

      if (!account || !region) {
        console.log("未登入，跳轉 login.html");
        window.location.href = "login.html";
      }

      const brandName = document.getElementById("brandName-edit").value.trim();
      const bio = document.getElementById("bio-edit").value.trim();
      const role = document.getElementById("role-edit").value;
      const category = document.getElementById("category-edit").value;

      console.log("品牌資料：", { brandName, bio, role, category });

      const params = new URLSearchParams({
        action: "update_dashboard_info",
        account: account,
        品牌: brandName,
        品牌簡介: bio,
        身分類別: role,
        作品類別: category,
      }).toString();

      console.log("品牌 params:", params);

      try {
        const updateBranchRes = await fetch(apiUrl, {
          redirect: "follow",
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        });

        console.log("品牌 fetch response:", updateBranchRes);

        const data = await updateBranchRes.json();

        console.log("品牌 API 回傳:", data);

        if (data.success) {
          setCookie("account", data.data.account, 21600);
          setCookie("region", data.data.region, 21600);
          setCookie("login", "success", 21600);

          window.location.href = "dashboard-TPABF.html";
        } else {
          alert("Network error, please try again later.");
        }
      } catch (error) {
        alert("Network error, please try again later.");
        console.error("品牌編輯 error:", error);
      }
    });
  }

  // 編輯帳戶資料
  const account_summit_btn = document.getElementById("submit-edit-account");
  if (account_summit_btn) {
    account_summit_btn.addEventListener("click", async function (e) {
      //   e.preventDefault();
      const account = getCookie("account");
      const region = getCookie("region");
      if (!account || !region) {
        console.log("未登入，跳轉 login.html");
        window.location.href = "login.html";
      }

      const phone = document.getElementById("phone-edit").value.trim();
      const contactPerson = document
        .getElementById("contact-person-edit")
        .value.trim();
      const nationality = document.getElementById("nationality-edit").value;
      const website = document.getElementById("website-edit").value.trim();
      const facebook = document.getElementById("facebook-edit").value.trim();
      const instagram = document.getElementById("instagram-edit").value.trim();
      const whatsapp = document.getElementById("whatsapp-edit").value.trim();
      const baselocation = document
        .getElementById("baselocation-edit")
        .value.trim();

      /**
       * 將 URLSearchParams 字串還原成原始字元（所有符號都還原）
       * @param {string} paramStr
       * @returns {string}
       */
      function decodeFormParams(paramStr) {
        return decodeURIComponent(paramStr.replace(/\+/g, " "));
      }

      const params = new URLSearchParams({
        action: "update_account_info",
        account: account,
        phone: phone,
        contactPerson: contactPerson,
        region: nationality,
        website: website,
        facebook: facebook,
        instagram: instagram,
        whatsapp: whatsapp,
        主要創作據點: baselocation,
      }).toString();

      const decodedParams = decodeFormParams(params); // decodedParams 就是所有符號都還原的字串

      try {
        const updateAccountRes = await fetch(apiUrl, {
          redirect: "follow",
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: decodedParams,
        });

        console.log("帳戶 fetch response:", updateAccountRes);

        const data = await updateAccountRes.json();

        console.log("帳戶 API 回傳:", data);

        if (data.success) {
          setCookie("account", data.data.account, 21600);
          setCookie("region", data.data.region, 21600);
          setCookie("login", "success", 21600);

          window.location.href = "dashboard-TPABF.html";
        } else {
          alert("Network error, please try again later.");
        }
      } catch (error) {
        alert("Network error, please try again later.");
        console.error("帳戶編輯 error:", error);
      }
    });
  }
});
