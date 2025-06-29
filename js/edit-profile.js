document.addEventListener("DOMContentLoaded", function () {
  const apiUrl =
    "https://script.google.com/macros/s/AKfycbwNWgPsLK_ldHUIvoIg5a9k3PNIlmjvJeTgbCZ5CZsvKFQ7e1DoxbMsAawi4nI3Rea4DA/exec";

  // 編輯品牌資料
  const branch_summit_btn = document.getElementById("submit-edit-brand");
  if (branch_summit_btn) {
    branch_summit_btn.addEventListener("click", async function (e) {
      e.preventDefault();
      document.getElementById("loading-mask").style.display = "flex";
      if (window.startFakeLoading) window.startFakeLoading(); // 新增這行

      const account = getCookie("account");
      const region = getCookie("region");

      if (!account || !region) {
        window.location.href = "login.html";
      }

      const brandName = document.getElementById("brandName-edit").value.trim();
      const bio = document.getElementById("bio-edit").value.trim();
      const role = document.getElementById("role-edit").value;
      const website = document.getElementById("website-edit").value.trim();
      const facebook = document.getElementById("facebook-edit").value.trim();
      const instagram = document.getElementById("instagram-edit").value.trim();
      const baselocation = document
        .getElementById("baselocation-edit")
        .value.trim();
      const attendedYears = document
        .getElementById("attendedYears-edit")
        .value.trim();
      const nationality = document.getElementById("nationality-edit").value;
      const yearlyanswer = document
        .getElementById("yearlyanswer-edit")
        .value.trim();
      const electricity = document
        .getElementById("electricity-edit")
        .value.trim();

      const params = new URLSearchParams({
        action: "update_dashboard_info",
        account: account,
        品牌: brandName,
        品牌簡介: bio,
        身分類別: role,
        website: website,
        facebook: facebook,
        IG帳號: instagram,
        主要創作據點: baselocation,
        參與年份: attendedYears,
        region: nationality,
        當屆問答: yearlyanswer,
        電力需求: electricity,
      }).toString();

      try {
        const updateBranchRes = await fetch(apiUrl, {
          redirect: "follow",
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        });

        const data = await updateBranchRes.json();

        if (data.success) {
          // 等待 2 秒
          await new Promise((resolve) => setTimeout(resolve, 2000));
          // 重新 fetch dashboard 資料
          const checkParams = new URLSearchParams({
            action: "get_dashboard_info",
            account: account,
          }).toString();
          let updated = false;
          for (let i = 0; i < 5; i++) {
            // 最多重試5次
            const checkRes = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: checkParams,
            });
            const checkData = await checkRes.json();
            // 這裡根據你剛剛更新的欄位來判斷是否已經是新值
            if (
              checkData.success &&
              checkData.data["品牌"] === brandName &&
              checkData.data["品牌簡介"] === bio
            ) {
              updated = true;
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000)); // 每秒重試
          }
          window.location.href = "dashboard-TPABF.html";
        } else {
          // 隱藏 loading 遮罩
          document.getElementById("loading-mask").style.display = "none";
          alert("Network error, please try again later.");
        }
      } catch (error) {
        alert("Network error, please try again later.");
      }
    });
  }

  // 編輯帳戶資料
  const account_summit_btn = document.getElementById("submit-edit-account");
  if (account_summit_btn) {
    account_summit_btn.addEventListener("click", async function (e) {
      e.preventDefault();
      document.getElementById("loading-mask").style.display = "flex";
      if (window.startFakeLoading) window.startFakeLoading(); // 只要這樣

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
      const nationality2 = document.getElementById("nationality-edit2").value;

      const params = new URLSearchParams({
        action: "update_account_info",
        account: account,
        phone: phone,
        name: contactPerson,
        region: nationality2,
      }).toString();

      try {
        const updateAccountRes = await fetch(apiUrl, {
          redirect: "follow",
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        });

        const data = await updateAccountRes.json();

        if (data.success) {
          // 等待 2 秒
          await new Promise((resolve) => setTimeout(resolve, 2000));
          // 重新 fetch dashboard 資料，確認已更新
          const checkParams = new URLSearchParams({
            action: "get_dashboard_info",
            account: account,
          }).toString();
          let updated = false;
          for (let i = 0; i < 5; i++) {
            const checkRes = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: checkParams,
            });
            const checkData = await checkRes.json();
            if (
              checkData.success &&
              checkData.data &&
              checkData.data["phone"] === phone &&
              checkData.data["name"] === contactPerson &&
              checkData.data["region"] === nationality2
            ) {
              updated = true;
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
          if (window.stopFakeLoading) window.stopFakeLoading();
          window.location.href = "dashboard-TPABF.html";
        } else {
          if (window.stopFakeLoading) window.stopFakeLoading();
          document.getElementById("loading-mask").style.display = "none";
          alert("Network error, please try again later.");
        }
      } catch (error) {
        if (window.stopFakeLoading) window.stopFakeLoading();
        document.getElementById("loading-mask").style.display = "none";
        alert("Network error, please try again later.");
        console.error("帳戶編輯 error:", error);
      }
    });
  }
});
