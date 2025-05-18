document.addEventListener("DOMContentLoaded", function () {
  const apiUrl =
    "https://script.google.com/macros/s/AKfycbwNWgPsLK_ldHUIvoIg5a9k3PNIlmjvJeTgbCZ5CZsvKFQ7e1DoxbMsAawi4nI3Rea4DA/exec";
  const form = document.querySelector(".login-form");

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
    }).toString;

    try {
      const res = await fetch(uploadUrl, {
        redirect: "follow",
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: params,
      });
      if (!res.ok) {
        alert("Server error, please try again later.");
        return;
      }

      const data = await res.json();

      if (data.success) {
        setCookieSec("account", data.data.account, 21600);
        setCookieSec("region", data.data.region, 21600);
        setCookieSec("login", "success", 21600);

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
