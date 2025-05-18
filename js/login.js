document.addEventListener("DOMContentLoaded", function () {
  const apiUrl =
    "https://script.google.com/macros/s/AKfycbwNWgPsLK_ldHUIvoIg5a9k3PNIlmjvJeTgbCZ5CZsvKFQ7e1DoxbMsAawi4nI3Rea4DA/exec";
  const form = document.querySelector(".login-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    //
    if (!email || !password) {
      alert("please enter your email and password.");
      return;
    }

    const params = new URLSearchParams({
      action: "login",
      account: email,
      password: password,
    });

    fetch(`${apiUrl}?${params.toString()}`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // cookie：6hr
          setCookieSec("account", data.data.account, 21600);
          setCookieSec("region", data.data.region, 21600);
          setCookieSec("login", "success", 21600);

          //   alert("登入成功！Login successful!");
          // redirect to dashboard
          window.location.href = "dashboard-TPABF.html";
        } else {
          alert(
            data.message || data.error || "Login failed, please try again."
          );
        }
      })
      .catch((err) => {
        alert("Server error, please try again later.");
        console.error(err);
      });
  });
});
