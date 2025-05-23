document.addEventListener("DOMContentLoaded", function () {
  const apiUrl =
    "https://script.google.com/macros/s/AKfycbwNWgPsLK_ldHUIvoIg5a9k3PNIlmjvJeTgbCZ5CZsvKFQ7e1DoxbMsAawi4nI3Rea4DA/exec";
  const form = document.querySelector(".login-form");
  const loading = document.getElementById("login-loading");

  if (form && loading) {
    form.addEventListener("submit", function () {
      loading.style.display = "block";
    });
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    const params = new URLSearchParams({
      action: "login",
      account: email,
      password: password,
    }).toString();

    try {
      const loginRes = await fetch(apiUrl, {
        redirect: "follow",
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: params,
      });

      const data = await loginRes.json();

      if (data.success) {
        setCookie("account", data.data.account, 21600);
        setCookie("region", data.data.region, 21600);
        setCookie("login", "success", 21600);

        // alert("登入成功！Login successful!");
        window.location.href = "dashboard-TPABF.html";
      } else {
        alert(data.message || data.error || "Login failed, please try again.");
      }
    } catch (error) {
      alert("Network error, please try again later.");
      console.error(error);
    }
  });
});
