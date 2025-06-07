document.addEventListener("DOMContentLoaded", function () {
  const apiUrl =
    "https://script.google.com/macros/s/AKfycbwNWgPsLK_ldHUIvoIg5a9k3PNIlmjvJeTgbCZ5CZsvKFQ7e1DoxbMsAawi4nI3Rea4DA/exec";

  // 編輯品牌資料
  const branch_summit_btn = document.getElementById("submit-edit-brand");
  if (branch_summit_btn) {
    branch_summit_btn.addEventListener("click", async function (e) {
      e.preventDefault();
      // 取得表單資料
      const account = getCookie("account");
      const region = getCookie("region");

      if (!account || !region) {
        window.location.href = "login.html";
      }

      const brandName = document.getElementById("brandName-edit").value.trim();
      const bio = document.getElementById("bio-edit").value.trim();
      const role = document.getElementById("role-edit").value;
      const category = document.getElementById("category-edit").value;
      const baselocation = document
        .getElementById("baselocation-edit")
        .value.trim();

      const params = new URLSearchParams({
        action: "update_dashboard_info",
        account: account,
        品牌: brandName,
        品牌簡介: bio,
        身分類別: role,
        作品類別: category,
        主要創作據點: baselocation,
      }).toString();
      try {
        const updateBranchRes = await fetch(apiUrl, {
          redirect: "follow",
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: params,
        });

        const data = await updateBranchRes.json();

        if (data.success) {
          setCookie("account", data.data.account, 21600);
          setCookie("region", data.data.region, 21600);
          setCookie("login", "success", 21600);

          // alert("登入成功！Login successful!");
          window.location.href = "dashboard-TPABF.html";
        } else {
          alert("Network error, please try again later.");
        }
      } catch (error) {
        alert("Network error, please try again later.");
        console.error(error);
      }
    });
  }

  // 編輯帳戶資料
  const accountForm = document.getElementById("submit-edit-account");
  if (accountForm) {
    accountForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      // 取得表單資料
      const contactPerson = document
        .getElementById("contact-person-edit")
        .value.trim();
      const phone = document.getElementById("phone-edit").value.trim();
      const nationality = document.getElementById("nationality-edit").value;
      const website = document.getElementById("website-edit").value.trim();
      const instagram = document.getElementById("instagram-edit").value.trim();
      const facebook = document.getElementById("facebook-edit").value.trim();
      const whatsapp = document.getElementById("whatsapp-edit").value.trim();

      // TODO: 送出 API 或處理資料
      const params = new URLSearchParams({
        action: "update_account_info",
        account: account,
        phone: phone,
        contactPerson: contactPerson,
        region: nationality,
        website: website,
        facebook: facebook,
        instagram: instagram,
      }).toString();

      try {
        const updateBranchRes = await fetch(apiUrl, {
          redirect: "follow",
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: params,
        });

        const data = await updateBranchRes.json();

        if (data.success) {
          setCookie("account", data.data.account, 21600);
          setCookie("region", data.data.region, 21600);
          setCookie("login", "success", 21600);

          // alert("登入成功！Login successful!");
          window.location.href = "dashboard-TPABF.html";
        } else {
          alert("Network error, please try again later.");
        }
      } catch (error) {
        alert("Network error, please try again later.");
        console.error(error);
      }
    });
  }
});
