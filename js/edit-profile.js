document.addEventListener("DOMContentLoaded", function () {
  const apiUrl =
    "https://script.google.com/macros/s/AKfycbyRV_uiklsvHWPeBblxTz47OlTnQ-IeKIxifYZ1D-8ZzHdljVMEbXwsKGO84Agon7mU8g/exec";

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

      const BIO_ZH_MAX = 80;
      const BIO_EN_MAX = 100;

      const brandName = document.getElementById("brandName-edit").value.trim();
      const brandNameOriginal = (document.getElementById("brandName-original-edit")?.value || "").trim();
      const bio = document.getElementById("bio-edit").value.trim();
      const bioEn = (document.getElementById("bio-edit-en")?.value || "").trim();

      if (bio.length > BIO_ZH_MAX) {
        document.getElementById("loading-mask").style.display = "none";
        alert(
          `中文品牌簡介請勿超過 ${BIO_ZH_MAX} 字。\nChinese bio must be at most ${BIO_ZH_MAX} characters.`,
        );
        return;
      }
      if (bioEn.length > BIO_EN_MAX) {
        document.getElementById("loading-mask").style.display = "none";
        alert(
          `英文品牌簡介請勿超過 ${BIO_EN_MAX} 字。\nEnglish bio must be at most ${BIO_EN_MAX} characters.`,
        );
        return;
      }
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
        品牌原文: brandNameOriginal,
        品牌簡介: bio,
        品牌簡介EN: bioEn,
        身分類別: role,
        website: website,
        facebook: facebook,
        IG帳號: instagram,
        主要創作據點: baselocation,
        參與年份: attendedYears,
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
              checkData.data["品牌"] === brandName &&
              checkData.data["品牌簡介"] === bio
            ) {
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
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

});
